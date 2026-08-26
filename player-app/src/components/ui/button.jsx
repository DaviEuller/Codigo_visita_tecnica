import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default:
    'bg-primary text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_8px_24px_-8px_hsl(var(--primary)/0.6)] hover:brightness-110 active:scale-[0.98]',
  accent:
    'bg-accent text-accent-foreground shadow-[0_0_0_1px_hsl(var(--accent)/0.4),0_8px_24px_-8px_hsl(var(--accent)/0.6)] hover:brightness-110 active:scale-[0.98]',
  destructive:
    'bg-destructive text-destructive-foreground hover:brightness-110 active:scale-[0.98]',
  outline:
    'border border-input bg-secondary/40 hover:bg-secondary text-foreground',
  ghost: 'hover:bg-secondary/60 text-foreground',
};

const sizes = {
  default: 'h-11 px-5 text-sm',
  sm: 'h-9 px-3 text-xs',
  lg: 'h-12 px-7 text-base',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150',
        'disabled:opacity-40 disabled:pointer-events-none disabled:grayscale',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
