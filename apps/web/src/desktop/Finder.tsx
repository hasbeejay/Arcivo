import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  Clock,
  Folder as FolderIcon,
  FolderPlus,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  StickyNote,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ResourceCard } from '../components/workspace/ResourceCard';
import {
  kindMeta,
  safeHostname,
  timeAgo,
  type ResourceKind,
  type SortMode,
  type WorkspaceFolder,
  type WorkspaceResource,
} from '../data/workspace';
import {
  locationTitle,
  sameLocation,
  type FinderLocation,
  type SmartView,
} from './types';

interface FinderProps {
  location: FinderLocation;
  navigationKey: number;
  resources: WorkspaceResource[];
  folders: WorkspaceFolder[];
  loading: boolean;
  error: string;
  compact: boolean;
  onNavigate: (location: FinderLocation) => void;
  onRetry: () => void;
  onOpenResource: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onNewSave: (folderId?: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
}

interface SmartItem {
  id: SmartView;
  label: string;
  icon: LucideIcon;
}

const smartItems: SmartItem[] = [
  { id: 'all', label: 'All Saves', icon: Layers },
  { id: 'liked', label: 'Liked', icon: Star },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'notes', label: 'Notes', icon: StickyNote },
];

const kindOrder: ResourceKind[] = ['article', 'video', 'book', 'paper', 'code', 'thread'];

const kindPlural: Record<ResourceKind, string> = {
  article: 'Articles',
  video: 'Videos',
  book: 'Books',
  paper: 'Papers',
  code: 'Code',
  thread: 'Threads',
};

const viewCopy: Record<SmartView, { subtitle: string; empty: string }> = {
  all: {
    subtitle: 'Everything you have archived, in one place.',
    empty: 'Your archive is empty. Save your first page to get started.',
  },
  liked: {
    subtitle: 'The saves you keep coming back to.',
    empty: 'No favorites yet. Tap the star on any save to keep it here.',
  },
  recent: {
    subtitle: 'The newest additions to your archive.',
    empty: 'Nothing saved recently. New saves will land here first.',
  },
  notes: {
    subtitle: 'Ideas and reminders attached to the things you saved.',
    empty: 'No notes yet. Add a thought when you save or open a resource.',
  },
};

function subtitleFor(
  location: FinderLocation,
  folders: WorkspaceFolder[],
): string {
  if (location.type === 'smart') return viewCopy[location.id].subtitle;
  if (location.type === 'folder') {
    const folder = folders.find((item) => item.id === location.id);
    return folder?.description || 'Everything saved in this folder.';
  }
  return `Every ${kindMeta[location.id].label.toLowerCase()} you have archived.`;
}

function emptyCopy(location: FinderLocation): string {
  if (location.type === 'smart') return viewCopy[location.id].empty;
  if (location.type === 'folder') return 'This folder is empty. Save something into it.';
  return `No ${kindMeta[location.id].label.toLowerCase()} saves yet.`;
}

