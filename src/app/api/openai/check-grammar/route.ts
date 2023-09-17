import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { ServerRuntime } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const bodySchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt is required' }),
});

export const runtime: ServerRuntime =
  process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

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

    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Check the grammar and spelling of the following text and return a corrected version if possible, if not return the orignial text: "${prompt}"`,
        },
      ],
    });

    const content = res.choices[0].message.content;

    return NextResponse.json({ response: content });
  } catch (err: any) {
    return handleApiError(err, '[OPENAI_CHECK_GRAMMAR]');
  }
}
