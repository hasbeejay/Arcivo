import { useCallback, useMemo, useRef, useState } from 'react';
import type { WorkspaceFolder } from '../data/workspace';
import {
  DOCK_HEIGHT,
  MENUBAR_HEIGHT,
  locationTitle,
  sameLocation,
  type DesktopApp,
  type DesktopWindowState,
  type FinderLocation,
  type WindowBounds,
} from './types';

export const COMPACT_BREAKPOINT = 820;

export function isCompactViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < COMPACT_BREAKPOINT;
}

const ALL_SAVES: FinderLocation = { type: 'smart', id: 'all' };
const SETTINGS_SIZE = { width: 640, height: 600 };

function availableHeight(): number {
  return window.innerHeight - MENUBAR_HEIGHT - DOCK_HEIGHT - 18;
}

function zoomBounds(): WindowBounds {
  return {
    x: 8,
    y: MENUBAR_HEIGHT + 6,
    width: Math.max(320, window.innerWidth - 16),
    height: Math.max(320, window.innerHeight - MENUBAR_HEIGHT - DOCK_HEIGHT - 10),
  };
}

function defaultBounds(app: DesktopApp): WindowBounds {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width < COMPACT_BREAKPOINT) {
    return {
      x: 8,
      y: MENUBAR_HEIGHT + 6,
      width: Math.max(320, width - 16),
      height: Math.max(320, height - MENUBAR_HEIGHT - DOCK_HEIGHT - 10),
    };
  }

  if (app === 'settings') {
    const w = Math.min(SETTINGS_SIZE.width, width - 96);
    const h = Math.min(SETTINGS_SIZE.height, availableHeight());
    return {
      x: Math.max(24, Math.round((width - w) / 2)),
      y: MENUBAR_HEIGHT + Math.max(26, Math.round((height - MENUBAR_HEIGHT - DOCK_HEIGHT - h) / 2)),
      width: w,
      height: h,
    };
  }

  const w = Math.min(1120, Math.max(620, width - 200));
  const h = Math.min(730, Math.max(420, availableHeight()));
  return {
    x: Math.max(24, Math.round((width - w) / 2)),
    y: MENUBAR_HEIGHT + Math.max(22, Math.round((height - MENUBAR_HEIGHT - DOCK_HEIGHT - h) / 2)),
    width: w,
    height: h,
  };
}

interface UseWindowsOptions {
  folders: WorkspaceFolder[];
}

export interface WindowsApi {
  windows: DesktopWindowState[];
  activeId: string | null;
  activeWindow: DesktopWindowState | null;
  openFinder: (location?: FinderLocation) => void;
  openSettings: () => void;
  focus: (id: string) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleZoom: (id: string) => void;
  navigate: (id: string, location: FinderLocation) => void;
  setBounds: (id: string, bounds: WindowBounds) => void;
  refit: (mode?: 'compact' | 'desktop') => void;
}

