import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  FileText,
  Link2,
  Loader2,
  Plus,
  Search,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { apiErrorMessage } from '../lib/api';
import {
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
  type WorkspaceNote,
} from '../lib/notes';
import { timeAgo } from '../data/workspace';

interface NotesWindowProps {
  compact: boolean;
  onNotesChanged?: () => void;
  onOpenResource?: (id: string) => void;
}

interface Draft {
  id: string;
  title: string;
  body: string;
}

export function NotesWindow({ compact, onNotesChanged, onOpenResource }: NotesWindowProps) {
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const draftRef = useRef<Draft | null>(null);
  const saveSeqRef = useRef(0);

  draftRef.current = draft;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = await fetchNotes();
      setNotes(next);
      setSelectedId((current) => current ?? next[0]?.id ?? null);
    } catch (loadError) {
      setError(apiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;

  // Load the editor draft when the selection changes.
  useEffect(() => {
    if (!selectedNote) {
      setDraft(null);
      return;
    }
    setDraft({
      id: selectedNote.id,
      title: selectedNote.title,
      body: selectedNote.contentMarkdown,
    });
    setDirty(false);
    setConfirmingDelete(false);
    setError('');
  }, [selectedId, selectedNote?.id]);

  const persist = useCallback(async () => {
    const current = draftRef.current;
    if (!current) return;
    const seq = ++saveSeqRef.current;
    setSaving(true);
    setError('');
    try {
      const saved = await updateNote(current.id, {
        title: current.title.trim() || 'Untitled note',
        contentMarkdown: current.body,
      });
      if (seq !== saveSeqRef.current) return;
      setNotes((list) =>
        list.map((note) => (note.id === saved.id ? { ...note, ...saved } : note)),
      );
      const latest = draftRef.current;
      if (
        latest &&
        latest.id === saved.id &&
        latest.title.trim() === saved.title &&
        latest.body === saved.contentMarkdown
      ) {
        setDirty(false);
      }
      setSavedAt(Date.now());
      if (saved.resourceId) onNotesChanged?.();
    } catch (saveError) {
      if (seq === saveSeqRef.current) setError(apiErrorMessage(saveError));
    } finally {
      if (seq === saveSeqRef.current) setSaving(false);
    }
  }, [onNotesChanged]);

  // Debounced autosave.
  useEffect(() => {
    if (!dirty || !draft) return;
    const timer = window.setTimeout(() => void persist(), 700);
    return () => window.clearTimeout(timer);
  }, [dirty, draft, persist]);

  const createNewNote = async () => {
    setError('');
    try {
      const created = await createNote({ title: 'Untitled note', contentMarkdown: '' });
      setNotes((list) => [created, ...list]);
      setSelectedId(created.id);
    } catch (createError) {
      setError(apiErrorMessage(createError));
    }
  };

  const removeSelected = async () => {
    if (!selectedNote) return;
    setError('');
    try {
      await deleteNote(selectedNote.id);
      const remaining = notes.filter((note) => note.id !== selectedNote.id);
      setNotes(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setConfirmingDelete(false);
      if (selectedNote.resourceId) onNotesChanged?.();
    } catch (removeError) {
      setError(apiErrorMessage(removeError));
    }
  };

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(search) ||
        note.contentMarkdown.toLowerCase().includes(search),
    );
  }, [notes, query]);

  const wordCount = draft
    ? draft.body.trim()
      ? draft.body.trim().split(/\s+/).length
      : 0
    : 0;

  const statusLabel = saving
    ? 'Saving…'
    : dirty
      ? 'Unsaved changes'
      : savedAt
        ? 'All changes saved'
        : selectedNote
          ? `Edited ${timeAgo(selectedNote.updatedAt)}`
          : '';

  return (
    <div className="flex min-h-0 flex-1">
      {!compact && (
        <aside className="flex w-[212px] shrink-0 flex-col border-r border-app-border/10 bg-app-panel/30">
          <div className="flex items-center gap-1.5 border-b border-app-border/10 p-2">
            <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-app-border/10 bg-app-card/70 px-2 py-1.5">
              <Search className="h-3 w-3 shrink-0 text-app-subtle" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes"
                aria-label="Search notes"
                className="min-w-0 flex-1 bg-transparent text-[10.5px] text-app-text outline-none placeholder:text-app-subtle"
              />
            </label>
            <button
              type="button"
              onClick={() => void createNewNote()}
              aria-label="New note"
              title="New note"
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-app-accent text-white transition-transform hover:-translate-y-0.5">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-1.5">
            {loading && (
              <p className="flex items-center gap-1.5 px-2 py-3 text-[10.5px] text-app-subtle">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading notes…
              </p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-2 py-3 text-[10.5px] leading-relaxed text-app-subtle">
                {notes.length === 0 ? 'No notes yet. Start one.' : 'No notes match that search.'}
              </p>
            )}
            {filtered.map((note) => {
              const active = note.id === selectedId;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full rounded-lg border px-2 py-1.5 text-left transition-colors ${
                    active
                      ? 'border-app-accent/30 bg-app-accent/10'
                      : 'border-transparent hover:bg-app-hover/5'
                  }`}>
                  <span className="flex items-center gap-1.5">
                    <StickyNote
                      className={`h-3 w-3 shrink-0 ${active ? 'text-app-accent' : 'text-app-subtle'}`}
                    />
                    <span className="truncate text-[11px] font-semibold text-app-text">
                      {note.title || 'Untitled note'}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[9.5px] text-app-subtle">
                    {note.contentMarkdown.replace(/\s+/g, ' ').trim() || 'Empty note'}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[8.5px] font-medium uppercase tracking-[0.1em] text-app-subtle/80">
                    {note.resource ? (
                      <>
                        <Link2 className="h-2.5 w-2.5" />
                        {note.resource.title}
                      </>
                    ) : (
                      timeAgo(note.updatedAt)
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-app-border/10 px-2.5 py-2 text-[9px] text-app-subtle">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} · saved to your archive
          </div>
        </aside>
      )}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        {compact && (
          <div className="flex items-center gap-1.5 border-b border-app-border/10 p-2">
            <select
              value={selectedId ?? ''}
              onChange={(event) => setSelectedId(event.target.value || null)}
              aria-label="Choose note"
              className="min-w-0 flex-1 rounded-lg border border-app-border/10 bg-app-card/70 px-2 py-1.5 text-[10.5px] font-medium text-app-text outline-none">
              {notes.length === 0 && <option value="">No notes</option>}
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title || 'Untitled note'}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void createNewNote()}
              aria-label="New note"
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-app-accent text-white">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mx-3 mt-2 flex items-start gap-1.5 rounded-lg border border-brand-berry-500/25 bg-brand-berry-500/10 px-2 py-1.5 text-[10px] text-brand-berry-600 dark:text-brand-coral-300">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!selectedNote && !loading ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-cream-300 via-brand-caramel-400 to-brand-caramel-600 text-white shadow-lg">
              <StickyNote className="h-6 w-6" />
            </span>
            <h3 className="text-[13px] font-bold text-app-text">A blank page for your archive</h3>
            <p className="max-w-[260px] text-[10.5px] leading-relaxed text-app-muted">
              Jot down an idea, a quote, or a thread you want to keep. Notes autosave as you type.
            </p>
            <button
              type="button"
              onClick={() => void createNewNote()}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-app-accent px-2.5 py-1.5 text-[10.5px] font-semibold text-white">
              <Plus className="h-3 w-3" />
              New note
            </button>
          </div>
        ) : (
          selectedNote &&
          draft && (
            <>
              <div className="border-b border-app-border/10 px-4 pb-2 pt-3">
                <input
                  value={draft.title}
                  onChange={(event) => {
                    setDraft({ ...draft, title: event.target.value });
                    setDirty(true);
                  }}
                  onBlur={() => dirty && void persist()}
                  placeholder="Untitled note"
                  aria-label="Note title"
                  className="w-full bg-transparent text-[15px] font-extrabold tracking-tight text-app-text outline-none placeholder:text-app-subtle/70"
                />
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9.5px] text-app-subtle">
                  <span>{statusLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{wordCount} words</span>
                  {selectedNote.resource && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => onOpenResource?.(selectedNote.resource!.id)}
                        className="inline-flex max-w-[240px] items-center gap-1 truncate rounded-full bg-app-accent/10 px-1.5 py-0.5 font-semibold text-app-accent transition-colors hover:bg-app-accent/15">
                        <Link2 className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{selectedNote.resource.title}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <textarea
                value={draft.body}
                onChange={(event) => {
                  setDraft({ ...draft, body: event.target.value });
                  setDirty(true);
                }}
                onBlur={() => dirty && void persist()}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
                    event.preventDefault();
                    void persist();
                  }
                }}
                placeholder="Write something worth keeping…"
                aria-label="Note content"
                spellCheck
                className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 text-[12px] leading-[1.75] text-app-text outline-none placeholder:text-app-subtle/60"
              />

              <div className="flex items-center gap-2 border-t border-app-border/10 px-3 py-2">
                <span className="flex items-center gap-1 text-[9.5px] text-app-subtle">
                  {saving ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : dirty ? (
                    <FileText className="h-2.5 w-2.5" />
                  ) : (
                    <Check className="h-2.5 w-2.5 text-brand-sage-600 dark:text-brand-sage-400" />
                  )}
                  {saving ? 'Saving' : dirty ? 'Not saved yet' : 'Saved'}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  {confirmingDelete ? (
                    <>
                      <span className="text-[9.5px] font-semibold text-app-muted">Delete this note?</span>
                      <button
                        type="button"
                        onClick={() => void removeSelected()}
                        className="rounded-md bg-brand-berry-500 px-2 py-1 text-[9.5px] font-semibold text-white">
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        className="rounded-md border border-app-border/15 px-2 py-1 text-[9.5px] font-semibold text-app-muted">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      aria-label="Delete note"
                      className="flex items-center gap-1 rounded-md border border-app-border/15 px-2 py-1 text-[9.5px] font-semibold text-app-muted transition-colors hover:border-brand-berry-500/30 hover:text-brand-berry-600 dark:hover:text-brand-coral-300">
                      <Trash2 className="h-2.5 w-2.5" />
                      Delete
                    </button>
                  )}
                </span>
              </div>
            </>
          )
        )}
      </section>
    </div>
  );
}
