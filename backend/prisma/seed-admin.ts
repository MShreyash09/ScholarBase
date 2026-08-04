import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

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
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
