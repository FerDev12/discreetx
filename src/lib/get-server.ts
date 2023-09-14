import { cache } from 'react';
import { db } from './db';

export const getServer = cache(async (id: string, profileId: string) => {
  return await db.server.findUnique({
    where: {
      id,
      members: {
        some: {
          profileId,
        },
      },
    },
    include: {
      channels: true,
      members: {
        include: {
          profile: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
});
