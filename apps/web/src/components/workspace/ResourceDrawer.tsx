import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bookmark,
  Check,
  Clock,
  ExternalLink,
  Folder as FolderIcon,
  ShieldCheck,
  Sparkles,
  Star,
  StickyNote,
  X,
} from 'lucide-react';
import {
  kindMeta,
  readingLabel,
  safeHostname,
  timeAgo,
  type WorkspaceFolder,
  type WorkspaceResource,
} from '../../data/workspace';

interface ResourceDrawerProps {
  resource: WorkspaceResource | null;
  folder?: WorkspaceFolder;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export function ResourceDrawer({ resource, folder, onClose, onToggleFavorite }: ResourceDrawerProps) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!resource) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resource, onClose]);

  useEffect(() => {
    setCopied(false);
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, [resource?.id]);

  const meta = resource ? kindMeta[resource.kind] : null;
  const Icon = meta?.icon ?? Bookmark;

  const copyLink = async () => {
    if (!resource) return;
    try {
      await navigator.clipboard.writeText(resource.url);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {resource && meta && (
        <motion.div
          key="resource-drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end">
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/60"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-app-border/10 bg-app-panel/95 shadow-2xl backdrop-blur-2xl">
            <div className={`relative h-36 shrink-0 overflow-hidden bg-gradient-to-tr p-4 ${meta.gradient}`}>
              <span className="bg-dots absolute inset-0 opacity-20" />
              <Icon className="absolute -bottom-4 -right-2 h-32 w-32 rotate-[-10deg] text-white/15" />

              <div className="relative flex items-start justify-between">
                <span className="rounded-md border border-white/20 bg-black/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                  {meta.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(resource.id)}
                    aria-label={resource.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={resource.isFavorite}
                    className="rounded-lg border border-white/15 bg-black/25 p-1.5 text-white/90 backdrop-blur-md transition-colors hover:bg-black/35">
                    <Star className={`h-3.5 w-3.5 ${resource.isFavorite ? 'fill-amber-300 text-amber-300' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close details"
                    className="rounded-lg border border-white/15 bg-black/25 p-1.5 text-white/90 backdrop-blur-md transition-colors hover:bg-black/35">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-3.5 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md border border-white/15 bg-black/25 px-1.5 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-md">
                  <span className="h-1 w-1 rounded-full bg-white/80" />
                  {safeHostname(resource.url)}
                </span>
                {resource.hasSnapshot && (
                  <span className="flex items-center gap-1 rounded-md border border-white/15 bg-black/25 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-md">
                    <ShieldCheck className="h-2.5 w-2.5" /> Reader copy kept
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-app-subtle">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {readingLabel(resource.readingMinutes)}
                </span>
                <span className="h-1 w-1 rounded-full bg-app-border/30" />
                <span>Saved {timeAgo(resource.createdAt)}</span>
                {folder && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-app-border/30" />
                    <span className="flex items-center gap-1">
                      <FolderIcon className="h-3 w-3" style={{ color: folder.color }} />
                      {folder.name}
                    </span>
                  </>
                )}
              </div>

              <h2 id="resource-drawer-title" className="mt-2.5 text-xl font-extrabold leading-snug tracking-tight text-app-text">
                {resource.title}
              </h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-app-muted">{resource.description}</p>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-3 py-2.5 text-[12px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40">
                  Open original
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-app-border/10 bg-app-hover/5 px-3 py-2.5 text-[12px] font-semibold text-app-muted transition-colors hover:bg-app-hover/10 hover:text-app-text">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Bookmark className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>

              <div className="mt-6">
                <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-app-subtle">
                  <Sparkles className="h-3 w-3 text-app-accent" /> AI takeaways
                </h3>
                {resource.aiSummary.length > 0 ? (
                  <ul className="mt-3 space-y-2.5">
                    {resource.aiSummary.map((line, index) => (
                      <li key={line} className="flex gap-2.5 text-[12px] leading-relaxed text-app-muted">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-app-accent/10 text-[9px] font-bold text-app-accent">
                          {index + 1}
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-app-subtle">
                    Takeaways appear once the reader copy finishes processing.
                  </p>
                )}
              </div>

              {resource.note && (
                <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-300">
                    <StickyNote className="h-3 w-3" /> Your note
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-app-text">{resource.note.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-app-muted">{resource.note.body}</p>
                  <p className="mt-2 text-[9px] text-app-subtle">Updated {timeAgo(resource.note.updatedAt)}</p>
                </div>
              )}

              {resource.tags.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-app-subtle">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-app-accent/10 px-2.5 py-1 text-[10px] font-medium text-app-accent">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-app-border/10 bg-app-hover/5 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-app-subtle">Source</p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1.5 break-all font-mono text-[10px] text-app-muted transition-colors hover:text-app-accent">
                  {resource.url}
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
              </div>

              <p className="mt-5 text-center text-[9px] text-app-subtle">
                Archived {new Date(resource.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
