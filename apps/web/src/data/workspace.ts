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

export const folderPalette = ['#7B9F86', '#E84A5F', '#FF847C', '#B57A4C', '#6C999C', '#96B49E'];

export const kindMeta: Record<
  ResourceKind,
  { label: string; gradient: string; icon: LucideIcon; note: string }
> = {
  article: {
    label: 'Article',
    gradient: 'from-brand-berry-600 via-brand-berry-500 to-brand-coral-500',
    icon: FileText,
    note: 'Reader copy saved',
  },
  video: {
    label: 'Video',
    gradient: 'from-brand-berry-700 via-brand-berry-600 to-brand-caramel-500',
    icon: PlayCircle,
    note: 'Transcript captured',
  },
  book: {
    label: 'Book',
    gradient: 'from-brand-caramel-600 via-brand-caramel-500 to-brand-berry-600',
    icon: BookOpen,
    note: 'Chapters indexed',
  },
  paper: {
    label: 'Paper',
    gradient: 'from-brand-teal-700 via-brand-teal-600 to-brand-mist-500',
    icon: ScrollText,
    note: 'Abstract summarized',
  },
  code: {
    label: 'Code',
    gradient: 'from-brand-sage-700 via-brand-sage-600 to-brand-teal-600',
    icon: Code2,
    note: 'Repo snapshot saved',
  },
  thread: {
    label: 'Thread',
    gradient: 'from-brand-ink-800 via-brand-ink-700 to-brand-ink-600',
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
