'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  User,
  XCircle,
  Check,
  Search,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
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
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: XCircle,
  },
  'Check-In': {
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: User,
  },
  Completed: {
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    icon: Check,
  },
  Scheduled: {
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
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
];

function formatSubtitle() {
  const d = new Date();
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `Here's your appointments for today (${dateStr} - ${timeStr})`;
}

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const subtitle = formatSubtitle();

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden sm:block">
            <span className="text-2xl font-bold text-foreground">ClinicSync</span>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Good Morning, Diddy
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" className="gap-2">
            + Walk In
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            + Appointment
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-foreground">{value}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            Filter by Status
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            Filter by Doctor
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Appointments table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 py-4 pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    aria-label="Select all"
                  />
                </th>
                <th className="py-4 px-4 font-semibold text-foreground">
                  Patient
                </th>
                <th className="py-4 px-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="py-4 px-4 font-semibold text-foreground">
                  Treatment
                </th>
                <th className="py-4 px-4 font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(({ time, rows }) => (
                <React.Fragment key={time}>
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-2 px-4">
                      <span className="font-semibold text-foreground text-sm">
                        {time}
                      </span>
                    </td>
                  </tr>
                  {rows.map((row, i) => (
                    <tr
                      key={`${time}-${i}`}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 pl-4">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          aria-label={`Select ${row.patient}`}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {row.patient}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {row.doctor}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          const config = statusConfig[
                            row.status as keyof typeof statusConfig
                          ] ?? statusConfig.Scheduled;
                          const Icon = config.icon;
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {row.status}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {row.treatment}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {row.action === 'reschedule' && (
                            <Button variant="outline" size="sm">
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
                              <Button size="sm">Mark as Check-In</Button>
                              <Button variant="ghost" size="sm">
                                Mark as Not-Seen
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
