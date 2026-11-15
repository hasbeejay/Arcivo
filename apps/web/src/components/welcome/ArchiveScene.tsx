import { useCallback, useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import {
  Bookmark,
  Check,
  Clock,
  FileText,
  Folder,
  MoreHorizontal,
  Search,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';

export function ArchiveScene() {
  const reduced = useReducedMotion();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const rotateX = useMotionValue(-4);
  const rotateY = useMotionValue(7);
  const springX = useSpring(rotateX, { stiffness: 90, damping: 18, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 90, damping: 18, mass: 0.6 });

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(7 + nx * 12);
      rotateX.set(-4 - ny * 10);
    },
    [reduced, rotateX, rotateY],
  );

  const handlePointerLeave = useCallback(() => {
    rotateX.set(-4);
    rotateY.set(7);
  }, [rotateX, rotateY]);

  const float = (distance: number, duration: number, delay = 0) =>
    reduced
      ? undefined
      : {
          y: [0, -distance, 0],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay },
        };

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto w-full max-w-[560px] [perspective:1400px]"
      aria-hidden="true">
      <div className="relative aspect-square [transform-style:preserve-3d]">
        {/* Aura */}
        <div className="animate-breathe absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-brand-sage-400/40 via-brand-cream-400/30 to-brand-coral-400/25 blur-3xl" />
        <div className="absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-brand-mist-400/30 blur-2xl" />
        <div className="animate-drift absolute bottom-[14%] right-[8%] h-32 w-32 rounded-full bg-brand-berry-400/20 blur-3xl" />

        {/* Orbit rings */}
        <div className="animate-spin-slow absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-app-accent/25" />
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-app-border/10" />

        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={{ rotateX: springX, rotateY: springY }}>

          {/* Main workspace window */}
          <motion.div
            animate={float(8, 9, 0.1)}
            style={{ z: 42 }}
            className="absolute inset-x-[7%] top-[16%] rounded-2xl border border-white/15 bg-app-panel/85 p-0 shadow-[0_40px_90px_-30px_rgba(42,54,59,0.55)] backdrop-blur-2xl">
            <div className="flex items-center gap-2 border-b border-app-border/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-rose-400/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md border border-app-border/10 bg-app-hover/5 px-2 py-1">
                <Search className="h-2.5 w-2.5 text-app-subtle" />
                <span className="text-[8px] text-app-subtle">Search your archive…</span>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-300">
                Synced
              </span>
            </div>

            <div className="flex">
              <div className="hidden w-[27%] space-y-1.5 border-r border-app-border/10 p-2.5 sm:block">
                <div className="flex items-center gap-1.5 rounded-md bg-app-accent/10 px-1.5 py-1">
                  <Folder className="h-2.5 w-2.5 text-app-accent" />
                  <span className="text-[8px] font-medium text-app-accent">Research</span>
                </div>
                {[
                  { label: 'Web Dev', color: '#7B9F86' },
                  { label: 'University', color: '#E84A5F' },
                  { label: 'Inspiration', color: '#B57A4C' },
                  { label: 'Notes', color: '#6C999C' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 px-1.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[8px] text-app-muted">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 space-y-2 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-app-subtle">
                    Recently archived
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-brand-berry-600 px-1.5 py-0.5 text-[7px] font-semibold text-white">
                    <Bookmark className="h-2 w-2" /> Save
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="overflow-hidden rounded-lg border border-app-border/10 bg-app-card/70">
                    <div className="h-10 bg-gradient-to-tr from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 p-1.5">
                      <span className="rounded bg-black/30 px-1 py-0.5 text-[6px] font-bold uppercase tracking-wide text-white backdrop-blur">
                        Article
                      </span>
                    </div>
                    <div className="space-y-1 p-1.5">
                      <p className="line-clamp-1 text-[8px] font-semibold text-app-text">Building Better APIs</p>
                      <p className="text-[7px] text-app-subtle">example.dev</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-app-border/10 bg-app-card/70">
                    <div className="flex h-10 items-center justify-center bg-gradient-to-tr from-brand-berry-700 via-brand-coral-600 to-brand-caramel-500">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90">
                        <span className="ml-0.5 h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-brand-berry-600" />
                      </span>
                    </div>
                    <div className="space-y-1 p-1.5">
                      <p className="line-clamp-1 text-[8px] font-semibold text-app-text">.NET 10 Full Course</p>
                      <p className="text-[7px] text-app-subtle">youtube.com</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-app-border/10 bg-app-hover/5 p-1.5">
                  <Sparkles className="h-2.5 w-2.5 shrink-0 text-app-accent" />
                  <span className="line-clamp-1 text-[7px] text-app-muted">
                    AI: clean boundaries, predictable responses…
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Saved toast */}
          <motion.div
            animate={float(10, 6, 0.4)}
            style={{ z: 120 }}
            className="absolute right-[4%] top-[8%] flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1.5 shadow-lg backdrop-blur-xl">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-2.5 w-2.5" />
            </span>
            <div>
              <p className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-300">Saved to Research</p>
              <p className="text-[6px] text-emerald-600/70 dark:text-emerald-300/70">Reader copy kept</p>
            </div>
          </motion.div>

          {/* Article preview card */}
          <motion.div
            animate={float(13, 7.5, 0.2)}
            style={{ z: 95 }}
            className="absolute -left-[2%] bottom-[13%] w-[46%] max-w-[210px] overflow-hidden rounded-xl border border-white/15 bg-app-panel/90 shadow-[0_30px_60px_-25px_rgba(42,54,59,0.6)] backdrop-blur-xl">
            <div className="relative h-16 bg-gradient-to-tr from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 p-2">
              <span className="rounded bg-black/30 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider text-white backdrop-blur">
                Reader copy
              </span>
              <Star className="absolute right-2 top-2 h-3 w-3 fill-brand-cream-300 text-brand-cream-300" />
            </div>
            <div className="space-y-1 p-2.5">
              <p className="line-clamp-1 text-[10px] font-semibold text-app-text">Building Better APIs</p>
              <div className="flex items-center gap-1 text-[7px] text-app-subtle">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-berry-500" />
                example.dev
              </div>
              <div className="space-y-1 pt-1">
                <span className="block h-1 w-full rounded-full bg-app-border/15" />
                <span className="block h-1 w-[86%] rounded-full bg-app-border/15" />
                <span className="block h-1 w-[64%] rounded-full bg-app-border/15" />
              </div>
              <div className="flex items-center gap-1 pt-1 text-[7px] text-app-accent">
                <Clock className="h-2 w-2" /> 6 min read
              </div>
            </div>
          </motion.div>

          {/* AI takeaways card */}
          <motion.div
            animate={float(11, 6.8, 0.9)}
            style={{ z: 110 }}
            className="absolute -right-[1%] top-[40%] w-[42%] max-w-[190px] rounded-xl border border-white/15 bg-app-panel/95 p-2.5 shadow-[0_30px_60px_-25px_rgba(42,54,59,0.6)] backdrop-blur-xl">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-tr from-brand-berry-600 to-brand-coral-500 text-white">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
              <span className="text-[8px] font-semibold text-app-text">AI takeaways</span>
            </div>
            <div className="space-y-1.5">
              {[92, 76, 84].map((width, index) => (
                <div key={width} className="flex items-start gap-1">
                  <span className="mt-[2px] text-[6px] font-bold text-app-accent">{index + 1}</span>
                  <span
                    className="block h-1 rounded-full bg-app-border/20"
                    style={{ width: `${width}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {['api', 'design'].map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 rounded-full bg-app-accent/10 px-1.5 py-0.5 text-[6px] font-medium text-app-accent">
                  <Tag className="h-1.5 w-1.5" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Extension popup */}
          <motion.div
            animate={float(14, 7, 0.6)}
            style={{ z: 140 }}
            className="absolute -right-[4%] bottom-[3%] w-[48%] max-w-[215px] rounded-xl border border-white/10 bg-brand-ink-900 p-2.5 text-brand-ink-100 shadow-[0_30px_70px_-20px_rgba(20,27,30,0.9)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-brand-berry-600 text-white">
                  <Bookmark className="h-2.5 w-2.5" />
                </span>
                <span className="text-[8px] font-bold tracking-widest">ARCIVO</span>
              </div>
              <span className="rounded-full border border-brand-sage-400/25 bg-brand-sage-400/10 px-1.5 py-0.5 text-[6px] font-mono text-brand-sage-300">
                Synced
              </span>
            </div>
            <div className="mt-1.5 rounded-lg border border-white/10 bg-white/5 p-1.5">
              <p className="line-clamp-1 text-[7px] font-semibold text-brand-ink-100">Building Better APIs</p>
              <p className="line-clamp-1 font-mono text-[6px] text-brand-ink-400">example.dev/article/apis</p>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[6px] text-brand-ink-300">
              <Folder className="h-2 w-2 text-brand-coral-400" /> Research
              <span className="ml-auto rounded bg-white/10 px-1 py-0.5">Archive</span>
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-1 rounded-md bg-brand-berry-600 py-1 text-[7px] font-semibold text-white">
              <Bookmark className="h-2 w-2" /> Archive This Page
            </div>
          </motion.div>

          {/* Floating chips */}
          <motion.div
            animate={float(8, 5.5, 1.2)}
            style={{ z: 150 }}
            className="absolute left-[2%] top-[6%] flex items-center gap-1 rounded-full border border-app-border/10 bg-app-panel/80 px-2 py-1 text-[7px] font-medium text-app-muted shadow-lg backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-berry-400" />
            University
          </motion.div>
          <motion.div
            animate={float(9, 6.4, 1.6)}
            style={{ z: 130 }}
            className="absolute left-[4%] top-[46%] flex items-center gap-1 rounded-full border border-app-border/10 bg-app-panel/80 px-2 py-1 text-[7px] font-medium text-app-muted shadow-lg backdrop-blur-xl">
            <FileText className="h-2 w-2 text-emerald-500" />
            Notes linked
          </motion.div>
          <motion.div
            animate={float(7, 7.2, 0.3)}
            style={{ z: 100 }}
            className="absolute bottom-[2%] left-[36%] flex items-center gap-1 rounded-full border border-app-border/10 bg-app-panel/80 px-2 py-1 text-[7px] font-medium text-app-muted shadow-lg backdrop-blur-xl">
            <MoreHorizontal className="h-2 w-2" />
            24 saved this week
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
