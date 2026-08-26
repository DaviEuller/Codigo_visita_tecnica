import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary/15 text-primary border border-primary/30',
  secondary: 'bg-secondary text-secondary-foreground border border-border',
  accent: 'bg-accent/15 text-accent border border-accent/30',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
  outline: 'border border-input text-foreground',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}
