import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, MousePointerClick, Sparkles, Zap } from 'lucide-react';
import { ArchiveScene } from './ArchiveScene';
import { EASE_OUT } from '../ui/Reveal';

const ease = EASE_OUT;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const meta = [
  'Free to start',
  'Chrome extension included',
  'No credit card',
];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-fade-b absolute inset-x-0 top-0 h-[720px] opacity-60" />
        <div className="animate-aurora absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-indigo-500/25 blur-[110px]" />
        <div className="animate-aurora absolute -right-24 top-32 h-[380px] w-[380px] rounded-full bg-fuchsia-500/20 blur-[110px] [animation-delay:-6s]" />
        <div className="absolute left-1/2 top-0 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:pb-24">
        <motion.div variants={container} initial={reduced ? false : 'hidden'} animate="show">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-app-border/10 bg-app-panel/60 py-1 pl-1 pr-3 text-[11px] font-medium text-app-muted backdrop-blur-xl">
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <Sparkles className="h-2.5 w-2.5" /> New
              </span>
              Reader snapshots that outlive the link
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-[3.1rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-app-text sm:text-6xl lg:text-[4.4rem]">
            The internet
            <br />
            forgets.
            <br />
            <span className="font-display text-gradient pr-1 italic tracking-[-0.02em]">Arcivo doesn&apos;t.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-app-muted sm:text-base">
            Save articles, videos, papers and passing ideas once. Arcivo keeps a readable copy, tags the details,
            and gives you a workspace that actually remembers.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth?mode=signup"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition-transform hover:-translate-y-0.5">
              <span className="relative z-10">Start archiving — it&apos;s free</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.25)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 transition-opacity duration-300 group-hover:animate-shimmer group-hover:opacity-100" />
            </Link>

            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-app-border/10 bg-app-panel/50 px-6 py-3 text-sm font-semibold text-app-text backdrop-blur-xl transition-colors hover:bg-app-hover/10">
              <MousePointerClick className="h-4 w-4 text-app-accent" />
              See how it works
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-app-subtle">
            {meta.map((text) => (
              <li key={text} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-500" />
                {text}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease }}>
          <ArchiveScene />
        </motion.div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 pb-6 sm:px-8">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-app-subtle">
          <Zap className="h-3 w-3 text-app-accent" />
          Scroll to explore
        </span>
        <span className="hidden text-[10px] uppercase tracking-[0.28em] text-app-subtle sm:block">
          Built for people who read, watch &amp; collect
        </span>
      </div>
    </section>
  );
}
