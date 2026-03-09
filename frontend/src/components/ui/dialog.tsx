'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  /** When true, overlay has no padding and content wrapper stretches to full height */
  fullHeight?: boolean;
}

export function Dialog({ open, onOpenChange, children, className, fullHeight }: DialogProps) {
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open || fullHeight) return;
    const root = contentRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      // Find the scrollable element under the cursor (may be root or an inner div like DialogContent)
      let scrollEl: HTMLElement | null = root;
      let node: HTMLElement | null = e.target as HTMLElement;
      while (node && node !== root) {
        const style = getComputedStyle(node);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
          scrollEl = node;
          break;
        }
        node = node.parentElement;
      }
      if (scrollEl) {
        scrollEl.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, [open, fullHeight]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex pointer-events-auto',
        fullHeight ? 'items-stretch p-0' : 'items-center justify-center p-3 sm:p-4'
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/50"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={contentRef}
        className={cn(
          'relative z-50 overflow-y-auto overflow-x-hidden',
          fullHeight ? 'h-full max-h-none pointer-events-none' : 'max-h-[90vh]',
          className
        )}
        onClick={fullHeight ? undefined : (e) => e.stopPropagation()}
        style={fullHeight ? undefined : { overscrollBehavior: 'contain' }}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 pb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-none text-foreground', className)} {...props} />;
}

export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-6', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-6 flex flex-wrap items-center justify-end gap-2', className)} {...props} />
  );
}
