import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  outline: 'border border-input bg-background hover:bg-secondary',
  ghost: 'hover:bg-secondary',
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
