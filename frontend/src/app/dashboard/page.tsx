'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  User,
  XCircle,
  Check,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const PAGE_SIZE = 5;
import { Button } from '@/components/ui/button';

const summaryCards = [
  {
    label: 'Scheduled Today',
    value: 6,
    icon: Clock,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    label: 'Check-In Today',
    value: 3,
    icon: User,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Not Seen Today',
    value: 2,
    icon: XCircle,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    label: 'Completed Today',
    value: 23,
    icon: Check,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
];

const statusConfig = {
  'Not Seen': {
    className: 'bg-red-100 text-red-800 shadow-sm dark:bg-red-900/35 dark:text-red-200',
    icon: XCircle,
  },
  'Check-In': {
    className: 'bg-blue-100 text-blue-800 shadow-sm dark:bg-blue-900/35 dark:text-blue-200',
    icon: User,
  },
  Completed: {
    className: 'bg-green-100 text-green-800 shadow-sm dark:bg-green-900/35 dark:text-green-200',
    icon: Check,
  },
  Scheduled: {
    className: 'bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-900/35 dark:text-amber-200',
    icon: Clock,
  },
};

const appointments = [
  {
    time: '9:00 AM',
    rows: [
      {
        patient: 'Francis Cruz',
        doctor: 'Dr. John Doe',
        status: 'Not Seen',
        treatment: 'Cleaning',
        action: 'reschedule',
      },
      {
        patient: 'Francis Cruz',
        doctor: 'Dr. John Doe',
        status: 'Check-In',
        treatment: 'Not yet assigned',
        action: 'summary',
      },
      {
        patient: 'Francis Cruz',
        doctor: 'Dr. John Doe',
        status: 'Completed',
        treatment: 'Cleaning',
        action: 'visit-summary',
      },
    ],
  },
  {
    time: '9:30 AM',
    rows: [
      {
        patient: 'Francis Cruz',
        doctor: 'Dr. John Doe',
        status: 'Scheduled',
        treatment: 'Cleaning',
        action: 'check-in',
      },
    ],
  },
  {
    time: '10:00 AM',
    rows: [
      {
        patient: 'Maria Santos',
        doctor: 'Dr. Jane Smith',
        status: 'Scheduled',
        treatment: 'Check-up',
        action: 'check-in',
      },
    ],
  },
];

function formatSubtitle() {
  const d = new Date();
  const timeZone =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;
  const localeOpts = timeZone ? { timeZone } : {};
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...localeOpts,
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...localeOpts,
  });
  return `Here's your appointments for today (${dateStr} - ${timeStr})`;
}

type Row = {
  patient: string;
  doctor: string;
  status: string;
  treatment: string;
  action: string;
};

function flattenAppointments(): { time: string; row: Row }[] {
  return appointments.flatMap(({ time, rows }) =>
    rows.map((row) => ({ time, row }))
  );
}

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [subtitle, setSubtitle] = useState(() => formatSubtitle());

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitle(formatSubtitle());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const allRows = flattenAppointments();
  const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = allRows.slice(start, start + PAGE_SIZE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-bold text-foreground">ClinicSync</span>
        </Link>
        <hr className="border-border" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Good Morning, Diddy
            </h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              className="gap-2 shadow-sm hover:shadow-md border-border/80 bg-background hover:bg-muted/50 transition-shadow duration-200"
            >
              + Walk In
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow duration-200">
              + Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        {summaryCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="rounded-xl border border-border/80 bg-card p-5 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${iconBg} ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-foreground">{value}</span>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border/80 bg-background text-foreground text-sm placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:shadow-md transition-shadow duration-200"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 shadow-sm hover:shadow-md border-border/80 bg-background hover:bg-muted/50 transition-shadow duration-200"
          >
            Filter by Status
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="gap-2 shadow-sm hover:shadow-md border-border/80 bg-background hover:bg-muted/50 transition-shadow duration-200"
          >
            Filter by Doctor
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Appointments table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-md overflow-hidden flex flex-col flex-shrink-0">
        <div className="overflow-hidden">
          <table className="w-full text-left table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-[28%]" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[32%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 py-2 pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    aria-label="Select all"
                  />
                </th>
                <th className="py-2 px-4 font-semibold text-foreground">
                  Patient
                </th>
                <th className="py-2 px-4 font-semibold text-foreground text-center">
                  Status
                </th>
                <th className="py-2 px-4 font-semibold text-foreground text-center">
                  Treatment
                </th>
                <th className="py-2 px-4 font-semibold text-foreground text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(({ time, row }, i) => (
                <React.Fragment key={`${time}-${i}-${start}`}>
                  {(i === 0 || paginated[i - 1].time !== time) && (
                    <tr className="bg-muted/20">
                      <td colSpan={5} className="py-1 px-4">
                        <span className="font-semibold text-foreground text-sm">
                          {time}
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 pl-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        aria-label={`Select ${row.patient}`}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {row.patient}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {row.doctor}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center">
                      {(() => {
                        const config = statusConfig[
                          row.status as keyof typeof statusConfig
                        ] ?? statusConfig.Scheduled;
                        const Icon = config.icon;
                        return (
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {row.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-2 px-4 text-muted-foreground text-sm text-center">
                      {row.treatment}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {row.action === 'reschedule' && (
                          <Button variant="outline" size="sm" className="shadow-sm hover:shadow">
                            Reschedule Visit
                          </Button>
                        )}
                        {row.action === 'summary' && (
                          <>
                            <Link
                              href="#"
                              className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                            >
                              View Patient Summary
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Button variant="ghost" size="sm">
                              Mark as Not-Seen
                            </Button>
                          </>
                        )}
                        {row.action === 'visit-summary' && (
                          <Link
                            href="#"
                            className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                          >
                            Visit Summary
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {row.action === 'check-in' && (
                          <>
                            <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow duration-200">
                              Mark as Check-In
                            </Button>
                            <Button variant="ghost" size="sm">
                              Mark as Not-Seen
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-border bg-muted/30 flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, allRows.length)} of {allRows.length} patients
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="shadow-sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="shadow-sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
