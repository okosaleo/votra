import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { headers } from 'next/headers';

type Params = Promise<{ slug: string }>;

export async function POST(
  request: NextRequest,
  props: {
    params: Params;
  }
) {
  try {
    const params = await props.params;
    const session = await auth.api.getSession({ headers: await headers() });
    const body = await request.json();
    const { optionId, justification, guestFingerprint } = body;

    // Find the room
    const room = await prisma.decisionRoom.findUnique({
      where: { slug: params.slug },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if voting is still active
    const now = new Date();
    if (!room.isActive || now > room.votingDeadline) {
      return NextResponse.json({ error: 'Voting has ended' }, { status: 400 });
    }

    // Verify option exists
    const option = await prisma.votingOption.findFirst({
      where: { id: optionId, roomId: room.id },
    });

    if (!option) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    let vote;
    let guest = null;

    if (session?.user?.id) {
      // Registered user voting
      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_roomId: {
            userId: session.user.id,
            roomId: room.id,
          },
        },
      });

      if (existingVote) {
        return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
      }

      vote = await prisma.vote.create({
        data: {
          userId: session.user.id,
          roomId: room.id,
          optionId,
        },
      });

      if (justification && room.allowVoteJustification) {
        await prisma.voteJustification.create({
          data: {
            userId: session.user.id,
            roomId: room.id,
            optionId,
            justification,
          },
        });
      }

    } else {
      // Guest voting
      if (!room.allowGuestVoting) {
        return NextResponse.json({ error: 'Guest voting not allowed' }, { status: 403 });
      }

      if (!guestFingerprint) {
        return NextResponse.json({ error: 'Guest fingerprint required' }, { status: 400 });
      }

      // Extract client IP and user-agent
      const clientIp =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        request.ip ||
        '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || '';

      // Prevent multiple votes from same IP
      const ipVoter = await prisma.guest.findFirst({
        where: {
          ipAddress: clientIp,
          votes: { some: { roomId: room.id } },
        },
      });

      if (ipVoter) {
        return NextResponse.json(
          { error: 'You have already Voted!' },
          { status: 400 }
        );
      }

      // Find or create guest
      guest = await prisma.guest.upsert({
        where: { sessionId: guestFingerprint },
        update: {},
        create: {
          sessionId: guestFingerprint,
          ipAddress: clientIp,
          userAgent,
        },
      });

      // Check if this guest already voted (redundant but safe)
      const existingGuestVote = await prisma.vote.findUnique({
        where: {
          guestId_roomId: {
            guestId: guest.id,
            roomId: room.id,
          },
        },
      });

      if (existingGuestVote) {
        return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
      }

      vote = await prisma.vote.create({
        data: {
          guestId: guest.id,
          roomId: room.id,
          optionId,
        },
      });

      if (justification && room.allowVoteJustification) {
        await prisma.voteJustification.create({
          data: {
            guestId: guest.id,
            roomId: room.id,
            optionId,
            justification,
          },
        });
      }
    }

    return NextResponse.json(
      { success: true, voteId: vote.id },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
