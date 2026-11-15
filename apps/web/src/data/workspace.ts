import {
  BookOpen,
  Code2,
  FileText,
  MessagesSquare,
  PlayCircle,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';

export type WorkspaceTab = 'home' | 'favorites' | 'recent' | 'notes';

export type ResourceKind = 'article' | 'video' | 'book' | 'paper' | 'code' | 'thread';

export interface WorkspaceFolder {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface WorkspaceNote {
  title: string;
  body: string;
  updatedAt: string;
}

export interface WorkspaceResource {
  id: string;
  url: string;
  title: string;
  description: string;
  kind: ResourceKind;
  folderId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  readingMinutes: number;
  hasSnapshot: boolean;
  aiSummary: string[];
  note?: WorkspaceNote;
}

export const folderPalette = ['#10B981', '#EC4899', '#6366F1', '#F59E0B', '#0EA5E9', '#8B5CF6'];

export const kindMeta: Record<
  ResourceKind,
  { label: string; gradient: string; icon: LucideIcon; note: string }
> = {
  article: {
    label: 'Article',
    gradient: 'from-indigo-500 via-violet-500 to-fuchsia-500',
    icon: FileText,
    note: 'Reader copy saved',
  },
  video: {
    label: 'Video',
    gradient: 'from-rose-500 via-red-500 to-orange-400',
    icon: PlayCircle,
    note: 'Transcript captured',
  },
  book: {
    label: 'Book',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    icon: BookOpen,
    note: 'Chapters indexed',
  },
  paper: {
    label: 'Paper',
    gradient: 'from-sky-500 via-cyan-500 to-blue-600',
    icon: ScrollText,
    note: 'Abstract summarized',
  },
  code: {
    label: 'Code',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: Code2,
    note: 'Repo snapshot saved',
  },
  thread: {
    label: 'Thread',
    gradient: 'from-slate-600 via-slate-700 to-slate-900',
    icon: MessagesSquare,
    note: 'Thread flattened',
  },
};

export function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'unknown source';
  }
}

export function hostnameFromInput(value: string): string | null {
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(normalized).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function guessKind(url: string): ResourceKind {
  const host = safeHostname(url).toLowerCase();
  if (host.includes('youtube') || host.includes('vimeo')) return 'video';
  if (host.includes('arxiv') || host.includes('doi.org') || host.includes('acm.org')) return 'paper';
  if (host.includes('github') || host.includes('gitlab')) return 'code';
  if (host.includes('twitter') || host.includes('x.com') || host.includes('reddit') || host.includes('ycombinator')) {
    return 'thread';
  }
  if (host.includes('book') || host.includes('goodreads')) return 'book';
  return 'article';
}

export function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const slug = parsed.pathname.split('/').filter(Boolean).pop();
    if (slug) {
      const cleaned = slug
        .replace(/\.(html?|php|md)$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      if (cleaned.length > 3) {
        return cleaned.replace(/\b\w/g, (character) => character.toUpperCase()).slice(0, 80);
      }
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled resource';
  }
}

export function timeAgo(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return 'unknown';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function readingLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export type SortMode = 'newest' | 'oldest' | 'title';

export const sortOptions: { value: SortMode; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
];
