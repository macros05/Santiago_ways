import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleApiError } from '@lib/http';

// TODO: Implement Apple Sign In token validation against Apple's JWKS endpoint
// (https://appleid.apple.com/auth/keys) and identity_token verification.
const schema = z.object({
  identityToken: z.string().min(10),
  user: z.object({ name: z.string().optional(), email: z.string().email().optional() }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    schema.parse(await req.json());
    return Response.json(
      { error: { message: 'Apple Sign In not yet wired. Add APPLE_* env vars and JWKS verification.' } },
      { status: 501 },
    );
  } catch (e) {
    return handleApiError(e);
  }
}
