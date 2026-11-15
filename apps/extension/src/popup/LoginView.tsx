import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bookmark,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

interface LoginViewProps {
  busy: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-xs text-brand-ink-50 placeholder:text-brand-ink-400 outline-none transition focus:border-brand-berry-500/60 focus:ring-1 focus:ring-brand-berry-500';

export function LoginView({ busy, error, onSubmit }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    onSubmit(email, password);
  };

  return (
    <div className="w-[360px] bg-brand-ink-900 p-5 text-brand-ink-50">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-berry-600 text-white shadow-lg shadow-brand-berry-600/30">
          <Bookmark className="h-6 w-6" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-white">Sign in to Arcivo</h1>
        <p className="mt-1 text-[11px] text-brand-ink-300">
          Use the same account as your Arcivo workspace to sync every save.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-brand-berry-500/25 bg-brand-berry-500/10 px-3 py-2 text-[11px] text-brand-coral-300">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="extension-email" className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-brand-ink-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-ink-400" />
            <input
              id="extension-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="extension-password" className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-brand-ink-300">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-ink-400" />
            <input
              id="extension-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={1}
              maxLength={72}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1.5 rounded-md p-1 text-brand-ink-400 transition-colors hover:text-brand-ink-100">
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-berry-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-berry-600/30 transition-all hover:bg-brand-berry-500 disabled:cursor-not-allowed disabled:opacity-70">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-brand-ink-400">
        No account yet?{' '}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-coral-400 hover:text-brand-coral-300">
          Create one in the workspace ↗
        </a>
      </p>
    </div>
  );
}
