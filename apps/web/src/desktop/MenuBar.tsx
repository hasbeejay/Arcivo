import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Clock,
  Folder as FolderIcon,
  Layers,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  StickyNote,
  Sun,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WorkspaceFolder } from '../data/workspace';
import type { DesktopApp, FinderLocation } from './types';

type MenuId = 'arcivo' | 'file' | 'go';

interface MenuBarProps {
  activeApp: DesktopApp | null;
  activeTitle: string;
  compact: boolean;
  isDark: boolean;
  folders: WorkspaceFolder[];
  user: { fullName: string; email: string; avatarUrl?: string | null } | null;
  resourceCount: number;
  onOpenFinder: (location?: FinderLocation) => void;
  onNewSave: () => void;
  onSettings: () => void;
  onOpenAccount: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onCloseActive: () => void;
  onRefresh: () => void;
  onSpotlight: () => void;
  onAbout: () => void;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function MenuBar({
  activeApp,
  activeTitle,
  compact,
  isDark,
  folders,
  user,
  resourceCount,
  onOpenFinder,
  onNewSave,
  onSettings,
  onOpenAccount,
  onToggleTheme,
  onLogout,
  onCloseActive,
  onRefresh,
  onSpotlight,
  onAbout,
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [now, setNow] = useState(() => new Date());
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const handlePointer = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openMenu]);

  const run = (action: () => void) => {
    setOpenMenu(null);
    action();
  };

  const appLabel = activeApp === 'settings' ? 'Settings' : activeApp === 'finder' ? 'Finder' : 'Desktop';

