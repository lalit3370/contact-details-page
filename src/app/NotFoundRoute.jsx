import { Link } from 'react-router-dom';

export function NotFoundRoute() {
  return (
    <main style={{ padding: '4rem', textAlign: 'center' }}>
      <h1>404 — Not Found</h1>
      <p>
        <Link to="/">Back to contacts</Link>
      </p>
    </main>
  );
}