function matchesQuery(resource: WorkspaceResource, folders: WorkspaceFolder[], query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const folderName = folders.find((folder) => folder.id === resource.folderId)?.name ?? '';
  return [
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
    .toLowerCase()
    .includes(normalized);
}

export function Finder({
  location,
  navigationKey,
  resources,
  folders,
  loading,
  error,
  compact,
  onNavigate,
  onRetry,
  onOpenResource,
  onToggleFavorite,
  onNewSave,
  onCreateFolder,
}: FinderProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortMode>('newest');
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    setQuery('');
  }, [navigationKey]);

  const title = locationTitle(location, folders);
  const currentFolder =
    location.type === 'folder' ? folders.find((folder) => folder.id === location.id) : undefined;

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

  const favouriteCount = useMemo(
    () => resources.filter((resource) => resource.isFavorite).length,
    [resources],
  );
  const noteCount = useMemo(
    () => resources.filter((resource) => resource.note).length,
    [resources],
  );
  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((resource) => {
      counts[resource.kind] = (counts[resource.kind] ?? 0) + 1;
    });
    return counts;
  }, [resources]);

  const baseList = useMemo(() => {
    return resources.filter((resource) => {
      if (location.type === 'smart') {
        if (location.id === 'liked') return resource.isFavorite;
        if (location.id === 'notes') return Boolean(resource.note);
        return true;
      }
      if (location.type === 'folder') return resource.folderId === location.id;
      return resource.kind === location.id;
    });
  }, [location, resources]);

  const visible = useMemo(() => {
    const list = baseList.filter((resource) => matchesQuery(resource, folders, query));
    return [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [baseList, folders, query, sort]);

  const notes = useMemo(
    () =>
      visible
        .filter((resource) => resource.note)
        .sort(
          (a, b) =>
            new Date(b.note?.updatedAt ?? b.createdAt).getTime() -
            new Date(a.note?.updatedAt ?? a.createdAt).getTime(),
        ),
    [visible],
  );

  const isNotes = location.type === 'smart' && location.id === 'notes';
  const showNotes = isNotes;
  const itemCount = isNotes ? notes.length : visible.length;
  const hasQuery = query.trim().length > 0;

  const submitFolder = async () => {
    const name = newFolderName.trim();
    if (!name || creatingFolder) return;
    setCreatingFolder(true);
    try {
      await onCreateFolder(name);
      setNewFolderName('');
      setNewFolderOpen(false);
    } finally {
      setCreatingFolder(false);
    }
  };

  const smartRows = smartItems.map((item) => {
    const count =
      item.id === 'liked' ? favouriteCount : item.id === 'notes' ? noteCount : resources.length;
    return { ...item, count };
  });

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-3.5 pb-2 pt-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white shadow-sm">
          <FolderIcon className="h-3 w-3" />
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-app-muted">
          Finder
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 pb-3">
        <SidebarGroup label="Favorites">
          {smartRows.map((item) => {
            const Icon = item.icon;
            const active = sameLocation(location, { type: 'smart', id: item.id });
            return (
              <SidebarRow
                key={item.id}
                active={active}
                icon={Icon}
                label={item.label}
                count={item.count}
                onClick={() => onNavigate({ type: 'smart', id: item.id })}
              />
            );
          })}
        </SidebarGroup>

        <SidebarGroup label="Library">
          {kindOrder.map((kind) => {
            const meta = kindMeta[kind];
            const Icon = meta.icon;
            return (
              <SidebarRow
                key={kind}
                active={sameLocation(location, { type: 'kind', id: kind })}
                icon={Icon}
                label={kindPlural[kind]}
                count={kindCounts[kind] ?? 0}
                onClick={() => onNavigate({ type: 'kind', id: kind })}
              />
            );
          })}
        </SidebarGroup>

        <SidebarGroup
          label="Folders"
          action={
            <button
              type="button"
              onClick={() => setNewFolderOpen((open) => !open)}
              aria-label="Create a folder"
              className="rounded-md p-1 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-text">
              <FolderPlus className="h-3 w-3" />
            </button>
          }>
          {folders.map((folder) => (
            <SidebarRow
              key={folder.id}
              active={sameLocation(location, { type: 'folder', id: folder.id })}
              icon={FolderIcon}
              iconClassName="text-[color:var(--row-color)]"
              color={folder.color}
              label={folder.name}
              count={folderCounts[folder.id] ?? 0}
              onClick={() => onNavigate({ type: 'folder', id: folder.id })}
            />
          ))}

          {newFolderOpen ? (
            <form
              className="px-1.5 pt-1"
              onSubmit={(event) => {
                event.preventDefault();
                void submitFolder();
              }}>
              <div className="flex items-center gap-1 rounded-lg border border-app-accent/30 bg-app-card/70 px-2 py-1">
                <FolderIcon className="h-3 w-3 shrink-0 text-app-subtle" />
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setNewFolderOpen(false);
                      setNewFolderName('');
                    }
                  }}
                  placeholder="New folder"
                  aria-label="New folder name"
                  className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-app-text outline-none placeholder:text-app-subtle"
                />
                <button
                  type="submit"
                  disabled={!newFolderName.trim() || creatingFolder}
                  aria-label="Create folder"
                  className="rounded p-0.5 text-app-accent disabled:opacity-40">
                  {creatingFolder ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </button>
              </div>
            </form>
          ) : null}
        </SidebarGroup>
      </div>

      <div className="border-t border-app-border/10 px-3.5 py-2.5">
        <p className="flex items-center gap-1.5 text-[9.5px] font-medium text-app-subtle">
          <ShieldCheck className="h-3 w-3 text-brand-sage-600 dark:text-brand-sage-400" />
          Synced with your browser
        </p>
      </div>
    </div>
  );

  const compactNav = (
    <div className="flex gap-1.5 overflow-x-auto border-b border-app-border/10 px-2.5 py-2">
      {[
        ...smartItems.map((item) => ({
          key: `smart-${item.id}`,
          label: item.label,
          icon: item.icon,
          active: sameLocation(location, { type: 'smart', id: item.id }),
          go: () => onNavigate({ type: 'smart', id: item.id }),
        })),
        ...folders.map((folder) => ({
          key: `folder-${folder.id}`,
          label: folder.name,
          icon: FolderIcon,
          active: sameLocation(location, { type: 'folder', id: folder.id }),
          go: () => onNavigate({ type: 'folder', id: folder.id }),
        })),
      ].map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.go}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              item.active
                ? 'border-app-accent/30 bg-app-accent/15 text-app-accent'
                : 'border-app-border/10 bg-app-card/40 text-app-muted'
            }`}>
            <Icon className="h-3 w-3" />
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1">
      {!compact && (
        <aside className="w-[186px] shrink-0 border-r border-app-border/10 bg-app-panel/30">
          {sidebar}
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {compact && compactNav}

        <div className="flex flex-wrap items-center gap-2 border-b border-app-border/10 px-3 py-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-app-border/10 bg-app-card/50 p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={`rounded-md p-1.5 transition-colors ${
                view === 'grid' ? 'bg-app-accent/15 text-app-accent' : 'text-app-subtle hover:text-app-text'
              }`}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={`rounded-md p-1.5 transition-colors ${
                view === 'list' ? 'bg-app-accent/15 text-app-accent' : 'text-app-subtle hover:text-app-text'
              }`}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <label className="flex min-w-[140px] flex-1 items-center gap-2 rounded-lg border border-app-border/10 bg-app-card/50 px-2.5 py-1.5 focus-within:border-app-accent/40">
            <Search className="h-3.5 w-3.5 shrink-0 text-app-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this view"
              aria-label="Search this view"
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-app-text outline-none placeholder:text-app-subtle"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="rounded p-0.5 text-app-subtle hover:text-app-text">
                <X className="h-3 w-3" />
              </button>
            )}
          </label>

          <div className="relative hidden sm:block">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              aria-label="Sort saves"
              className="appearance-none rounded-lg border border-app-border/10 bg-app-card/50 py-1.5 pl-2.5 pr-7 text-[11px] font-semibold text-app-muted outline-none">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
            <Clock className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-app-subtle" />
          </div>

          <button
            type="button"
            onClick={() => onNewSave(currentFolder?.id)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-berry-600 to-brand-coral-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-brand-berry-600/25 transition-transform hover:-translate-y-0.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Save</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3 sm:px-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-app-text">{title}</h2>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-app-muted">
                {subtitleFor(location, folders)}
              </p>
            </div>
            <span className="rounded-full border border-app-border/10 bg-app-card/50 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-app-subtle">
              {loading ? 'Loading' : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            </span>
          </div>

          {loading ? (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 210 : 220}px, 1fr))` }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[232px] animate-pulse rounded-2xl border border-app-border/10 bg-app-card/40"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-app-border/15 bg-app-card/30 px-6 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-berry-500/10 text-brand-berry-600 dark:text-brand-coral-300">
                <AlertCircle className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-app-text">Could not load your archive</h3>
              <p className="mt-1 max-w-sm text-[11px] text-app-muted">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-xl bg-app-text px-3 py-1.5 text-[11px] font-semibold text-app-bg">
                Try again
              </button>
            </div>
          ) : showNotes ? (
            notes.length ? (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 210 : 230}px, 1fr))` }}>
                {notes.map((resource, index) => {
                  const folder = folders.find((item) => item.id === resource.folderId);
                  return (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => onOpenResource(resource.id)}
                      style={{
                        animationDelay: `${Math.min(index * 40, 240)}ms`,
                        borderTopColor: folder?.color ?? 'rgb(var(--app-accent) / 0.5)',
                      }}
                      className="animate-float-in group flex flex-col rounded-2xl border border-app-border/10 border-t-2 bg-app-card/55 p-3.5 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-app-accent/30 hover:shadow-lg">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-app-subtle">
                          <FolderIcon className="h-3 w-3 shrink-0" style={{ color: folder?.color }} />
                          <span className="truncate">{folder?.name ?? 'Unfiled'}</span>
                        </span>
                        <StickyNote className="h-3.5 w-3.5 shrink-0 text-brand-caramel-500" />
                      </div>
                      <h4 className="mt-2.5 line-clamp-2 text-[13px] font-bold leading-snug text-app-text transition-colors group-hover:text-app-accent">
                        {resource.note?.title || resource.title}
                      </h4>
                      <p className="mt-1.5 line-clamp-4 whitespace-pre-line text-[11px] leading-relaxed text-app-muted">
                        {resource.note?.body}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-app-border/10 pt-2 text-[9.5px] text-app-subtle">
                        <span className="truncate">{resource.title}</span>
                        <span className="shrink-0">
                          {timeAgo(resource.note?.updatedAt ?? resource.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <FinderEmpty
                icon={StickyNote}
                title={hasQuery ? 'No notes match that search' : 'No notes yet'}
                body={
                  hasQuery
                    ? 'Try a different word, or clear the search to see every note.'
                    : emptyCopy(location)
                }
                actionLabel={hasQuery ? 'Clear search' : 'New Save'}
                onAction={() => (hasQuery ? setQuery('') : onNewSave(currentFolder?.id))}
              />
            )
          ) : visible.length ? (
            view === 'grid' ? (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 210 : 218}px, 1fr))` }}>
                {visible.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    folder={folders.find((folder) => folder.id === resource.folderId)}
                    onToggleFavorite={onToggleFavorite}
                    onOpen={onOpenResource}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {visible.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    folder={folders.find((folder) => folder.id === resource.folderId)}
                    onToggleFavorite={onToggleFavorite}
                    onOpen={onOpenResource}
                    variant="list"
                    index={index}
                  />
                ))}
              </div>
            )
          ) : (
            <FinderEmpty
              icon={hasQuery ? Search : location.type === 'smart' && location.id === 'liked' ? Star : Sparkles}
              title={hasQuery ? 'Nothing matches that search' : emptyCopy(location).split('.')[0]}
              body={
                hasQuery
                  ? 'Try a shorter word, a tag, or a folder name. Search looks through titles, notes and AI takeaways.'
                  : emptyCopy(location)
              }
              actionLabel={hasQuery ? 'Clear search' : 'New Save'}
              onAction={() => (hasQuery ? setQuery('') : onNewSave(currentFolder?.id))}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-app-border/10 px-3.5 py-1.5 text-[9.5px] font-medium text-app-subtle">
          <span className="truncate">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · {title}
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-sage-500" />
            Chrome extension connected
          </span>
        </div>
      </div>
    </div>
  );
}

