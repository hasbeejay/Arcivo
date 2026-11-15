import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Bookmark, Check, Sparkles } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

const promises = ['Reader-mode snapshots', 'AI summaries & tags', 'Chrome extension sync'];

export function ClosingCTA() {
  const reduced = useReducedMotion();

  return (
    <section className="relative px-5 pb-20 pt-6 sm:px-8 sm:pb-28">
      <Reveal>
        <div className="noise animate-gradient relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-berry-700 via-brand-berry-600 to-brand-coral-500 px-6 py-16 text-center shadow-[0_40px_120px_-30px_rgba(174,39,57,0.55)] sm:px-12 sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="bg-dots absolute inset-0 opacity-20" />
            <div className="animate-breathe absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-cream-300/25 blur-3xl" />
            <div className="animate-drift absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-brand-sage-300/25 blur-3xl" />
            <motion.div
              animate={reduced ? undefined : { y: [0, -14, 0], rotate: [0, 6, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-[8%] top-[22%] hidden rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl sm:block">
              <Bookmark className="h-6 w-6 text-white/90" />
            </motion.div>
            <motion.div
              animate={reduced ? undefined : { y: [0, 12, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute bottom-[20%] right-[9%] hidden rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl sm:block">
              <Sparkles className="h-6 w-6 text-white/90" />
            </motion.div>
          </div>

          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              <Sparkles className="h-3 w-3" /> Your archive is waiting
            </span>

            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Start keeping the internet
              <span className="font-display block italic text-white/95">worth remembering.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-balance text-sm leading-relaxed text-white/90 sm:text-base">
              One account connects your workspace and your browser. Save the first page in under a minute.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth?mode=signup"
                className="sheen group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-cream-50 px-6 py-3.5 text-sm font-bold text-brand-berry-700 shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:w-auto">
                Create your free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-brand-berry-900/25 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-brand-berry-900/40 sm:w-auto">
                I already have one
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-white/85">
              {promises.map((promise) => (
                <li key={promise} className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-brand-sage-200" />
                  {promise}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
