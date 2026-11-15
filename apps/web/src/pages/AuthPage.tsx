import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { AuthShowcase } from '../components/auth/AuthShowcase';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/auth';
import { EASE_OUT } from '../components/ui/Reveal';

type AuthMode = 'login' | 'register';

const inputClass =
  'w-full rounded-xl border border-app-border/10 bg-app-hover/5 py-3 pl-11 pr-11 text-sm text-app-text placeholder:text-app-subtle outline-none transition-all focus:border-app-accent/40 focus:bg-app-panel/60 focus:ring-4 focus:ring-app-accent/15';

const strengthMeta = [
  { label: 'Too short', color: 'bg-brand-berry-500', text: 'Use at least 8 characters.' },
  { label: 'Weak', color: 'bg-brand-berry-500', text: 'Add a number or symbol.' },
  { label: 'Fair', color: 'bg-brand-caramel-500', text: 'Add an uppercase letter and a symbol.' },
  { label: 'Good', color: 'bg-brand-mist-500', text: 'Almost there — add a symbol.' },
  { label: 'Strong', color: 'bg-brand-sage-500', text: 'Your archive is well protected.' },
];

function passwordScore(password: string): number {
  if (!password) return 0;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  return checks.filter(Boolean).length;
}

export default function AuthPage() {
  const { isDark, toggleTheme } = useTheme();
  const [params, setParams] = useSearchParams();
  const mode: AuthMode = params.get('mode') === 'signup' ? 'register' : 'login';
  const isRegistering = mode === 'register';

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const busy = useAuthStore((state) => state.busy);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const reduced = useReducedMotion();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const score = passwordScore(password);
  const strength = strengthMeta[score];

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode || busy) return;
    clearError();
    setParams(nextMode === 'register' ? { mode: 'signup' } : {}, { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (isRegistering) {
      await register(fullName.trim(), email.trim(), password);
      return;
    }

    await login(email.trim(), password);
  };

  const handlePasswordKey = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState?.('CapsLock') ?? false);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-grid mask-fade-b absolute inset-x-0 top-0 h-[620px] opacity-40" />
        <div className="animate-aurora absolute -left-24 top-16 h-[420px] w-[420px] rounded-full bg-brand-sage-400/30 blur-[120px]" />
        <div className="animate-drift-slow absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-brand-cream-400/35 blur-[120px]" />
        <div className="animate-drift absolute left-1/2 top-1/3 h-[300px] w-[520px] -translate-x-1/2 rounded-full bg-brand-coral-400/20 blur-[110px] [animation-delay:-7s]" />
      </div>

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Arcivo home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-berry-600 via-brand-berry-500 to-brand-coral-400 text-white shadow-lg shadow-brand-berry-600/25 transition-transform duration-300 group-hover:scale-105">
              <Bookmark className="h-4 w-4" />
            </span>
            <span className="text-sm font-extrabold tracking-[0.22em] text-app-text">ARCIVO</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium text-app-muted transition-colors hover:bg-app-hover/5 hover:text-app-text sm:flex">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
            <Link
              to="/"
              aria-label="Back to home"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-app-border/10 bg-app-panel/50 text-app-muted backdrop-blur-xl transition-colors hover:text-app-text sm:hidden">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-app-border/10 bg-app-panel/50 text-app-muted backdrop-blur-xl transition-colors hover:bg-app-hover/10 hover:text-app-text">
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-24 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pt-20">
        <AuthShowcase />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 26, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mx-auto w-full max-w-[430px]">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-brand-berry-500/30 via-brand-cream-400/20 to-brand-sage-400/25"
            />
            <div className="glass-panel noise relative overflow-hidden rounded-[2rem] p-6 shadow-[0_40px_100px_-40px_rgba(42,54,59,0.45)] sm:p-8">
              <div className="mb-5">
                <GoogleSignInButton
                  onCredential={(credential) => void loginWithGoogle(credential)}
                  isDark={isDark}
                  disabled={busy}
                />
              </div>

              <div className="mb-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-app-border/10" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-app-subtle">
                  or with email
                </span>
                <span className="h-px flex-1 bg-app-border/10" />
              </div>

              {/* Mode switch */}
              <div className="relative grid grid-cols-2 rounded-2xl border border-app-border/10 bg-app-hover/5 p-1">
                {[
                  { value: 'login' as const, label: 'Sign in' },
                  { value: 'register' as const, label: 'Create account' },
                ].map((option) => {
                  const active = mode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => switchMode(option.value)}
                      aria-pressed={active}
                      className={`relative rounded-xl py-2 text-xs font-semibold transition-colors ${
                        active ? 'text-app-text' : 'text-app-muted hover:text-app-text'
                      }`}>
                      {active && (
                        <motion.span
                          layoutId="auth-mode-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute inset-0 rounded-xl border border-app-border/10 bg-app-card shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 min-h-[52px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: EASE_OUT }}>
                    <h1 className="text-2xl font-extrabold tracking-tight text-app-text">
                      {isRegistering ? (
                        <>
                          Create your <span className="font-display text-gradient italic">archive</span>
                        </>
                      ) : (
                        'Welcome back'
                      )}
                    </h1>
                    <p className="mt-1 text-[12px] leading-relaxed text-app-muted">
                      {isRegistering
                        ? 'A free account keeps your saves, notes and snapshots together.'
                        : 'Sign in to open your saved internet.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    key="auth-error"
                    role="alert"
                    aria-live="polite"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="overflow-hidden">
                    <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-rose-600 dark:text-rose-300">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} noValidate={false}>
                <motion.div
                  initial={false}
                  animate={{
                    height: isRegistering ? 'auto' : 0,
                    opacity: isRegistering ? 1 : 0,
                    marginBottom: isRegistering ? 14 : 0,
                  }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                  className="overflow-hidden">
                  <label htmlFor="fullName" className="mb-1.5 mt-4 block text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-3.5 top-3.5 h-4 w-4 text-app-subtle" />
                    <input
                      id="fullName"
                      type="text"
                      required={isRegistering}
                      disabled={!isRegistering}
                      minLength={2}
                      maxLength={100}
                      tabIndex={isRegistering ? 0 : -1}
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Haseeb Jalil"
                      className={inputClass}
                    />
                  </div>
                </motion.div>

                <div className="mb-3.5">
                  <label htmlFor="email" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-app-subtle" />
                    <input
                      id="email"
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

                <div className={isRegistering ? 'mb-1' : 'mb-5'}>
                  <label htmlFor="password" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-app-subtle" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={isRegistering ? 8 : 1}
                      maxLength={72}
                      autoComplete={isRegistering ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyDown={handlePasswordKey}
                      onKeyUp={handlePasswordKey}
                      placeholder={isRegistering ? 'At least 8 characters' : 'Your password'}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-text">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {isRegistering && password.length > 0 && (
                    <div className="mt-2 px-0.5">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((index) => (
                          <span
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              index < score ? strength.color : 'bg-app-border/15'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[10px] text-app-subtle">
                        <span className="font-semibold text-app-muted">{strength.label}</span> · {strength.text}
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {capsLock && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Caps Lock is on
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  disabled={busy}
                  whileTap={reduced ? undefined : { scale: 0.99 }}
                  className="group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-berry-600/30 transition-all hover:-translate-y-0.5 hover:shadow-brand-berry-600/45 disabled:cursor-not-allowed disabled:opacity-70">
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRegistering ? 'Creating your archive…' : 'Signing in…'}
                    </>
                  ) : (
                    <>
                      {isRegistering ? 'Create account' : 'Sign in'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                  <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] transition-transform duration-700 group-hover:translate-x-full" />
                </motion.button>
              </form>

              <p className="mt-5 text-center text-[11px] text-app-muted">
                {isRegistering ? 'Already have an archive?' : 'New to Arcivo?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegistering ? 'login' : 'register')}
                  className="font-semibold text-app-accent transition-colors hover:text-app-accent/80">
                  {isRegistering ? 'Sign in instead' : 'Create an account'}
                </button>
              </p>

              <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-app-border/10 pt-4 text-[9px] text-app-subtle">
                <ShieldCheck className="h-3 w-3 text-brand-sage-600" />
                Passwords hashed with bcrypt · sessions secured with JWT
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] text-app-subtle">
            Arcivo v1.0.0 · Full Stack Web Development Lab · BSCS 5A
          </p>
        </motion.div>
      </div>
    </div>
  );
}
