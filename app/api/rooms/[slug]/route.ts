// app/api/rooms/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { headers } from 'next/headers';

type Params = Promise<{slug: string}>;
export async function GET(
  request: NextRequest,
  props: {
    params: Params
  }
) {
  try {
    const params = await props.params;
    const session = await auth.api.getSession({ headers: await headers() });
    
    const room = await prisma.decisionRoom.findUnique({
      where: { slug: params.slug },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { votes: true } }
          }
        },
        creator: {
          select: { id: true, name: true }
        },
        _count: {
          select: { votes: true, comments: true }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user has already voted
    let hasVoted = false;
    let userVote = null;

    if (session?.user?.id) {
      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_roomId: {
            userId: session.user.id,
            roomId: room.id
          }
        },
        include: { option: true }
      });
      
      if (existingVote) {
        hasVoted = true;
        userVote = existingVote.optionId;
      }
    }

    // Transform options to include vote counts
    const optionsWithVotes = room.options.map(option => ({
      ...option,
      votes: option._count.votes
    }));

    return NextResponse.json({
      ...room,
      options: optionsWithVotes,
      hasVoted,
      userVote,
      isCreator: session?.user?.id === room.creatorId
    });

  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}