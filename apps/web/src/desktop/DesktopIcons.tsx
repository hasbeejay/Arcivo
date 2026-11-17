import { useState } from 'react';
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
}

interface DesktopItem {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  gradient?: string;
  folderColor?: string;
  location: FinderLocation;
}

export function DesktopIcons({ folders, counts, folderCounts, onOpenFinder }: DesktopIconsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const items: DesktopItem[] = [
    {
      id: 'smart-all',
      label: 'All Saves',
      count: counts.all,
      icon: Layers,
      gradient: 'from-brand-teal-700 via-brand-ink-600 to-brand-ink-800',
      location: { type: 'smart', id: 'all' },
    },
    {
      id: 'smart-liked',
      label: 'Liked',
      count: counts.liked,
      icon: Star,
      gradient: 'from-brand-coral-400 via-brand-berry-500 to-brand-berry-700',
      location: { type: 'smart', id: 'liked' },
    },
    {
      id: 'smart-recent',
      label: 'Recent',
      count: counts.recent,
      icon: Clock,
      gradient: 'from-brand-sage-400 via-brand-sage-600 to-brand-teal-700',
      location: { type: 'smart', id: 'recent' },
    },
    {
      id: 'smart-notes',
      label: 'Notes',
      count: counts.notes,
      icon: StickyNote,
      gradient: 'from-brand-cream-300 via-brand-caramel-400 to-brand-caramel-600',
      location: { type: 'smart', id: 'notes' },
    },
    ...folders.map<DesktopItem>((folder) => ({
      id: `folder-${folder.id}`,
      label: folder.name,
      count: folderCounts[folder.id] ?? 0,
      icon: FolderIcon,
      folderColor: folder.color,
      location: { type: 'folder', id: folder.id },
    })),
  ];

  return (
    <div
      aria-label="Desktop items"
      style={{ gridTemplateRows: 'repeat(auto-fill, 88px)', gridAutoFlow: 'column' }}
      className="absolute bottom-[104px] right-3 top-[42px] z-[5] hidden max-w-[calc(100vw-24px)] gap-x-1 gap-y-0.5 md:grid">
      {items.slice(0, 14).map((item) => {
        const Icon = item.icon;
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            onDoubleClick={() => onOpenFinder(item.location)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenFinder(item.location);
              }
            }}
            title={`Double-click to open ${item.label}`}
            className={`group flex w-[84px] flex-col items-center gap-1 rounded-xl px-1 py-1.5 outline-none transition-colors ${
              active ? 'bg-app-panel/40 backdrop-blur-sm' : 'hover:bg-app-panel/25'
            } focus-visible:ring-2 focus-visible:ring-app-accent/60`}>
            <span className="relative">
              {item.folderColor ? (
                <span
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] border shadow-md backdrop-blur-md transition-transform duration-200 group-hover:-translate-y-0.5"
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
                <span className="absolute -right-1.5 -top-1.5 rounded-full border border-app-panel/60 bg-app-panel/90 px-1 py-px text-[8px] font-bold tabular-nums text-app-text shadow-sm backdrop-blur-md">
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
