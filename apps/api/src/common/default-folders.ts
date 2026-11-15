export interface DefaultFolder {
  name: string;
  color: string;
  description: string;
  sortOrder: number;
}

/** Folders every new Arcivo account starts with, mirroring the workspace defaults. */
export const DEFAULT_FOLDERS: DefaultFolder[] = [
  { name: 'Research', color: '#10B981', description: 'Deep dives and papers', sortOrder: 0 },
  { name: 'University', color: '#EC4899', description: 'Coursework and lectures', sortOrder: 1 },
  { name: 'Web Development', color: '#6366F1', description: 'Frontend and backend', sortOrder: 2 },
  { name: 'Inspiration', color: '#F59E0B', description: 'Design and ideas', sortOrder: 3 },
];