function SidebarGroup({
  label,
  action,
  children,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-1.5 pb-1">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-app-subtle">{label}</span>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarRow({
  active,
  icon: Icon,
  label,
  count,
  color,
  iconClassName,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  count: number;
  color?: string;
  iconClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={color ? ({ '--row-color': color } as CSSProperties) : undefined}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-[5px] text-left text-[11.5px] font-medium transition-colors ${
        active
          ? 'bg-app-accent/12 text-app-accent'
          : 'text-app-muted hover:bg-app-hover/5 hover:text-app-text'
      }`}>
      <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-app-accent' : 'text-app-subtle'} ${iconClassName ?? ''}`} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className={`text-[9.5px] tabular-nums ${active ? 'text-app-accent/80' : 'text-app-subtle'}`}>
        {count}
      </span>
    </button>
  );
}

function FinderEmpty({
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-app-border/15 bg-app-card/30 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-app-border/10 bg-app-panel/70 text-app-accent shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-sm font-bold text-app-text">{title}</h3>
      <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-app-muted">{body}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-app-text px-3.5 py-1.5 text-[11px] font-semibold text-app-bg transition-transform hover:-translate-y-0.5">
        <Plus className="h-3 w-3" /> {actionLabel}
      </button>
    </div>
  );
}
