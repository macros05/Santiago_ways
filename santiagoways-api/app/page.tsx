export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>SantiagoWays API</h1>
      <p>Backend service. The mobile client lives in <code>/santiagoways-app</code>.</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/routes">/api/routes</a></li>
      </ul>
    </main>
  );
}
