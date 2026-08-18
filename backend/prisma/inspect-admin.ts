import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      emailVerifiedAt: true,
      createdAt: true,
      _count: { select: { uploadedPapers: true, uploadedNotes: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  console.table(
    users.map((u) => ({
      email: u.email,
      role: u.role,
      name: u.fullName,
      verified: Boolean(u.emailVerifiedAt),
      papers: u._count.uploadedPapers,
      notes: u._count.uploadedNotes,
    })),
  );
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
