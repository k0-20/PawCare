import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type AlertType = 'error' | 'success' | 'info';

interface AlertBannerProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
}

const config: Record<AlertType, { icon: typeof Info; bg: string; text: string; border: string }> = {
  error: { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  success: { icon: CheckCircle2, bg: 'bg-sage-50', text: 'text-sage-700', border: 'border-sage-200' },
  info: { icon: Info, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export function AlertBanner({ type, message, onDismiss }: AlertBannerProps) {
  const { icon: Icon, bg, text, border } = config[type];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 animate-fade-in`}>
      <Icon className={`h-5 w-5 shrink-0 ${text}`} />
      <p className={`flex-1 text-sm font-medium ${text}`}>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className={`rounded-lg p-1 transition-colors hover:bg-white/50 ${text}`}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function ErrorState({ message, onRetry, children }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-ink-800">Something went wrong</h3>
      <p className="mb-4 max-w-sm text-sm text-ink-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
      {children}
    </div>
  );
}
