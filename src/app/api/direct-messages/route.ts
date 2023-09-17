import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { Conversation, DirectMessage } from '@prisma/client';
import { NextResponse } from 'next/server';
import Cryptr from 'cryptr';
import { MemberWithSimpleProfile } from '@/types';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { BadRequestError } from '@/errors/bad-request-error';
import { handleApiError } from '@/lib/api-error-handler';
import { NotFoundError } from '@/errors/not-found-error';

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
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      throw new BadRequestError('Conversation Id missing');
    }

    let conversation:
      | (Conversation & {
          directMessages: (DirectMessage & {
            member: MemberWithSimpleProfile;
          })[];
        })
      | null = null;

    if (cursor) {
      conversation = await db.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          directMessages: {
            updateMany: {
              where: {
                deleted: {
                  not: true,
                },
                memberId: {
                  not: '',
                },
              },
              data: {
                read: true,
              },
            },
          },
        },
        include: {
          directMessages: {
            take: MESSAGES_BATCH,
            skip: 1,
            cursor: {
              id: cursor,
            },
            include: {
              member: {
                include: {
                  profile: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    } else {
      conversation = await db.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          directMessages: {
            updateMany: {
              where: {
                deleted: {
                  not: true,
                },
                memberId: {
                  not: '',
                },
              },
              data: {
                read: true,
              },
            },
          },
        },
        include: {
          directMessages: {
            take: MESSAGES_BATCH,
            include: {
              member: {
                include: {
                  profile: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const messages = conversation.directMessages;

    const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY ?? '', {
      encoding: 'base64',
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });

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
    return handleApiError(err, '[DIRECT_MESSAGES_GET]');
  }
}
