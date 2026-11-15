import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import {
  Bookmark,
  Check,
  Clock,
  FileText,
  Folder,
  Globe,
  Highlighter,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { SectionBadge } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';

const steps = [
  {
    tag: 'Capture',
    title: 'Save anything in one click',
    body: 'Paste a link or tap the extension. Arcivo pulls the title, cover, author, favicon and reading time — no manual filing required.',
    icon: Bookmark,
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    tag: 'Preserve',
    title: 'Keep a copy that outlives the link',
    body: 'Reader mode extracts the clean article text and stores it beside the URL. When a page changes or disappears, your version still opens.',
    icon: ShieldCheck,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    tag: 'Recall',
    title: 'Find it again in seconds',
    body: 'Folders, tags, notes and full-text search work together. Search the way you think — Arcivo searches the saved copy, not just the title.',
    icon: Search,
    accent: 'from-fuchsia-500 to-pink-500',
  },
];

function CapturePanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-app-border/10 bg-app-hover/5 px-3 py-2">
        <Globe className="h-3.5 w-3.5 shrink-0 text-app-subtle" />
        <span className="min-w-0 truncate font-mono text-[11px] text-app-muted">
          example.dev/article/building-better-apis
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white">
          <Sparkles className="h-2.5 w-2.5" /> Fetch
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-app-border/10 bg-app-card/60">
        <div className="relative h-24 bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 p-3">
          <span className="rounded bg-black/30 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white backdrop-blur">
            Article
          </span>
          <Highlighter className="absolute bottom-3 right-3 h-4 w-4 text-white/70" />
        </div>
        <div className="space-y-2 p-3.5">
          <h4 className="text-sm font-semibold text-app-text">Building Better APIs</h4>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-app-muted">
            A practical guide to designing reliable, maintainable APIs with clear boundaries and predictable responses.
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {['example.dev', '6 min read', 'article'].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-app-border/10 bg-app-hover/5 px-2 py-0.5 text-[9px] text-app-subtle">
                {chip}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="flex items-center gap-1 rounded-full bg-app-accent/10 px-2 py-0.5 text-[9px] font-medium text-app-accent">
              <Tag className="h-2.5 w-2.5" /> api
            </span>
            <span className="flex items-center gap-1 rounded-full bg-app-accent/10 px-2 py-0.5 text-[9px] font-medium text-app-accent">
              <Tag className="h-2.5 w-2.5" /> design
            </span>
            <span className="ml-auto flex items-center gap-1 rounded-lg bg-app-text px-2.5 py-1 text-[10px] font-semibold text-app-bg">
              <Check className="h-2.5 w-2.5" /> Save
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReaderPanel() {
  return (
    <div className="relative rounded-xl border border-app-border/10 bg-app-card/70 p-4">
      <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 backdrop-blur dark:text-emerald-300">
        <ShieldCheck className="h-2.5 w-2.5" /> Snapshot saved
      </span>
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-app-subtle">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        example.dev · reader copy
      </div>
      <h4 className="mt-2 text-base font-bold leading-snug text-app-text">Building Better APIs</h4>
      <div className="mt-1 flex items-center gap-3 text-[9px] text-app-subtle">
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" /> 6 min
        </span>
        <span>Saved Nov 12</span>
      </div>
      <div className="mt-3 space-y-2 text-[10px] leading-relaxed text-app-muted">
        <p>
          Good APIs are predictable. A caller should be able to guess the shape of a response before reading the
          documentation, because the boundaries were designed, not discovered.
        </p>
        <p className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-app-text">
          Keep resources small, name them with nouns, and let verbs belong to HTTP.
        </p>
        <div className="space-y-1.5 pt-1">
          <span className="block h-1.5 w-full rounded-full bg-app-border/10" />
          <span className="block h-1.5 w-[92%] rounded-full bg-app-border/10" />
          <span className="block h-1.5 w-[74%] rounded-full bg-app-border/10" />
        </div>
      </div>
    </div>
  );
}

function RecallPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-app-accent/25 bg-app-accent/5 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-app-accent" />
        <span className="text-[11px] text-app-text">predictable endpoints</span>
        <span className="ml-auto rounded bg-app-accent/15 px-1.5 py-0.5 text-[9px] font-medium text-app-accent">
          full-text
        </span>
      </div>

      {[
        { title: 'Building Better APIs', meta: 'Research · article · saved Nov 12', icon: FileText },
        { title: '.NET 10 Full Course', meta: 'Web Development · video · 4h 12m', icon: FileText },
        { title: 'API design notes', meta: 'Notes · linked to 3 resources', icon: FileText },
      ].map((row) => (
        <div
          key={row.title}
          className="flex items-center gap-2.5 rounded-xl border border-app-border/10 bg-app-card/60 px-3 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-app-accent/10 text-app-accent">
            <row.icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-app-text">{row.title}</p>
            <p className="truncate text-[9px] text-app-subtle">{row.meta}</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-medium text-emerald-600 dark:text-emerald-300">
            opens instantly
          </span>
        </div>
      ))}

      <div className="flex items-center gap-1.5 pt-1">
        {['Research', 'Web Dev', 'University'].map((folder) => (
          <span
            key={folder}
            className="flex items-center gap-1 rounded-full border border-app-border/10 bg-app-hover/5 px-2 py-0.5 text-[9px] text-app-muted">
            <Folder className="h-2.5 w-2.5 text-app-accent" />
            {folder}
          </span>
        ))}
      </div>
    </div>
  );
}

