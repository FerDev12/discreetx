import { BaseError } from '@/errors/base-error';
import { InternalServerError } from '@/errors/internal-server-error';
import { NextResponse } from 'next/server';

export async function handleApiError(err: unknown, loggerName?: string) {
  if (err instanceof BaseError) {
    const errors = err.serializedErrors();
    console.error(loggerName ?? '[API_ERROR]', err);
    return NextResponse.json(errors, { status: err.status });
  }

  const internalError = new InternalServerError();
  console.error(loggerName ?? '[API_ERROR]', internalError);
  return NextResponse.json(internalError.serializedErrors(), {
    status: internalError.status,
  });
}
