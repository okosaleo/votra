// app/room/[slug]/page.tsx
import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VotingRoomClient from "@/app/components/VotingRoomClient";

async function getRoomData(slug: string, userId?: string) {
  const room = await prisma.decisionRoom.findUnique({
    where: { slug },
    include: {
      options: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { votes: true } }
        }
      },
      creator: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { votes: true, comments: true }
      }
    }
  });

  if (!room) {
    return null;
  }

  // Check if user has already voted
  let hasVoted = false;
  let userVote = null;
  let userJustification = null;

  if (userId) {
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId: room.id
        }
      }
    });
    
    if (existingVote) {
      hasVoted = true;
      userVote = existingVote.optionId;

      // Get user's justification if it exists
      const justification = await prisma.voteJustification.findUnique({
        where: {
          userId_roomId: {
            userId,
            roomId: room.id
          }
        }
      });
      
      if (justification) {
        userJustification = justification.justification;
      }
    }
  }

  // Get comments if discussion is allowed
  let comments = [];
  if (room.allowDiscussion) {
    comments = await prisma.comment.findMany({
      where: { roomId: room.id, parentId: null },
      include: {
        user: { select: { name: true } },
        guest: true,
        replies: {
          include: {
            user: { select: { name: true } },
            guest: true
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit initial comments load
    });
  }

  // Transform options to include vote counts
  const optionsWithVotes = room.options.map(option => ({
    ...option,
    votes: option._count.votes
  }));

  return {
    ...room,
    options: optionsWithVotes,
    hasVoted,
    userVote,
    userJustification,
    comments: comments.map(comment => ({
      ...comment,
      authorName: comment.user?.name || 'Anonymous Guest',
      replies: comment.replies.map(reply => ({
        ...reply,
        authorName: reply.user?.name || 'Anonymous Guest'
      }))
    }))
  };
}

type Params = Promise<{ slug: string }>;

export default async function RoomPage(props: { params: Params }) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  const roomData = await getRoomData(params.slug, session?.user?.id);
  
  if (!roomData) {
    notFound();
  }

  const isCreator = session?.user?.id === roomData.creatorId;
  
  return (
    <VotingRoomClient
      initialData={roomData}
      currentUser={session?.user || null}
      isCreator={isCreator}
    />
  );
}