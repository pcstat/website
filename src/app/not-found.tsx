import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="pg active" style={{ display: 'block' }}>
      <div className="nf">
        <div className="nf-code" aria-hidden="true">404</div>
        <div className="pe">// Page not found</div>
        <h1 className="pt">This page <span>doesn’t exist</span></h1>
        <p className="pd">The link may be broken, or the page may have moved. Head back home or pick a section from the menu.</p>
        <div className="nf-actions">
          <Link className="bjoin" href="/">Back to home</Link>
          <Link className="nf-link" href="/projects">Browse projects</Link>
        </div>
      </div>
    </section>
  );
}
