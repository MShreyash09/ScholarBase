import "dotenv/config";
import { createHash } from "crypto";
import { PrismaClient, UploadStatus } from "@prisma/client";
import { Client as MinioClient } from "minio";

const prisma = new PrismaClient();

const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT ?? "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!,
});
const PAPERS_BUCKET = process.env.MINIO_BUCKET_PAPERS ?? "papers";

const YEAR_LEVELS = [
  { yearNumber: 1, label: "1st Year" },
  { yearNumber: 2, label: "2nd Year" },
  { yearNumber: 3, label: "3rd Year" },
  { yearNumber: 4, label: "4th Year" },
];

const EXAM_TYPES = ["Unit Test", "End Term", "RE-ETE"];

const DEPARTMENT = "IT";

interface SubjectSeed {
  code: string;
  name: string;
  semester: number;
  yearNumber: number;
}

const SUBJECTS: SubjectSeed[] = [
  { code: "M2", name: "Engineering Mathematics II", semester: 2, yearNumber: 1 },
  { code: "AC", name: "Applied Chemistry", semester: 2, yearNumber: 1 },
  { code: "CYBER", name: "Cyber Security", semester: 3, yearNumber: 2 },
  { code: "DSA", name: "Data Structures & Algorithms", semester: 3, yearNumber: 2 },
  { code: "OOP", name: "Object-Oriented Programming", semester: 3, yearNumber: 2 },
  { code: "SEM", name: "SEM", semester: 3, yearNumber: 2 },
  { code: "OS", name: "Operating Systems", semester: 4, yearNumber: 2 },
  { code: "DBMS", name: "Database Management Systems", semester: 4, yearNumber: 2 },
  { code: "JAPANESE", name: "Japanese", semester: 4, yearNumber: 2 },
  { code: "CN", name: "Computer Networks", semester: 4, yearNumber: 2 },
];

// subjectCode -> examType label -> object key already sitting in the "papers" MinIO bucket
const PAPER_FILES: Record<string, Partial<Record<(typeof EXAM_TYPES)[number], string>>> = {
  M2: { "End Term": "M2 ETE.pdf" },
  AC: { "End Term": "AC ETE.pdf" },
  CYBER: { "Unit Test": "Cyber UT.pdf", "End Term": "Cyber ETE.pdf" },
  DSA: { "Unit Test": "DSA UT.pdf", "End Term": "DSA ETE.pdf" },
  OOP: { "Unit Test": "OOP UT.pdf", "End Term": "OOP ETE.pdf" },
  SEM: { "Unit Test": "SEM UT.pdf", "End Term": "SEM ETE.pdf" },
  OS: { "Unit Test": "OS UT.pdf" },
  DBMS: { "Unit Test": "DBMS UT.pdf" },
  JAPANESE: { "Unit Test": "Japanese UT.pdf" },
  CN: { "Unit Test": "CN UT.pdf" },
};

const ACADEMIC_YEAR = 2025;

async function hashObject(key: string): Promise<{ checksum: string; size: number }> {
  const stream = await minio.getObject(PAPERS_BUCKET, key);
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of stream) {
    hash.update(chunk);
    size += chunk.length;
  }
  return { checksum: hash.digest("hex"), size };
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail) throw new Error("ADMIN_EMAIL must be set (same as backend/.env)");
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error(`No user found for ${adminEmail} — run "pnpm seed:admin" first`);

  const yearLevelByNumber = new Map<number, string>();
  for (const yl of YEAR_LEVELS) {
    const row = await prisma.yearLevel.upsert({
      where: { yearNumber: yl.yearNumber },
      update: { label: yl.label },
      create: yl,
    });
    yearLevelByNumber.set(row.yearNumber, row.id);
  }

  const examTypeByName = new Map<string, string>();
  for (const name of EXAM_TYPES) {
    const row = await prisma.examType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    examTypeByName.set(name, row.id);
  }

  const subjectIdByCode = new Map<string, string>();
  for (const s of SUBJECTS) {
    const yearLevelId = yearLevelByNumber.get(s.yearNumber)!;
    const row = await prisma.subject.upsert({
      where: { yearLevelId_code: { yearLevelId, code: s.code } },
      update: { name: s.name, department: DEPARTMENT, semester: s.semester },
      create: {
        yearLevelId,
        code: s.code,
        name: s.name,
        department: DEPARTMENT,
        semester: s.semester,
      },
    });
    subjectIdByCode.set(s.code, row.id);
    console.log(`Subject ready: ${s.code} (sem ${s.semester}) — ${row.id}`);
  }

  let created = 0;
  let skipped = 0;
  for (const [subjectCode, byExamType] of Object.entries(PAPER_FILES)) {
    const subjectId = subjectIdByCode.get(subjectCode)!;
    for (const [examTypeName, fileKey] of Object.entries(byExamType)) {
      const examTypeId = examTypeByName.get(examTypeName)!;

      const existing = await prisma.questionPaper.findFirst({
        where: { subjectId, examTypeId, academicYear: ACADEMIC_YEAR },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const { checksum, size } = await hashObject(fileKey!);
      await prisma.questionPaper.create({
        data: {
          subjectId,
          examTypeId,
          academicYear: ACADEMIC_YEAR,
          fileKey: fileKey!,
          fileName: fileKey!,
          fileSizeBytes: size,
          mimeType: "application/pdf",
          checksum,
          uploadedById: admin.id,
          uploadStatus: UploadStatus.ready,
        },
      });
      created++;
      console.log(`Paper linked: ${subjectCode} / ${examTypeName} <- ${fileKey}`);
    }
  }

  console.log(`\nDone. ${created} question papers created, ${skipped} already existed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
