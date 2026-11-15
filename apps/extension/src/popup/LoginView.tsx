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
  'w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500';

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
    <div className="w-[360px] bg-slate-900 p-5 text-slate-100">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Bookmark className="h-6 w-6" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-white">Sign in to Arcivo</h1>
        <p className="mt-1 text-[11px] text-slate-400">
          Use the same account as your Arcivo workspace to sync every save.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="extension-email" className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
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
          <label htmlFor="extension-password" className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
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
              className="absolute right-2 top-1.5 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-200">
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70">
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

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-500">
        No account yet?{' '}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-indigo-400 hover:text-indigo-300">
          Create one in the workspace ↗
        </a>
      </p>
    </div>
  );
}
