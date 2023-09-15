import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { z } from 'zod';

import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const bodySchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt is required' }),
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

    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'assistant',
          content: `Check the grammar of the following text and return a corrected version: "${prompt}"`,
        },
      ],
    });

    const content = res.choices[0].message.content;

    return NextResponse.json({ response: content });
  } catch (err: any) {
    return handleApiError(err, '[OPENAI_CHECK_GRAMMAR]');
  }
}
