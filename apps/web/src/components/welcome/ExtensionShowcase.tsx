import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bookmark,
  Check,
  Cloud,
  Folder,
  Globe,
  Lock,
  MousePointerClick,
  Puzzle,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';
import { Reveal, SectionBadge } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';

const points = [
  { icon: MousePointerClick, title: 'One click from any tab', body: 'Save the page you are reading without breaking focus.' },
  { icon: Cloud, title: 'Same account, instantly synced', body: 'Saves land in the same workspace and folders as the web app.' },
  { icon: Sparkles, title: 'Metadata while you wait', body: 'Title, cover, tags and AI takeaways fill themselves in.' },
];

export function ExtensionShowcase() {
  return (
    <section id="extension" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/4 h-[380px] w-[380px] rounded-full bg-fuchsia-500/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[420px] rounded-full bg-indigo-500/15 blur-[120px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div className="min-w-0">
          <Reveal>
            <SectionBadge icon={<Puzzle className="h-3 w-3" />}>Companion extension</SectionBadge>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
              Save the page you&apos;re on.{' '}
              <span className="font-display text-gradient italic">Keep your flow.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-app-muted sm:text-[15px]">
              The Arcivo extension lives in your toolbar. Pick a folder, add a tag or two, and the page is archived to
              the same account you use in the workspace — reader copy included.
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {points.map((point, index) => (
              <Reveal key={point.title} delay={0.12 + index * 0.05}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-app-border/10 bg-app-panel/60 text-app-accent backdrop-blur-xl">
                    <point.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-app-text">{point.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-app-muted">{point.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.28}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-app-text px-5 py-3 text-sm font-semibold text-app-bg shadow-lg transition-transform hover:-translate-y-0.5">
                Sign in to sync
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-app-border/10 bg-app-panel/50 px-5 py-3 text-sm font-semibold text-app-text backdrop-blur-xl transition-colors hover:bg-app-hover/10">
                Create a free account
              </Link>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-app-subtle">
              <Check className="h-3 w-3 text-emerald-500" />
              Chrome · Manifest V3 · Uses your existing Arcivo login
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={34} className="min-w-0">
          <div className="relative mx-auto w-full max-w-[540px] [perspective:1400px]">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/20 via-transparent to-fuchsia-500/20 blur-2xl" />

            <TiltCard
              className="rounded-2xl border border-app-border/10 bg-app-panel/80 shadow-[0_40px_100px_-40px_rgba(30,27,75,0.65)] backdrop-blur-2xl"
              intensity={5}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-app-border/10 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <div className="mx-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-app-border/10 bg-app-hover/5 px-2.5 py-1">
                  <Lock className="h-2.5 w-2.5 shrink-0 text-emerald-500" />
                  <span className="min-w-0 truncate font-mono text-[9px] text-app-muted">example.dev/article/building-better-apis</span>
                  <Star className="ml-auto h-2.5 w-2.5 shrink-0 text-app-subtle" />
                </div>
                <span className="relative flex h-6 w-6 items-center justify-center rounded-md bg-app-accent/10 text-app-accent">
                  <Puzzle className="h-3 w-3" />
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
              </div>

              {/* Page content */}
              <div className="relative space-y-3 rounded-b-2xl bg-app-bg/40 p-4 sm:p-5">
                <div className="h-24 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 p-3 sm:h-28">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-2.5 w-2.5 text-white/80" />
                    <span className="font-mono text-[8px] text-white/80">example.dev</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="block h-2.5 w-[70%] rounded-full bg-app-border/15" />
                  <span className="block h-1.5 w-full rounded-full bg-app-border/10" />
                  <span className="block h-1.5 w-[92%] rounded-full bg-app-border/10" />
                  <span className="block h-1.5 w-[80%] rounded-full bg-app-border/10" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-12 rounded-lg border border-app-border/10 bg-app-card/50" />
                  <div className="h-12 rounded-lg border border-app-border/10 bg-app-card/50" />
                </div>
                <div className="pb-16 sm:pb-20" />
              </div>

              {/* Extension popup */}
              <div className="absolute -bottom-4 right-3 w-[240px] rounded-xl border border-white/15 bg-slate-900 p-3 text-slate-100 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.9)] sm:right-5 sm:w-[255px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white">
                      <Bookmark className="h-3 w-3" />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold tracking-[0.18em]">ARCIVO</p>
                      <p className="text-[7px] text-slate-400">haseeb@arcivo.app</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[7px] text-emerald-400">
                    Synced
                  </span>
                </div>

                <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2">
                  <p className="line-clamp-1 text-[9px] font-semibold text-slate-200">Building Better APIs</p>
                  <p className="mt-0.5 truncate font-mono text-[7px] text-slate-500">
                    example.dev/article/building-better-apis
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[8px] text-slate-300">
                  <Folder className="h-2.5 w-2.5 text-indigo-400" /> Research
                  <span className="ml-auto text-slate-500">▾</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[8px] text-slate-400">
                  <Tag className="h-2.5 w-2.5 text-indigo-400" /> api, architecture
                </div>

                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-[9px] font-semibold text-white shadow-lg shadow-indigo-600/30">
                  <Bookmark className="h-3 w-3" /> Archive This Page
                </div>
              </div>
            </TiltCard>

            {/* Saved toast */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-2 -left-5 hidden items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-3 py-2 shadow-lg backdrop-blur-xl sm:flex">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-3 w-3" />
              </span>
              <div>
                <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-300">Saved to Research</p>
                <p className="text-[7px] text-emerald-600/70 dark:text-emerald-300/70">Reader copy archived</p>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
