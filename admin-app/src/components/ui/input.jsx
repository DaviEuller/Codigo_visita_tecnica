import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-xl border border-input bg-secondary/40 px-4 py-2 text-sm text-foreground',
      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
