import { useEffect, useState, type ReactNode } from 'react';
import {
  Check,
  Chrome,
  Folder as FolderIcon,
  Info,
  Layers,
  LogOut,
  Moon,
  Palette,
  RefreshCw,
  Sparkles,
  Star,
  StickyNote,
  Sun,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '../types';
import type { FinderLocation } from './types';
import { accentPresets, wallpapers, type AccentId, type WallpaperId } from '../hooks/useAppearance';

type SettingsTab = 'account' | 'appearance' | 'sync' | 'about';

interface SettingsWindowProps {
  user: User | null;
  isDark: boolean;
  compact: boolean;
  counts: { resources: number; folders: number; favorites: number; notes: number };
  onToggleTheme: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onOpenFinder: (location?: FinderLocation) => void;
  onNewSave: () => void;
  accent: AccentId;
  wallpaper: WallpaperId;
  onAccentChange: (accent: AccentId) => void;
  onWallpaperChange: (wallpaper: WallpaperId) => void;
  onUpdateProfile: (input: { fullName?: string; username?: string; avatarUrl?: string | null }) => Promise<void>;
  onChangePassword: (currentPassword: string | undefined, newPassword: string) => Promise<void>;
}

const tabs: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: 'account', label: 'Account', icon: UserRound },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'sync', label: 'Library & Sync', icon: RefreshCw },
  { id: 'about', label: 'About Arcivo', icon: Info },
];

