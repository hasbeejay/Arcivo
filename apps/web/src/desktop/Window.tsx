import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Folder,
  Maximize2,
  Minus,
  Settings as SettingsIcon,
  StickyNote,
  X,
} from 'lucide-react';
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
  const { id, title, bounds, z, maximized, minimized, app } = windowState;
  const [interacting, setInteracting] = useState<'drag' | 'resize' | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const liveBoundsRef = useRef<WindowBounds | null>(null);
  const frameRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const [animating, setAnimating] = useState(false);
  const AppIcon = app === 'finder' ? Folder : app === 'notes' ? StickyNote : SettingsIcon;

  useEffect(() => {
    return () => stopRef.current?.();
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (element) element.inert = minimized;
  }, [minimized]);

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
      const element = sectionRef.current;
      const previousWillChange = element?.style.willChange ?? '';
      setInteracting(mode);
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = mode === 'drag' ? 'grabbing' : 'nwse-resize';
      if (mode === 'drag' && element) element.style.willChange = 'transform, translate';

      const compute = (clientX: number, clientY: number): WindowBounds => {
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (mode === 'drag') {
          return {
            ...origin,
            x: clamp(origin.x + dx, 8 - origin.width + 140, window.innerWidth - 140),
            y: clamp(origin.y + dy, MENUBAR_HEIGHT + 2, window.innerHeight - 72),
          };
        }

        if (!direction) return origin;
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

        return { x, y, width, height };
      };

      // Paint directly during the gesture; commit to the window manager once on release.
      const paint = () => {
        frameRef.current = 0;
        const next = liveBoundsRef.current;
        const target = sectionRef.current;
        if (!next || !target) return;
        if (mode === 'drag') {
          target.style.translate = `${next.x - origin.x}px ${next.y - origin.y}px`;
          return;
        }
        target.style.left = `${next.x}px`;
        target.style.top = `${next.y}px`;
        target.style.width = `${next.width}px`;
        target.style.height = `${next.height}px`;
      };

      const handleMove = (moveEvent: PointerEvent) => {
        liveBoundsRef.current = compute(moveEvent.clientX, moveEvent.clientY);
        if (!frameRef.current) frameRef.current = requestAnimationFrame(paint);
      };

      const stop = () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        const finalBounds = liveBoundsRef.current;
        liveBoundsRef.current = null;
        if (element) {
          if (mode === 'drag') {
            element.style.translate = '';
            element.style.willChange = previousWillChange;
            if (finalBounds) {
              element.style.left = `${finalBounds.x}px`;
              element.style.top = `${finalBounds.y}px`;
            }
          }
        }
        if (finalBounds) onBoundsChange(id, finalBounds);
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

  const dockX = window.innerWidth / 2 - (bounds.x + bounds.width / 2);
  const dockY = window.innerHeight - 54 - (bounds.y + bounds.height / 2);
  const minimizedAnimation = useMemo(
    () =>
      prefersReducedMotion
        ? { opacity: 0, transition: { duration: 0.12 } }
        : {
            opacity: [1, 1, 0],
            scale: [1, 0.72, 0.14],
            x: [0, dockX * 0.35, dockX],
            y: [0, dockY * 0.3, dockY],
            transition: {
              duration: 0.38,
              times: [0, 0.42, 1],
              ease: [0.22, 0.72, 0.2, 1] as const,
            },
          },
    [prefersReducedMotion, dockX, dockY],
  );
  const restoredAnimation = useMemo(
    () =>
      prefersReducedMotion
        ? { opacity: 1, transition: { duration: 0.12 } }
        : {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.65 },
          },
    [prefersReducedMotion],
  );

  return (
    <motion.section
      ref={sectionRef}
      aria-label={`${title} window`}
      aria-hidden={minimized || undefined}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
      animate={minimized ? minimizedAnimation : restoredAnimation}
      onAnimationStart={() => setAnimating(true)}
      onAnimationComplete={() => setAnimating(false)}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.97, y: 10, transition: { duration: 0.18 } }
      }
      onPointerDown={() => onFocus(id)}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        zIndex: z,
        pointerEvents: minimized ? 'none' : undefined,
        transformOrigin: minimized ? '50% 100%' : '50% 50%',
      }}
      className={`desktop-window pointer-events-auto absolute flex flex-col overflow-hidden rounded-[14px] ${
        active ? 'desktop-window-active' : 'desktop-window-idle'
      } ${interacting || animating ? 'desktop-window-busy' : ''} ${maximized ? 'desktop-window-maximized' : ''}`}>
      <header
        onPointerDown={(event) => beginInteraction(event, 'drag')}
        onDoubleClick={() => onToggleZoom(id)}
        className="relative flex h-10 shrink-0 cursor-default items-center gap-2 border-b border-app-border/10 px-3">
        <div className="group/traffic flex items-center gap-2" data-no-drag>
          <button
            type="button"
            onClick={() => onClose(id)}
            title="Close"
            aria-label={`Close ${title} window`}
            className="group/light flex h-3 w-3 items-center justify-center rounded-full bg-brand-berry-500 shadow-sm transition-all duration-150 hover:scale-125 hover:brightness-110 active:scale-90">
            <X
              className="h-2 w-2 text-brand-ink opacity-0 transition-opacity group-hover/traffic:opacity-70 group-hover/light:opacity-100"
              strokeWidth={3.2}
            />
          </button>
          <button
            type="button"
            onClick={() => onMinimize(id)}
            title="Minimize"
            aria-label={`Minimize ${title} window`}
            className="group/minimize flex h-3 w-3 items-center justify-center rounded-full bg-brand-caramel-400 shadow-sm transition-all duration-150 hover:scale-125 hover:brightness-110 active:scale-90">
            <Minus
              className="h-2 w-2 text-brand-ink opacity-0 transition-opacity group-hover/traffic:opacity-70 group-hover/minimize:opacity-100"
              strokeWidth={3.2}
            />
          </button>
          <button
            type="button"
            onClick={() => onToggleZoom(id)}
            title={maximized ? 'Restore' : 'Zoom'}
            aria-label={maximized ? `Restore ${title} window` : `Zoom ${title} window`}
            className="group/zoom flex h-3 w-3 items-center justify-center rounded-full bg-brand-sage-500 shadow-sm transition-all duration-150 hover:scale-125 hover:brightness-110 active:scale-90">
            <Maximize2
              className="h-1.5 w-1.5 text-brand-ink opacity-0 transition-opacity group-hover/traffic:opacity-70 group-hover/zoom:opacity-100"
              strokeWidth={3.2}
            />
          </button>
        </div>

        <span className="pointer-events-none absolute left-1/2 flex max-w-[62%] -translate-x-1/2 items-center gap-1.5">
          <AppIcon className="h-3 w-3 shrink-0 text-app-subtle" />
          <span className="truncate text-[11.5px] font-semibold text-app-muted">{title}</span>
        </span>

        <span className="ml-auto flex items-center gap-1 text-app-subtle" data-no-drag>
          <span className="hidden text-[9px] font-medium uppercase tracking-[0.14em] sm:inline">
            {app === 'finder' ? 'Finder' : app === 'notes' ? 'Notes' : 'Settings'}
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
