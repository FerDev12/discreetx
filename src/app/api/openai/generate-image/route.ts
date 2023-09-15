import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const bodySchema = z.object({
  prompt: z
    .string()
    .min(1, { message: 'Prompt is required' })
    .max(500, { message: 'Keep it short' }),
});

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      throw new UnauthorizedError();
    }

    const bodyResponse = bodySchema.safeParse(await req.json());

    if (!bodyResponse.success) {
      throw new ValidationError(bodyResponse.error.errors);
    }

    const { prompt } = bodyResponse.data;

    const res = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    });

    return NextResponse.json({ imageUrl: res.data[0]?.url ?? '' });
  } catch (err: any) {
    return handleApiError(err, '[AI_GENERATE_IMAGE]');
  }
}
