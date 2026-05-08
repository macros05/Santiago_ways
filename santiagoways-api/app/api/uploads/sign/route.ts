import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@lib/auth';
import { err, handleApiError, ok } from '@lib/http';
import { isCloudinaryConfigured, signUpload } from '@lib/cloudinary';
import { checkRate, RATE_WRITE } from '@lib/rateLimit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  folder: z.enum(['avatars', 'posts']),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const limited = await checkRate(req, `upload-sign:${auth.sub}`, RATE_WRITE);
    if (limited) return limited;

    if (!isCloudinaryConfigured()) {
      return err('Image uploads not configured', 503, 'uploads_disabled');
    }

    const { folder } = schema.parse(await req.json());
    const signed = signUpload({ folder, userId: auth.sub });
    return ok(signed);
  } catch (e) {
    return handleApiError(e);
  }
}
