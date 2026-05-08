import { Resend } from 'resend';

let _client: Resend | null = null;

function client(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  _client = new Resend(key);
  return _client;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

type SendOpts = {
  to: string;
  subject: string;
  html: string;
  text: string;
  // ReplyTo defaults to EMAIL_REPLY_TO or EMAIL_FROM. Useful for support flows
  // that want bounces routed somewhere other than the marketing sender.
  replyTo?: string;
};

export async function sendEmail(opts: SendOpts): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error('EMAIL_FROM is not set');
  await client().emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo ?? process.env.EMAIL_REPLY_TO ?? from,
  });
}

export function resetEmailHtml(opts: { name: string; url: string; minutes: number }): string {
  const safeName = opts.name.replace(/</g, '&lt;');
  return `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0C0A09;color:#FFFBEB;padding:32px">
  <table style="max-width:480px;margin:auto;background:#1C1917;border-radius:16px;padding:32px">
    <tr><td>
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 16px">Restablece tu contraseña</h1>
      <p style="color:#D6D3D1;line-height:1.5;margin:0 0 24px">Hola ${safeName}, recibimos una solicitud para restablecer la contraseña de tu cuenta SantiagoWays.</p>
      <p style="margin:0 0 24px">
        <a href="${opts.url}" style="display:inline-block;background:#FBBF24;color:#0C0A09;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px">Crear nueva contraseña</a>
      </p>
      <p style="color:#A8A29E;font-size:13px;line-height:1.5">El enlace expira en ${opts.minutes} minutos. Si no fuiste tú, ignora este email — tu contraseña no cambiará.</p>
      <p style="color:#78716C;font-size:12px;margin-top:32px">SantiagoWays · Buen Camino, peregrino.</p>
    </td></tr>
  </table>
</body></html>`;
}

export function resetEmailText(opts: { name: string; url: string; minutes: number }): string {
  return [
    `Hola ${opts.name},`,
    '',
    'Recibimos una solicitud para restablecer la contraseña de tu cuenta SantiagoWays.',
    '',
    'Crea una nueva contraseña aquí:',
    opts.url,
    '',
    `Este enlace expira en ${opts.minutes} minutos.`,
    'Si no fuiste tú, ignora este email — tu contraseña no cambiará.',
    '',
    'SantiagoWays — Buen Camino, peregrino.',
  ].join('\n');
}
