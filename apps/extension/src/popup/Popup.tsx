import { useEffect, useState } from 'react';
import {
  Bookmark,
  Folder,
  Tag,
  Check,
  Sparkles,
  ExternalLink,
  Loader2,
  LogOut,
} from 'lucide-react';
import {
  ApiError,
  fetchCurrentUser,
  fetchFolders,
  saveResource,
  signIn,
  signOut,
  type ExtensionFolder,
} from '../lib/api';
import { loadSession, saveSession, type StoredSession } from '../lib/storage';
import { LoginView } from './LoginView';

type Status = 'loading' | 'signed-out' | 'signed-in';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Popup() {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<StoredSession | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [tabInfo, setTabInfo] = useState<{ title: string; url: string; favIconUrl?: string }>({
    title: 'Loading current tab...',
    url: '',
  });
  const [folders, setFolders] = useState<ExtensionFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [tags, setTags] = useState('development, research');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const stored = await loadSession();
      if (cancelled) return;

      if (!stored) {
        setStatus('signed-out');
        return;
      }

      try {
        const user = await fetchCurrentUser(stored.token);
        if (cancelled) return;
        const refreshed = { ...stored, user };
        await saveSession(refreshed);
        setSession(refreshed);
        setStatus('signed-in');
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await signOut();
          setStatus('signed-out');
          return;
        }
        // API unreachable: keep the stored session so the popup still works offline.
        setSession(stored);
        setStatus('signed-in');
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setTabInfo({
            title: tabs[0].title || 'Untitled Web Page',
            url: tabs[0].url || '',
            favIconUrl: tabs[0].favIconUrl,
          });
        }
      });
    } else {
      // Browser fallback for local preview testing.
      setTabInfo({
        title: 'Building Better APIs — Practical REST Design',
        url: 'https://example.dev/article/building-better-apis',
      });
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setFolders([]);
      setSelectedFolder('');
      return;
    }

    let cancelled = false;

    fetchFolders(session.token)
      .then((list) => {
        if (cancelled) return;
        setFolders(list);
        setSelectedFolder((current) => current || list[0]?.id || '');
      })
      .catch(() => {
        if (!cancelled) setFolders([]);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const handleLogin = async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const nextSession = await signIn(email, password);
      setSession(nextSession);
      setStatus('signed-in');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSession(null);
    setAuthError(null);
    setStatus('signed-out');
  };

  const handleArchive = async () => {
    if (!session) return;

    if (!/^https?:/i.test(tabInfo.url)) {
      setArchiveError('Open a regular http(s) page to archive it.');
      return;
    }

    setLoading(true);
    setArchiveError(null);

    try {
      await saveResource(session.token, {
        url: tabInfo.url,
        title: tabInfo.title,
        folderId: selectedFolder || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 6),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await signOut();
        setSession(null);
        setStatus('signed-out');
        return;
      }
      setArchiveError(error instanceof Error ? error.message : 'Could not archive this page.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[320px] w-[360px] items-center justify-center bg-slate-900 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Bookmark className="h-6 w-6" />
          </div>
          <span className="flex items-center gap-2 text-[11px]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking your session…
          </span>
        </div>
      </div>
    );
  }

  if (status === 'signed-out' || !session) {
    return <LoginView busy={authBusy} error={authError} onSubmit={(email, password) => void handleLogin(email, password)} />;
  }

  return (
    <div className="flex w-[360px] flex-col space-y-4 bg-slate-900 p-5 text-slate-100">
      {/* Extension Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-600/30 p-1.5 text-indigo-400">
            <Bookmark className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">ARCIVO</h1>
            <p className="max-w-[190px] truncate text-[10px] text-slate-400">{session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
            Synced
          </span>
          <button
            onClick={() => void handleSignOut()}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Account row */}
      <div className="flex items-center gap-2">
        {session.user.avatarUrl ? (
          <img
            src={session.user.avatarUrl}
            alt={session.user.fullName}
            referrerPolicy="no-referrer"
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
            {initials(session.user.fullName)}
          </span>
        )}
        <span className="text-[11px] font-medium text-slate-200">{session.user.fullName}</span>
      </div>

      {/* Captured Webpage Card */}
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 text-xs font-semibold text-slate-200">{tabInfo.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 truncate font-mono text-[11px] text-slate-400">
          <ExternalLink className="h-3 w-3 flex-shrink-0 text-indigo-400" />
          <span className="truncate">{tabInfo.url}</span>
        </div>
        <div className="flex items-center gap-1 pt-1 text-[10px] text-indigo-300">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>Extracts clean reader mode & metadata</span>
        </div>
      </div>

      {/* Destination Folder Selector */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          <Folder className="h-3.5 w-3.5 text-indigo-400" />
          Save to Folder
        </label>
        <select
          value={selectedFolder}
          onChange={(event) => setSelectedFolder(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {folders.length === 0 && <option value="">No folders yet</option>}
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Input */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          <Tag className="h-3.5 w-3.5 text-indigo-400" />
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="api, backend, architecture"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Save Action Button */}
      {archiveError && (
        <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-[10px] leading-relaxed text-rose-300">
          {archiveError}
        </p>
      )}
      <button
        onClick={() => void handleArchive()}
        disabled={loading || saved}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-lg transition-all ${
          saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500'
        }`}>
        {saved ? (
          <>
            <Check className="h-4 w-4" /> Saved to Arcivo!
          </>
        ) : loading ? (
          <span>Archiving page...</span>
        ) : (
          <>
            <Bookmark className="h-4 w-4" /> Archive This Page
          </>
        )}
      </button>

      <div className="border-t border-white/10 pt-2 text-center">
        <a
          href="http://localhost:5173/app"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-slate-400 transition-colors hover:text-indigo-300">
          Open Arcivo Workspace ↗
        </a>
      </div>
    </div>
  );
}
