import { motion, useReducedMotion } from 'motion/react';
import {
  Bookmark,
  Check,
  Cloud,
  FileText,
  Folder,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';

const bullets = [
  { icon: Mail, title: 'Email or Google', body: 'One identity, whichever way you prefer to sign in.' },
  { icon: Cloud, title: 'Extension included', body: 'The toolbar popup signs into this same account.' },
  { icon: ShieldCheck, title: 'Private by default', body: 'Your archive, notes and snapshots belong to you.' },
];

export function AuthShowcase() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:block">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-app-accent/20 bg-app-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-app-accent">
        <Sparkles className="h-3 w-3" />
        Your archive, everywhere
      </span>

      <h2 className="mt-5 max-w-md text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-app-text xl:text-[2.9rem]">
        One account.
        <span className="font-display text-gradient mt-1 block italic">Everything remembered.</span>
      </h2>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-app-muted">
        Sign in to open your workspace, and the Chrome extension picks up the same session automatically.
      </p>

      <div className="relative mt-9 h-[340px] w-full max-w-[440px] [perspective:1200px]">
        <div className="animate-breathe absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-brand-sage-400/40 via-brand-cream-400/30 to-brand-coral-400/30 blur-3xl" />
        <div className="animate-spin-slow absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-app-accent/20" />

        <TiltCard className="h-full" wrapperClassName="h-full" intensity={5}>
          {/* Main archive card */}
          <div className="absolute left-0 top-4 w-[76%] overflow-hidden rounded-2xl border border-app-border/10 bg-app-panel/90 shadow-[0_30px_70px_-25px_rgba(42,54,59,0.5)] backdrop-blur-2xl [transform:translateZ(28px)]">
            <div className="relative h-24 bg-gradient-to-tr from-brand-berry-600 via-brand-berry-500 to-brand-coral-500 p-3">
              <span className="rounded bg-black/30 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white backdrop-blur">
                Reader copy
              </span>
              <Star className="absolute right-3 top-3 h-4 w-4 fill-brand-cream-300 text-brand-cream-300" />
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-app-text">Building Better APIs</p>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-app-subtle">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-berry-500" />
                example.dev · 6 min read
              </div>
              <div className="mt-3 space-y-1.5">
                <span className="block h-1.5 w-full rounded-full bg-app-border/10" />
                <span className="block h-1.5 w-[86%] rounded-full bg-app-border/10" />
                <span className="block h-1.5 w-[62%] rounded-full bg-app-border/10" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['api', 'architecture'].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-app-accent/10 px-2 py-0.5 text-[9px] font-medium text-app-accent">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Synced pill */}
          <motion.div
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ z: 90 }}
            className="absolute right-0 top-0 flex items-center gap-2 rounded-xl border border-brand-sage-400/30 bg-brand-sage-400/15 px-3 py-2 shadow-lg backdrop-blur-xl">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-sage-500 text-white">
              <Check className="h-3 w-3" />
            </span>
            <div>
              <p className="text-[9px] font-semibold text-brand-sage-700 dark:text-brand-sage-200">Session synced</p>
              <p className="text-[7px] text-brand-sage-700/70 dark:text-brand-sage-200/70">Web · Extension</p>
            </div>
          </motion.div>

          {/* Note card */}
          <motion.div
            animate={reduced ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            style={{ z: 70 }}
            className="absolute -right-1 bottom-0 w-[52%] rounded-xl border border-brand-caramel-400/30 bg-app-panel/95 p-3 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-brand-caramel-600 dark:text-brand-cream-300">
              <FileText className="h-3 w-3" />
              Demo note
            </div>
            <p className="mt-1.5 text-[9px] leading-relaxed text-app-muted">
              Compare with the REST chapter, slide 14.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[8px] text-app-subtle">
              <span className="h-1 w-1 rounded-full bg-brand-sage-500" />
              linked to resource
            </div>
          </motion.div>

          {/* Folder chip */}
          <motion.div
            animate={reduced ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
            style={{ z: 100 }}
            className="absolute bottom-4 left-6 flex items-center gap-1.5 rounded-full border border-app-border/10 bg-app-panel/90 px-3 py-1.5 text-[9px] font-medium text-app-muted shadow-lg backdrop-blur-xl">
            <Folder className="h-3 w-3 text-app-accent" />
            Research
          </motion.div>

          {/* Bookmark chip */}
          <motion.div
            animate={reduced ? undefined : { y: [0, -9, 0] }}
            transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            style={{ z: 80 }}
            className="absolute bottom-16 right-10 flex h-9 w-9 items-center justify-center rounded-xl border border-app-border/10 bg-app-panel/90 text-app-accent shadow-lg backdrop-blur-xl">
            <Bookmark className="h-4 w-4" />
          </motion.div>
        </TiltCard>
      </div>

      <ul className="mt-8 space-y-4">
        {bullets.map((bullet, index) => (
          <motion.li
            key={bullet.title}
            initial={reduced ? false : { opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-app-border/10 bg-app-panel/60 text-app-accent backdrop-blur-xl">
              <bullet.icon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-app-text">{bullet.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-app-muted">{bullet.body}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
