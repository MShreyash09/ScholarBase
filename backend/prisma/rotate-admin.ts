import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";

const OLD_EMAIL = "admin@youruniversity.edu.in";
const NEW_EMAIL = "shreyashmandlapure2024.it@mmcoe.edu.in";

const prisma = new PrismaClient();

async function main() {
  const oldAdmin = await prisma.user.findUnique({ where: { email: OLD_EMAIL } });
  const newAdmin = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });

  if (!oldAdmin) throw new Error(`${OLD_EMAIL} not found — nothing to rotate`);
  if (!newAdmin) throw new Error(`${NEW_EMAIL} not found — sign up with it first`);
  if (!newAdmin.emailVerifiedAt) {
    throw new Error(`${NEW_EMAIL} is not verified — login would be refused after promotion`);
  }

  // Rooms are reassigned rather than left behind. Closing a room in the admin
  // UI is a *soft* close (isActive: false) that keeps the transcript, so the
  // rows survive — and StudyRoom.createdBy cascades on delete, which would
  // destroy those rooms and every message in them along with the old account.
  const [papers, notes, rooms] = await prisma.$transaction([
    prisma.questionPaper.updateMany({
      where: { uploadedById: oldAdmin.id },
      data: { uploadedById: newAdmin.id },
    }),
    prisma.note.updateMany({
      where: { uploadedById: oldAdmin.id },
      data: { uploadedById: newAdmin.id },
    }),
    prisma.studyRoom.updateMany({
      where: { createdById: oldAdmin.id },
      data: { createdById: newAdmin.id },
    }),
  ]);

  // Promote first, delete second: if the delete failed we would rather be left
  // with two admins than none.
  await prisma.user.update({
    where: { id: newAdmin.id },
    data: { role: UserRole.admin },
  });

  await prisma.user.delete({ where: { id: oldAdmin.id } });

  console.log("Reassigned:", { papers: papers.count, notes: notes.count, rooms: rooms.count });
  console.log("Promoted:", NEW_EMAIL);
  console.log("Deleted:", OLD_EMAIL);
}

main()
  .catch((err) => {
    console.error("FAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
