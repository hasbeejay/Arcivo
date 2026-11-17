import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
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

function useDockMagnification(
  mouseX: number | null,
  compact: boolean,
  layoutKey: number,
) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [center, setCenter] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const measure = () => {
      const element = ref.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        setCenter(rect.left + rect.width / 2);
      }
    };
    measure();
    const timer = window.setTimeout(measure, 90);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [compact, layoutKey]);

  const resting = prefersReducedMotion || mouseX === null || center === null;
  const distance = resting ? Number.POSITIVE_INFINITY : Math.abs(mouseX - center);
  const influence = Math.exp(-Math.pow(distance / (compact ? 62 : 74), 2));
  const scale = resting ? 1 : 1 + influence * (compact ? 0.3 : 0.38);

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'bottom center',
    transition: prefersReducedMotion
      ? 'none'
      : resting
        ? 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
        : 'transform 70ms linear',
    willChange: 'transform',
  };

  return { ref, style, zIndex: Math.round(scale * 100) };
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
  const layoutKey = windows.length;

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
      onMouseMove={(event) => setMouseX(event.clientX)}
      onMouseLeave={() => setMouseX(null)}>
      {primary.map((action) => (
        <DockButton
          key={action.id}
          action={action}
          mouseX={mouseX}
          compact={compact}
          layoutKey={layoutKey}
        />
      ))}

      {minimized.length > 0 && <DockDivider compact={compact} />}

      {minimized.map((item) => (
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
          mouseX={mouseX}
          compact={compact}
          layoutKey={layoutKey}
        />
      ))}

      <DockDivider compact={compact} />

      <DockAccount
        avatarUrl={avatarUrl}
        initials={initials}
        onClick={onOpenAccount}
        mouseX={mouseX}
        compact={compact}
        layoutKey={layoutKey}
      />
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
  mouseX,
  compact,
  layoutKey,
}: {
  action: DockAction;
  mouseX: number | null;
  compact: boolean;
  layoutKey: number;
}) {
  const { ref, style, zIndex } = useDockMagnification(mouseX, compact, layoutKey);
  const Icon = action.icon;

  return (
    <div
      style={{ zIndex }}
      className="animate-dock-in group relative flex flex-col items-center">
      <span className="pointer-events-none absolute -top-8 z-20 whitespace-nowrap rounded-md border border-app-border/10 bg-app-panel/95 px-2 py-0.5 text-[10px] font-semibold text-app-text opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {action.label}
      </span>
      <button
        ref={ref}
        type="button"
        onClick={action.onClick}
        aria-label={action.label}
        title={action.label}
        style={style}
        className={`flex items-center justify-center rounded-[13px] bg-gradient-to-tr text-white shadow-md active:brightness-95 ${
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

function DockAccount({
  avatarUrl,
  initials,
  onClick,
  mouseX,
  compact,
  layoutKey,
}: {
  avatarUrl?: string | null;
  initials: string;
  onClick: () => void;
  mouseX: number | null;
  compact: boolean;
  layoutKey: number;
}) {
  const { ref, style, zIndex } = useDockMagnification(mouseX, compact, layoutKey);

  return (
    <div
      style={{ zIndex }}
      className="animate-dock-in group relative flex flex-col items-center">
      <span className="pointer-events-none absolute -top-8 z-20 whitespace-nowrap rounded-md border border-app-border/10 bg-app-panel/95 px-2 py-0.5 text-[10px] font-semibold text-app-text opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        Account
      </span>
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label="Open account settings"
        style={style}
        className={`flex items-center justify-center overflow-hidden rounded-[13px] border border-app-border/15 bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white shadow-md active:brightness-95 ${
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
      <span className="mt-0.5 flex h-1 items-center" />
    </div>
  );
}
