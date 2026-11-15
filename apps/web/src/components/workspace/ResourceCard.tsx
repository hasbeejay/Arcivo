import { forwardRef, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Folder as FolderIcon, ShieldCheck, Star, StickyNote } from 'lucide-react';
import {
  kindMeta,
  readingLabel,
  safeHostname,
  timeAgo,
  type WorkspaceFolder,
  type WorkspaceResource,
} from '../../data/workspace';

interface ResourceCardProps {
  resource: WorkspaceResource;
  folder?: WorkspaceFolder;
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
  variant?: 'grid' | 'list';
}

function cardKeyActivate(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.target !== event.currentTarget) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

function FavoriteButton({
  resource,
  onToggleFavorite,
  className = '',
}: {
  resource: WorkspaceResource;
  onToggleFavorite: (id: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggleFavorite(resource.id);
      }}
      aria-label={resource.isFavorite ? `Remove ${resource.title} from favorites` : `Add ${resource.title} to favorites`}
      aria-pressed={resource.isFavorite}
      className={`rounded-lg p-1.5 backdrop-blur-md transition-colors ${
        resource.isFavorite
          ? 'bg-amber-400/15 text-amber-400'
          : 'bg-black/20 text-white/70 hover:bg-black/30 hover:text-amber-300'
      } ${className}`}>
      <Star className={`h-3.5 w-3.5 ${resource.isFavorite ? 'fill-amber-400' : ''}`} />
    </button>
  );
}

export const ResourceCard = forwardRef<HTMLElement, ResourceCardProps>(function ResourceCard(
  { resource, folder, onToggleFavorite, onOpen, variant = 'grid' },
  ref,
) {
  const meta = kindMeta[resource.kind];
  const Icon = meta.icon;
  const host = safeHostname(resource.url);
  const open = () => onOpen(resource.id);

  if (variant === 'list') {
    return (
      <motion.article
        ref={ref}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(event) => cardKeyActivate(event, open)}
        className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-app-border/10 bg-app-card/45 p-3 backdrop-blur-xl transition-colors hover:border-app-accent/30 hover:bg-app-card/70 sm:gap-4 sm:p-4">
        <span
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr text-white shadow-md sm:h-14 sm:w-14 ${meta.gradient}`}>
          <span className="bg-dots absolute inset-0 opacity-20" />
          <Icon className="relative h-5 w-5 sm:h-6 sm:w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-[13px] font-semibold text-app-text transition-colors group-hover:text-app-accent sm:text-sm">
              {resource.title}
            </h4>
            {resource.note && <StickyNote className="h-3 w-3 shrink-0 text-amber-500" />}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-app-muted">{resource.description}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-app-subtle">
            <span className="flex items-center gap-1 font-mono">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              {host}
            </span>
            {folder && (
              <span className="flex items-center gap-1">
                <FolderIcon className="h-2.5 w-2.5" style={{ color: folder.color }} />
                {folder.name}
              </span>
            )}
            <span>{timeAgo(resource.createdAt)}</span>
            <span className="hidden sm:inline">{readingLabel(resource.readingMinutes)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {resource.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-app-accent/10 px-2 py-0.5 text-[9px] font-medium text-app-accent">
                {tag}
              </span>
            ))}
          </div>
          <FavoriteButton resource={resource} onToggleFavorite={onToggleFavorite} className="bg-transparent" />
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Open ${resource.title} in a new tab`}
            className="rounded-lg p-1.5 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-accent">
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => cardKeyActivate(event, open)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-app-border/10 bg-app-card/45 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-app-accent/30 hover:bg-app-card/70 hover:shadow-xl hover:shadow-indigo-950/5">
      <div className={`relative h-28 overflow-hidden bg-gradient-to-tr p-3.5 ${meta.gradient}`}>
        <span className="bg-dots absolute inset-0 opacity-20" />
        <Icon className="absolute -bottom-3 -right-2 h-20 w-20 rotate-[-10deg] text-white/15" />

        <div className="relative flex items-start justify-between">
          <span className="rounded-md border border-white/20 bg-black/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {meta.label}
          </span>
          <FavoriteButton resource={resource} onToggleFavorite={onToggleFavorite} />
        </div>

        <div className="absolute inset-x-3.5 bottom-3 flex items-center justify-between">
          <span className="flex items-center gap-1 rounded-md border border-white/15 bg-black/25 px-1.5 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-md">
            <span className="h-1 w-1 rounded-full bg-white/80" />
            {host}
          </span>
          {resource.hasSnapshot && (
            <span
              title="Reader copy saved"
              className="flex items-center gap-1 rounded-md border border-white/15 bg-black/25 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-md">
              <ShieldCheck className="h-2.5 w-2.5" />
              Kept
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-1.5">
          <h4 className="line-clamp-1 flex-1 text-sm font-semibold text-app-text transition-colors group-hover:text-app-accent">
            {resource.title}
          </h4>
          {resource.note && (
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Has a note" />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-app-muted">{resource.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-app-accent/10 px-2 py-0.5 text-[9px] font-medium text-app-accent">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-app-border/10 pt-3 text-[10px] text-app-subtle">
          <span className="flex min-w-0 items-center gap-1.5">
            {folder && (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm" style={{ backgroundColor: folder.color }} />
                <span className="truncate">{folder.name}</span>
                <span className="text-app-subtle/60">·</span>
              </>
            )}
            <span className="shrink-0">{timeAgo(resource.createdAt)}</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-app-accent opacity-0 transition-opacity group-hover:opacity-100">
            Details <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </motion.article>
  );
});
