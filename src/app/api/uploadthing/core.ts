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
  messageImage: f({
    image: { maxFileCount: 1, maxFileSize: '4MB' },
  })
    .middleware(handleAuth)
    .onUploadComplete(({ metadata, file }) => {
      console.log('[IMAGE UPLOAD]', {
        userId: metadata.userId,
        file: file.url,
      });
    }),
  messageVideo: f({
    video: { maxFileCount: 1, maxFileSize: '64MB' },
  })
    .middleware(handleAuth)
    .onUploadComplete(({ metadata, file }) => {
      console.log('[VIDEO UPLOAD]', {
        userId: metadata.userId,
        file: file.url,
      });
    }),
  messagePdf: f({
    pdf: { maxFileCount: 1, maxFileSize: '4MB' },
  })
    .middleware(handleAuth)
    .onUploadComplete(({ metadata, file }) => {
      console.log('[PDF UPLOAD]', { userId: metadata.userId, file: file.url });
    }),
  // messageFile: f({
  //   image: { maxFileSize: '4MB', maxFileCount: 10 },
  //   'video/mp4': { maxFileSize: '64MB', maxFileCount: 1 },
  //   pdf: { maxFileCount: 1, maxFileSize: '4MB' },
  // })
  //   .middleware(handleAuth)
  //   .onUploadComplete(({ metadata, file }) =>
  //     console.log('[FILE UPLOAD]', { userId: metadata.userId, file: file.url })
  //   ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
