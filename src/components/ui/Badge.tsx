import { type ReactNode } from 'react';

type Tone = 'sage' | 'amber' | 'red' | 'blue' | 'neutral' | 'purple';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  sage: 'bg-sage-100 text-sage-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  neutral: 'bg-cream-200 text-ink-600',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
