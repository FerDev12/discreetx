import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await currentProfile();
    return NextResponse.json(profile);
  } catch (err: any) {
    return handleApiError(err, '[PROFILE]');
  }
}
