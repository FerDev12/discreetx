import { createNextRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from './core';
import { NextResponse } from 'next/server';
import { utapi } from 'uploadthing/server';

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const imageId = url.searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json('imageId is required as a query paramter', {
        status: 400,
      });
    }

    await utapi.deleteFiles(imageId);

    return NextResponse.json(`Success`);
  } catch (err: unknown) {
    console.error('[File Delete Error]', err);
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
