import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  Folder,
  Plus,
  Search,
  Settings,
  StickyNote,
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
  activeApp: 'finder' | 'settings' | 'notes' | null;
  finderOpen: boolean;
  onOpenFinder: (location?: FinderLocation) => void;
  onOpenSettings: () => void;
  onOpenNotes: () => void;
  onOpenSpotlight: () => void;
  onNewSave: () => void;
  onRestoreWindow: (id: string) => void;
}

interface DockItem {
  button: HTMLButtonElement;
  wrapper: HTMLElement;
  center: number;
}

export function Dock({
  compact,
  windows,
  activeApp,
  finderOpen,
  onOpenFinder,
  onOpenSettings,
  onOpenNotes,
  onOpenSpotlight,
  onNewSave,
  onRestoreWindow,
}: DockProps) {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<DockItem[]>([]);
  const mouseXRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const hoveringRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const minimized = windows.filter((item) => item.minimized);

  const measure = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const items: DockItem[] = [];
    dock.querySelectorAll<HTMLElement>('[data-dock-item]').forEach((wrapper) => {
      const button = wrapper.querySelector<HTMLButtonElement>('[data-dock-magnify]');
      if (!button) return;
      items.push({
        button,
        wrapper,
        center: wrapper.getBoundingClientRect().left + wrapper.getBoundingClientRect().width / 2,
      });
    });
    itemsRef.current = items;
  }, []);

  useLayoutEffect(() => {
    measure();
    const timer = window.setTimeout(measure, 120);
    const dock = dockRef.current;
    const observer =
      typeof ResizeObserver !== 'undefined' && dock ? new ResizeObserver(measure) : null;
    if (dock && observer) observer.observe(dock);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, compact, windows.length]);

  const paint = useCallback(() => {
    frameRef.current = 0;
    const x = mouseXRef.current;
    if (x === null) return;
    const radius = compact ? 62 : 74;
    const strength = compact ? 0.3 : 0.38;
    for (const item of itemsRef.current) {
      const influence = Math.exp(-Math.pow(Math.abs(x - item.center) / radius, 2));
      const scale = 1 + influence * strength;
      item.button.style.transform = `scale(${scale.toFixed(4)})`;
      item.wrapper.style.zIndex = String(Math.round(scale * 100));
    }
  }, [compact]);

  const handleMove = (event: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    mouseXRef.current = event.clientX;
    if (!hoveringRef.current) {
      hoveringRef.current = true;
      for (const item of itemsRef.current) {
          item.button.style.transition = 'transform 110ms cubic-bezier(0.2, 0.8, 0.2, 1)';
      }
    }
    if (!frameRef.current) frameRef.current = requestAnimationFrame(paint);
  };

  const handleLeave = () => {
    if (prefersReducedMotion) return;
    hoveringRef.current = false;
    mouseXRef.current = null;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    for (const item of itemsRef.current) {
      item.button.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)';
      item.button.style.transform = 'scale(1)';
      item.wrapper.style.zIndex = '1';
    }
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Keep magnification correct when items are added/removed mid-hover.
  useEffect(() => {
    if (mouseXRef.current !== null) paint();
  }, [paint, compact, windows.length]);

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
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      gradient: 'from-brand-cream-300 via-brand-caramel-400 to-brand-caramel-600',
      active: activeApp === 'notes',
      onClick: onOpenNotes,
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
      ref={dockRef}
      aria-label="Arcivo dock"
      className={`glass-dock absolute left-1/2 z-50 flex -translate-x-1/2 items-end rounded-[22px] shadow-[0_18px_60px_-12px_rgba(42,54,59,0.5)] ${
        compact ? 'bottom-1.5 gap-1 px-2 pb-1.5 pt-2' : 'bottom-2.5 gap-2 px-3 pb-2 pt-2.5'
      }`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}>
      {primary.map((action) => (
        <DockButton key={action.id} action={action} compact={compact} />
      ))}

      {minimized.length > 0 && <DockDivider compact={compact} />}

      {minimized.map((item) => (
        <DockButton
          key={item.id}
          action={{
            id: item.id,
            label: item.title,
            icon: item.app === 'finder' ? Folder : item.app === 'notes' ? StickyNote : Settings,
            gradient:
              item.app === 'finder'
                ? 'from-brand-sage-500 via-brand-teal-500 to-brand-teal-700'
                : item.app === 'notes'
                  ? 'from-brand-cream-300 via-brand-caramel-400 to-brand-caramel-600'
                  : 'from-brand-mist-400 via-brand-ink-500 to-brand-ink-700',
            onClick: () => onRestoreWindow(item.id),
          }}
          compact={compact}
        />
      ))}

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
  compact,
}: {
  action: DockAction;
  compact: boolean;
}) {
  const Icon = action.icon;

  return (
    <div data-dock-item className="animate-dock-in group relative flex flex-col items-center">
      <span className="pointer-events-none absolute -top-8 z-20 whitespace-nowrap rounded-md border border-app-border/10 bg-app-panel/95 px-2 py-0.5 text-[10px] font-semibold text-app-text opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {action.label}
      </span>
      <button
        type="button"
        data-dock-magnify
        onClick={action.onClick}
        aria-label={action.label}
        title={action.label}
        className={`dock-magnify flex items-center justify-center rounded-[13px] bg-gradient-to-tr text-white shadow-md active:brightness-95 ${
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
