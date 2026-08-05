import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

// Baseline reference data. Without at least one row in each of these, the admin
// page's "Add subject" and "Upload question paper" forms render empty Year
// level / Exam type dropdowns and neither form can be submitted — a fresh
// deployment is unusable until they exist. Both are upserted, so re-running is
// safe and won't clobber labels an admin has since edited via the UI.
const YEAR_LEVELS = [
  { yearNumber: 1, label: "1st Year" },
  { yearNumber: 2, label: "2nd Year" },
  { yearNumber: 3, label: "3rd Year" },
  { yearNumber: 4, label: "4th Year" },
];

const EXAM_TYPES = ["Unit Test", "End Term"];

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME ?? "Site Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin account");
  }

  // Student signup is gated on allowed_email_domains, so the domains configured
  // in ALLOWED_EMAIL_DOMAINS have to exist as rows before anyone can register.
  const domains = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.toLowerCase().trim())
    .filter(Boolean);

  if (domains.length === 0) {
    throw new Error("ALLOWED_EMAIL_DOMAINS must list at least one domain, e.g. youruniversity.edu.in");
  }

  for (const domain of domains) {
    await prisma.allowedEmailDomain.upsert({
      where: { domain },
      update: {},
      create: { domain },
    });
  }

  console.log(`Allowed signup domains: ${domains.join(", ")}`);

  const passwordHash = await argon2.hash(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, fullName, role: UserRole.admin },
    create: { email, passwordHash, fullName, role: UserRole.admin },
  });

  console.log(`Admin account ready: ${admin.email} (id: ${admin.id})`);

  for (const yearLevel of YEAR_LEVELS) {
    await prisma.yearLevel.upsert({
      where: { yearNumber: yearLevel.yearNumber },
      update: {},
      create: yearLevel,
    });
  }

  for (const name of EXAM_TYPES) {
    await prisma.examType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(
    `Reference data ready: ${YEAR_LEVELS.length} year levels, exam types ${EXAM_TYPES.join(", ")}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
