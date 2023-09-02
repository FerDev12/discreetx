import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { DirectMessage, Message } from '@prisma/client';
import { NextResponse } from 'next/server';
import Cryptr from 'cryptr';
import { MemberWithProfile } from '@/types';
import axios from 'axios';

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor');
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new NextResponse('Conversation Id missing', { status: 400 });
    }

    let messages: (DirectMessage & { member: MemberWithProfile })[] = [];

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY ?? '');

    for (let i = 0; i < messages.length; i++) {
      const { content, fileUrl, deleted, read, id, member } = messages[i];

      if (deleted) continue;

      if (content.length) {
        messages[i].content = cryptr.decrypt(content);
      }

      if (fileUrl && fileUrl.length) {
        messages[i].fileUrl = cryptr.decrypt(fileUrl);
      }
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({ items: messages, nextCursor });
  } catch (err: any) {
    console.error('[DIRECT_MESSAGES_GET]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
