import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bookmark } from 'lucide-react';
import WelcomePage from './pages/WelcomePage';
import { useAuthStore } from './store/auth';

const Workspace = lazy(() => import('./App'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function Splash() {
  return (
    <div className="flex h-screen w-screen items-center justify-center text-app-text">
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-2xl bg-indigo-500/30"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-2xl border border-indigo-400/30"
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0.1, 0.8] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-600/30">
            <Bookmark className="h-7 w-7" />
          </span>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-tight text-app-text">Opening your archive…</p>
          <p className="mt-1 text-[11px] text-app-subtle">Restoring your session</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedWorkspace() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return <Splash />;
  if (status !== 'authenticated') return <Navigate to="/auth" replace />;

  return <Workspace />;
}

function AuthRoute() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return <Splash />;
  if (status === 'authenticated') return <Navigate to="/app" replace />;

  return <AuthPage />;
}

export default function Root() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const handleForcedLogout = () => logout();
    window.addEventListener('arcivo:logout', handleForcedLogout);
    return () => window.removeEventListener('arcivo:logout', handleForcedLogout);
  }, [logout]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Splash />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/app" element={<ProtectedWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