const panels = [CapturePanel, ReaderPanel, RecallPanel];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;
    setActive((current) => (current === next ? current : next));
  });

  const jumpTo = (index: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (travel * (index + 0.5)) / steps.length, behavior: 'smooth' });
  };

  const step = steps[active];
  const Panel = panels[active];

  return (
    <section id="how" ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="min-w-0">
            <SectionBadge>The Arcivo loop</SectionBadge>
            <h2 className="mt-5 max-w-md text-balance text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl lg:text-[2.9rem] lg:leading-[1.05]">
              From open tab to <span className="font-display text-gradient italic">permanent memory.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-app-muted">
              Three quiet steps happen every time you save. Nothing to organize by hand, nothing to remember
              later.
            </p>

            <div className="mt-7 hidden space-y-2 lg:block">
              {steps.map((entry, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={entry.tag}
                    onClick={() => jumpTo(index)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-app-accent/30 bg-app-accent/5'
                        : 'border-transparent hover:border-app-border/10 hover:bg-app-hover/5'
                    }`}>
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-white transition-all ${entry.accent} ${
                        isActive ? 'shadow-lg shadow-indigo-600/25' : 'opacity-40 grayscale'
                      }`}>
                      <entry.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-2">
                        <span className={`text-[10px] font-mono ${isActive ? 'text-app-accent' : 'text-app-subtle'}`}>
                          0{index + 1}
                        </span>
                        <span className={`text-[13px] font-semibold ${isActive ? 'text-app-text' : 'text-app-muted'}`}>
                          {entry.title}
                        </span>
                      </span>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1 block overflow-hidden text-[11px] leading-relaxed text-app-muted">
                            {entry.body}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile step indicator */}
            <div className="mt-5 flex items-center gap-2 lg:hidden">
              {steps.map((entry, index) => (
                <button
                  key={entry.tag}
                  onClick={() => jumpTo(index)}
                  aria-label={entry.title}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index === active ? 'bg-app-accent' : 'bg-app-border/15'
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 lg:hidden">
              <p className="text-sm font-semibold text-app-text">
                <span className="mr-2 font-mono text-[10px] text-app-accent">0{active + 1}</span>
                {step.title}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-app-muted">{step.body}</p>
            </div>
          </div>

          <div className="relative min-w-0 [perspective:1200px]">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-indigo-500/15 via-transparent to-fuchsia-500/15 blur-2xl" />
            <TiltCard className="rounded-2xl border border-app-border/10 bg-app-panel/70 p-3 shadow-2xl backdrop-blur-2xl sm:p-4" intensity={4}>
              <div className="mb-3 flex items-center gap-2 border-b border-app-border/10 pb-2.5">
                <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-app-subtle">arcivo · {step.tag}</span>
                <span className="ml-auto font-mono text-[9px] text-app-subtle">0{active + 1} / 03</span>
              </div>

              <div className="relative min-h-[280px] [perspective:900px] sm:min-h-[320px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, rotateX: 7 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, rotateX: -7 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="origin-top">
                    <Panel />
                  </motion.div>
                </AnimatePresence>
              </div>
            </TiltCard>

            <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-app-subtle">
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${active >= 0 ? 'bg-emerald-400' : 'bg-app-border/20'}`} />
                Capture
                <span className="mx-1 h-px w-4 bg-app-border/15" />
                <span className={`h-1.5 w-1.5 rounded-full ${active >= 1 ? 'bg-emerald-400' : 'bg-app-border/20'}`} />
                Preserve
                <span className="mx-1 h-px w-4 bg-app-border/15" />
                <span className={`h-1.5 w-1.5 rounded-full ${active >= 2 ? 'bg-emerald-400' : 'bg-app-border/20'}`} />
                Recall
              </span>
              <span className="hidden sm:inline">Scroll to advance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
