import { Link } from 'react-router-dom';
import { Bookmark, Github, Heart } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'Features', href: '#features' },
      { label: 'Extension', href: '#extension' },
    ],
  },
];

export function WelcomeFooter() {
  return (
    <footer className="border-t border-app-border/10 bg-app-panel/40 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-600/30">
              <Bookmark className="h-4 w-4" />
            </span>
            <span className="text-sm font-extrabold tracking-[0.22em] text-app-text">ARCIVO</span>
          </Link>
          <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-app-muted">
            A personal internet archive and knowledge workspace. Save it once, keep it readable, find it again.
          </p>
          <a
            href="https://github.com/hasbeejay/Arcivo"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-app-border/10 bg-app-hover/5 px-3 py-1.5 text-[11px] font-medium text-app-muted transition-colors hover:text-app-text">
            <Github className="h-3.5 w-3.5" />
            View the source
          </a>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-subtle">Explore</p>
          <ul className="mt-4 space-y-2.5">
            {columns[0].links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-[12px] text-app-muted transition-colors hover:text-app-text">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/auth" className="text-[12px] text-app-muted transition-colors hover:text-app-text">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/auth?mode=signup" className="text-[12px] text-app-muted transition-colors hover:text-app-text">
                Create account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-subtle">Project</p>
          <ul className="mt-4 space-y-2.5 text-[12px] text-app-muted">
            <li>Full Stack Web Development Lab</li>
            <li>BSCS 5A · Fall 2026</li>
            <li>Haseeb Jalil · Taimur Sajid</li>
            <li>M. Uzair · Sharuf Khan</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-app-border/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-[10px] text-app-subtle sm:flex-row sm:px-8">
          <span>© 2026 Arcivo. Built for the semester project.</span>
          <span className="flex items-center gap-1.5">
            Made with <Heart className="h-3 w-3 text-rose-500" /> NestJS, React &amp; PostgreSQL
          </span>
        </div>
      </div>
    </footer>
  );
}
