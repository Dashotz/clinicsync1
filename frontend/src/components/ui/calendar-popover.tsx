'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

/** Build a 6-week grid of dates for the calendar view (starts on Sunday) */
function getCalendarDays(viewDate: Date): { date: Date; isCurrentMonth: boolean }[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());
  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
    });
  }
  return days;
}

export type CalendarPopoverProps = {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  trigger: React.ReactNode;
  triggerClassName?: string;
  id?: string;
};

export function CalendarPopover({
  value,
  onChange,
  trigger,
  triggerClassName,
  id,
}: CalendarPopoverProps) {
  const [open, setOpen] = useState(false);
  const viewDate = value ? parseDate(value) : new Date();
  const [viewMonth, setViewMonth] = useState(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setViewMonth((m) => {
      const v = value ? parseDate(value) : new Date();
      return new Date(v.getFullYear(), v.getMonth(), 1);
    });
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const el = e.target as Node;
      if (
        panelRef.current?.contains(el) ||
        triggerRef.current?.contains(el)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handlePrev = () => {
    setViewMonth((m) => {
      const next = new Date(m);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setViewMonth((m) => {
      const next = new Date(m);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  const handleToday = () => {
    onChange(toYYYYMMDD(new Date()));
    setOpen(false);
  };

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getCalendarDays(viewMonth);

  return (
    <div className="relative inline-block w-full">
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Pick date"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={cn('flex h-9 w-full cursor-pointer items-center rounded-md border border-input bg-transparent px-3 py-1 text-base md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring', triggerClassName)}
      >
        {trigger}
      </div>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full z-50 mt-1 w-[240px] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md"
          role="dialog"
          aria-label="Calendar"
        >
          {/* Header: Month Year + arrows */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium">{monthLabel}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="rounded p-0.5 hover:bg-muted"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="rounded p-0.5 hover:bg-muted"
                aria-label="Next month"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground mb-0.5">
            {DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 gap-0.5 text-xs">
            {days.map(({ date, isCurrentMonth }) => {
              const iso = toYYYYMMDD(date);
              const isSelected = value === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleSelect(iso)}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md',
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                    isSelected
                      ? 'bg-primary text-primary-foreground ring-2 ring-foreground/20'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer: Clear, Today */}
          <div className="mt-2 flex justify-end gap-1.5 border-t border-border pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-primary hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-xs text-primary hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
