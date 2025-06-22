import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@/lib/session'


export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to create a room' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await req.json()
    
    const { title, description, options, votingDeadline } = body
    const settings = body.settings || {}
    
    if (!title || !description || !options || !votingDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 3. Validate options count
    if (options.length < 2 || options.length > 5) {
      return NextResponse.json(
        { error: 'Must provide between 2-5 options' },
        { status: 400 }
      )
    }

    // 4. Validate voting deadline
    if (new Date(votingDeadline) <= new Date()) {
      return NextResponse.json(
        { error: 'Voting deadline must be in the future' },
        { status: 400 }
      )
    }

    // 5. Generate unique slug
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      trim: true
    })
    
    let slug = baseSlug
    let slugExists = true
    let attempt = 0

    while (slugExists && attempt < 5) {
      const existingRoom = await prisma.decisionRoom.findUnique({
        where: { slug }
      })
      
      if (!existingRoom) {
        slugExists = false
      } else {
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`
        attempt++
      }
    }

    // 6. Create room with options in transaction
    const newRoom = await prisma.$transaction(async (tx) => {
      const room = await tx.decisionRoom.create({
        data: {
          title,
          description,
          slug,
          votingDeadline: new Date(votingDeadline),
          creatorId: user.user.id,
          allowGuestVoting: settings.allowGuestVoting ?? true,
          allowDiscussion: settings.allowDiscussion ?? true,
          allowVoteJustification: settings.allowVoteJustification ?? true,
          showLiveResults: settings.showLiveResults ?? true
        }
      })

      await tx.votingOption.createMany({
        data: options.map((opt: { title: string }, idx: number) => ({
          title: opt.title,
          roomId: room.id,
          order: idx + 1
        }))
      })

      return room
    })

    // 7. Return response with shareable URL
    return NextResponse.json(
      {
        success: true,
        room: {
          ...newRoom,
          shareableUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/room/${newRoom.slug}`
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Room creation failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}