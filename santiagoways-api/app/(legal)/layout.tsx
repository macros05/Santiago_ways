import type { ReactNode } from 'react';

// Shared chrome for the public legal pages (/terms, /privacy). These are linked
// from the in-app paywall (app/plans.tsx → santiagoways.app/terms|privacy), so
// they must be served on the public web domain. Deploy this Next app (or copy
// these pages) at https://santiagoways.app.
//
// NOTE: This is a solid starting template covering what the app actually
// collects, but it is NOT a substitute for legal advice. Fill in the
// [BRACKETED] placeholders and have it reviewed before launch.
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        color: '#1c1917',
        lineHeight: 1.6,
        maxWidth: 760,
        margin: '0 auto',
        padding: '3rem 1.25rem 5rem',
      }}
    >
      <a href="/" style={{ color: '#3A6B47', textDecoration: 'none', fontSize: 14 }}>
        ← SantiagoWays
      </a>
      {children}
      <hr style={{ margin: '3rem 0 1.5rem', border: 0, borderTop: '1px solid #e7e5e4' }} />
      <footer style={{ fontSize: 13, color: '#78716c' }}>
        <p>
          <a href="/terms" style={{ color: '#3A6B47', marginRight: 16 }}>
            Terms of Service
          </a>
          <a href="/privacy" style={{ color: '#3A6B47' }}>
            Privacy Policy
          </a>
        </p>
        <p>© {new Date().getFullYear()} [COMPANY NAME] · SantiagoWays</p>
      </footer>
    </main>
  );
}
