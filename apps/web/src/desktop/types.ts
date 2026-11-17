import type { ResourceKind } from '../data/workspace';

export type SmartView = 'all' | 'liked' | 'recent' | 'notes';

export type FinderLocation =
  | { type: 'smart'; id: SmartView }
  | { type: 'folder'; id: string }
  | { type: 'kind'; id: ResourceKind };

export type DesktopApp = 'finder' | 'settings';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopWindowState {
  id: string;
  app: DesktopApp;
  title: string;
  bounds: WindowBounds;
  restoreBounds?: WindowBounds;
  z: number;
  minimized: boolean;
  maximized: boolean;
  finder?: FinderLocation;
  finderKey: number;
}

export const MENUBAR_HEIGHT = 30;
export const DOCK_HEIGHT = 86;
export const WINDOW_MARGIN = 12;

const kindTitles: Record<ResourceKind, string> = {
  article: 'Articles',
  video: 'Videos',
  book: 'Books',
  paper: 'Papers',
  code: 'Code',
  thread: 'Threads',
};

const smartTitles: Record<SmartView, string> = {
  all: 'All Saves',
  liked: 'Liked',
  recent: 'Recent',
  notes: 'Notes',
};

export function sameLocation(a: FinderLocation, b: FinderLocation): boolean {
  return a.type === b.type && a.id === b.id;
}

export function locationTitle(
  location: FinderLocation,
  folders: { id: string; name: string }[],
): string {
  if (location.type === 'smart') return smartTitles[location.id];
  if (location.type === 'folder') {
    return folders.find((folder) => folder.id === location.id)?.name ?? 'Folder';
  }
  return kindTitles[location.id];
}

export function smartLocation(id: SmartView): FinderLocation {
  return { type: 'smart', id };
}
