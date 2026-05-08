'use client';

import { useState } from 'react';

export default function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  // Next 15 passes searchParams as a Promise — unwrap it on the client.
  const [token, setToken] = useState<string | null>(null);
  if (token === null) {
    props.searchParams.then((p) => setToken(p.token ?? ''));
    return <Layout><p style={paragraph}>Cargando…</p></Layout>;
  }

  return <ResetForm token={token} />;
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <Layout>
        <h1 style={heading}>Enlace no válido</h1>
        <p style={paragraph}>
          El enlace está incompleto o ha caducado. Solicita uno nuevo desde la app.
        </p>
      </Layout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(data.error?.message ?? `Error ${res.status}`);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos restablecer tu contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Layout>
        <h1 style={heading}>Contraseña actualizada</h1>
        <p style={paragraph}>
          Ya puedes volver a la app SantiagoWays e iniciar sesión con tu nueva contraseña.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 style={heading}>Restablece tu contraseña</h1>
      <p style={paragraph}>Elige una contraseña nueva con al menos 8 caracteres.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label style={label}>
          Nueva contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            style={input}
          />
        </label>
        <label style={label}>
          Confirmar
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            style={input}
          />
        </label>
        {error ? <p style={errorText}>{error}</p> : null}
        <button type="submit" disabled={submitting} style={submitting ? buttonBusy : button}>
          {submitting ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main style={page}>
      <section style={card}>{children}</section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0C0A09',
  color: '#FFFBEB',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
};

const card: React.CSSProperties = {
  maxWidth: 460,
  width: '100%',
  background: '#1C1917',
  borderRadius: 16,
  padding: 32,
  border: '1px solid #44403C',
};

const heading: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: 28,
  margin: '0 0 12px',
};

const paragraph: React.CSSProperties = {
  color: '#D6D3D1',
  lineHeight: 1.5,
  margin: '0 0 24px',
};

const label: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  fontSize: 14,
  color: '#D6D3D1',
};

const input: React.CSSProperties = {
  background: '#0C0A09',
  color: '#FFFBEB',
  border: '1px solid #44403C',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 16,
};

const button: React.CSSProperties = {
  background: '#FBBF24',
  color: '#0C0A09',
  border: 'none',
  borderRadius: 999,
  padding: '12px 20px',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 8,
};

const buttonBusy: React.CSSProperties = { ...button, opacity: 0.6, cursor: 'wait' };

const errorText: React.CSSProperties = {
  color: '#FCA5A5',
  fontSize: 13,
  margin: 0,
};
