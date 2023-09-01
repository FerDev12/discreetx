import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';
import { NextResponse } from 'next/server';

type RequestContet = {
  params: { channelId: string };
};

export async function PATCH(req: Request, { params }: RequestContet) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get('serverId') as string;

    if (!serverId) {
      return new NextResponse('Missing server Id', { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse('Missing channel Id', { status: 400 });
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
            role: { in: [MemberRole.MODERATOR, MemberRole.ADMIN] },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              name: {
                not: 'general',
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (err: any) {
    console.error('[CHANNEL_ID_PATCH]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RequestContet) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get('serverId') as string;

    if (!serverId) {
      return new NextResponse('Missing server Id', { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse('Missing channel Id', { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: { in: [MemberRole.MODERATOR, MemberRole.ADMIN] },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: 'general',
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (err: any) {
    console.error('[CHANNEL_ID_DELETE]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
