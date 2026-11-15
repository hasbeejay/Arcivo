import { useEffect, useRef, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  isDark: boolean;
  disabled?: boolean;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ onCredential, isDark, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onCredential);
  const [scriptReady, setScriptReady] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-arcivo-gsi]');
    if (existing) {
      const handleLoad = () => setScriptReady(true);
      existing.addEventListener('load', handleLoad);
      return () => existing.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.arcivoGsi = 'true';
    script.addEventListener('load', () => setScriptReady(true));
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      setWidth(Math.max(200, Math.min(400, Math.floor(element.clientWidth))));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady || !containerRef.current || !window.google?.accounts?.id || width < 200) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => callbackRef.current(response.credential),
      ux_mode: 'popup',
    });

    containerRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: isDark ? 'filled_black' : 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'center',
      width,
    });
  }, [scriptReady, isDark, width]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-full border border-app-border/10 bg-app-hover/5 px-4 py-3 text-sm font-semibold text-app-muted opacity-80">
          <GoogleIcon />
          Continue with Google
        </button>
        <p className="mt-2 text-center text-[10px] text-app-subtle">
          Set VITE_GOOGLE_CLIENT_ID in apps/web/.env to enable Google sign-in.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex min-h-[44px] justify-center overflow-hidden rounded-full ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    />
  );
}
