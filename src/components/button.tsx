import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40',
        variant === 'primary' && 'bg-text text-bg px-3 py-2 hover:bg-accent',
        variant === 'ghost' && 'px-3 py-2 text-muted hover:text-text',
        variant === 'outline' && 'border border-line px-3 py-2 hover:border-accent hover:text-text',
        variant === 'danger' && 'border border-red-500/30 text-red-300 px-3 py-2 hover:bg-red-500/10',
        className
      )}
      {...props}
    />
  );
}
