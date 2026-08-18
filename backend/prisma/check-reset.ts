import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.passwordResetToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      createdAt: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { email: true, role: true } },
    },
  });
  console.table(
    rows.map((r) => ({
      email: r.user.email,
      role: r.user.role,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      used: Boolean(r.usedAt),
    })),
  );
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
