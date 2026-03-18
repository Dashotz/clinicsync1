'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Download, Filter, Import, MoreVertical, Plus, Search, ChevronDown, Check, User, Pencil, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PATIENT_ROWS } from '@/features/patients/data/patient-data';

const ACTION_MENU_WIDTH = 224;
const ACTION_MENU_GAP = 8;

const TOTAL_PATIENTS = 300;
const NEW_PATIENTS_THIS_WEEK = 24;

type SortValue = 'By Name' | 'By Last Visit';

export default function PatientsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<'Active' | 'Archive'>>(() => new Set(['Active']));
  const [sort, setSort] = useState<SortValue>('By Last Visit');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen && !sortOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (filterOpen && filterRef.current?.contains(t)) return;
      if (sortOpen && sortRef.current?.contains(t)) return;
      setFilterOpen(false);
      setSortOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen, sortOpen]);

  useEffect(() => {
    if (!actionMenuId) {
      setActionMenuPosition(null);
      return;
    }
    const el = actionButtonRef.current;
    if (!el) return;

    const updatePosition = () => {
      const rect = el.getBoundingClientRect();
      const menuHeight = 160;
      const padding = 8;
      let left = rect.right - ACTION_MENU_WIDTH;
      let top = rect.bottom + ACTION_MENU_GAP;
      if (left < padding) left = padding;
      if (left + ACTION_MENU_WIDTH > window.innerWidth - padding) left = window.innerWidth - ACTION_MENU_WIDTH - padding;
      if (top + menuHeight > window.innerHeight - padding) top = rect.top - menuHeight - ACTION_MENU_GAP;
      if (top < padding) top = padding;
      setActionMenuPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [actionMenuId]);

  useEffect(() => {
    if (!actionMenuId) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (actionMenuRef.current?.contains(t)) return;
      if (actionButtonRef.current?.contains(t)) return;
      setActionMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [actionMenuId]);

  const filtered = useMemo(() => {
    let list = [...PATIENT_ROWS];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q));

    if (statusFilter.size > 0) {
      list = list.filter((r) => statusFilter.has(r.status));
    }

    const rankLast = (v: string) => {
      if (v === 'Today') return 0;
      if (v === 'Yesterday') return 1;
      if (v.includes('days ago')) return 2;
      return 3;
    };

    list.sort((a, b) => {
      if (sort === 'By Name') return a.name.localeCompare(b.name);
      return rankLast(a.lastVisit) - rankLast(b.lastVisit);
    });

    return list;
  }, [query, sort, statusFilter]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const allOnPageSelected = paginated.length > 0 && paginated.every((r) => selectedIds.has(r.id));
  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginated.forEach((r) => next.delete(r.id));
      } else {
        paginated.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showingText =
    totalCount === 0
      ? 'Showing 0 of 0'
      : `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`;

  return (
    <div className="h-full flex flex-col overflow-auto p-4 sm:p-6 lg:p-8 bg-background">
      <header className="flex items-center justify-between gap-3 mb-4 sm:mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Patients</h1>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Patient
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Patients</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{TOTAL_PATIENTS}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">New Patients this Week</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{NEW_PATIENTS_THIS_WEEK}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by patient name"
              className="pl-9"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => {
                setFilterOpen((o) => !o);
                setSortOpen(false);
              }}
            >
              <Filter className="h-4 w-4 opacity-70" />
              Filter
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
            {filterOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-2">
                <p className="px-2 pt-1 pb-2 text-[11px] font-medium text-muted-foreground">Status</p>
                {(['Active', 'Archive'] as const).map((s) => {
                  const checked = statusFilter.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatusFilter((prev) => {
                          const next = new Set(prev);
                          if (next.has(s)) next.delete(s);
                          else next.add(s);
                          return next;
                        });
                        setPage(1);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted/60',
                        checked && 'bg-muted/40'
                      )}
                    >
                      <span
                        className={cn(
                          'h-4 w-4 rounded border border-border bg-background flex items-center justify-center',
                          checked && 'border-primary'
                        )}
                        aria-hidden
                      >
                        {checked && <Check className="h-3 w-3 text-primary" />}
                      </span>
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => {
                setSortOpen((o) => !o);
                setFilterOpen(false);
              }}
            >
              Sort
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
            {sortOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-44 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg py-1">
                {(['By Name', 'By Last Visit'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSort(opt);
                      setSortOpen(false);
                      setPage(1);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <span>{opt}</span>
                    {sort === opt && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between lg:justify-end">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export Patient
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Import className="h-4 w-4" />
            Import Patient
          </Button>
        </div>
      </div>

      <div className="rounded-lg sm:rounded-xl border border-border bg-card overflow-hidden flex-1 min-h-0">
        <div className="w-full overflow-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all patients on page"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Mobile Number</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Last Visit</th>
                <th className="w-16 px-3 py-3 text-center text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-primary">{row.name}</td>
                  <td className="px-3 py-3 text-sm text-foreground">{row.mobile}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{row.email}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{row.lastVisit}</td>
                  <td className="px-3 py-3 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        actionButtonRef.current = e.currentTarget;
                        setActionMenuId((v) => (v === row.id ? null : row.id));
                      }}
                      aria-label="Row actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground">{showingText}</p>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2 text-xs"
              >
                &lt; Previous
              </Button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-8 w-8 p-0 text-xs min-w-8',
                    page !== p && 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  {p}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2 text-xs"
              >
                Next &gt;
              </Button>
            </div>
          </div>
        </div>
      </div>

      {typeof document !== 'undefined' && actionMenuId && actionMenuPosition && (() => {
        const actionRow = filtered.find((r) => r.id === actionMenuId);
        if (!actionRow) return null;
        return createPortal(
          <div
            ref={actionMenuRef}
            style={{
              position: 'fixed',
              top: actionMenuPosition.top,
              left: actionMenuPosition.left,
              zIndex: 50,
              width: ACTION_MENU_WIDTH,
            }}
            className="rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden"
          >
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/60">
              {actionRow.name}
            </div>
            <div className="py-1">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 text-foreground"
                onClick={() => {
                  setActionMenuId(null);
                  router.push(`/dashboard/patients/${actionRow.id}`);
                }}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                View Details
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 text-foreground"
                onClick={() => setActionMenuId(null)}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Edit
              </button>
            </div>
            <div className="h-px bg-border" />
            <div className="py-1">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive"
                onClick={() => setActionMenuId(null)}
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}

