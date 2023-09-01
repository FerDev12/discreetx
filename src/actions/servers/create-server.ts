'use server';

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { MemberRole, Server } from '@prisma/client';

import { tryCatch } from '@/actions/try-catch';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

type Return = Server;

const bodySchema = z.object({
  name: z.string().min(1, { message: 'A server name is required' }),
  imageUrl: z.string().min(1, { message: 'Please provide an image url' }),
});

export const createServer = tryCatch<Return>(async function createServer(
  formData
) {
  const profile = await currentProfile();

  if (!profile) {
    throw new Error('Unauthorized');
  }

  const parsed = bodySchema.safeParse({
    name: formData.get('name'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) {
    throw new Error('Failed to parse request body');
  }

  const { name, imageUrl } = parsed.data;

  if (!name || !imageUrl) {
    throw new Error('Missing name or imageUrl');
  }

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
          },
        ],
      },
    },
  });

  return server;
});
