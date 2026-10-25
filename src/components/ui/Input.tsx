import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input id={id} className={`input-field ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''} ${className}`} {...props} />
      {error && <p className="input-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <select id={id} className={`input-field ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <textarea id={id} className={`input-field min-h-[80px] resize-y ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''} ${className}`} {...props} />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export function Checkbox({ label, error, id, className = '', ...props }: CheckboxProps) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5">
        <input
          id={id}
          type="checkbox"
          className={`h-4 w-4 rounded border-cream-300 text-sage-600 focus:ring-sage-200 ${className}`}
          {...props}
        />
        <span className="text-sm text-ink-700">{label}</span>
      </label>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}
