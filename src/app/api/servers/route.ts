import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { BadRequestError } from '@/errors/bad-request-error';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';
import { ValidationError } from '@/errors/validation-error';

const bodySchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  avatarUrl: z.string().url().min(1, { message: 'Avatar is required' }),
});

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const bodyResponse = bodySchema.safeParse(req.json());

    if (!bodyResponse.success) {
      throw new ValidationError(bodyResponse.error.errors);
    }

    const { username, avatarUrl } = bodyResponse.data;

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [
            {
              name: 'general',
              profileId: profile.id,
            },
          ],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: MemberRole.ADMIN,
              username,
              avatarUrl,
            },
          ],
        },
      },
    });

    if (!server) {
      throw new BadRequestError('Something went wrong');
    }

    return NextResponse.json(server);
  } catch (err: unknown) {
    return handleApiError(err, '[SERVER_POST]');
  }
}
