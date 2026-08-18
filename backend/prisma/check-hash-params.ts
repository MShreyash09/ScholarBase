import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, passwordHash: true } });

  // Only the parameter header is printed — never the salt or the digest.
  // An argon2 hash looks like:  $argon2id$v=19$m=65536,t=3,p=4$<salt>$<digest>
  const rows = users.map((u) => {
    const parts = u.passwordHash.split("$");
    return {
      email: u.email.replace(/(.{3}).*(@.*)/, "$1***$2"),
      algorithm: parts[1],
      version: parts[2],
      params: parts[3],
      saltLen: parts[4]?.length ?? 0,
      digestLen: parts[5]?.length ?? 0,
    };
  });

  console.table(rows.slice(0, 3));

  const uniqueSalts = new Set(users.map((u) => u.passwordHash.split("$")[4]));
  console.log(`Distinct salts: ${uniqueSalts.size} across ${users.length} users`);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
