import { useRef, type PointerEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  /** Maximum rotation in degrees. */
  intensity?: number;
  glare?: boolean;
}

export function TiltCard({ children, className = '', wrapperClassName = '', intensity = 7, glare = true }: TiltCardProps) {
  const reduced = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 170, damping: 20, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 170, damping: 20, mass: 0.4 });
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const glareX = useTransform(pointerX, (value) => `${value}%`);
  const glareY = useTransform(pointerY, (value) => `${value}%`);
  const glareBackground = useMotionTemplate`radial-gradient(340px circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.16), transparent 60%)`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(nx * intensity * 2);
    rotateX.set(-ny * intensity * 2);
    pointerX.set((nx + 0.5) * 100);
    pointerY.set((ny + 0.5) * 100);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    pointerX.set(50);
    pointerY.set(50);
  };

  return (
    <div
      ref={wrapperRef}
      className={`[perspective:1200px] ${wrapperClassName}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}>
      <motion.div
        className={`relative ${className}`}
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}>
        {children}
        {glare && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glareBackground }}
          />
        )}
      </motion.div>
    </div>
  );
}
