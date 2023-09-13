import { BadRequestError } from '@/errors/bad-request-error';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const message = await db.message.create({
      data: {
        channelId: uuidv4(),
        memberId: uuidv4(),
        content: 'Fake',
      },
    });

    if (!message) {
      throw new BadRequestError('Failed to send message');
    }

    return NextResponse.json(message);
  } catch (err: any) {
    return handleApiError(err, '[MESSAGE_TEST]');
  }
}
