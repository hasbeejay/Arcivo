import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CornerDownLeft,
  Folder as FolderIcon,
  Layers,
  Moon,
  Plus,
  Search,
  Settings,
  Star,
  StickyNote,
  Sun,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { kindMeta, safeHostname, type WorkspaceFolder, type WorkspaceResource } from '../data/workspace';
import type { FinderLocation } from './types';

interface SpotlightProps {
  open: boolean;
  isDark: boolean;
  resources: WorkspaceResource[];
  folders: WorkspaceFolder[];
  onClose: () => void;
  onNavigate: (location: FinderLocation) => void;
  onOpenResource: (id: string) => void;
  onNewSave: () => void;
  onSettings: () => void;
  onToggleTheme: () => void;
}

type Group = 'Actions' | 'Folders' | 'Saves';

interface SpotlightResult {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  icon: LucideIcon;
  gradient?: string;
  iconColor?: string;
  shortcut?: string;
  run: () => void;
}

export function Spotlight({
  open,
  isDark,
  resources,
  folders,
  onClose,
  onNavigate,
  onOpenResource,
  onNewSave,
  onSettings,
  onToggleTheme,
}: SpotlightProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  const close = useCallback(
    (action: () => void) => {
      onClose();
      action();
    },
    [onClose],
  );

  const results = useMemo<SpotlightResult[]>(() => {
    const normalized = query.trim().toLowerCase();

    const actionItems: SpotlightResult[] = [
      {
        id: 'action-all',
        group: 'Actions',
        label: 'All Saves',
        hint: 'Open every saved resource',
        icon: Layers,
        gradient: 'from-brand-teal-700 to-brand-ink-700',
        run: () => close(() => onNavigate({ type: 'smart', id: 'all' })),
      },
      {
        id: 'action-liked',
        group: 'Actions',
        label: 'Liked',
        hint: 'Your favorite saves',
        icon: Star,
        gradient: 'from-brand-coral-400 to-brand-berry-600',
        run: () => close(() => onNavigate({ type: 'smart', id: 'liked' })),
      },
      {
        id: 'action-notes',
        group: 'Actions',
        label: 'Notes',
        hint: 'Thoughts attached to saves',
        icon: StickyNote,
        gradient: 'from-brand-cream-300 to-brand-caramel-600',
        run: () => close(() => onNavigate({ type: 'smart', id: 'notes' })),
      },
      {
        id: 'action-new-save',
        group: 'Actions',
        label: 'New Save',
        hint: 'Archive a link',
        icon: Plus,
        gradient: 'from-brand-berry-600 to-brand-coral-500',
        shortcut: '⌘N',
        run: () => close(onNewSave),
      },
      {
        id: 'action-settings',
        group: 'Actions',
        label: 'Settings',
        hint: 'Account, appearance and sync',
        icon: Settings,
        gradient: 'from-brand-mist-400 to-brand-ink-700',
        run: () => close(onSettings),
      },
      {
        id: 'action-theme',
        group: 'Actions',
        label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
        hint: 'Change the desktop appearance',
        icon: isDark ? Sun : Moon,
        gradient: 'from-brand-sage-400 to-brand-teal-700',
        run: () => close(onToggleTheme),
      },
    ];

    const actions = actionItems.filter(
      (action) => !normalized || `${action.label} ${action.hint ?? ''}`.toLowerCase().includes(normalized),
    );

    const folderResults: SpotlightResult[] = normalized
      ? folders
          .filter((folder) => `${folder.name} ${folder.description}`.toLowerCase().includes(normalized))
          .slice(0, 4)
          .map((folder) => ({
            id: `folder-${folder.id}`,
            group: 'Folders',
            label: folder.name,
            hint: folder.description,
            icon: FolderIcon,
            iconColor: folder.color,
            run: () => close(() => onNavigate({ type: 'folder', id: folder.id })),
          }))
      : [];

    const saveResults: SpotlightResult[] = resources
      .filter((resource) => {
        if (!normalized) return true;
        return [
          resource.title,
          resource.description,
          safeHostname(resource.url),
          ...resource.tags,
          resource.note?.title ?? '',
          resource.note?.body ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized);
      })
      .slice(0, normalized ? 8 : 5)
      .map((resource) => {
        const meta = kindMeta[resource.kind];
        return {
          id: `resource-${resource.id}`,
          group: 'Saves',
          label: resource.title,
          hint: safeHostname(resource.url),
          icon: meta.icon,
          gradient: meta.gradient,
          run: () => close(() => onOpenResource(resource.id)),
        };
      });

    return [...actions, ...folderResults, ...saveResults];
  }, [
    close,
    folders,
    isDark,
    onNavigate,
    onNewSave,
    onOpenResource,
    onSettings,
    onToggleTheme,
    query,
    resources,
  ]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (selected >= results.length) setSelected(Math.max(0, results.length - 1));
  }, [results.length, selected]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-result-index="${selected}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, open]);

  const groups: { label: Group; items: { result: SpotlightResult; index: number }[] }[] = [];
  results.forEach((result, index) => {
    const existing = groups.find((group) => group.label === result.group);
    if (existing) existing.items.push({ result, index });
    else groups.push({ label: result.group, items: [{ result, index }] });
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}>
          <div className="absolute inset-0 bg-brand-ink/25 backdrop-blur-[3px] dark:bg-black/45" aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-label="Spotlight search"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={prefersReducedMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 34 }}
            className="relative w-full max-w-[620px] overflow-hidden rounded-2xl border border-app-border/15 bg-app-panel/95 shadow-[0_30px_90px_-20px_rgba(42,54,59,0.65)] backdrop-blur-2xl">
            <div className="flex items-center gap-2.5 border-b border-app-border/10 px-3.5 py-3">
              <Search className="h-4 w-4 shrink-0 text-app-subtle" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setSelected((current) => (results.length ? (current + 1) % results.length : 0));
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setSelected((current) =>
                      results.length ? (current - 1 + results.length) % results.length : 0,
                    );
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    results[selected]?.run();
                  }
                }}
                placeholder="Search saves, folders or run a command…"
                aria-label="Search Arcivo"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-app-text outline-none placeholder:text-app-subtle"
              />
              <kbd className="hidden rounded border border-app-border/15 bg-app-card/60 px-1.5 py-0.5 text-[9px] font-semibold text-app-subtle sm:block">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] min-h-[80px] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <Search className="h-6 w-6 text-app-subtle" />
                  <p className="mt-2 text-[12px] font-semibold text-app-text">No results for “{query}”</p>
                  <p className="mt-0.5 text-[10.5px] text-app-muted">
                    Try a title, a tag, a folder name or a saved link.
                  </p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.label} className="mb-1 last:mb-0">
                    <p className="px-2 pb-1 pt-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-app-subtle">
                      {group.label}
                    </p>
                    {group.items.map(({ result, index }) => {
                      const Icon = result.icon;
                      const active = index === selected;
                      return (
                        <button
                          key={result.id}
                          type="button"
                          data-result-index={index}
                          onMouseEnter={() => setSelected(index)}
                          onClick={result.run}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors ${
                            active ? 'bg-app-accent/14' : 'hover:bg-app-hover/5'
                          }`}>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${
                              result.gradient
                                ? `bg-gradient-to-tr text-white ${result.gradient}`
                                : 'border border-app-border/10 bg-app-card/60'
                            }`}>
                            <Icon
                              className="h-3.5 w-3.5"
                              style={result.iconColor ? { color: result.iconColor } : undefined}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-[12px] font-semibold ${active ? 'text-app-accent' : 'text-app-text'}`}>
                              {result.label}
                            </span>
                            {result.hint && (
                              <span className="block truncate text-[10px] text-app-subtle">{result.hint}</span>
                            )}
                          </span>
                          {result.shortcut && (
                            <span className="shrink-0 rounded border border-app-border/10 px-1 py-0.5 text-[9px] font-medium text-app-subtle">
                              {result.shortcut}
                            </span>
                          )}
                          {active && <CornerDownLeft className="h-3 w-3 shrink-0 text-app-subtle" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-app-border/10 px-3.5 py-1.5 text-[9.5px] font-medium text-app-subtle">
              <span className="flex items-center gap-2">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span className="hidden sm:inline">esc Close</span>
              </span>
              <span className="tracking-[0.14em]">ARCIVO SPOTLIGHT</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
