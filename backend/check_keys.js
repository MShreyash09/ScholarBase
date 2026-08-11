require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { Client: MinioClient } = require('minio');

const prisma = new PrismaClient();
const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT ?? "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

(async () => {
  const papers = await prisma.questionPaper.findMany({ select: { id: true, fileKey: true, fileName: true, academicYear: true, subjectId: true } });
  console.log("=== DB QuestionPaper rows ===");
  papers.forEach(p => console.log(`${p.id}  key="${p.fileKey}"`));

  console.log("\n=== Actual objects in MinIO 'papers' bucket ===");
  const stream = minio.listObjectsV2("papers", "", true);
  const objs = [];
  stream.on("data", (obj) => objs.push(`${obj.name}  (${obj.size} bytes)`));
  stream.on("end", () => {
    objs.forEach(o => console.log(o));
    prisma.$disconnect();
  });
  stream.on("error", (err) => { console.error("MinIO list error:", err.message); prisma.$disconnect(); });
})();
