'use server';

import { BaseError } from '@/errors/base-error';
import { InternalServerError } from '@/errors/internal-server-error';
import { NotFoundError } from '@/errors/not-found-error';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { z } from 'zod';

const formSchema = z.object({
  serverId: z.string().uuid().nonempty(),
  name: z.string(),
  imageUrl: z.string().url().nullish(),
});

export async function editServer(formData: FormData) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const formResponse = formSchema.safeParse({
      serverId: formData.get('serverId'),
      name: formData.get('name'),
      imageUrl: formData.get('imageUrl'),
    });

    if (!formResponse.success) {
      throw new ValidationError(formResponse.error.errors);
    }

    const { name, imageUrl, serverId } = formResponse.data;

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl: imageUrl ?? undefined,
      },
    });

    if (!server) {
      throw new NotFoundError('Server not found');
    }

    return server;
  } catch (err: any) {
    if (err instanceof BaseError) {
      return err.serializedErrors();
    }

    return new InternalServerError().serializedErrors();
  }
}
