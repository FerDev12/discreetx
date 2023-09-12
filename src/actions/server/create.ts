'use server';
import { BaseError } from '@/errors/base-error';
import { InternalServerError } from '@/errors/internal-server-error';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { MemberRole } from '@prisma/client';
import { BadRequestError } from '@/errors/bad-request-error';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Server name is required' }),
  imageUrl: z
    .string()
    .url('Value is not a valid url')
    .min(1, { message: 'Server image is required' }),
});

export async function createServer(formData: FormData) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const formResult = formSchema.safeParse({
      name: formData.get('name'),
      imageUrl: formData.get('imageUrl'),
    });

    if (!formResult.success) {
      throw new ValidationError(formResult.error.errors);
    }

    const { name, imageUrl } = formResult.data;

    const server = await db.server.create({
      data: {
        name,
        imageUrl,
        profileId: profile.id,
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
          create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
        },
      },
    });

    if (!server) {
      throw new BadRequestError('Something went wrong');
    }

    return server;
  } catch (err: any) {
    if (err instanceof BaseError) {
      return err.serializedErrors();
    }

    return new InternalServerError().serializedErrors();
  }
}
