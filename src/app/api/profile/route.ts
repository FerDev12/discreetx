import { handleApiError } from '@/lib/api-error-handler';
import { currentProfile } from '@/lib/current-profile';

export async function GET() {
  try {
    return await currentProfile();
  } catch (err: any) {
    return handleApiError(err, '[PROFILE]');
  }
}
