import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Folder as FolderIcon,
  Globe,
  Link2,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  guessKind,
  hostnameFromInput,
  kindMeta,
  titleFromUrl,
  type WorkspaceFolder,
} from '../../data/workspace';

export interface SaveDraft {
  url: string;
  folderId: string;
  tags: string[];
  note: string;
}

interface SaveModalProps {
  open: boolean;
  folders: WorkspaceFolder[];
  defaultFolderId: string | null;
  onClose: () => void;
  onSave: (draft: SaveDraft) => void;
}

type Phase = 'idle' | 'saving' | 'saved';

function normalizeUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function SaveModal({ open, folders, defaultFolderId, onClose, onSave }: SaveModalProps) {
  const [url, setUrl] = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId ?? folders[0]?.id ?? '');
  const [tags, setTags] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!open) return;
    setUrl('');
    setTags('');
    setNote('');
    setError('');
    setPhase('idle');
    setFolderId(defaultFolderId ?? folders[0]?.id ?? '');
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(focusTimer);
  }, [open, defaultFolderId, folders]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && phase === 'idle') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, phase, onClose]);

  const trimmedUrl = url.trim();
  const normalized = trimmedUrl ? normalizeUrl(trimmedUrl) : '';
  const host = trimmedUrl ? hostnameFromInput(trimmedUrl) : null;
  const previewKind = host ? guessKind(normalized) : null;
  const previewMeta = previewKind ? kindMeta[previewKind] : null;
  const PreviewIcon = previewMeta?.icon ?? Link2;
  const previewTitle = host ? titleFromUrl(normalized) : '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phase !== 'idle') return;

    if (!trimmedUrl) {
      setError('Paste a link to archive.');
      return;
    }

    try {
      const parsed = new URL(normalized);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('invalid protocol');
      if (!parsed.hostname.includes('.')) throw new Error('invalid host');
    } catch {
      setError('That does not look like a valid URL. Try https://example.com/article.');
      return;
    }

    setError('');
    setPhase('saving');
    const saveTimer = window.setTimeout(() => {
      onSave({
        url: normalized,
        folderId: folderId || folders[0]?.id || '',
        tags: tags
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 6),
        note: note.trim(),
      });
      setPhase('saved');
      const closeTimer = window.setTimeout(() => onClose(), 720);
      timers.current.push(closeTimer);
    }, 780);
    timers.current.push(saveTimer);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="save-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            aria-hidden="true"
            onClick={() => phase === 'idle' && onClose()}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm dark:bg-black/65"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-app-border/10 bg-app-panel/95 shadow-2xl backdrop-blur-2xl sm:rounded-3xl">
            <div className="relative shrink-0 border-b border-app-border/10 px-5 py-4 sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-fuchsia-500/10" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-600/30">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 id="save-modal-title" className="text-[15px] font-bold tracking-tight text-app-text">
                      Archive something worth keeping
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-app-muted">
                      Arcivo keeps the link, a reader copy and the details that help you find it later.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => phase === 'idle' && onClose()}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-app-subtle transition-colors hover:bg-app-hover/10 hover:text-app-text">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
                <div>
                  <label
                    htmlFor="save-url"
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                    <Globe className="h-3 w-3" /> Page URL
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-app-subtle" />
                    <input
                      ref={inputRef}
                      id="save-url"
                      type="text"
                      value={url}
                      onChange={(event) => {
                        setUrl(event.target.value);
                        if (error) setError('');
                      }}
                      placeholder="https://example.com/article/building-better-apis"
                      className="w-full rounded-xl border border-app-border/10 bg-app-hover/5 py-2.5 pl-10 pr-10 text-[13px] text-app-text outline-none transition-all placeholder:text-app-subtle focus:border-app-accent/40 focus:bg-app-panel/60 focus:ring-4 focus:ring-app-accent/15"
                    />
                    {host && (
                      <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-1.5 text-[11px] font-medium text-rose-500">
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence initial={false}>
                  {host && previewMeta && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="overflow-hidden">
                      <div className="flex items-center gap-3 rounded-xl border border-app-border/10 bg-app-hover/5 p-2.5">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr text-white ${previewMeta.gradient}`}>
                          <PreviewIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-app-text">{previewTitle}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-app-subtle">
                            <span className="font-mono">{host}</span>
                            <span className="rounded-full bg-app-accent/10 px-1.5 py-0.5 font-medium text-app-accent">
                              Detected: {previewMeta.label}
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="save-folder"
                      className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                      <FolderIcon className="h-3 w-3" /> Folder
                    </label>
                    <select
                      id="save-folder"
                      value={folderId}
                      onChange={(event) => setFolderId(event.target.value)}
                      className="w-full rounded-xl border border-app-border/10 bg-app-hover/5 px-3 py-2.5 text-[12.5px] text-app-text outline-none transition-all focus:border-app-accent/40 focus:ring-4 focus:ring-app-accent/15">
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="save-tags"
                      className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                      <Sparkles className="h-3 w-3" /> Tags
                    </label>
                    <input
                      id="save-tags"
                      type="text"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                      placeholder="api, design"
                      className="w-full rounded-xl border border-app-border/10 bg-app-hover/5 px-3 py-2.5 text-[12.5px] text-app-text outline-none transition-all placeholder:text-app-subtle focus:border-app-accent/40 focus:ring-4 focus:ring-app-accent/15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="save-note"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                    Note <span className="normal-case tracking-normal text-app-subtle">(optional)</span>
                  </label>
                  <textarea
                    id="save-note"
                    rows={2}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Why is this worth keeping?"
                    className="w-full resize-none rounded-xl border border-app-border/10 bg-app-hover/5 px-3 py-2.5 text-[12.5px] text-app-text outline-none transition-all placeholder:text-app-subtle focus:border-app-accent/40 focus:ring-4 focus:ring-app-accent/15"
                  />
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-app-border/10 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="flex items-center gap-1.5 text-[10px] text-app-subtle">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Reader copy + metadata included
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => phase === 'idle' && onClose()}
                    className="flex-1 rounded-xl px-4 py-2 text-[12px] font-semibold text-app-muted transition-colors hover:bg-app-hover/10 hover:text-app-text sm:flex-none">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={phase !== 'idle'}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-4 py-2 text-[12px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40 disabled:cursor-not-allowed disabled:opacity-90 sm:flex-none">
                    {phase === 'saving' && (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Archiving…
                      </>
                    )}
                    {phase === 'saved' && (
                      <>
                        <Check className="h-3.5 w-3.5" /> Saved
                      </>
                    )}
                    {phase === 'idle' && (
                      <>
                        <Link2 className="h-3.5 w-3.5" /> Archive page
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
