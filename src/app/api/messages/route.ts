import { BadRequestError } from '@/errors/bad-request-error';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { Message } from '@prisma/client';
import Cryptr from 'cryptr';
import { NextResponse } from 'next/server';

const MESSAGES_BATCH = 10;

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor');
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      throw new BadRequestError('Missing channel Id');
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
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
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId,
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

    const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY ?? '', {
      encoding: 'base64',
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });

    for (let i = 0; i < messages.length; i++) {
      const { content, fileUrl, deleted } = messages[i];

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
    // console.error('[MESSAGES_GET]', err);
    // return new NextResponse('Internal Server Error', { status: 500 });
    return handleApiError(err, '[Messages_GET]');
  }
}
