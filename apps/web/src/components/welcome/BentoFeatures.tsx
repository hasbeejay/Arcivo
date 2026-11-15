import type { ReactNode } from 'react';
import {
  BookOpen,
  FileText,
  FolderTree,
  Github,
  Headphones,
  Search,
  Sparkles,
  Tag,
  Youtube,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Reveal, SectionBadge } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';

function CardShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <TiltCard
      className={`group relative h-full overflow-hidden rounded-3xl border border-app-border/10 bg-app-card/50 p-6 backdrop-blur-xl transition-colors duration-300 hover:border-app-accent/25 ${className}`}
      intensity={4}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-tr from-brand-berry-500/20 via-brand-coral-400/15 to-brand-cream-400/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      {children}
    </TiltCard>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl border border-app-border/10 bg-app-panel/70 text-app-accent shadow-sm">
      {children}
    </span>
  );
}

export function BentoFeatures() {
  const reduced = useReducedMotion();
  const cardProps = {
    initial: reduced ? false : { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-drift-slow absolute left-1/2 top-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-brand-sage-400/20 blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionBadge>Everything inside</SectionBadge>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
              A workspace for the things you <span className="font-display text-gradient italic">actually keep.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-balance text-sm leading-relaxed text-app-muted sm:text-base">
              Not another bookmark graveyard. Every save is cleaned, described, summarized and linked to the rest of
              your library.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div {...cardProps} className="md:col-span-2">
            <CardShell>
              <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <IconTile>
                    <BookOpen className="h-5 w-5" />
                  </IconTile>
                  <h3 className="text-lg font-bold tracking-tight text-app-text">Reader snapshots</h3>
                  <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-app-muted">
                    Arcivo stores the readable article, not just the address. Highlight it, search it, and open it
                    years after the original link dies.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-app-subtle">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-medium text-emerald-600 dark:text-emerald-300">
                      Link-rot proof
                    </span>
                    <span className="rounded-full bg-app-hover/5 px-2 py-1">Offline ready</span>
                  </div>
                </div>

                <div className="w-full shrink-0 sm:w-52">
                  <div className="rounded-2xl border border-app-border/10 bg-app-panel/80 p-3 shadow-lg">
                    <div className="flex items-center justify-between text-[8px] text-app-subtle">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        example.dev
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> kept
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-app-text">Building Better APIs</p>
                    <div className="mt-2 space-y-1.5">
                      <span className="block h-1 w-full rounded-full bg-app-border/10" />
                      <span className="block h-1 w-[88%] rounded-full bg-amber-400/40" />
                      <span className="block h-1 w-[70%] rounded-full bg-app-border/10" />
                      <span className="block h-1 w-[80%] rounded-full bg-app-border/10" />
                    </div>
                    <p className="mt-2 text-[8px] text-app-subtle">6 min read · saved Nov 12</p>
                  </div>
                </div>
              </div>
            </CardShell>
          </motion.div>

          <motion.div {...cardProps} transition={{ ...cardProps.transition, delay: 0.06 }} className="md:col-span-2">
            <CardShell>
              <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <IconTile>
                    <Sparkles className="h-5 w-5" />
                  </IconTile>
                  <h3 className="text-lg font-bold tracking-tight text-app-text">AI takeaways &amp; smart tags</h3>
                  <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-app-muted">
                    Three bullets and a handful of tags, generated from the saved copy. Skim before you commit to a
                    forty-minute read.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['api', 'architecture', 'design'].map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-app-accent/10 px-2 py-1 text-[10px] font-medium text-app-accent">
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full shrink-0 sm:w-52">
                  <div className="rounded-2xl border border-app-border/10 bg-app-panel/80 p-3 shadow-lg">
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-app-text">
                      <span className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white">
                        <Sparkles className="h-2.5 w-2.5" />
                      </span>
                      AI takeaways
                    </div>
                    <div className="mt-2 space-y-2">
                      {['Name resources as nouns', 'Let HTTP carry the verbs', 'Design boundaries, not surprises'].map(
                        (line, index) => (
                          <p key={line} className="flex gap-1.5 text-[9px] leading-snug text-app-muted">
                            <span className="font-bold text-app-accent">{index + 1}</span>
                            {line}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardShell>
          </motion.div>

          <motion.div {...cardProps} transition={{ ...cardProps.transition, delay: 0.1 }}>
            <CardShell className="p-5">
              <IconTile>
                <Youtube className="h-5 w-5" />
              </IconTile>
              <h3 className="text-sm font-bold tracking-tight text-app-text">Metadata adapters</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-app-muted">
                Purpose-built readers for the places you collect from.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  { icon: Youtube, label: 'YouTube' },
                  { icon: BookOpen, label: 'Books' },
                  { icon: Github, label: 'GitHub' },
                  { icon: Headphones, label: 'Audio' },
                ].map((source) => (
                  <span
                    key={source.label}
                    className="flex items-center gap-1 rounded-full border border-app-border/10 bg-app-hover/5 px-2 py-1 text-[9px] text-app-muted">
                    <source.icon className="h-2.5 w-2.5 text-app-accent" />
                    {source.label}
                  </span>
                ))}
              </div>
            </CardShell>
          </motion.div>

          <motion.div {...cardProps} transition={{ ...cardProps.transition, delay: 0.14 }}>
            <CardShell className="p-5">
              <IconTile>
                <FileText className="h-5 w-5" />
              </IconTile>
              <h3 className="text-sm font-bold tracking-tight text-app-text">Notes with context</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-app-muted">
                Markdown notes live beside the resource they belong to.
              </p>
              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-2.5">
                <p className="text-[9px] font-semibold text-amber-600 dark:text-amber-300">Use in the final demo</p>
                <p className="mt-1 text-[9px] leading-relaxed text-app-muted">
                  Compare with the REST chapter, slide 14.
                </p>
              </div>
            </CardShell>
          </motion.div>

          <motion.div {...cardProps} transition={{ ...cardProps.transition, delay: 0.18 }}>
            <CardShell className="p-5">
              <IconTile>
                <FolderTree className="h-5 w-5" />
              </IconTile>
              <h3 className="text-sm font-bold tracking-tight text-app-text">Folders &amp; tags</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-app-muted">
                Structure that grows with your library, without the upkeep.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  { label: 'Research', color: '#7B9F86' },
                  { label: 'University', color: '#E84A5F' },
                  { label: 'Web Dev', color: '#6C999C' },
                  { label: 'Inspiration', color: '#B57A4C' },
                ].map((folder) => (
                  <span
                    key={folder.label}
                    className="flex items-center gap-1 rounded-full border border-app-border/10 bg-app-hover/5 px-2 py-1 text-[9px] text-app-muted">
                    <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: folder.color }} />
                    {folder.label}
                  </span>
                ))}
              </div>
            </CardShell>
          </motion.div>

          <motion.div {...cardProps} transition={{ ...cardProps.transition, delay: 0.22 }}>
            <CardShell className="p-5">
              <IconTile>
                <Search className="h-5 w-5" />
              </IconTile>
              <h3 className="text-sm font-bold tracking-tight text-app-text">Search everything</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-app-muted">
                Titles, descriptions, notes and complete reader copies.
              </p>
              <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-app-border/10 bg-app-hover/5 px-2.5 py-2">
                <Search className="h-3 w-3 text-app-subtle" />
                <span className="text-[9px] text-app-muted">predictable endpoints</span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-app-accent/60" />
              </div>
            </CardShell>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
