import * as React from 'react';
import { cn } from '@/lib/utils';

export function Progress({ value = 0, className, indicatorClassName }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-secondary/70 border border-border/60', className)}>
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-500 ease-out', indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
