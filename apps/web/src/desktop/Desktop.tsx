import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../hooks/useTheme';
import { SaveModal, type SaveDraft } from '../components/workspace/SaveModal';
import { ResourceDrawer } from '../components/workspace/ResourceDrawer';
import {
  folderPalette,
  type WorkspaceFolder,
  type WorkspaceResource,
} from '../data/workspace';
import { apiErrorMessage } from '../lib/api';
import {
  createFolder as createFolderRequest,
  createResource,
  fetchWorkspace,
  updateResource,
} from '../lib/resources';
import { COMPACT_BREAKPOINT, isCompactViewport, useWindows } from './useWindows';
import { Window } from './Window';
import { Finder } from './Finder';
import { Dock } from './Dock';
import { MenuBar } from './MenuBar';
import { DesktopIcons } from './DesktopIcons';
import { Spotlight } from './Spotlight';
import { SettingsWindow } from './SettingsWindow';
import type { FinderLocation } from './types';

interface Toast {
  title: string;
  body: string;
  tone: 'success' | 'error';
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Desktop() {
  const { isDark, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [resources, setResources] = useState<WorkspaceResource[]>([]);
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [compact, setCompact] = useState(isCompactViewport);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveFolderId, setSaveFolderId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const toastTimer = useRef<number | null>(null);
  const autoOpened = useRef(false);
  const compactRef = useRef(compact);

  const {
    windows,
    activeWindow,
    activeId: focusedWindowId,
    openFinder,
    newFinderWindow,
    openSettings,
    focus,
    close,
    minimize,
    restore,
    toggleZoom,
    navigate,
    setBounds,
    refit,
  } = useWindows({ folders });

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setLoadError('');

    fetchWorkspace()
      .then((snapshot) => {
        if (cancelled) return;
        setResources(snapshot.resources);
        setFolders(snapshot.folders);
        setLoadState('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(apiErrorMessage(error));
        setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (autoOpened.current) return;
    autoOpened.current = true;
    openFinder({ type: 'smart', id: 'all' });
  }, [openFinder]);

  useEffect(() => {
    let frame = 0;
    const handleResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const nextCompact = window.innerWidth < COMPACT_BREAKPOINT;
        const changed = nextCompact !== compactRef.current;
        compactRef.current = nextCompact;
        setCompact(nextCompact);
        refit(changed ? (nextCompact ? 'compact' : 'desktop') : undefined);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, [refit]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = (title: string, body: string, tone: 'success' | 'error' = 'success') => {
    setToast({ title, body, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  const openSave = (folderId?: string) => {
    setSaveFolderId(folderId ?? null);
    setSaveOpen(true);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      if (event.key.toLowerCase() === 'k' || event.code === 'Space') {
        event.preventDefault();
        setSpotlightOpen((open) => !open);
        return;
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openSave();
        return;
      }
      if (event.key === ',') {
        event.preventDefault();
        openSettings();
        return;
      }
      if (event.key.toLowerCase() === 'w') {
        event.preventDefault();
        if (focusedWindowId) close(focusedWindowId);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [close, focusedWindowId, openSettings]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder.id] = 0;
    });
    resources.forEach((resource) => {
      if (resource.folderId in counts) counts[resource.folderId] += 1;
    });
    return counts;
  }, [folders, resources]);

  const counts = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      all: resources.length,
      liked: resources.filter((resource) => resource.isFavorite).length,
      recent: resources.filter((resource) => new Date(resource.createdAt).getTime() >= weekAgo).length,
      notes: resources.filter((resource) => resource.note).length,
      folders: folders.length,
    };
  }, [folders, resources]);

  const activeResource = resources.find((resource) => resource.id === activeId) ?? null;
  const activeFolder = activeResource
    ? folders.find((folder) => folder.id === activeResource.folderId)
    : undefined;

  const finderOpen = windows.some((item) => item.app === 'finder');
  const activeApp = activeWindow?.app ?? null;

  const navigateFinder = (location: FinderLocation) => {
    const finder =
      windows.find(
        (item) => item.id === focusedWindowId && item.app === 'finder' && !item.minimized,
      ) ??
      [...windows]
        .filter((item) => item.app === 'finder' && !item.minimized)
        .sort((a, b) => b.z - a.z)[0];
    if (finder) navigate(finder.id, location);
    else newFinderWindow(location);
  };

  const openNewFinder = (location?: FinderLocation) => {
    if (location) newFinderWindow(location);
    else openFinder();
  };

  const handleToggleFavorite = async (id: string) => {
    const resource = resources.find((item) => item.id === id);
    if (!resource) return;

    const nextFavorite = !resource.isFavorite;
    setResources((current) =>
      current.map((item) => (item.id === id ? { ...item, isFavorite: nextFavorite } : item)),
    );
    notify(
      nextFavorite ? 'Added to Liked' : 'Removed from Liked',
      resource.title,
      'success',
    );

    try {
      await updateResource(id, { isFavorite: nextFavorite });
    } catch (error) {
      setResources((current) =>
        current.map((item) =>
          item.id === id ? { ...item, isFavorite: resource.isFavorite } : item,
        ),
      );
      notify('Could not update favorite', apiErrorMessage(error), 'error');
    }
  };

  const handleSave = async (draft: SaveDraft) => {
    const folder = folders.find((item) => item.id === draft.folderId) ?? folders[0];
    const created = await createResource({
      url: draft.url,
      folderId: draft.folderId || folder?.id,
      tags: draft.tags,
      note: draft.note,
    });

    setResources((current) => [created, ...current]);
    if (folder) navigateFinder({ type: 'folder', id: folder.id });
    else navigateFinder({ type: 'smart', id: 'all' });
    notify(`Saved to ${folder?.name ?? 'your archive'}`, created.title);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folder = await createFolderRequest({
        name,
        color: folderPalette[folders.length % folderPalette.length],
      });
      setFolders((current) => [...current, folder]);
      navigateFinder({ type: 'folder', id: folder.id });
      notify('Folder created', name);
    } catch (error) {
      notify('Could not create folder', apiErrorMessage(error), 'error');
    }
  };

  const refresh = () => {
    setReloadKey((key) => key + 1);
    notify('Syncing archive', 'Pulling the latest from your Chrome extension.');
  };

  const closeActiveWindow = () => {
    if (focusedWindowId) close(focusedWindowId);
  };

  const openAccount = () => {
    openSettings();
  };

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden bg-app-bg text-app-text">
      <div aria-hidden="true" className="desktop-wallpaper pointer-events-none absolute inset-0">
        <span className="desktop-orb desktop-orb-sage" />
        <span className="desktop-orb desktop-orb-cream" />
        <span className="desktop-orb desktop-orb-coral" />
        <span className="desktop-grid" />
      </div>

      <MenuBar
        activeApp={activeApp}
        activeTitle={activeWindow?.title ?? 'Arcivo Desktop'}
        compact={compact}
        isDark={isDark}
        folders={folders}
        user={user}
        resourceCount={resources.length}
        onOpenFinder={openNewFinder}
        onNewSave={() => openSave()}
        onSettings={() => openSettings()}
        onOpenAccount={openAccount}
        onToggleTheme={toggleTheme}
        onLogout={logout}
        onCloseActive={closeActiveWindow}
        onRefresh={refresh}
        onSpotlight={() => setSpotlightOpen(true)}
        onAbout={() => notify('Arcivo Desktop', 'Everything worth keeping, organized like a desktop.')}
      />

      {!compact && (
        <DesktopIcons
          folders={folders}
          counts={counts}
          folderCounts={folderCounts}
          onOpenFinder={openNewFinder}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-10">
        <AnimatePresence>
          {(compact ? windows.filter((item) => item.id === focusedWindowId) : windows)
            .map((item) => (
            <Window
              key={item.id}
              windowState={item}
              active={focusedWindowId === item.id}
              compact={compact}
              onFocus={focus}
              onClose={close}
              onMinimize={minimize}
              onToggleZoom={toggleZoom}
              onBoundsChange={setBounds}>
              {item.app === 'finder' ? (
                <Finder
                  location={item.finder ?? { type: 'smart', id: 'all' }}
                  navigationKey={item.finderKey}
                  resources={resources}
                  folders={folders}
                  loading={loadState === 'loading'}
                  error={loadState === 'error' ? loadError : ''}
                  compact={compact}
                  onNavigate={(location) => navigate(item.id, location)}
                  onRetry={() => setReloadKey((key) => key + 1)}
                  onOpenResource={setActiveId}
                  onToggleFavorite={(id) => void handleToggleFavorite(id)}
                  onNewSave={openSave}
                  onCreateFolder={handleCreateFolder}
                />
              ) : (
                <SettingsWindow
                  user={user}
                  isDark={isDark}
                  compact={compact}
                  counts={{
                    resources: counts.all,
                    folders: counts.folders,
                    favorites: counts.liked,
                    notes: counts.notes,
                  }}
                  onToggleTheme={toggleTheme}
                  onLogout={logout}
                  onRefresh={refresh}
                  onOpenFinder={openNewFinder}
                  onNewSave={() => openSave()}
                />
              )}
            </Window>
          ))}
        </AnimatePresence>
      </div>

      <Dock
        compact={compact}
        windows={windows}
        activeApp={activeApp}
        finderOpen={finderOpen}
        avatarUrl={user?.avatarUrl}
        initials={initialsOf(user?.fullName ?? '')}
        onOpenFinder={openNewFinder}
        onOpenSettings={() => openSettings()}
        onOpenSpotlight={() => setSpotlightOpen(true)}
        onNewSave={() => openSave()}
        onRestoreWindow={restore}
        onOpenAccount={openAccount}
      />

      <Spotlight
        open={spotlightOpen}
        isDark={isDark}
        resources={resources}
        folders={folders}
        onClose={() => setSpotlightOpen(false)}
        onNavigate={(location) => newFinderWindow(location)}
        onOpenResource={setActiveId}
        onNewSave={() => openSave()}
        onSettings={() => openSettings()}
        onToggleTheme={toggleTheme}
      />

      <ResourceDrawer
        resource={activeResource}
        folder={activeFolder}
        onClose={() => setActiveId(null)}
        onToggleFavorite={(id) => void handleToggleFavorite(id)}
      />

      <SaveModal
        open={saveOpen}
        folders={folders}
        defaultFolderId={saveFolderId}
        onClose={() => setSaveOpen(false)}
        onSave={handleSave}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`pointer-events-auto absolute top-9 z-[100] flex w-[min(380px,calc(100vw-24px))] items-start gap-2.5 rounded-xl border border-app-border/12 bg-app-panel/95 px-3 py-2.5 shadow-2xl backdrop-blur-2xl ${
              compact ? 'left-1/2 -translate-x-1/2' : 'right-3'
            }`}>
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                toast.tone === 'success'
                  ? 'bg-brand-sage-500/15 text-brand-sage-700 dark:text-brand-sage-300'
                  : 'bg-brand-berry-500/15 text-brand-berry-600 dark:text-brand-coral-300'
              }`}>
              {toast.tone === 'success' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-bold text-app-text">{toast.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-app-muted">{toast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="rounded-md p-0.5 text-app-subtle transition-colors hover:text-app-text">
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-24 left-4 z-0 hidden items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-app-subtle/70 lg:flex">
        <Sparkles className="h-3 w-3" />
        <span>{resources.length} saves in Arcivo</span>
      </div>

      {loadState === 'error' && (
        <div className="pointer-events-none absolute left-4 top-12 z-20 flex max-w-xs items-start gap-2 rounded-xl border border-brand-berry-500/25 bg-app-panel/90 px-2.5 py-2 text-[10.5px] text-app-muted shadow-lg backdrop-blur-xl">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-berry-600 dark:text-brand-coral-300" />
          <span>
            <strong className="block font-semibold text-app-text">Archive sync paused</strong>
            {loadError || 'Could not reach the Arcivo API.'}
          </span>
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {activeWindow ? `${activeWindow.title} is focused` : 'Arcivo desktop'}
      </div>
    </div>
  );
}
