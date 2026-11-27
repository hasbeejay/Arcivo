import { api } from './api';

export interface NoteResourceRef {
  id: string;
  title: string;
  url: string;
}

export interface WorkspaceNote {
  id: string;
  title: string;
  contentMarkdown: string;
  resourceId: string | null;
  resource: NoteResourceRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title?: string;
  contentMarkdown?: string;
  resourceId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  contentMarkdown?: string;
  resourceId?: string | null;
}

export async function fetchNotes(): Promise<WorkspaceNote[]> {
  const { data } = await api.get<WorkspaceNote[]>('/notes');
  return data;
}

export async function createNote(input: CreateNoteInput = {}): Promise<WorkspaceNote> {
  const { data } = await api.post<WorkspaceNote>('/notes', input);
  return data;
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<WorkspaceNote> {
  const { data } = await api.patch<WorkspaceNote>(`/notes/${id}`, input);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}
