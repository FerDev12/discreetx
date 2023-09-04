import { UnauthorizedError } from '@/errors/unauthorized-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const { disconnected } = await req.json();

    console.log(`${profile.name} has disconnected`);

    return new NextResponse('Success', { status: 200 });
  } catch (err: any) {
    return handleApiError(err, '[TEST]');
  }
}
