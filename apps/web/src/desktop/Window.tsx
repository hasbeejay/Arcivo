import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Folder, Maximize2, Minus, Settings as SettingsIcon, X } from 'lucide-react';
import { MENUBAR_HEIGHT, type DesktopWindowState, type WindowBounds } from './types';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface WindowProps {
  windowState: DesktopWindowState;
  active: boolean;
  compact: boolean;
  children: ReactNode;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleZoom: (id: string) => void;
  onBoundsChange: (id: string, bounds: WindowBounds) => void;
}

const MIN_WIDTH = 360;
const MIN_HEIGHT = 300;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function Window({
  windowState,
  active,
  compact,
  children,
  onFocus,
  onClose,
  onMinimize,
  onToggleZoom,
  onBoundsChange,
}: WindowProps) {
  const { id, title, bounds, z, maximized, app } = windowState;
  const [interacting, setInteracting] = useState<'drag' | 'resize' | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const AppIcon = app === 'finder' ? Folder : SettingsIcon;

  useEffect(() => {
    return () => stopRef.current?.();
  }, []);

  const beginInteraction = useCallback(
    (event: React.PointerEvent, mode: 'drag' | 'resize', direction?: ResizeDirection) => {
      if (event.button !== 0) return;
      if (mode === 'drag' && maximized) return;
      event.preventDefault();
      event.stopPropagation();
      onFocus(id);

      const startX = event.clientX;
      const startY = event.clientY;
      const origin: WindowBounds = { ...bounds };
      setInteracting(mode);
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = mode === 'drag' ? 'grabbing' : 'nwse-resize';

      const handleMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (mode === 'drag') {
          onBoundsChange(id, {
            ...origin,
            x: clamp(origin.x + dx, 8 - origin.width + 140, window.innerWidth - 140),
            y: clamp(origin.y + dy, MENUBAR_HEIGHT + 2, window.innerHeight - 72),
          });
          return;
        }

        if (!direction) return;
        let { x, y, width, height } = origin;

        if (direction.includes('e')) {
          width = clamp(origin.width + dx, MIN_WIDTH, window.innerWidth - origin.x - 8);
        }
        if (direction.includes('s')) {
          height = clamp(origin.height + dy, MIN_HEIGHT, window.innerHeight - origin.y - 8);
        }
        if (direction.includes('w')) {
          const maxWidth = origin.x + origin.width - 8;
          width = clamp(origin.width - dx, MIN_WIDTH, Math.max(MIN_WIDTH, maxWidth));
          x = origin.x + origin.width - width;
        }
        if (direction.includes('n')) {
          const maxHeight = origin.y + origin.height - (MENUBAR_HEIGHT + 2);
          height = clamp(origin.height - dy, MIN_HEIGHT, Math.max(MIN_HEIGHT, maxHeight));
          y = origin.y + origin.height - height;
          y = Math.max(y, MENUBAR_HEIGHT + 2);
        }

        onBoundsChange(id, { x, y, width, height });
      };

      const stop = () => {
        setInteracting(null);
        document.body.style.cursor = previousCursor;
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', stop);
        window.removeEventListener('pointercancel', stop);
        stopRef.current = null;
      };

      stopRef.current?.();
      stopRef.current = stop;
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
    },
    [bounds, id, maximized, onBoundsChange, onFocus],
  );

  const resizeHandles: { dir: ResizeDirection; className: string }[] = [
    { dir: 'n', className: 'left-3 right-3 top-0 h-1.5 cursor-ns-resize' },
    { dir: 's', className: 'bottom-0 left-3 right-3 h-1.5 cursor-ns-resize' },
    { dir: 'w', className: 'bottom-3 left-0 top-3 w-1.5 cursor-ew-resize' },
    { dir: 'e', className: 'bottom-3 right-0 top-3 w-1.5 cursor-ew-resize' },
    { dir: 'nw', className: 'left-0 top-0 h-3 w-3 cursor-nwse-resize' },
    { dir: 'ne', className: 'right-0 top-0 h-3 w-3 cursor-nesw-resize' },
    { dir: 'sw', className: 'bottom-0 left-0 h-3 w-3 cursor-nesw-resize' },
    { dir: 'se', className: 'bottom-0 right-0 h-3 w-3 cursor-nwse-resize' },
  ];

  return (
    <motion.section
      aria-label={`${title} window`}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.12 }
          : { type: 'spring', stiffness: 360, damping: 31, mass: 0.7 }
      }
      onPointerDown={() => onFocus(id)}
      style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height, zIndex: z }}
      className={`desktop-window pointer-events-auto absolute flex flex-col overflow-hidden rounded-[14px] ${
        active ? 'desktop-window-active' : 'desktop-window-idle'
      } ${interacting ? 'desktop-window-busy' : ''} ${maximized ? 'desktop-window-maximized' : ''}`}>
      <header
        onPointerDown={(event) => beginInteraction(event, 'drag')}
        onDoubleClick={() => onToggleZoom(id)}
        className="relative flex h-10 shrink-0 cursor-default items-center gap-2 border-b border-app-border/10 px-3">
        <div className="group/traffic flex items-center gap-2" data-no-drag>
          <button
            type="button"
            onClick={() => onClose(id)}
            aria-label={`Close ${title} window`}
            className="group/light flex h-3 w-3 items-center justify-center rounded-full bg-brand-berry-500 shadow-sm transition-transform active:scale-90">
            <X className="h-2 w-2 text-brand-ink opacity-0 transition-opacity group-hover/traffic:opacity-80" strokeWidth={3.2} />
          </button>
          <button
            type="button"
            onClick={() => onMinimize(id)}
            aria-label={`Minimize ${title} window`}
            className="flex h-3 w-3 items-center justify-center rounded-full bg-brand-caramel-400 shadow-sm transition-transform active:scale-90">
            <Minus className="h-2 w-2 text-brand-ink opacity-0 transition-opacity group-hover/traffic:opacity-80" strokeWidth={3.2} />
          </button>
          <button
            type="button"
            onClick={() => onToggleZoom(id)}
            aria-label={maximized ? `Restore ${title} window` : `Zoom ${title} window`}
            className="flex h-3 w-3 items-center justify-center rounded-full bg-brand-sage-500 shadow-sm transition-transform active:scale-90">
            <Maximize2 className="h-1.5 w-1.5 text-brand-ink opacity-0 transition-opacity group-hover/traffic:opacity-80" strokeWidth={3.2} />
          </button>
        </div>

        <span className="pointer-events-none absolute left-1/2 flex max-w-[62%] -translate-x-1/2 items-center gap-1.5">
          <AppIcon className="h-3 w-3 shrink-0 text-app-subtle" />
          <span className="truncate text-[11.5px] font-semibold text-app-muted">{title}</span>
        </span>

        <span className="ml-auto flex items-center gap-1 text-app-subtle" data-no-drag>
          <span className="hidden text-[9px] font-medium uppercase tracking-[0.14em] sm:inline">
            {app === 'finder' ? 'Finder' : 'Settings'}
          </span>
        </span>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>

      {!compact &&
        !maximized &&
        resizeHandles.map((handle) => (
          <span
            key={handle.dir}
            onPointerDown={(event) => beginInteraction(event, 'resize', handle.dir)}
            className={`absolute z-30 ${handle.className}`}
            aria-hidden="true"
          />
        ))}
    </motion.section>
  );
}
