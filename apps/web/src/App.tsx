import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Folder as FolderIcon,
  Layers,
  LayoutGrid,
  List,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  StickyNote,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from './store/auth';
import { useTheme } from './hooks/useTheme';
import { WorkspaceSidebar } from './components/workspace/WorkspaceSidebar';
import { ResourceCard } from './components/workspace/ResourceCard';
import { SaveModal, type SaveDraft } from './components/workspace/SaveModal';
import { ResourceDrawer } from './components/workspace/ResourceDrawer';
import {
  folderPalette,
  kindMeta,
  safeHostname,
  sortOptions,
  timeAgo,
  type SortMode,
  type WorkspaceFolder,
  type WorkspaceResource,
  type WorkspaceTab,
} from './data/workspace';
import { apiErrorMessage } from './lib/api';
import {
  createFolder as createFolderRequest,
  createResource,
  fetchWorkspace,
  updateResource,
} from './lib/resources';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ icon: Icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-app-border/15 bg-app-card/30 px-6 py-14 text-center backdrop-blur-xl">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-app-border/10 bg-app-panel/70 text-app-accent shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-app-text">{title}</h3>
      <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-app-muted">{body}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-app-text px-3.5 py-2 text-[11px] font-semibold text-app-bg transition-transform hover:-translate-y-0.5">
          <Plus className="h-3 w-3" /> {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [resources, setResources] = useState<WorkspaceResource[]>([]);
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<WorkspaceTab>('home');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortMode>('newest');
  const [saveOpen, setSaveOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string; tone: 'success' | 'error' } | null>(
    null,
  );

  const searchRef = useRef<HTMLInputElement | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [now] = useState(() => new Date());

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

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder.id] = resources.filter((resource) => resource.folderId === folder.id).length;
    });
    return counts;
  }, [folders, resources]);

  const favoriteCount = resources.filter((resource) => resource.isFavorite).length;
  const noteCount = resources.filter((resource) => resource.note).length;
  const activeResource = resources.find((resource) => resource.id === activeId) ?? null;
  const activeFolder = activeResource ? folders.find((folder) => folder.id === activeResource.folderId) : undefined;
  const selectedFolder = folderId ? folders.find((folder) => folder.id === folderId) : undefined;

  const matchesQuery = (resource: WorkspaceResource) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    const folderName = folders.find((folder) => folder.id === resource.folderId)?.name ?? '';
    const haystack = [
      resource.title,
      resource.description,
      safeHostname(resource.url),
      folderName,
      ...resource.tags,
      resource.note?.title ?? '',
      resource.note?.body ?? '',
      ...resource.aiSummary,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  };

  const filtered = useMemo(() => {
    const list = resources.filter((resource) => {
      if (tab === 'favorites' && !resource.isFavorite) return false;
      if (folderId && resource.folderId !== folderId) return false;
      return matchesQuery(resource);
    });

    return [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [resources, folders, tab, folderId, query, sort]);

  const notes = useMemo(() => {
    return resources
      .filter((resource) => resource.note)
      .filter((resource) => !folderId || resource.folderId === folderId)
      .filter(matchesQuery)
      .sort(
        (a, b) =>
          new Date(b.note?.updatedAt ?? b.createdAt).getTime() -
          new Date(a.note?.updatedAt ?? a.createdAt).getTime(),
      );
  }, [resources, folders, folderId, query]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (!typing && event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (!typing && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        setSaveOpen(true);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

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

  const selectTab = (nextTab: WorkspaceTab) => {
    setTab(nextTab);
    setFolderId(null);
    setSidebarOpen(false);
  };

  const selectFolder = (id: string | null) => {
    setFolderId(id);
    setTab('home');
    setSidebarOpen(false);
  };

  const toggleFavorite = async (id: string) => {
    const resource = resources.find((item) => item.id === id);
    if (!resource) return;

    const nextFavorite = !resource.isFavorite;
    setResources((current) =>
      current.map((item) => (item.id === id ? { ...item, isFavorite: nextFavorite } : item)),
    );
    notify(nextFavorite ? 'Added to favorites' : 'Removed from favorites', resource.title);

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
    setTab('home');
    setFolderId(null);
    setQuery('');
    notify(`Saved to ${folder?.name ?? 'your archive'}`, created.title);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folder = await createFolderRequest({
        name,
        color: folderPalette[folders.length % folderPalette.length],
      });
      setFolders((current) => [...current, folder]);
      notify('Folder created', name);
    } catch (error) {
      notify('Could not create folder', apiErrorMessage(error), 'error');
    }
  };

  const totalCount = resources.length;
  const isNotesTab = tab === 'notes';
  const hasQuery = query.trim().length > 0;
  const showFolders = tab === 'home' && !folderId && !hasQuery;

  const sectionTitle = isNotesTab
    ? 'Notes'
    : hasQuery
      ? 'Search results'
      : tab === 'favorites'
        ? 'Favorites'
        : tab === 'recent'
          ? 'Recent activity'
          : selectedFolder
            ? selectedFolder.name
            : 'Recently archived';

  const sectionSubtitle = isNotesTab
    ? 'Ideas and reminders attached to the things you saved.'
    : hasQuery
      ? 'Matching titles, tags, notes and AI takeaways.'
      : tab === 'favorites'
        ? 'The saves you keep coming back to.'
        : tab === 'recent'
          ? 'Everything you have archived, newest first.'
          : selectedFolder
            ? selectedFolder.description
            : 'The latest additions to your archive.';

  const itemCount = isNotesTab ? notes.length : filtered.length;
  const firstName = user?.fullName.split(' ').filter(Boolean)[0] ?? 'there';

  const sidebarProps = {
    folders,
    folderCounts,
    totalCount,
    favoriteCount,
    noteCount,
    activeTab: tab,
    selectedFolder: folderId,
    user,
    isDark,
    onToggleTheme: toggleTheme,
    onSelectTab: selectTab,
    onSelectFolder: selectFolder,
    onArchive: () => setSaveOpen(true),
    onCreateFolder: (name: string) => void handleCreateFolder(name),
    onLogout: logout,
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Compass },
    { id: 'favorites' as const, label: 'Favorites', icon: Star },
    { id: 'recent' as const, label: 'Recent', icon: Clock },
    { id: 'notes' as const, label: 'Notes', icon: StickyNote },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-app-text">
      <div className="hidden h-full shrink-0 lg:block">
        <WorkspaceSidebar {...sidebarProps} />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex lg:hidden">
            <div
              aria-hidden="true"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm dark:bg-black/65"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="relative h-full shadow-2xl">
              <WorkspaceSidebar {...sidebarProps} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-grid mask-fade-b absolute inset-x-0 top-0 h-[520px] opacity-40" />
          <div className="animate-drift-slow absolute -right-24 top-10 h-[360px] w-[360px] rounded-full bg-brand-coral-400/15 blur-[120px]" />
          <div className="animate-drift absolute -left-24 top-64 h-[320px] w-[320px] rounded-full bg-brand-sage-400/20 blur-[120px] [animation-delay:-8s]" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:px-9 lg:pt-8">
          {/* Mobile top bar */}
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-xl border border-app-border/10 bg-app-panel/60 p-2 text-app-muted backdrop-blur-xl transition-colors hover:text-app-text">
                <Menu className="h-4 w-4" />
              </button>
              <span className="flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.18em] text-app-text">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white">
                  <FolderIcon className="h-3 w-3" />
                </span>
                ARCIVO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSaveOpen(true)}
                aria-label="Archive a page"
                className="rounded-xl bg-gradient-to-r from-brand-berry-600 to-brand-coral-500 p-2 text-white shadow-lg shadow-brand-berry-600/25">
                <Plus className="h-4 w-4" />
              </button>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-[10px] font-bold text-white">
                  {initials(user?.fullName ?? 'Arcivo')}
                </span>
              )}
            </div>
          </div>

          {/* Greeting */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-app-subtle">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-sage-400" />
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-app-text sm:text-[2.4rem]">
                {greeting(now.getHours())},{' '}
                <span className="font-display text-gradient italic tracking-normal">{firstName}.</span>
              </h1>
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-app-muted">
                {plural(totalCount, 'save')} across {plural(folders.length, 'folder')}.{' '}
                {plural(favoriteCount, 'favorite')}, {plural(noteCount, 'note')} — here is what is
                worth reopening.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSaveOpen(true)}
                className="sheen group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-lg shadow-brand-berry-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-berry-600/45">
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                Archive a page
              </button>
              <button
                onClick={() => searchRef.current?.focus()}
                aria-label="Search your archive"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border/10 bg-app-panel/60 text-app-muted backdrop-blur-xl transition-colors hover:text-app-text sm:hidden">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {[
              { icon: Layers, label: 'Total saves', value: totalCount, tint: 'text-brand-berry-500', bg: 'bg-brand-berry-500/10' },
              { icon: Star, label: 'Favorites', value: favoriteCount, tint: 'text-brand-caramel-500', bg: 'bg-brand-caramel-500/10' },
              { icon: FolderIcon, label: 'Folders', value: folders.length, tint: 'text-brand-sage-600', bg: 'bg-brand-sage-500/10' },
              { icon: StickyNote, label: 'Notes', value: noteCount, tint: 'text-brand-coral-500', bg: 'bg-brand-coral-500/10' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="hover-lift rounded-2xl border border-app-border/10 bg-app-card/40 p-3.5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg} ${stat.tint}`}>
                    <stat.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-app-subtle">{stat.label}</span>
                </div>
                <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-app-text tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile tabs */}
          <div className="mt-5 flex gap-1 rounded-xl border border-app-border/10 bg-app-hover/5 p-1 lg:hidden">
            {navItems.map((item) => {
              const active = tab === item.id && !(item.id === 'home' && folderId);
              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                    active ? 'text-app-text' : 'text-app-muted hover:text-app-text'
                  }`}>
                  {active && (
                    <motion.span
                      layoutId="workspace-mobile-tab"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-lg border border-app-border/10 bg-app-card shadow-sm"
                    />
                  )}
                  <item.icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Folder shortcuts */}
          <AnimatePresence initial={false}>
            {showFolders && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden">
                <div className="mt-7 flex items-center justify-between">
                  <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-app-subtle">
                    Jump back in
                  </h2>
                  <span className="text-[10px] text-app-subtle">{plural(folders.length, 'folder')}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => selectFolder(folder.id)}
                      className="group relative overflow-hidden rounded-2xl border border-app-border/10 bg-app-card/40 p-3.5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-app-accent/30 hover:shadow-lg">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35"
                        style={{ backgroundColor: folder.color }}
                      />
                      <div className="relative flex items-start justify-between">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${folder.color}20`, color: folder.color }}>
                          <FolderIcon className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] tabular-nums text-app-subtle">
                          {plural(folderCounts[folder.id] ?? 0, 'save')}
                        </span>
                      </div>
                      <p className="relative mt-2.5 truncate text-[12.5px] font-semibold text-app-text">
                        {folder.name}
                      </p>
                      <p className="relative mt-0.5 truncate text-[10px] text-app-subtle">{folder.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar */}
          <div className="sticky top-2 z-20 mt-6 rounded-2xl border border-app-border/10 bg-app-panel/75 p-2 shadow-sm backdrop-blur-xl sm:top-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-subtle" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles, tags, notes…"
                  aria-label="Search your archive"
                  className="w-full rounded-xl border border-app-border/10 bg-app-hover/5 py-2 pl-9 pr-20 text-[12.5px] text-app-text outline-none transition-all placeholder:text-app-subtle focus:border-app-accent/40 focus:bg-app-panel/60 focus:ring-4 focus:ring-app-accent/10"
                />
                {query ? (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-text">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-app-border/10 bg-app-panel/60 px-1.5 py-0.5 font-mono text-[9px] text-app-subtle sm:block">
                    ⌘K
                  </kbd>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isNotesTab && (
                  <>
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value as SortMode)}
                        aria-label="Sort resources"
                        className="appearance-none rounded-xl border border-app-border/10 bg-app-hover/5 py-2 pl-8 pr-8 text-[11.5px] font-medium text-app-muted outline-none transition-colors hover:text-app-text focus:border-app-accent/40 focus:ring-4 focus:ring-app-accent/10">
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Sparkles className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-app-subtle" />
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-app-subtle" />
                    </div>

                    <div className="ml-auto flex items-center rounded-xl border border-app-border/10 bg-app-hover/5 p-0.5">
                      <button
                        onClick={() => setView('grid')}
                        aria-label="Grid view"
                        aria-pressed={view === 'grid'}
                        className={`rounded-lg p-1.5 transition-colors ${
                          view === 'grid'
                            ? 'bg-app-card text-app-text shadow-sm'
                            : 'text-app-subtle hover:text-app-text'
                        }`}>
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setView('list')}
                        aria-label="List view"
                        aria-pressed={view === 'list'}
                        className={`rounded-lg p-1.5 transition-colors ${
                          view === 'list'
                            ? 'bg-app-card text-app-text shadow-sm'
                            : 'text-app-subtle hover:text-app-text'
                        }`}>
                        <List className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}

                {isNotesTab && (
                  <span className="ml-auto rounded-xl border border-app-border/10 bg-app-hover/5 px-3 py-2 text-[11px] text-app-subtle">
                    Sorted by last edited
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section heading */}
          <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-app-text">
                {sectionTitle}
                <span className="rounded-full bg-app-hover/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-app-subtle">
                  {itemCount}
                </span>
              </h2>
              <p className="mt-0.5 text-[11px] text-app-muted">{sectionSubtitle}</p>
            </div>

            {folderId && selectedFolder && (
              <button
                onClick={() => setFolderId(null)}
                className="inline-flex items-center gap-1.5 rounded-full border border-app-border/10 bg-app-panel/60 px-3 py-1.5 text-[10px] font-medium text-app-muted backdrop-blur-xl transition-colors hover:text-app-text">
                <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: selectedFolder.color }} />
                {selectedFolder.name}
                <X className="h-3 w-3" />
              </button>
            )}

            {hasQuery && (
              <span className="text-[10px] text-app-subtle">
                Matched <span className="font-semibold text-app-text">“{query.trim()}”</span>
              </span>
            )}
          </div>

          {/* Content */}
          {loadState === 'loading' ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[264px] animate-pulse rounded-2xl border border-app-border/10 bg-app-card/40"
                />
              ))}
            </div>
          ) : loadState === 'error' ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-500/25 bg-rose-500/5 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
                <AlertCircle className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-app-text">Could not load your archive</h3>
              <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-app-muted">{loadError}</p>
              <button
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-app-text px-3.5 py-2 text-[11px] font-semibold text-app-bg transition-transform hover:-translate-y-0.5">
                <RefreshCw className="h-3 w-3" /> Try again
              </button>
            </div>
          ) : isNotesTab ? (
            notes.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {notes.map((resource) => {
                  const note = resource.note;
                  if (!note) return null;
                  const folder = folders.find((item) => item.id === resource.folderId);
                  const meta = kindMeta[resource.kind];
                  const NoteIcon = meta.icon;
                  return (
                    <button
                      key={resource.id}
                      onClick={() => setActiveId(resource.id)}
                      className="group flex flex-col rounded-2xl border border-app-border/10 bg-app-card/45 p-4 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-caramel-400/40 hover:bg-app-card/70 hover:shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 rounded-lg bg-brand-caramel-400/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-caramel-700 dark:text-brand-cream-300">
                          <StickyNote className="h-3 w-3" /> Note
                        </span>
                        <span className="text-[9px] text-app-subtle">{timeAgo(note.updatedAt)}</span>
                      </div>
                      <h3 className="mt-3 line-clamp-1 text-[13px] font-bold text-app-text transition-colors group-hover:text-app-accent">
                        {note.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-4 text-[11.5px] leading-relaxed text-app-muted">{note.body}</p>
                      <div className="mt-auto flex items-center gap-1.5 border-t border-app-border/10 pt-3 text-[10px] text-app-subtle">
                        <NoteIcon className="h-3 w-3 text-app-accent" />
                        <span className="truncate">{resource.title}</span>
                        {folder && (
                          <>
                            <span className="text-app-subtle/50">·</span>
                            <span className="flex shrink-0 items-center gap-1">
                              <span className="h-1 w-1 rounded-sm" style={{ backgroundColor: folder.color }} />
                              {folder.name}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={StickyNote}
                title={query.trim() ? 'No notes match that search' : 'No notes yet'}
                body={
                  query.trim()
                    ? 'Try a different phrase, or clear the search to see every note.'
                    : 'Add a note while archiving, or start one beside a saved resource. Notes stay linked to the page they belong to.'
                }
                actionLabel={query.trim() ? 'Clear search' : 'Archive a page'}
                onAction={() => (query.trim() ? setQuery('') : setSaveOpen(true))}
              />
            )
          ) : filtered.length > 0 ? (
            view === 'grid' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      index={index}
                      folder={folders.find((folder) => folder.id === resource.folderId)}
                      onToggleFavorite={toggleFavorite}
                      onOpen={setActiveId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      index={index}
                      folder={folders.find((folder) => folder.id === resource.folderId)}
                      onToggleFavorite={toggleFavorite}
                      onOpen={setActiveId}
                      variant="list"
                    />
                  ))}
                </AnimatePresence>
              </div>
            )
          ) : (
            <EmptyState
              icon={query.trim() ? Search : tab === 'favorites' ? Star : FolderIcon}
              title={
                query.trim()
                  ? 'Nothing matches that search'
                  : tab === 'favorites'
                    ? 'No favorites yet'
                    : selectedFolder
                      ? `${selectedFolder.name} is empty`
                      : 'Your archive is ready'
              }
              body={
                query.trim()
                  ? 'Try a title, a tag, a folder name, or a phrase from a note.'
                  : tab === 'favorites'
                    ? 'Star a resource and it will show up here for quick access.'
                    : 'Archive the first page and Arcivo keeps a reader copy, metadata and AI takeaways.'
              }
              actionLabel={query.trim() ? 'Clear search' : 'Archive a page'}
              onAction={() => (query.trim() ? setQuery('') : setSaveOpen(true))}
            />
          )}

          {/* Footer */}
          <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-app-border/10 pt-5 text-[9px] uppercase tracking-[0.16em] text-app-subtle sm:flex-row">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-sage-400" />
              Arcivo v1.0 · Reader copies kept
            </span>
            <span>Full Stack Web Development Lab · BSCS 5A</span>
          </div>
        </div>
      </main>

      <SaveModal
        open={saveOpen}
        folders={folders}
        defaultFolderId={folderId}
        onClose={() => setSaveOpen(false)}
        onSave={handleSave}
      />

      <ResourceDrawer
        resource={activeResource}
        folder={activeFolder}
        onClose={() => setActiveId(null)}
        onToggleFavorite={toggleFavorite}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-app-border/10 bg-app-panel/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  toast.tone === 'error'
                    ? 'bg-brand-berry-500/15 text-brand-berry-500'
                    : 'bg-brand-sage-500/15 text-brand-sage-600 dark:text-brand-sage-300'
                }`}>
                {toast.tone === 'error' ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-app-text">{toast.title}</p>
                <p className="max-w-[240px] truncate text-[10px] text-app-subtle">{toast.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
