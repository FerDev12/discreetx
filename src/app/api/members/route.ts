import { NotFoundError } from '@/errors/not-found-error';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import {
  MemberWithSimpleProfile,
  ServerWithMembersWithConversations,
} from '@/types';
import { Conversation, DirectMessage, Member, Server } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const serverIdSchema = z.string().uuid().nonempty();

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);

    const serverIdResponse = serverIdSchema.safeParse(
      searchParams.get('serverId')
    );

    if (!serverIdResponse.success) {
      throw new ValidationError(serverIdResponse.error.errors);
    }

    const serverId = serverIdResponse.data;

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          updateMany: {
            where: {
              profileId: profile.id,
            },
            data: {
              updatedAt: new Date(),
            },
          },
        },
      },
      include: {
        conversations: {
          where: {
            OR: [
              {
                memberOne: { profileId: profile.id },
              },
              { memberTwo: { profileId: profile.id } },
            ],
          },
          include: {
            directMessages: {
              where: {
                member: {
                  profileId: {
                    not: profile.id,
                  },
                },
                read: false,
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
            },
          },
        },
        members: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundError('Server not found');
    }

    return NextResponse.json<ServerWithMembersWithConversations>(server);
  } catch (err: any) {
    return handleApiError(err, '[MESSAGES_GET]');
  }
}
