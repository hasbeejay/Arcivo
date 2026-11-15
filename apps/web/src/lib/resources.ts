import { api } from './api';
import type {
  ResourceKind,
  WorkspaceFolder,
  WorkspaceResource,
} from '../data/workspace';

export type ApiResourceType = 'ARTICLE' | 'VIDEO' | 'BOOK' | 'PAPER' | 'CODE' | 'THREAD' | 'GENERAL';

interface ApiFolder {
  id: string;
  name: string;
  color: string;
  description: string | null;
  count: number;
  createdAt: string;
}

interface ApiNote {
  title: string;
  body: string;
  updatedAt: string;
}

interface ApiResource {
  id: string;
  url: string;
  title: string;
  description: string;
  resourceType: ApiResourceType;
  folderId: string | null;
  folder: { id: string; name: string; color: string; description: string } | null;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  hasSnapshot: boolean;
  readingMinutes: number;
  aiSummary: string[];
  note: ApiNote | null;
  createdAt: string;
  updatedAt: string;
}

const kindByType: Record<ApiResourceType, ResourceKind> = {
  ARTICLE: 'article',
  VIDEO: 'video',
  BOOK: 'book',
  PAPER: 'paper',
  CODE: 'code',
  THREAD: 'thread',
  GENERAL: 'article',
};

const typeByKind: Record<ResourceKind, ApiResourceType> = {
  article: 'ARTICLE',
  video: 'VIDEO',
  book: 'BOOK',
  paper: 'PAPER',
  code: 'CODE',
  thread: 'THREAD',
};

function toFolder(folder: ApiFolder): WorkspaceFolder {
  return {
    id: folder.id,
    name: folder.name,
    color: folder.color,
    description: folder.description ?? '',
  };
}

function toResource(resource: ApiResource): WorkspaceResource {
  return {
    id: resource.id,
    url: resource.url,
    title: resource.title,
    description: resource.description,
    kind: kindByType[resource.resourceType] ?? 'article',
    folderId: resource.folderId ?? '',
    tags: resource.tags,
    isFavorite: resource.isFavorite,
    createdAt: resource.createdAt,
    readingMinutes: resource.readingMinutes,
    hasSnapshot: resource.hasSnapshot,
    aiSummary: resource.aiSummary,
    note: resource.note ?? undefined,
  };
}

export interface WorkspaceSnapshot {
  folders: WorkspaceFolder[];
  resources: WorkspaceResource[];
}

export async function fetchWorkspace(): Promise<WorkspaceSnapshot> {
  const [foldersResponse, resourcesResponse] = await Promise.all([
    api.get<ApiFolder[]>('/folders'),
    api.get<ApiResource[]>('/resources'),
  ]);

  return {
    folders: foldersResponse.data.map(toFolder),
    resources: resourcesResponse.data.map(toResource),
  };
}

export interface CreateResourceInput {
  url: string;
  folderId?: string | null;
  tags?: string[];
  note?: string;
  title?: string;
  description?: string;
  kind?: ResourceKind;
}

export async function createResource(input: CreateResourceInput): Promise<WorkspaceResource> {
  const { data } = await api.post<ApiResource>('/resources', {
    url: input.url,
    ...(input.title ? { title: input.title } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.kind ? { resourceType: typeByKind[input.kind] } : {}),
    ...(input.folderId ? { folderId: input.folderId } : {}),
    ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
    ...(input.note ? { note: input.note } : {}),
  });

  return toResource(data);
}

export interface UpdateResourceInput {
  isFavorite?: boolean;
  folderId?: string | null;
  tags?: string[];
  note?: string;
  title?: string;
  description?: string;
  kind?: ResourceKind;
}

export async function updateResource(
  id: string,
  input: UpdateResourceInput,
): Promise<WorkspaceResource> {
  const { data } = await api.patch<ApiResource>(`/resources/${id}`, {
    ...(input.isFavorite !== undefined ? { isFavorite: input.isFavorite } : {}),
    ...(input.folderId !== undefined ? { folderId: input.folderId } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.note !== undefined ? { note: input.note } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.kind !== undefined ? { resourceType: typeByKind[input.kind] } : {}),
  });

  return toResource(data);
}

export interface CreateFolderInput {
  name: string;
  description?: string;
  color?: string;
}

export async function createFolder(input: CreateFolderInput): Promise<WorkspaceFolder> {
  const { data } = await api.post<ApiFolder>('/folders', {
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(input.color ? { color: input.color } : {}),
  });

  return toFolder(data);
}