  return (
    <header className="glass-panel absolute inset-x-0 top-0 z-[60] flex h-[30px] items-center gap-1 border-x-0 border-t-0 px-2 text-app-text shadow-sm">
      <div ref={navRef} className="flex min-w-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => setOpenMenu((current) => (current === 'arcivo' ? null : 'arcivo'))}
          aria-label="Arcivo menu"
          aria-expanded={openMenu === 'arcivo'}
          className={`flex h-[22px] items-center gap-1.5 rounded-md px-1.5 transition-colors ${
            openMenu === 'arcivo' ? 'bg-app-accent/15' : 'hover:bg-app-hover/10'
          }`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white">
            <FolderIcon className="h-2.5 w-2.5" />
          </span>
          <span className="text-[11.5px] font-extrabold tracking-tight">Arcivo</span>
        </button>

        <span className="mx-1 hidden h-3 w-px bg-app-border/15 sm:block" />

        <span className="hidden truncate text-[11.5px] font-bold text-app-text sm:block">
          {appLabel}
        </span>

        {!compact && (
          <>
            <MenuTrigger
              label="File"
              open={openMenu === 'file'}
              onToggle={() => setOpenMenu((current) => (current === 'file' ? null : 'file'))}>
              <MenuItem icon={Plus} label="New Save" shortcut="⌘N" onClick={() => run(onNewSave)} />
              <MenuItem
                icon={Search}
                label="Spotlight Search"
                shortcut="⌘K"
                onClick={() => run(onSpotlight)}
              />
              <MenuDivider />
              <MenuItem icon={FolderIcon} label="Show Finder" onClick={() => run(() => onOpenFinder())} />
              <MenuItem
                icon={Settings}
                label="Settings…"
                shortcut="⌘,"
                onClick={() => run(onSettings)}
              />
              <MenuDivider />
              <MenuItem
                icon={X}
                label="Close Window"
                shortcut="⌘W"
                onClick={() => run(onCloseActive)}
              />
            </MenuTrigger>

            <MenuTrigger
              label="Go"
              open={openMenu === 'go'}
              onToggle={() => setOpenMenu((current) => (current === 'go' ? null : 'go'))}>
              <MenuItem
                icon={Layers}
                label="All Saves"
                onClick={() => run(() => onOpenFinder({ type: 'smart', id: 'all' }))}
              />
              <MenuItem
                icon={Star}
                label="Liked"
                onClick={() => run(() => onOpenFinder({ type: 'smart', id: 'liked' }))}
              />
              <MenuItem
                icon={Clock}
                label="Recent"
                onClick={() => run(() => onOpenFinder({ type: 'smart', id: 'recent' }))}
              />
              <MenuItem
                icon={StickyNote}
                label="Notes"
                onClick={() => run(() => onOpenFinder({ type: 'smart', id: 'notes' }))}
              />
              {folders.length > 0 && <MenuDivider />}
              {folders.slice(0, 7).map((folder) => (
                <MenuItem
                  key={folder.id}
                  icon={FolderIcon}
                  iconColor={folder.color}
                  label={folder.name}
                  onClick={() => run(() => onOpenFinder({ type: 'folder', id: folder.id }))}
                />
              ))}
            </MenuTrigger>
          </>
        )}

        {openMenu === 'arcivo' && (
          <div className="absolute left-2 top-[31px] min-w-[212px] rounded-xl border border-app-border/12 bg-app-panel/95 p-1 shadow-2xl backdrop-blur-2xl">
            <div className="px-2.5 pb-1.5 pt-1">
              <p className="text-[11px] font-bold text-app-text">{user?.fullName ?? 'Arcivo'}</p>
              <p className="truncate text-[9.5px] text-app-subtle">{user?.email ?? 'Arcivo desktop'}</p>
            </div>
            <MenuDivider />
            <MenuItem icon={Layers} label="About Arcivo" onClick={() => run(onAbout)} />
            <MenuItem icon={Settings} label="Settings…" shortcut="⌘," onClick={() => run(onSettings)} />
            <MenuItem icon={Search} label="Spotlight" shortcut="⌘K" onClick={() => run(onSpotlight)} />
            <MenuDivider />
            <MenuItem icon={LogOut} label="Log Out" onClick={() => run(onLogout)} />
          </div>
        )}
      </div>

      {compact && (
        <span className="ml-1 min-w-0 flex-1 truncate text-[10.5px] font-medium text-app-subtle">
          {activeTitle}
        </span>
      )}

      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Sync archive"
          title={`${resourceCount} saves synced`}
          className="flex h-[22px] items-center gap-1 rounded-md px-1.5 text-app-muted transition-colors hover:bg-app-hover/10 hover:text-app-text">
          <RefreshCw className="h-3 w-3" />
          <span className={`text-[10px] font-semibold ${compact ? 'hidden' : 'hidden md:inline'}`}>
            Synced
          </span>
          <span className="h-1 w-1 rounded-full bg-brand-sage-500" />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md text-app-muted transition-colors hover:bg-app-hover/10 hover:text-app-text">
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <span className="mx-1 h-3 w-px bg-app-border/15" />

        <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-app-muted sm:flex">
          <span>{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="tabular-nums">
            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-app-muted sm:hidden">
          {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>

        <button
          type="button"
          onClick={onOpenAccount}
          aria-label="Open account"
          className="ml-1 flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full border border-app-border/15 bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-[8px] font-bold text-white">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            initialsOf(user?.fullName ?? 'Arcivo')
          )}
        </button>
      </div>
    </header>
  );
}

function MenuTrigger({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`h-[22px] rounded-md px-2 text-[11.5px] font-medium transition-colors ${
          open ? 'bg-app-accent/15 text-app-text' : 'text-app-muted hover:bg-app-hover/10 hover:text-app-text'
        }`}>
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-[26px] min-w-[206px] rounded-xl border border-app-border/12 bg-app-panel/95 p-1 shadow-2xl backdrop-blur-2xl">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  iconColor,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  iconColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-[5px] text-left text-[11.5px] font-medium text-app-text transition-colors hover:bg-app-accent/12 hover:text-app-accent">
      <Icon className="h-3.5 w-3.5 shrink-0 text-app-subtle" style={iconColor ? { color: iconColor } : undefined} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {shortcut && <span className="text-[9.5px] font-medium text-app-subtle">{shortcut}</span>}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 h-px bg-app-border/10" />;
}