export function useWindows({ folders }: UseWindowsOptions): WindowsApi {
  const [windows, setWindows] = useState<DesktopWindowState[]>([]);
  const zRef = useRef(20);
  const seqRef = useRef(0);
  const foldersRef = useRef(folders);
  foldersRef.current = folders;

  const bumpZ = useCallback(() => {
    zRef.current += 1;
    return zRef.current;
  }, []);

  const makeWindow = useCallback(
    (app: DesktopApp, finder: FinderLocation, title: string, z: number): DesktopWindowState => {
      seqRef.current += 1;
      return {
        id: `${app}-${seqRef.current}`,
        app,
        title,
        bounds: defaultBounds(app),
        z,
        minimized: false,
        maximized: false,
        finder: app === 'finder' ? finder : undefined,
        finderKey: 0,
      };
    },
    [],
  );

  const openFinder = useCallback(
    (location?: FinderLocation) => {
      const z = bumpZ();
      setWindows((current) => {
        const existing = current.find((item) => item.app === 'finder');
        if (existing) {
          const nextLocation = location ?? existing.finder ?? ALL_SAVES;
          const changed = !sameLocation(nextLocation, existing.finder ?? ALL_SAVES);
          return current.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  minimized: false,
                  z,
                  finder: nextLocation,
                  title: locationTitle(nextLocation, foldersRef.current),
                  finderKey: changed ? item.finderKey + 1 : item.finderKey,
                }
              : item,
          );
        }
        const start = location ?? ALL_SAVES;
        return [...current, makeWindow('finder', start, locationTitle(start, foldersRef.current), z)];
      });
    },
    [bumpZ, makeWindow],
  );

  const openSettings = useCallback(() => {
    const z = bumpZ();
    setWindows((current) => {
      const existing = current.find((item) => item.app === 'settings');
      if (existing) {
        return current.map((item) =>
          item.id === existing.id ? { ...item, minimized: false, z } : item,
        );
      }
      return [...current, makeWindow('settings', ALL_SAVES, 'Settings', z)];
    });
  }, [bumpZ, makeWindow]);

  const focus = useCallback(
    (id: string) => {
      const z = bumpZ();
      setWindows((current) =>
        current.map((item) =>
          item.id === id ? { ...item, z, minimized: false } : item,
        ),
      );
    },
    [bumpZ],
  );

  const close = useCallback((id: string) => {
    setWindows((current) => current.filter((item) => item.id !== id));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, minimized: true } : item)),
    );
  }, []);

  const restore = useCallback(
    (id: string) => {
      focus(id);
    },
    [focus],
  );

  const toggleZoom = useCallback(
    (id: string) => {
      const z = bumpZ();
      setWindows((current) =>
        current.map((item) => {
          if (item.id !== id) return item;
          if (item.maximized) {
            return {
              ...item,
              maximized: false,
              bounds: item.restoreBounds ?? defaultBounds(item.app),
              restoreBounds: undefined,
              z,
            };
          }
          return {
            ...item,
            maximized: true,
            restoreBounds: item.bounds,
            bounds: zoomBounds(),
            z,
          };
        }),
      );
    },
    [bumpZ],
  );

  const navigate = useCallback((id: string, location: FinderLocation) => {
    setWindows((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              finder: location,
              title: locationTitle(location, foldersRef.current),
              finderKey: item.finderKey + 1,
              maximized: item.maximized,
            }
          : item,
      ),
    );
  }, []);

  const setBounds = useCallback((id: string, bounds: WindowBounds) => {
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, bounds } : item)),
    );
  }, []);

  const refit = useCallback((mode?: 'compact' | 'desktop') => {
    setWindows((current) =>
      current.map((item) => {
        if (mode === 'compact') {
          return {
            ...item,
            maximized: false,
            restoreBounds: undefined,
            bounds: defaultBounds(item.app),
          };
        }
        if (mode === 'desktop') {
          return {
            ...item,
            maximized: false,
            restoreBounds: undefined,
            bounds: defaultBounds(item.app),
          };
        }
        if (item.maximized) return { ...item, bounds: zoomBounds() };
        const width = Math.min(item.bounds.width, window.innerWidth - 16);
        const height = Math.min(
          item.bounds.height,
          window.innerHeight - MENUBAR_HEIGHT - 16,
        );
        const x = Math.min(
          Math.max(item.bounds.x, 8),
          Math.max(8, window.innerWidth - width - 8),
        );
        const y = Math.min(
          Math.max(item.bounds.y, MENUBAR_HEIGHT + 4),
          Math.max(MENUBAR_HEIGHT + 4, window.innerHeight - 96),
        );
        return {
          ...item,
          bounds: { x, y, width: Math.max(320, width), height: Math.max(280, height) },
        };
      }),
    );
  }, []);

  const activeWindow = useMemo(() => {
    return (
      windows
        .filter((item) => !item.minimized)
        .sort((a, b) => b.z - a.z)[0] ?? null
    );
  }, [windows]);

  return {
    windows,
    activeId: activeWindow?.id ?? null,
    activeWindow,
    openFinder,
    openSettings,
    focus,
    close,
    minimize,
    restore,
    toggleZoom,
    navigate,
    setBounds,
    refit,
  };
}
