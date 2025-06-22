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
    const params = await props.params;
    const room = await prisma.decisionRoom.findUnique({
      where: { slug: params.slug }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.allowDiscussion) {
      return NextResponse.json({ error: 'Discussion not allowed' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { roomId: room.id, parentId: null },
      include: {
        user: { select: { name: true } },
        replies: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
   props: {
    params: Params
  }
) {
  try {
    const params = await props.params;
    const session = await auth.api.getSession({ headers: await headers() });
    const body = await request.json();
    const { content, parentId, guestFingerprint } = body;

    const room = await prisma.decisionRoom.findUnique({
      where: { slug: params.slug }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.allowDiscussion) {
      return NextResponse.json({ error: 'Discussion not allowed' }, { status: 403 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment content required' }, { status: 400 });
    }

    let comment;

    if (session?.user?.id) {
      // Registered user comment
      comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          userId: session.user.id,
          roomId: room.id,
          parentId: parentId || null
        },
        include: {
          user: { select: { name: true } }
        }
      });
    } else {
      // Guest comment
      if (!guestFingerprint) {
        return NextResponse.json({ error: 'Guest fingerprint required' }, { status: 400 });
      }

      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || '';

      const guest = await prisma.guest.upsert({
        where: { sessionId: guestFingerprint },
        update: {},
        create: {
          sessionId: guestFingerprint,
          ipAddress: clientIp,
          userAgent: userAgent
        }
      });

      comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          guestId: guest.id,
          roomId: room.id,
          parentId: parentId || null
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      comment: {
        ...comment,
        author: session?.user?.name || 'Anonymous Guest'
      }
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}