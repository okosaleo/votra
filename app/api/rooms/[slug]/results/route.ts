import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { headers } from 'next/headers';

type Params = Promise<{slug: string}>
export async function GET(
  request: NextRequest,
  props: {
    params: Params
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const params = await props.params;
    const room = await prisma.decisionRoom.findUnique({
      where: { slug: params.slug },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { votes: true } }
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if results should be shown
    const now = new Date();
    const isCreator = session?.user?.id === room.creatorId;
    const votingEnded = now > room.votingDeadline || !room.isActive;
    
    if (!room.showLiveResults && !votingEnded && !isCreator) {
      return NextResponse.json({ error: 'Results not available yet' }, { status: 403 });
    }

    // Get detailed results
    const results = await Promise.all(
      room.options.map(async (option) => {
        const voteCount = await prisma.vote.count({
          where: { optionId: option.id }
        });

        // Get justifications if room allows and user is creator
        const justifications = isCreator ? await prisma.voteJustification.findMany({
          where: { optionId: option.id },
          select: { justification: true, createdAt: true }
        }) : [];

        return {
          ...option,
          votes: voteCount,
          justifications: isCreator ? justifications : []
        };
      })
    );

    const totalVotes = results.reduce((sum: number, option: typeof results[0]) => sum + option.votes, 0);

    return NextResponse.json({
      room: {
        id: room.id,
        title: room.title,
        description: room.description,
        votingDeadline: room.votingDeadline,
        isActive: room.isActive
      },
      results,
      totalVotes,
      votingEnded,
      canViewResults: room.showLiveResults || votingEnded || isCreator
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
