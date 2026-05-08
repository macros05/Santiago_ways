import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { prisma } from '@lib/prisma';
import { handleApiError, ok } from '@lib/http';
import { checkRate, RATE_REGISTER } from '@lib/rateLimit';
import { isEmailConfigured, resetEmailHtml, resetEmailText, sendEmail } from '@lib/email';

const schema = z.object({ email: z.string().email().toLowerCase() });

const TOKEN_TTL_MINUTES = 30;
const RESET_PATH = '/auth/reset-password';

function tokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    // Hard rate-limit so attackers can't enumerate emails by timing or by
    // bursting the email provider.
    const limited = await checkRate(req, 'forgot-password', RATE_REGISTER);
    if (limited) return limited;

    const { email } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });

    // Important: we always respond OK so the API does not leak which emails are
    // registered. Side-effects (email send + token write) only happen if the
    // user exists and email is configured.
    if (user && user.passwordHash && isEmailConfigured()) {
      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

      await prisma.$transaction([
        // Invalidate any other unused token so a single request always supersedes
        // older ones.
        prisma.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
          data: { usedAt: new Date() },
        }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: tokenHash(token),
            expiresAt,
          },
        }),
      ]);

      const baseUrl = process.env.APP_PUBLIC_URL ?? 'https://santiagoways.app';
      const url = `${baseUrl}${RESET_PATH}?token=${encodeURIComponent(token)}`;

      try {
        await sendEmail({
          to: user.email,
          subject: 'Restablece tu contraseña — SantiagoWays',
          html: resetEmailHtml({ name: user.name, url, minutes: TOKEN_TTL_MINUTES }),
          text: resetEmailText({ name: user.name, url, minutes: TOKEN_TTL_MINUTES }),
        });
      } catch (e) {
        // Surface in server logs but never to the client.
        console.error('[forgot-password] email send failed', e);
      }
    }

    return ok({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
