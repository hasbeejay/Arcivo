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

export const initialFolders: WorkspaceFolder[] = [
  { id: 'research', name: 'Research', color: '#10B981', description: 'Deep dives and papers' },
  { id: 'university', name: 'University', color: '#EC4899', description: 'Coursework and lectures' },
  { id: 'web-dev', name: 'Web Development', color: '#6366F1', description: 'Frontend and backend' },
  { id: 'inspiration', name: 'Inspiration', color: '#F59E0B', description: 'Design and ideas' },
];

export const folderPalette = ['#10B981', '#EC4899', '#6366F1', '#F59E0B', '#0EA5E9', '#8B5CF6'];

export const initialResources: WorkspaceResource[] = [
  {
    id: 'res-building-apis',
    url: 'https://example.dev/article/building-better-apis',
    title: 'Building Better APIs',
    description:
      'A practical guide to designing reliable, maintainable APIs with clear boundaries and predictable responses.',
    kind: 'article',
    folderId: 'research',
    tags: ['api', 'architecture'],
    isFavorite: true,
    createdAt: '2026-11-14T08:12:00Z',
    readingMinutes: 6,
    hasSnapshot: true,
    aiSummary: [
      'Name resources with nouns and let HTTP carry the verbs.',
      'Design boundaries deliberately instead of discovering them in production.',
      'Predictable responses beat clever endpoints every time.',
    ],
    note: {
      title: 'Slides for the final demo',
      body: 'Compare the boundary section with the REST chapter, slide 14. Use the pagination example for the API demo.',
      updatedAt: '2026-11-14T09:02:00Z',
    },
  },
  {
    id: 'res-dotnet-course',
    url: 'https://youtube.com/watch?v=dotnet10-course',
    title: '.NET 10 Full Course',
    description: 'A four-hour deep dive into backend architecture, minimal APIs and performant endpoints.',
    kind: 'video',
    folderId: 'web-dev',
    tags: ['dotnet', 'backend'],
    isFavorite: false,
    createdAt: '2026-11-13T16:40:00Z',
    readingMinutes: 252,
    hasSnapshot: true,
    aiSummary: [
      'Minimal APIs keep the request pipeline readable.',
      'Dependency injection stays explicit when registrations are grouped by feature.',
      'Measure before optimizing — the profiler found the real bottleneck.',
    ],
  },
  {
    id: 'res-css-glass',
    url: 'https://css-tricks.com/modern-css-patterns',
    title: 'Modern CSS Patterns & Glassmorphism',
    description: 'Creating depth, backdrop filters and fluid layouts for desktop-grade web applications.',
    kind: 'article',
    folderId: 'inspiration',
    tags: ['css', 'design'],
    isFavorite: true,
    createdAt: '2026-11-12T11:05:00Z',
    readingMinutes: 8,
    hasSnapshot: true,
    aiSummary: [
      'Layered translucency only works when contrast is controlled underneath.',
      'Use one backdrop blur per surface, not per child element.',
      'Fluid type scales remove most of the awkward breakpoint jumps.',
    ],
  },
  {
    id: 'res-attention',
    url: 'https://arxiv.org/abs/1706.03762',
    title: 'Attention Is All You Need',
    description: 'The transformer paper that replaced recurrence with self-attention for sequence modelling.',
    kind: 'paper',
    folderId: 'university',
    tags: ['ml', 'transformers'],
    isFavorite: true,
    createdAt: '2026-11-11T19:20:00Z',
    readingMinutes: 34,
    hasSnapshot: true,
    aiSummary: [
      'Self-attention relates every position to every other position in one step.',
      'Multi-head attention lets the model track several relationships at once.',
      'Positional encodings are what give the otherwise orderless model sequence.',
    ],
    note: {
      title: 'Presentation angle',
      body: 'Open with the recurrence bottleneck, then show how attention removes it. Keep the math light.',
      updatedAt: '2026-11-12T08:15:00Z',
    },
  },
  {
    id: 'res-ddia',
    url: 'https://dataintensive.net/',
    title: 'Designing Data-Intensive Applications',
    description: 'The systems book on storage engines, replication, partitioning and distributed consistency.',
    kind: 'book',
    folderId: 'research',
    tags: ['systems', 'databases'],
    isFavorite: false,
    createdAt: '2026-11-10T09:30:00Z',
    readingMinutes: 620,
    hasSnapshot: true,
    aiSummary: [
      'Every storage engine is a tradeoff between read and write amplification.',
      'Replication lag turns consistency into a product decision, not a checkbox.',
      'Partitioning changes the failure model — plan for rebalancing early.',
    ],
  },
  {
    id: 'res-rsc-rfc',
    url: 'https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md',
    title: 'React Server Components RFC',
    description: 'The proposal for components that render ahead of time and ship no JavaScript to the client.',
    kind: 'code',
    folderId: 'web-dev',
    tags: ['react', 'ssr'],
    isFavorite: false,
    createdAt: '2026-11-09T21:14:00Z',
    readingMinutes: 12,
    hasSnapshot: true,
    aiSummary: [
      'Server components stream rendered output instead of shipping bundles.',
      'Client components stay opt-in, which keeps the interactive surface small.',
      'The boundary between the two is the important design decision.',
    ],
    note: {
      title: 'Before the demo',
      body: 'Read the streaming section again and test the suspense fallback in the workspace branch.',
      updatedAt: '2026-11-10T07:40:00Z',
    },
  },
  {
    id: 'res-tailwind-v4',
    url: 'https://tailwindcss.com/blog/tailwindcss-v4',
    title: 'Tailwind CSS v4',
    description: 'A faster engine, CSS-first configuration and a smaller runtime for utility-first styling.',
    kind: 'article',
    folderId: 'web-dev',
    tags: ['tailwind', 'css'],
    isFavorite: true,
    createdAt: '2026-11-08T14:00:00Z',
    readingMinutes: 5,
    hasSnapshot: true,
    aiSummary: [
      'Configuration moves into CSS with theme variables.',
      'The new engine avoids generating unused utilities up front.',
      'Container queries are now a first-class primitive.',
    ],
  },
  {
    id: 'res-smart-notes',
    url: 'https://takesmartnotes.com/',
    title: 'How to Take Smart Notes',
    description: 'The Zettelkasten method for turning reading into durable, connected notes.',
    kind: 'book',
    folderId: 'university',
    tags: ['notes', 'learning'],
    isFavorite: false,
    createdAt: '2026-11-07T08:45:00Z',
    readingMinutes: 180,
    hasSnapshot: true,
    aiSummary: [
      'Write notes for your future self, not as a transcript.',
      'One idea per note keeps the graph linkable.',
      'Connections matter more than the number of notes.',
    ],
    note: {
      title: 'Method to try',
      body: 'One idea per note, written in my own words, linked to at least one existing note.',
      updatedAt: '2026-11-08T22:05:00Z',
    },
  },
  {
    id: 'res-local-first',
    url: 'https://news.ycombinator.com/item?id=local-first',
    title: 'Local-first software, five years later',
    description: 'A long thread on sync engines, conflict resolution and why local data still wins.',
    kind: 'thread',
    folderId: 'inspiration',
    tags: ['local-first', 'sync'],
    isFavorite: false,
    createdAt: '2026-11-05T22:10:00Z',
    readingMinutes: 7,
    hasSnapshot: false,
    aiSummary: [
      'Local-first is a UX promise, not only a storage choice.',
      'Conflict resolution must be designed before the first sync.',
      'Offline behaviour is the easiest way to feel the difference.',
    ],
  },
  {
    id: 'res-ts-patterns',
    url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
    title: 'TypeScript Narrowing Patterns',
    description: 'A reference for discriminated unions, type guards and exhaustive checks.',
    kind: 'article',
    folderId: 'research',
    tags: ['typescript', 'patterns'],
    isFavorite: false,
    createdAt: '2026-11-03T10:20:00Z',
    readingMinutes: 11,
    hasSnapshot: true,
    aiSummary: [
      'Discriminated unions make impossible states unrepresentable.',
      'Custom type guards should stay small and honest.',
      'Exhaustive switches turn future additions into compile errors.',
    ],
  },
  {
    id: 'res-ux-laws',
    url: 'https://lawsofux.com/',
    title: 'Laws of UX',
    description: 'A collection of psychology principles that explain how interfaces actually feel.',
    kind: 'article',
    folderId: 'inspiration',
    tags: ['ux', 'design'],
    isFavorite: true,
    createdAt: '2026-10-30T13:40:00Z',
    readingMinutes: 9,
    hasSnapshot: true,
    aiSummary: [
      'Perceived performance is often more important than raw speed.',
      'Choices become easier when defaults are sensible.',
      'Familiar patterns reduce the cost of learning a new tool.',
    ],
  },
  {
    id: 'res-postgres-course',
    url: 'https://youtube.com/watch?v=postgres-deep-dive',
    title: 'PostgreSQL Deep Dive',
    description: 'Indexes, query planning and the parts of Postgres that decide whether a query is fast.',
    kind: 'video',
    folderId: 'university',
    tags: ['postgres', 'db'],
    isFavorite: false,
    createdAt: '2026-10-27T17:00:00Z',
    readingMinutes: 96,
    hasSnapshot: true,
    aiSummary: [
      'Indexes help reads and quietly tax every write.',
      'EXPLAIN ANALYZE is the only honest opinion about a query.',
      'Most slow queries are a missing predicate, not a slow database.',
    ],
  },
];

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
