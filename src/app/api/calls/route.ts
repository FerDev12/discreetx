import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({
  conversationId: z.string().nonempty(),
  memberId: z.string().nonempty(),
});

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const bodyResponse = bodySchema.safeParse(await req.json());

    if (!bodyResponse.success) {
      const { error } = bodyResponse;
      throw new ValidationError(error.errors);
    }

    const body = bodyResponse.data;

    // const call = await db.conversation.update({
    //   where: {
    //     OR: [],
    //   },
    // });
  } catch (err: any) {
    return handleApiError(err, '[CALLS_ERROR]');
  }
}
