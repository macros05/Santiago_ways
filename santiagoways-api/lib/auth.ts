import { NextRequest } from 'next/server';
import { verifyAccessToken, type AccessPayload } from './jwt';

export class AuthError extends Error {
  status = 401;
  constructor(message = 'Unauthenticated') {
    super(message);
  }
}

export async function getAuth(req: NextRequest): Promise<AccessPayload> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError();
  }
  const token = header.slice(7);
  try {
    return await verifyAccessToken(token);
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}

export async function getOptionalAuth(req: NextRequest): Promise<AccessPayload | null> {
  try {
    return await getAuth(req);
  } catch {
    return null;
  }
}
