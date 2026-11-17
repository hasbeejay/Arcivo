import { useEffect, useRef, useState } from 'react';
import {
  Folder,
  Plus,
  Search,
  Settings,
  Star,
  StickyNote,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DesktopWindowState, FinderLocation } from './types';

interface DockAction {
  id: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
  active?: boolean;
  onClick: () => void;
}

interface DockProps {
  compact: boolean;
  windows: DesktopWindowState[];
  activeApp: 'finder' | 'settings' | null;
  finderOpen: boolean;
  avatarUrl?: string | null;
  initials: string;
  onOpenFinder: (location?: FinderLocation) => void;
  onOpenSettings: () => void;
  onOpenSpotlight: () => void;
  onNewSave: () => void;
  onRestoreWindow: (id: string) => void;
  onOpenAccount: () => void;
}

export function Dock({
  compact,
  windows,
  activeApp,
  finderOpen,
  avatarUrl,
  initials,
  onOpenFinder,
  onOpenSettings,
  onOpenSpotlight,
  onNewSave,
  onRestoreWindow,
  onOpenAccount,
}: DockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const minimized = windows.filter((item) => item.minimized);

  const primary: DockAction[] = [
    {
      id: 'finder',
      label: 'Finder',
      icon: Folder,
      gradient: 'from-brand-sage-500 via-brand-teal-500 to-brand-teal-700',
      active: finderOpen && activeApp === 'finder',
      onClick: () => onOpenFinder(),
    },
    {
      id: 'liked',
      label: 'Liked',
      icon: Star,
      gradient: 'from-brand-coral-400 via-brand-berry-500 to-brand-berry-700',
      onClick: () => onOpenFinder({ type: 'smart', id: 'liked' }),
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      gradient: 'from-brand-cream-300 via-brand-caramel-400 to-brand-caramel-600',
      onClick: () => onOpenFinder({ type: 'smart', id: 'notes' }),
    },
    {
      id: 'spotlight',
      label: 'Spotlight',
      icon: Search,
      gradient: 'from-brand-ink-500 via-brand-ink-700 to-brand-ink-800',
      onClick: onOpenSpotlight,
    },
    {
      id: 'new-save',
      label: 'New Save',
      icon: Plus,
      gradient: 'from-brand-berry-600 via-brand-coral-500 to-brand-cream-300',
      onClick: onNewSave,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      gradient: 'from-brand-mist-400 via-brand-ink-500 to-brand-ink-700',
      active: activeApp === 'settings',
      onClick: onOpenSettings,
    },
  ];

  return (
    <div
      aria-label="Arcivo dock"
      className={`glass-dock absolute left-1/2 z-50 flex -translate-x-1/2 items-end rounded-[22px] shadow-[0_18px_60px_-12px_rgba(42,54,59,0.5)] ${
        compact ? 'bottom-1.5 gap-1 px-2 pb-1.5 pt-2' : 'bottom-2.5 gap-2 px-3 pb-2 pt-2.5'
      }`}
      onMouseMove={(event) => setMouseX(event.clientX - event.currentTarget.getBoundingClientRect().left)}
      onMouseLeave={() => setMouseX(null)}>
      {primary.map((action, index) => (
        <DockButton
          key={action.id}
          action={action}
          index={index}
          mouseX={mouseX}
          compact={compact}
        />
      ))}

      {minimized.length > 0 && <DockDivider compact={compact} />}

      {minimized.map((item, index) => (
        <DockButton
          key={item.id}
          action={{
            id: item.id,
            label: item.title,
            icon: item.app === 'finder' ? Folder : Settings,
            gradient:
              item.app === 'finder'
                ? 'from-brand-sage-500 via-brand-teal-500 to-brand-teal-700'
                : 'from-brand-mist-400 via-brand-ink-500 to-brand-ink-700',
            onClick: () => onRestoreWindow(item.id),
          }}
          index={primary.length + index}
          mouseX={mouseX}
          compact={compact}
        />
      ))}

      <DockDivider compact={compact} />

      <div
        className="group relative flex flex-col items-center"
        onMouseEnter={() => setMouseX(null)}>
        <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md border border-app-border/10 bg-app-panel/95 px-2 py-0.5 text-[10px] font-semibold text-app-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Account
        </span>
        <button
          type="button"
          onClick={onOpenAccount}
          aria-label="Open account settings"
          className={`flex items-center justify-center overflow-hidden rounded-[13px] border border-app-border/15 bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white shadow-md transition-transform duration-150 hover:-translate-y-1 ${
            compact ? 'h-9 w-9 text-[10px]' : 'h-11 w-11 text-[11px]'
          }`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : initials ? (
            <span className="font-bold tracking-wide">{initials}</span>
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </button>
        <span className="mt-0.5 flex h-1 items-center">
          <span className="h-1 w-1 rounded-full bg-brand-berry-500" />
        </span>
      </div>
    </div>
  );
}

function DockDivider({ compact }: { compact: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mb-1 w-px shrink-0 self-center bg-app-border/20 ${compact ? 'h-7' : 'h-9'}`}
    />
  );
}

function DockButton({
  action,
  index,
  mouseX,
  compact,
}: {
  action: DockAction;
  index: number;
  mouseX: number | null;
  compact: boolean;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [center, setCenter] = useState<number | null>(null);
  const Icon = action.icon;

  useEffect(() => {
    const measure = () => {
      const element = ref.current;
      if (element) setCenter(element.offsetLeft + element.offsetWidth / 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [compact, action.label, index, mouseX]);

  const distance = mouseX !== null && center !== null ? Math.abs(mouseX - center) : Infinity;
  const influence = Math.exp(-Math.pow(distance / 78, 2));
  const scale = mouseX === null ? 1 : 1 + influence * (compact ? 0.32 : 0.42);
  const lift = mouseX === null ? 0 : influence * (compact ? 8 : 12);

  return (
    <div className="group relative flex flex-col items-center animate-dock-in">
      <span className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-md border border-app-border/10 bg-app-panel/95 px-2 py-0.5 text-[10px] font-semibold text-app-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {action.label}
      </span>
      <button
        ref={ref}
        type="button"
        onClick={action.onClick}
        aria-label={action.label}
        title={action.label}
        style={{
          transform: `translateY(${-lift}px) scale(${scale})`,
          transformOrigin: 'bottom center',
          transitionDelay: mouseX === null ? '80ms' : '0ms',
        }}
        className={`flex items-center justify-center rounded-[13px] bg-gradient-to-tr text-white shadow-md transition-transform duration-150 ease-out hover:brightness-105 active:scale-95 ${
          compact ? 'h-9 w-9' : 'h-11 w-11'
        } ${action.gradient}`}>
        <Icon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2.1} />
      </button>
      <span className="mt-0.5 flex h-1 items-center">
        {action.active ? (
          <span className="h-1 w-1 rounded-full bg-brand-berry-500" />
        ) : (
          <span className="h-1 w-1 rounded-full bg-transparent" />
        )}
      </span>
    </div>
  );
}
