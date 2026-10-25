import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-sage-400">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-ink-800">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-ink-500">{description}</p>
      {action}
    </div>
  );
}
