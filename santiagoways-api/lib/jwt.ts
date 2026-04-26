import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import crypto from 'node:crypto';

const enc = new TextEncoder();

const accessSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return enc.encode(s);
};

const refreshSecret = () => {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error('JWT_REFRESH_SECRET is not set');
  return enc.encode(s);
};

export type AccessPayload = {
  sub: string;
  username: string;
  email: string;
};

export async function signAccessToken(payload: AccessPayload): Promise<string> {
  const ttl = process.env.JWT_EXPIRES_IN ?? '15m';
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(accessSecret());
}

export async function signRefreshToken(userId: string): Promise<{ token: string; hash: string; expiresAt: Date }> {
  const ttl = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';
  const token = await new SignJWT({ sub: userId, jti: crypto.randomUUID() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(refreshSecret());
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  // 30d default
  const expiresAt = new Date(Date.now() + parseTtlMs(ttl));
  return { token, hash, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<AccessPayload> {
  const { payload } = await jwtVerify(token, accessSecret());
  return payload as unknown as AccessPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, refreshSecret());
  return { sub: String(payload.sub) };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseTtlMs(ttl: string): number {
  const m = ttl.match(/^(\d+)([smhd])$/);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  switch (m[2]) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'd': return n * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}
