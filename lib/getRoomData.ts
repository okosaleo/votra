import { prisma } from "@/lib/prisma"; // your Prisma client

export async function getRoomData(slug: string) {
  const room = await prisma.decisionRoom.findUnique({
    where: { slug },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
      votes: true,
      comments: {
        where: { parentId: null }, // only top-level comments
        include: {
          user: true,
          guest: true,
          replies: {
            include: {
              user: true,
              guest: true,
            },
          },
        },
      },
      voteJustifications: true,
    },
  });

  if (!room) return null;

  // Optionally filter sensitive fields
  return room;
}
