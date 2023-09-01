import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type RequestContext = {
  params: { params: { serverId: string } };
};

export async function PATCH(req: Request, { params }: RequestContext) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get('serverId');

    if (!serverId) {
      return new NextResponse('Missing server Id', { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId as string,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (err: any) {
    console.error('[SERVER_ID_LEAVE]', err);
    return new NextResponse('Internal Server Error', { status: 400 });
  }
}
