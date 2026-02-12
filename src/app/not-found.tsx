import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, #eff6ff, #ffffff)' }}>
          <nav style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                    <path d="M3 12A9 3 0 0 0 21 12" />
                  </svg>
                  <span style={{ marginLeft: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>IndustryDB</span>
                </Link>
              </div>
            </div>
          </nav>

          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
              <div style={{ marginBottom: '2rem', position: 'relative', display: 'inline-block' }}>
                <span style={{ fontSize: '9rem', fontWeight: 'bold', color: '#f3f4f6', userSelect: 'none', lineHeight: 1 }}>
                  404
                </span>
              </div>

              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Page not found
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          </main>

          <footer style={{ borderTop: '1px solid #e5e7eb', backgroundColor: 'white', padding: '1.5rem 0' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              <p>&copy; {new Date().getFullYear()} IndustryDB. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
