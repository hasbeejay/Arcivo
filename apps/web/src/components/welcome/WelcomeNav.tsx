import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ArrowUpRight, Bookmark, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/auth';

const links = [
  { label: 'How it works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Extension', href: '#extension' },
];

export function WelcomeNav() {
  const { isDark, toggleTheme } = useTheme();
  const status = useAuthStore((state) => state.status);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (value) => {
    setScrolled(value > 24);
  });

  // Only render section links on the landing page.
  const showSectionLinks = location.pathname === '/';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-app-border/10 bg-app-panel/70 backdrop-blur-2xl'
          : 'border-b border-transparent bg-transparent'
      }`}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Arcivo home">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-brand-berry-600 via-brand-berry-500 to-brand-coral-400 text-white shadow-lg shadow-brand-berry-600/25 transition-transform duration-300 group-hover:scale-105">
            <Bookmark className="h-4 w-4" />
          </span>
          <span className="text-sm font-extrabold tracking-[0.22em] text-app-text">ARCIVO</span>
        </Link>

        {showSectionLinks && (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Landing sections">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-[13px] font-medium text-app-muted transition-colors hover:text-app-text">
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-brand-berry-500 to-brand-coral-400 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-app-border/10 bg-app-panel/50 text-app-muted backdrop-blur-xl transition-colors hover:bg-app-hover/10 hover:text-app-text">
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {status === 'authenticated' ? (
            <Link
              to="/app"
              className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-berry-600 to-brand-coral-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-berry-600/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-berry-600/40">
              Open workspace
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-full px-3.5 py-2 text-xs font-semibold text-app-muted transition-colors hover:bg-app-hover/5 hover:text-app-text sm:block">
                Sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="group relative overflow-hidden rounded-full bg-app-text px-4 py-2 text-xs font-semibold text-app-bg shadow-lg transition-transform hover:-translate-y-0.5">
                <span className="relative z-10 flex items-center gap-1.5">
                  Get started
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-brand-berry-500 via-brand-berry-400 to-brand-coral-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
