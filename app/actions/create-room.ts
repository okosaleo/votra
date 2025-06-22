"use server";

import { CreateRoomSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { generateCuid } from "@/lib/utils";
import { z } from "zod";
import { currentUser } from "@/lib/session";

export async function createRoom(data: z.infer<typeof CreateRoomSchema>) {
    const user = await currentUser()
  try {
    // Generate unique slug
    const baseSlug = slugify(data.title, { lower: true, strict: true });
    const uniqueSlug = `${baseSlug}-${generateCuid(5)}`;

    // Create room and options in transaction
    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.decisionRoom.create({
        data: {
          title: data.title,
          description: data.description,
          slug: uniqueSlug,
          votingDeadline: data.votingDeadline,
          creatorId: user.user.id, // Replace with actual user ID
          allowGuestVoting: data.settings.allowGuestVoting,
          allowDiscussion: data.settings.allowDiscussion,
          allowVoteJustification: data.settings.allowVoteJustification,
          showLiveResults: data.settings.showLiveResults,
        },
      });

      // Use the correct structure from form data
      await tx.votingOption.createMany({
        data: data.options.map((option, index) => ({
          title: option.value,  // Access the value property
          roomId: newRoom.id,
          order: index + 1,
        })),
      });

      return newRoom;
    });

    return {
      success: true,
      room: {
        ...room,
        shareableUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/room/${room.slug}`,
      },
    };
  } catch (error) {
    console.error("Room creation error:", error);
    return { success: false, error: "Failed to create room" };
  }
}