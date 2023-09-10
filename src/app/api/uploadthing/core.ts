import { UnauthorizedError } from '@/errors/unauthorized-error';
import { auth } from '@clerk/nextjs';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const handleAuth = () => {
  const { userId } = auth();
  if (!userId) throw new UnauthorizedError();
  return { userId };
};

export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[FILE UPLOAD]', { userId: metadata.userId, file: file.url });
    }),
  messageFile: f({
    image: { maxFileSize: '4MB', maxFileCount: 10 },
    'video/mp4': { maxFileSize: '32MB', maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(({ metadata, file }) =>
      console.log('[FILE UPLOAD]', { userId: metadata.userId, file: file.url })
    ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
