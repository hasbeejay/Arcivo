import { useState, type FormEvent } from 'react';
import {
  Bookmark,
  Clock,
  Compass,
  Folder as FolderIcon,
  FolderPlus,
  LogOut,
  Moon,
  Plus,
  Star,
  StickyNote,
  Sun,
  X,
} from 'lucide-react';
import type { User } from '../../types';
import type { WorkspaceFolder, WorkspaceTab } from '../../data/workspace';

interface WorkspaceSidebarProps {
  folders: WorkspaceFolder[];
  folderCounts: Record<string, number>;
  totalCount: number;
  favoriteCount: number;
  noteCount: number;
  activeTab: WorkspaceTab;
  selectedFolder: string | null;
  user: User | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectTab: (tab: WorkspaceTab) => void;
  onSelectFolder: (id: string | null) => void;
  onArchive: () => void;
  onCreateFolder: (name: string) => void;
  onLogout: () => void;
  onClose?: () => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function WorkspaceSidebar({
  folders,
  folderCounts,
  totalCount,
  favoriteCount,
  noteCount,
  activeTab,
  selectedFolder,
  user,
  isDark,
  onToggleTheme,
  onSelectTab,
  onSelectFolder,
  onArchive,
  onCreateFolder,
  onLogout,
  onClose,
}: WorkspaceSidebarProps) {
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderDraft, setFolderDraft] = useState('');

  const navItems = [
    { tab: 'home' as const, label: 'Home', icon: Compass, count: totalCount },
    { tab: 'favorites' as const, label: 'Favorites', icon: Star, count: favoriteCount },
    { tab: 'recent' as const, label: 'Recent', icon: Clock, count: null },
    { tab: 'notes' as const, label: 'Notes', icon: StickyNote, count: noteCount },
  ];

  const submitFolder = (event: FormEvent) => {
    event.preventDefault();
    const name = folderDraft.trim();
    if (!name) return;
    onCreateFolder(name);
    setFolderDraft('');
    setAddingFolder(false);
  };

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-app-border/10 bg-app-panel/55 backdrop-blur-2xl lg:w-[264px]">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 text-white shadow-lg shadow-brand-berry-600/25">
            <Bookmark className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-app-panel bg-brand-sage-400" />
          </span>
          <div>
            <p className="text-[13px] font-extrabold tracking-[0.2em] text-app-text">ARCIVO</p>
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-app-subtle">Your archive</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-full p-2 text-app-muted transition-colors hover:bg-app-hover/10 hover:text-app-text lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          onClick={onArchive}
          className="sheen group flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-berry-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-berry-600/40">
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Archive a page
          <span className="ml-auto rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[9px] font-medium">N</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-6">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-app-subtle">Workspace</p>
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.tab && !(item.tab === 'home' && selectedFolder);
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-app-accent/10 text-app-accent'
                    : 'text-app-muted hover:bg-app-hover/5 hover:text-app-text'
                }`}>
                <item.icon
                  className={`h-4 w-4 ${active ? 'text-app-accent' : 'text-app-subtle group-hover:text-app-text'}`}
                />
                {item.label}
                {item.count !== null && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      active ? 'bg-app-accent/15 text-app-accent' : 'bg-app-hover/10 text-app-subtle'
                    }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-7 flex items-center justify-between px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-app-subtle">Folders</p>
          <button
            onClick={() => setAddingFolder((current) => !current)}
            aria-label={addingFolder ? 'Cancel new folder' : 'New folder'}
            className="rounded-md p-1 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-text">
            {addingFolder ? <X className="h-3.5 w-3.5" /> : <FolderPlus className="h-3.5 w-3.5" />}
          </button>
        </div>

        {addingFolder && (
          <form onSubmit={submitFolder} className="mt-2 px-1">
            <input
              autoFocus
              value={folderDraft}
              onChange={(event) => setFolderDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setAddingFolder(false);
              }}
              placeholder="Folder name"
              maxLength={40}
              className="w-full rounded-lg border border-app-accent/30 bg-app-hover/5 px-2.5 py-1.5 text-[12px] text-app-text outline-none placeholder:text-app-subtle focus:ring-2 focus:ring-app-accent/20"
            />
          </form>
        )}

        <div className="mt-2 space-y-0.5">
          {folders.map((folder) => {
            const active = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                aria-current={active ? 'true' : undefined}
                className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] transition-colors ${
                  active
                    ? 'bg-app-hover/10 font-semibold text-app-text'
                    : 'text-app-muted hover:bg-app-hover/5 hover:text-app-text'
                }`}>
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${folder.color}22`, color: folder.color }}>
                  <FolderIcon className="h-3 w-3" />
                </span>
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-[10px] tabular-nums text-app-subtle">{folderCounts[folder.id] ?? 0}</span>
              </button>
            );
          })}

          {selectedFolder && (
            <button
              onClick={() => onSelectFolder(null)}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-medium text-app-accent transition-colors hover:bg-app-accent/5">
              <X className="h-3 w-3" /> Clear folder filter
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-app-border/10 p-3">
        <div className="mb-2 flex items-center justify-between rounded-xl bg-brand-sage-400/10 px-3 py-2">
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-brand-sage-700 dark:text-brand-sage-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-sage-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-sage-500" />
            </span>
            Extension synced
          </span>
          <span className="text-[9px] text-app-subtle">Live</span>
        </div>

        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-app-muted transition-colors hover:bg-app-hover/5 hover:text-app-text">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? 'Light mode' : 'Dark mode'}
          <span
            className={`ml-auto flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${
              isDark ? 'bg-app-accent' : 'bg-app-border/20'
            }`}>
            <span
              className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                isDark ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </span>
        </button>

        <div className="mt-1 flex items-center gap-2.5 rounded-xl px-2 py-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-[11px] font-bold text-white">
              {initials(user?.fullName ?? 'Arcivo')}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-app-text">{user?.fullName ?? 'Arcivo user'}</p>
            <p className="truncate text-[10px] text-app-subtle">{user?.email ?? 'Signed in'}</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-1.5 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-text">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
