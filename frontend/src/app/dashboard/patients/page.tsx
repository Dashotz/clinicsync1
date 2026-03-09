'use client';

import React, { useMemo, useState } from 'react';
import { Download, Filter, Import, MoreVertical, Plus, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PatientRow = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  lastVisit: string;
};

const TOTAL_PATIENTS = 300;
const NEW_PATIENTS_THIS_WEEK = 24;

const PATIENT_ROWS: PatientRow[] = [
  { id: 'p1', name: 'Francis Cruz', mobile: '+9454987652', email: 'francis@gmail.com', lastVisit: 'Today' },
  { id: 'p2', name: 'Francis Cruz', mobile: '+9454987652', email: 'francis@gmail.com', lastVisit: '3 days ago' },
  { id: 'p3', name: 'Francis Cruz', mobile: '+9454987652', email: 'francis@gmail.com', lastVisit: 'Jan 6, 2026' },
  // Fill to 54 rows with realistic-looking data
  ...Array.from({ length: 51 }, (_, i) => {
    const idx = i + 4;
    const name = ['Ivary Lapina', 'John Llyod', 'Patient A', 'Patient B', 'Patient C', 'Patient D'][i % 6];
    const last = ['Today', 'Yesterday', '3 days ago', 'Jan 6, 2026', 'Dec 12, 2025'][i % 5];
    return {
      id: `p${idx}`,
      name,
      mobile: '+63912345678',
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      lastVisit: last,
    } satisfies PatientRow;
  }),
];

type FilterValue = 'All' | 'Visited recently' | 'No recent visit';
type SortValue = 'Name (A–Z)' | 'Name (Z–A)' | 'Last visit (newest)' | 'Last visit (oldest)';

export default function PatientsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('All');
  const [sort, setSort] = useState<SortValue>('Last visit (newest)');

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...PATIENT_ROWS];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q));

    if (filter === 'Visited recently') {
      list = list.filter((r) => r.lastVisit === 'Today' || r.lastVisit === 'Yesterday' || r.lastVisit.includes('days ago'));
    } else if (filter === 'No recent visit') {
      list = list.filter((r) => !(r.lastVisit === 'Today' || r.lastVisit === 'Yesterday' || r.lastVisit.includes('days ago')));
    }

    const rankLast = (v: string) => {
      if (v === 'Today') return 0;
      if (v === 'Yesterday') return 1;
      if (v.includes('days ago')) return 2;
      return 3;
    };

    list.sort((a, b) => {
      if (sort === 'Name (A–Z)') return a.name.localeCompare(b.name);
      if (sort === 'Name (Z–A)') return b.name.localeCompare(a.name);
      if (sort === 'Last visit (oldest)') return rankLast(b.lastVisit) - rankLast(a.lastVisit);
      // Last visit (newest)
      return rankLast(a.lastVisit) - rankLast(b.lastVisit);
    });

    return list;
  }, [query, filter, sort]);

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
          <Select
            value={filter}
            onValueChange={(v: FilterValue) => {
              setFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[110px] h-9 text-xs sm:text-sm">
              <Filter className="h-4 w-4 mr-1.5 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Visited recently">Visited recently</SelectItem>
              <SelectItem value="No recent visit">No recent visit</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(v: SortValue) => {
              setSort(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px] h-9 text-xs sm:text-sm">
              <ArrowUpDown className="h-4 w-4 mr-1.5 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Last visit (newest)">Last visit</SelectItem>
              <SelectItem value="Name (A–Z)">Name (A–Z)</SelectItem>
              <SelectItem value="Name (Z–A)">Name (Z–A)</SelectItem>
              <SelectItem value="Last visit (oldest)">Last visit (oldest)</SelectItem>
            </SelectContent>
          </Select>
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
                    <div className="relative inline-flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setActionMenuId((v) => (v === row.id ? null : row.id))}
                        aria-label="Row actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {actionMenuId === row.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover text-popover-foreground shadow-md py-1">
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70"
                            onClick={() => setActionMenuId(null)}
                          >
                            View patient
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70"
                            onClick={() => setActionMenuId(null)}
                          >
                            Edit patient
                          </button>
                        </div>
                      )}
                    </div>
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
                  className={cn('h-8 w-8 p-0 text-xs min-w-8', page !== p && 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary')}
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
    </div>
  );
}
