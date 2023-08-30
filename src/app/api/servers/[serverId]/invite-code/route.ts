import { NextResponse } from 'next/server';

import { v4 as uuidv4 } from 'uuid';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

type RequestContext = {
  params: { serverId: string };
};

export async function PATCH(req: Request, { params }: RequestContext) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse('Server Id missing', { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return NextResponse.json(server);
  } catch (err: any) {
    console.log('[SERVER_ID_ERROR]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
