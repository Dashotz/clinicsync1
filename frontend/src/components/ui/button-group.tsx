'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'vertical' && 'flex-col',
        orientation === 'horizontal' && [
          'gap-0',
          '[&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md',
          '[&>button:not(:first-child)]:-ml-px',
        ],
        orientation === 'vertical' && [
          '[&>button]:rounded-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md',
          '[&>button:not(:first-child)]:-mt-px',
        ],
        className
      )}
      {...props}
    />
  )
);
ButtonGroup.displayName = 'ButtonGroup';

export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

const ButtonGroupText = React.forwardRef<HTMLSpanElement, ButtonGroupTextProps>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn('px-3 py-1.5 text-sm text-muted-foreground', className)} {...props} />;
  }
);
ButtonGroupText.displayName = 'ButtonGroupText';

export { ButtonGroup, ButtonGroupText };
