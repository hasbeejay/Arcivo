import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Folder as FolderIcon,
  Layers,
  Star,
  StickyNote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WorkspaceFolder } from '../data/workspace';
import type { FinderLocation } from './types';

interface DesktopIconsProps {
  folders: WorkspaceFolder[];
  counts: { all: number; liked: number; recent: number; notes: number };
  folderCounts: Record<string, number>;
  onOpenFinder: (location: FinderLocation) => void;
  onOpenNotes: () => void;
}

interface DesktopItem {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  gradient?: string;
  folderColor?: string;
  open: () => void;
}

interface Position {
  x: number;
  y: number;
}

const POSITION_KEY = 'arcivo.desktop-positions';
const ITEM_WIDTH = 84;
const ITEM_HEIGHT = 88;
const COLUMN_STEP = 92;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function readPositions(): Record<string, Position> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Position>;
    if (!parsed || typeof parsed !== 'object') return {};
    const safe: Record<string, Position> = {};
    Object.entries(parsed).forEach(([id, value]) => {
      if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) {
        safe[id] = { x: value.x, y: value.y };
      }
    });
    return safe;
  } catch {
    return {};
  }
}

export function DesktopIcons({
  folders,
  counts,
  folderCounts,
  onOpenFinder,
  onOpenNotes,
}: DesktopIconsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, Position>>(readPositions);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    id: string;
    element: HTMLButtonElement;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const nextPositionRef = useRef<Position | null>(null);
  const frameRef = useRef(0);
  const suppressClickRef = useRef(false);

  const items: DesktopItem[] = useMemo(
    () => [
      {
        id: 'smart-all',
        label: 'All Saves',
        count: counts.all,
        icon: Layers,
        gradient: 'from-brand-teal-700 via-brand-ink-600 to-brand-ink-800',
        open: () => onOpenFinder({ type: 'smart', id: 'all' }),
      },
      {
        id: 'smart-liked',
        label: 'Liked',
        count: counts.liked,
        icon: Star,
        gradient: 'from-brand-coral-400 via-brand-berry-500 to-brand-berry-700',
        open: () => onOpenFinder({ type: 'smart', id: 'liked' }),
      },
      {
        id: 'smart-recent',
        label: 'Recent',
        count: counts.recent,
        icon: Clock,
        gradient: 'from-brand-sage-400 via-brand-sage-600 to-brand-teal-700',
        open: () => onOpenFinder({ type: 'smart', id: 'recent' }),
      },
      {
        id: 'smart-notes',
        label: 'Notes',
        count: counts.notes,
        icon: StickyNote,
        gradient: 'from-brand-cream-300 via-brand-caramel-400 to-brand-caramel-600',
        open: onOpenNotes,
      },
      ...folders.map<DesktopItem>((folder) => ({
        id: `folder-${folder.id}`,
        label: folder.name,
        count: folderCounts[folder.id] ?? 0,
        icon: FolderIcon,
        folderColor: folder.color,
        open: () => onOpenFinder({ type: 'folder', id: folder.id }),
      })),
    ],
    [counts, folderCounts, folders, onOpenFinder, onOpenNotes],
  );

  const visibleItems = useMemo(() => items.slice(0, 14), [items]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const defaultPositions = useMemo(() => {
    const rows = Math.max(1, Math.floor((size.height - 4) / ITEM_HEIGHT));
    const next: Record<string, Position> = {};
    visibleItems.forEach((item, index) => {
      const column = Math.floor(index / rows);
      const row = index % rows;
      next[item.id] = {
        x: Math.max(0, size.width - (column + 1) * COLUMN_STEP - 4),
        y: row * ITEM_HEIGHT,
      };
    });
    return next;
  }, [size.height, size.width, visibleItems]);

  const positionFor = useCallback(
    (item: DesktopItem, index: number): Position => {
      const stored = positions[item.id];
      const fallback = defaultPositions[item.id] ?? { x: 0, y: index * ITEM_HEIGHT };
      const position = stored ?? fallback;
      return {
        x: clamp(position.x, 0, Math.max(0, size.width - ITEM_WIDTH)),
        y: clamp(position.y, 0, Math.max(0, size.height - ITEM_WIDTH)),
      };
    },
    [defaultPositions, positions, size.height, size.width],
  );

  const beginDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    item: DesktopItem,
    position: Position,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const element = event.currentTarget;
    dragRef.current = {
      id: item.id,
      element,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    nextPositionRef.current = position;

    const move = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = moveEvent.clientX - drag.startX;
      const dy = moveEvent.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        drag.element.style.zIndex = '30';
        drag.element.style.willChange = 'transform';
      }
      nextPositionRef.current = {
        x: clamp(drag.originX + dx, 0, Math.max(0, size.width - ITEM_WIDTH)),
        y: clamp(drag.originY + dy, 0, Math.max(0, size.height - ITEM_WIDTH)),
      };
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = 0;
          const active = dragRef.current;
          const next = nextPositionRef.current;
          if (!active || !next) return;
          active.element.style.transform = `translate3d(${next.x - active.originX}px, ${
            next.y - active.originY
          }px, 0)`;
        });
      }
    };

    const finish = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      const drag = dragRef.current;
      const next = nextPositionRef.current;
      dragRef.current = null;
      nextPositionRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      if (!drag) return;

      drag.element.style.transform = '';
      drag.element.style.zIndex = '';
      drag.element.style.willChange = '';

      if (drag.moved && next) {
        setPositions((current) => {
          const updated = { ...current, [drag.id]: next };
          try {
            localStorage.setItem(POSITION_KEY, JSON.stringify(updated));
          } catch {
            // Storage can be unavailable in private mode; keep the in-memory position.
          }
          return updated;
        });
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      } else {
        setSelected(drag.id);
      }
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  };

  return (
    <div
      ref={containerRef}
      aria-label="Desktop items"
      onClick={(event) => {
        if (event.target === event.currentTarget) setSelected(null);
      }}
      className="absolute bottom-[104px] right-3 top-[42px] z-[5] hidden max-w-[calc(100vw-24px)] md:block">
      {visibleItems.map((item, index) => {
        const Icon = item.icon;
        const active = selected === item.id;
        const position = positionFor(item, index);
        return (
          <button
            key={item.id}
            type="button"
            onPointerDown={(event) => beginDrag(event, item, position)}
            onDoubleClick={() => {
              if (!suppressClickRef.current) item.open();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                item.open();
              }
            }}
            title={`Double-click to open ${item.label}. Drag to move.`}
            style={{ left: position.x, top: position.y }}
            className={`group absolute flex w-[84px] flex-col items-center gap-1 rounded-xl px-1 py-1.5 outline-none transition-colors ${
              active ? 'bg-app-panel/40' : 'hover:bg-app-panel/25'
            } focus-visible:ring-2 focus-visible:ring-app-accent/60`}>
            <span className="relative">
              {item.folderColor ? (
                <span
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] border shadow-md transition-transform duration-200 group-hover:-translate-y-0.5"
                  style={{
                    backgroundColor: `${item.folderColor}2e`,
                    borderColor: `${item.folderColor}55`,
                  }}>
                  <FolderIcon
                    className="h-7 w-7 drop-shadow-sm"
                    style={{ color: item.folderColor, fill: `${item.folderColor}4d` }}
                    strokeWidth={1.6}
                  />
                </span>
              ) : (
                <span
                  className={`flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-gradient-to-tr text-white shadow-md transition-transform duration-200 group-hover:-translate-y-0.5 ${item.gradient}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.9} />
                </span>
              )}
              {item.count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full border border-app-panel/60 bg-app-panel/90 px-1 py-px text-[8px] font-bold tabular-nums text-app-text shadow-sm">
                  {item.count}
                </span>
              )}
            </span>
            <span
              className={`line-clamp-2 max-w-[78px] rounded px-1 text-center text-[10.5px] font-semibold leading-tight text-app-text drop-shadow-[0_1px_2px_rgba(255,255,255,0.65)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] ${
                active ? 'bg-app-accent/20' : ''
              }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
