export type ResourceType = 'article' | 'video' | 'book' | 'code' | 'general';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  _count?: {
    resources: number;
  };
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  parentId?: string | null;
  createdAt: string;
  _count?: {
    resources: number;
    subfolders?: number;
  };
}

export interface Note {
  id: string;
  title: string;
  contentMarkdown: string;
  resourceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  resourceType: ResourceType;
  contentSnapshot?: string;
  aiSummary?: string;
  isFavorite: boolean;
  isArchived: boolean;
  folderId?: string | null;
  folder?: Folder;
  tags?: Tag[];
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface ScrapedPreview {
  url: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  resourceType: ResourceType;
  readingTimeMinutes?: number;
}

