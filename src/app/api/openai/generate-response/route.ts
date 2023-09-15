import { UnauthorizedError } from '@/errors/unauthorized-error';
import { ValidationError } from '@/errors/validation-error';
import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
// import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { z } from 'zod';
import { ServerRuntime } from 'next';

const bodySchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt is required' }),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
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
      max_tokens: 500,
      stream: true,
      messages: [
        {
          role: 'user',
          content: `Create a short response for the following message: "${prompt}"`,
        },
      ],
    });

    const stream = OpenAIStream(res);

    return new StreamingTextResponse(stream);
  } catch (err: any) {
    return handleApiError(err, '[OPENAI_GENERATE_RESPONSE]');
  }
}
