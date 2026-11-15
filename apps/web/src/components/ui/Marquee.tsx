import type { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
}

export function Marquee({ children, className = '' }: MarqueeProps) {
  return (
    <div className={`mask-fade-x overflow-hidden ${className}`}>
      <div className="animate-marquee flex w-max items-center">
        <div className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14">
          {children}
        </div>
      </div>
    </div>
  );
}
