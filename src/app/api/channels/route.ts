import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';
import { handleApiError } from '@/lib/api-error-handler';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().nonempty(),
  type: z.string().nonempty(),
});

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get('serverId');

    if (!serverId) {
      return new NextResponse('Missing server Id', { status: 400 });
    }

    const { name, type } = await req.json();

    if (name === 'general') {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
      include: {
        channels: {
          where: {
            profileId: profile.id,
            name: name,
            type: type,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (err: any) {
    return handleApiError(err, '[CHANNELS_POST]');
  }
}
