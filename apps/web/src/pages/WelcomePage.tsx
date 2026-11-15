import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import {
  BookOpen,
  Code2,
  FileText,
  Github,
  GraduationCap,
  Headphones,
  MessageCircle,
  Youtube,
} from 'lucide-react';
import { WelcomeNav } from '../components/welcome/WelcomeNav';
import { Hero } from '../components/welcome/Hero';
import { HowItWorks } from '../components/welcome/HowItWorks';
import { BentoFeatures } from '../components/welcome/BentoFeatures';
import { ExtensionShowcase } from '../components/welcome/ExtensionShowcase';
import { ClosingCTA } from '../components/welcome/ClosingCTA';
import { WelcomeFooter } from '../components/welcome/WelcomeFooter';
import { Marquee } from '../components/ui/Marquee';
import { Reveal } from '../components/ui/Reveal';

const sources = [
  { icon: FileText, label: 'Articles' },
  { icon: Youtube, label: 'Videos' },
  { icon: GraduationCap, label: 'Papers' },
  { icon: BookOpen, label: 'Books' },
  { icon: Github, label: 'Repositories' },
  { icon: MessageCircle, label: 'Threads' },
  { icon: Headphones, label: 'Podcasts' },
  { icon: Code2, label: 'Docs' },
];

const stats = [
  { value: '1 click', label: 'to save from any tab' },
  { value: '3 bullets', label: 'of AI takeaways per save' },
  { value: 'Forever', label: 'that your reader copy stays open' },
];

export default function WelcomePage() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="relative overflow-x-clip">
      <motion.div
        aria-hidden="true"
        style={{ scaleX: reduced ? scrollYProgress : scaleX }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
      />

      <WelcomeNav />

      <main>
        <Hero />

        <section className="pb-16 pt-4 sm:pb-20">
          <Reveal>
            <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-app-subtle">
              Collected from everywhere you learn
            </p>
          </Reveal>
          <Marquee>
            {sources.map((source) => (
              <span
                key={source.label}
                className="flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-app-subtle/80">
                <source.icon className="h-4 w-4 text-app-accent/70" />
                {source.label}
              </span>
            ))}
          </Marquee>

          <div className="mx-auto mt-14 grid w-full max-w-4xl grid-cols-1 gap-6 px-5 sm:grid-cols-3 sm:gap-4 sm:px-8">
            {stats.map((stat, index) => (
              <Reveal key={stat.value} delay={index * 0.06}>
                <div className="relative text-center sm:border-l sm:border-app-border/10 sm:first:border-l-0">
                  <p className="text-2xl font-extrabold tracking-tight text-app-text sm:text-[1.7rem]">{stat.value}</p>
                  <p className="mx-auto mt-1 max-w-[180px] text-[11px] leading-relaxed text-app-subtle">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <HowItWorks />
        <BentoFeatures />
        <ExtensionShowcase />
        <ClosingCTA />
      </main>

      <WelcomeFooter />
    </div>
  );
}