const wallpaperSwatches: Record<WallpaperId, string> = {
  aurora: 'linear-gradient(130deg, #96b49e, #ffceab 55%, #ff847c)',
  sage: 'linear-gradient(130deg, #d8e8d9, #96b49e)',
  sunset: 'linear-gradient(130deg, #ffceab, #ff847c)',
  dusk: 'linear-gradient(130deg, #4d786c, #2a363b)',
  rose: 'linear-gradient(130deg, #f8d9dc, #e84a5f)',
  paper: 'linear-gradient(130deg, #fffaf3, #e9ddc9)',
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function SettingsWindow({
  user,
  isDark,
  compact,
  counts,
  onToggleTheme,
  onLogout,
  onRefresh,
  onOpenFinder,
  onNewSave,
  accent,
  wallpaper,
  onAccentChange,
  onWallpaperChange,
  onUpdateProfile,
  onChangePassword,
}: SettingsWindowProps) {
  const [tab, setTab] = useState<SettingsTab>('account');
  const [name, setName] = useState(user?.fullName ?? '');
  const [username, setUsername] = useState(user?.username ?? user?.email.split('@')[0] ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  useEffect(() => {
    setName(user?.fullName ?? '');
    setUsername(user?.username ?? user?.email.split('@')[0] ?? '');
    setAvatarUrl(user?.avatarUrl ?? '');
  }, [user?.fullName, user?.username, user?.avatarUrl]);

  const saveProfile = async () => {
    setProfileBusy(true);
    setProfileMessage('');
    try {
      await onUpdateProfile({ fullName: name.trim(), username: username.trim(), avatarUrl: avatarUrl.trim() || null });
      setProfileMessage('Profile updated');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Could not update profile');
    } finally {
      setProfileBusy(false);
    }
  };

  return (
    <div className={`flex min-h-0 flex-1 ${compact ? 'flex-col' : 'flex-row'}`}>
      <div
        className={`shrink-0 border-app-border/10 bg-app-panel/30 ${
          compact ? 'flex gap-1 overflow-x-auto border-b px-2 py-1.5' : 'w-[176px] border-r p-2'
        }`}>
        {!compact && (
          <div className="mb-2 flex items-center gap-2 px-1.5 pt-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-app-muted">
              Settings
            </span>
          </div>
        )}
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 rounded-lg px-2 py-[6px] text-[11.5px] font-medium transition-colors ${
                compact ? 'shrink-0' : 'w-full'
              } ${
                active
                  ? 'bg-app-accent/12 text-app-accent'
                  : 'text-app-muted hover:bg-app-hover/5 hover:text-app-text'
              }`}>
              <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-app-accent' : 'text-app-subtle'}`} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'account' && (
          <div className="space-y-3">
            <Panel>
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-base font-bold text-white shadow-lg shadow-brand-berry-600/20">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initialsOf(user?.fullName ?? 'Arcivo')
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-app-text">{user?.fullName ?? 'Arcivo user'}</h3>
                  <p className="truncate text-[11px] text-app-muted">{user?.email ?? 'Signed in'}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-sage-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand-sage-700 dark:text-brand-sage-300">
                    <Check className="h-2.5 w-2.5" />
                    {user?.emailVerified ? 'Verified account' : 'Personal archive'}
                  </span>
                </div>
              </div>

              {user?.createdAt && (
                <p className="mt-3 border-t border-app-border/10 pt-2.5 text-[10px] text-app-subtle">
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Panel>

            <Panel>
              <SectionTitle icon={UserRound} title="Profile details" />
              <div className="mt-2.5 grid gap-2">
                <label className="grid gap-1 text-[10px] font-semibold text-app-muted">Display name
                  <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="rounded-lg border border-app-border/15 bg-app-card/60 px-2.5 py-2 text-[11px] text-app-text outline-none focus:border-app-accent/50" />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-app-muted">Username
                  <input value={username} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30))} minLength={3} maxLength={30} className="rounded-lg border border-app-border/15 bg-app-card/60 px-2.5 py-2 text-[11px] text-app-text outline-none focus:border-app-accent/50" />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-app-muted">Profile picture URL
                  <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://…" className="rounded-lg border border-app-border/15 bg-app-card/60 px-2.5 py-2 text-[11px] text-app-text outline-none focus:border-app-accent/50" />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-app-accent">
                  <input type="file" accept="image/*" className="max-w-[210px] text-[9px] text-app-muted" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2_000_000) { setProfileMessage('Choose an image smaller than 2 MB'); return; }
                    const reader = new FileReader();
                    reader.onload = () => { if (typeof reader.result === 'string') setAvatarUrl(reader.result); };
                    reader.readAsDataURL(file);
                  }} />
                  Upload a profile picture (max 2 MB)
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={profileBusy || name.trim().length < 2} onClick={() => void saveProfile()} className="rounded-lg bg-app-accent px-2.5 py-1.5 text-[10.5px] font-semibold text-white disabled:opacity-50">{profileBusy ? 'Saving…' : 'Save profile'}</button>
                  {profileMessage && <span role="status" className="text-[10px] text-app-muted">{profileMessage}</span>}
                </div>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={LogOut} title="Change password" />
              <div className="mt-2 grid gap-2">
                <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password (if applicable)" className="rounded-lg border border-app-border/15 bg-app-card/60 px-2.5 py-2 text-[11px] text-app-text outline-none" />
                <div className="flex gap-2"><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="min-w-0 flex-1 rounded-lg border border-app-border/15 bg-app-card/60 px-2.5 py-2 text-[11px] text-app-text outline-none" /><button type="button" disabled={newPassword.length < 8} onClick={() => void onChangePassword(currentPassword || undefined, newPassword).then(() => { setNewPassword(''); setCurrentPassword(''); setProfileMessage('Password updated'); }).catch((error) => setProfileMessage(error instanceof Error ? error.message : 'Could not update password'))} className="rounded-lg border border-app-border/15 px-2 text-[10px] font-semibold disabled:opacity-40">Update</button></div>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={Layers} title="Your archive" />
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <Stat label="Saves" value={counts.resources} />
                <Stat label="Folders" value={counts.folders} />
                <Stat label="Liked" value={counts.favorites} />
                <Stat label="Notes" value={counts.notes} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenFinder({ type: 'smart', id: 'all' })}
                  className="rounded-lg bg-app-text px-2.5 py-1.5 text-[10.5px] font-semibold text-app-bg transition-transform hover:-translate-y-0.5">
                  Open Finder
                </button>
                <button
                  type="button"
                  onClick={onNewSave}
                  className="rounded-lg border border-app-border/15 px-2.5 py-1.5 text-[10.5px] font-semibold text-app-text transition-colors hover:bg-app-hover/5">
                  New Save
                </button>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={LogOut} title="Session" />
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-app-muted">
                Signing out clears this device session. Your archive stays synced to your account.
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-brand-berry-500/30 bg-brand-berry-500/10 px-2.5 py-1.5 text-[10.5px] font-semibold text-brand-berry-600 transition-colors hover:bg-brand-berry-500/15 dark:text-brand-coral-300">
                <LogOut className="h-3 w-3" />
                Log out
              </button>
            </Panel>
          </div>
        )}

        {tab === 'appearance' && (
          <div className="space-y-3">
            <Panel>
              <SectionTitle icon={Palette} title="Desktop theme" />
              <p className="mt-1 text-[10.5px] text-app-muted">
                Choose the wallpaper and chrome lighting for your desktop.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <ThemeCard label="Light" active={!isDark} onClick={() => isDark && onToggleTheme()} icon={Sun} />
                <ThemeCard label="Dark" active={isDark} onClick={() => !isDark && onToggleTheme()} icon={Moon} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[9.5px] text-app-subtle">
                <Check className="h-2.5 w-2.5 text-brand-sage-600 dark:text-brand-sage-400" />
                Honors your system reduced-motion setting.
              </p>
            </Panel>

            <Panel>
              <SectionTitle icon={Sparkles} title="Arcivo palette" />
              <div className="mt-2.5 flex flex-wrap gap-2">
                {accentPresets.map((color) => (
                  <button type="button" aria-pressed={accent === color.id} onClick={() => onAccentChange(color.id)} key={color.id} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${accent === color.id ? 'border-app-accent/50 bg-app-accent/10' : 'border-app-border/10 bg-app-card/40'}`}>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-app-border/10"
                      style={{ backgroundColor: color.swatch }}
                    />
                    <span className="text-[10px] font-semibold text-app-text">{color.name}</span>
                    <span className="font-mono text-[9px] text-app-subtle">{color.swatch}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={Palette} title="Desktop wallpaper" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {wallpapers.map((item) => <button key={item.id} type="button" aria-pressed={wallpaper === item.id} onClick={() => onWallpaperChange(item.id)} className={`rounded-xl border p-2 text-left ${wallpaper === item.id ? 'border-app-accent/50 bg-app-accent/10' : 'border-app-border/10 bg-app-card/40'}`}><span className="mb-1.5 block h-8 rounded-lg" style={{ background: wallpaperSwatches[item.id] }} /><span className="block text-[10px] font-semibold text-app-text">{item.name}</span><span className="block text-[9px] text-app-subtle">{item.description}</span></button>)}
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={Star} title="Motion" />
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-app-muted">
                Windows spring into place, the dock magnifies as you move across it, and cards stagger
                into view. When reduced motion is on, transitions collapse to instant fades.
              </p>
            </Panel>
          </div>
        )}

        {tab === 'sync' && (
          <div className="space-y-3">
            <Panel>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-sage-500/15 text-brand-sage-700 dark:text-brand-sage-300">
                  <Chrome className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-bold text-app-text">Chrome extension</h3>
                  <p className="text-[10px] text-app-muted">Connected to the same Arcivo account</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-brand-sage-500/15 px-2 py-0.5 text-[9px] font-semibold text-brand-sage-700 dark:text-brand-sage-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-sage-500" />
                  Live
                </span>
              </div>
              <p className="mt-2.5 text-[10.5px] leading-relaxed text-app-muted">
                Pages you archive from Chrome land here automatically. Sessions and folders sync both
                ways, so your desktop and extension always show the same library.
              </p>
              <button
                type="button"
                onClick={onRefresh}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-app-text px-2.5 py-1.5 text-[10.5px] font-semibold text-app-bg transition-transform hover:-translate-y-0.5">
                <RefreshCw className="h-3 w-3" />
                Sync now
              </button>
            </Panel>

            <Panel>
              <SectionTitle icon={Layers} title="What syncs" />
              <div className="mt-2.5 space-y-1.5">
                <SyncRow icon={Layers} label="Saved pages & reader snapshots" count={counts.resources} />
                <SyncRow icon={FolderIcon} label="Folders and categories" count={counts.folders} />
                <SyncRow icon={Star} label="Liked saves" count={counts.favorites} />
                <SyncRow icon={StickyNote} label="Notes on saves" count={counts.notes} />
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={RefreshCw} title="Connection" />
              <p className="mt-1.5 font-mono text-[10px] text-app-subtle">Arcivo sync service · v1</p>
              <p className="mt-1 text-[10px] text-app-muted">
                Active session for {user?.email ?? 'this account'}.
              </p>
            </Panel>
          </div>
        )}

        {tab === 'about' && (
          <div className="space-y-3">
            <Panel className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white shadow-lg shadow-brand-berry-600/25">
                <FolderIcon className="h-7 w-7" />
              </span>
              <h3 className="mt-3 text-base font-extrabold tracking-tight text-app-text">Arcivo Desktop</h3>
              <p className="mt-1 text-[10.5px] leading-relaxed text-app-muted">
                A home for everything worth keeping — archived from the web, organized like a desktop.
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-[9.5px] font-medium text-app-subtle">
                <span>Version 2.0</span>
                <span>·</span>
                <span>Finder build</span>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={Sparkles} title="Keyboard shortcuts" />
              <div className="mt-2 space-y-1">
                <ShortcutRow keys="⌘ K" label="Spotlight search" />
                <ShortcutRow keys="⌘ N" label="New save" />
                <ShortcutRow keys="⌘ ," label="Settings" />
                <ShortcutRow keys="⌘ W" label="Close active window" />
                <ShortcutRow keys="esc" label="Close Spotlight or Quick Look" />
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={Layers} title="Credits" />
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-app-muted">
                Built with React, Tailwind and Motion. Palette anchored in sage, cream, coral,
                raspberry and ink. Finder, dock and window chrome are custom to Arcivo.
              </p>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-app-border/10 bg-app-card/80 p-3 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-app-subtle" />
      <h4 className="text-[11px] font-bold text-app-text">{title}</h4>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-app-border/10 bg-app-panel/50 px-2.5 py-1.5">
      <p className="text-base font-extrabold tabular-nums text-app-text">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-app-subtle">{label}</p>
    </div>
  );
}

function SyncRow({ icon: Icon, label, count }: { icon: LucideIcon; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-app-border/10 bg-app-panel/40 px-2.5 py-1.5">
      <Icon className="h-3 w-3 shrink-0 text-app-subtle" />
      <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-app-text">{label}</span>
      <span className="rounded-full bg-brand-sage-500/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-brand-sage-700 dark:text-brand-sage-300">
        {count}
      </span>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg px-1 py-1 text-[10.5px]">
      <span className="text-app-muted">{label}</span>
      <kbd className="rounded border border-app-border/15 bg-app-panel/60 px-1.5 py-0.5 text-[9px] font-semibold text-app-text">
        {keys}
      </kbd>
    </div>
  );
}

function ThemeCard({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative overflow-hidden rounded-xl border p-1.5 text-left transition-all ${
        active
          ? 'border-app-accent/45 ring-1 ring-app-accent/30'
          : 'border-app-border/10 hover:border-app-border/25'
      }`}>
      <span
        className={`relative block h-16 overflow-hidden rounded-lg border border-app-border/10 ${
          label === 'Dark' ? 'bg-brand-ink-800' : 'bg-[#F3EEE4]'
        }`}>
        <span
          className={`absolute inset-x-0 top-0 h-2 ${
            label === 'Dark' ? 'bg-brand-ink-700/80' : 'bg-white/70'
          }`}
        />
        <span
          className={`absolute bottom-1 left-1.5 right-1.5 h-1.5 rounded-full ${
            label === 'Dark' ? 'bg-brand-ink-600' : 'bg-brand-ink/10'
          }`}
        />
        <span className="absolute left-2 top-3.5 h-5 w-8 rounded-md bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 opacity-80" />
        <span
          className={`absolute right-2 top-3.5 h-5 w-6 rounded-md ${
            label === 'Dark' ? 'bg-brand-sage-500/35' : 'bg-brand-sage-400/40'
          }`}
        />
      </span>
      <span className="mt-1.5 flex items-center gap-1.5 px-0.5 text-[10.5px] font-semibold text-app-text">
        <Icon className="h-3 w-3 text-app-subtle" />
        {label}
        {active && <Check className="ml-auto h-3 w-3 text-app-accent" />}
      </span>
    </button>
  );
}
