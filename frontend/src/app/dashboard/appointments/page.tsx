'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  User,
  Check,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIME_SLOTS = ['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm'];
const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

type AppointmentStatus = 'Scheduled' | 'Check-in' | 'Completed' | 'Not seen';

type Appointment = {
  id: string;
  dentistId: number;
  patientName: string;
  start: string;
  end: string;
  service: string;
  status: AppointmentStatus;
};

const DENTISTS = [
  { id: 1, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 2, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 3, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 4, name: 'Dr. Ang Avatar', initials: 'AA' },
];

// Mock appointments for Jan 6, 2026
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', dentistId: 1, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled' },
  { id: '2', dentistId: 2, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Root canal treatment', status: 'Check-in' },
  { id: '3', dentistId: 2, patientName: 'Ivary Lapina', start: '9:00', end: '9:30', service: 'Cleaning', status: 'Not seen' },
  { id: '4', dentistId: 2, patientName: 'John Llyod', start: '9:30', end: '10:00', service: 'General check-up', status: 'Scheduled' },
  { id: '5', dentistId: 3, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Completed' },
  { id: '6', dentistId: 4, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled' },
];

const NOT_AVAILABLE_SLOTS: { dentistId: number; slotIndex: number }[] = [
  { dentistId: 1, slotIndex: 2 },
];

const STATUS_CONFIG: Record<AppointmentStatus, { icon: typeof Clock; bg: string; text: string }> = {
  Scheduled: { icon: Clock, bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200', text: 'text-amber-700 dark:text-amber-300' },
  'Check-in': { icon: User, bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200', text: 'text-emerald-700 dark:text-emerald-300' },
  Completed: { icon: Check, bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', text: 'text-green-700 dark:text-green-300' },
  'Not seen': { icon: XCircle, bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', text: 'text-red-700 dark:text-red-300' },
};

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'log'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 6));
  const [dentistFilter, setDentistFilter] = useState('All Dentist');
  const [statusFilter, setStatusFilter] = useState('Status');

  const dateLabel = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isToday = useMemo(() => {
    const t = new Date();
    return selectedDate.getDate() === t.getDate() && selectedDate.getMonth() === t.getMonth() && selectedDate.getFullYear() === t.getFullYear();
  }, [selectedDate]);

  const appointments = useMemo(() => MOCK_APPOINTMENTS, []);
  const totalCount = appointments.length;

  const goPrevDay = () =>
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 1);
      return next;
    });
  const goNextDay = () =>
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });
  const goToday = () => setSelectedDate(new Date());

  const currentHour = useMemo(() => new Date().getHours() + new Date().getMinutes() / 60, []);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const handleTableWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el) return;
    el.scrollTop += e.deltaY;
    e.preventDefault();
  }, []);

  const gridBySlot = useMemo(() => {
    const grid: Record<number, Record<number, (Appointment | 'not-available')[]>> = {};
    SLOT_HOURS.forEach((_, slotIdx) => {
      grid[slotIdx] = {};
      DENTISTS.forEach((d) => {
        grid[slotIdx][d.id] = [];
      });
    });
    NOT_AVAILABLE_SLOTS.forEach(({ dentistId, slotIndex }) => {
      if (grid[slotIndex]) grid[slotIndex][dentistId] = ['not-available'];
    });
    appointments.forEach((apt) => {
      const hour = parseTime(apt.start);
      let slotIdx = 0;
      for (let i = 0; i < SLOT_HOURS.length; i++) {
        const next = SLOT_HOURS[i + 1] ?? SLOT_HOURS[i] + 1;
        if (hour >= SLOT_HOURS[i] && hour < next) {
          slotIdx = i;
          break;
        }
      }
      const cell = grid[slotIdx][apt.dentistId];
      if (Array.isArray(cell) && !cell.includes('not-available')) {
        cell.push(apt);
      }
    });
    return grid;
  }, [appointments]);

  const appointmentCountByDentist = useMemo(() => {
    const count: Record<number, number> = {};
    DENTISTS.forEach((d) => { count[d.id] = appointments.filter((a) => a.dentistId === d.id).length; });
    return count;
  }, [appointments]);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 bg-background">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Appointment</h1>
        <Button className="w-fit shrink-0" asChild>
          <Link href="/dashboard/appointments/new">+ New Appointment</Link>
        </Button>
      </header>

      <div className="flex border-b border-border mb-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'calendar'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Calendar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'log'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Appointment log
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 flex-shrink-0">
            <span className="text-sm text-muted-foreground">{totalCount} Total appointments</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToday} className={isToday ? 'bg-primary/10 border-primary/30' : ''}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goPrevDay} aria-label="Previous day">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="min-w-[120px] text-center text-sm font-medium px-2">{dateLabel}</span>
              <Button variant="outline" size="icon" onClick={goNextDay} aria-label="Next day">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={dentistFilter}
              onChange={(e) => setDentistFilter(e.target.value)}
            >
              <option>All Dentist</option>
              {DENTISTS.map((d, i) => (
                <option key={d.id}>{d.name} {i + 1}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Status</option>
              <option>Scheduled</option>
              <option>Check-in</option>
              <option>Completed</option>
              <option>Not seen</option>
            </select>
            <Button variant="outline" size="sm" className="gap-2 ml-auto">
              <Download className="w-4 h-4" />
              Download Calendar
            </Button>
          </div>

          <div
            ref={tableScrollRef}
            onWheel={handleTableWheel}
            className="flex-1 min-h-0 overflow-auto border border-border rounded-xl bg-card overscroll-auto"
          >
            <table className="w-full border-collapse table-fixed" style={{ minWidth: 600 }}>
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-20 sm:w-24 py-3 text-left text-xs font-medium text-muted-foreground pl-3" />
                  {DENTISTS.map((d) => (
                    <th key={d.id} className="p-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {d.initials}
                        </span>
                        <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {appointmentCountByDentist[d.id] ?? 0} Appointment{(appointmentCountByDentist[d.id] ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((label, slotIdx) => {
                  const isCurrentTime = isToday && currentHour >= SLOT_HOURS[slotIdx] && currentHour < (SLOT_HOURS[slotIdx + 1] ?? 24);
                  return (
                  <tr key={label} className="border-b border-border last:border-b-0 relative">
                    <td className="py-2 pl-3 text-sm text-muted-foreground align-top w-20 sm:w-24 relative">
                      {label}
                      {isCurrentTime && (
                        <div
                          className="absolute left-0 top-1/2 h-0.5 bg-red-500 z-10 -translate-y-1/2 w-[2000px] max-w-[calc(100vw-8rem)] pointer-events-none"
                          aria-hidden
                        />
                      )}
                    </td>
                    {DENTISTS.map((d) => {
                      const cellList = gridBySlot[slotIdx]?.[d.id] ?? [];
                      const isNotAvailable = cellList.length === 1 && cellList[0] === 'not-available';
                      const apts = cellList.filter((c): c is Appointment => c !== 'not-available');
                      return (
                        <td key={d.id} className="p-2 align-top border-l border-border first:border-l-0">
                          {cellList.length === 0 && <div className="min-h-[60px]" />}
                          {isNotAvailable && (
                            <div className="min-h-[60px] rounded-lg bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                              Not Available
                            </div>
                          )}
                          {apts.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {apts.map((cell) => (
                                <div
                                  key={cell.id}
                                  className={`rounded-lg p-2 min-h-[60px] border ${
                                    cell.status === 'Scheduled'
                                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50'
                                      : cell.status === 'Check-in'
                                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                                        : cell.status === 'Completed'
                                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'
                                          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'
                                  }`}
                                >
                                  {(() => {
                                    const config = STATUS_CONFIG[cell.status];
                                    const Icon = config.icon;
                                    return (
                                      <>
                                        <div className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${config.bg}`}>
                                          <Icon className="w-3 h-3" />
                                          {cell.status}
                                        </div>
                                        <p className="font-medium text-foreground text-sm mt-1 truncate">{cell.patientName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {cell.start} - {cell.end} {parseInt(cell.start, 10) < 12 ? 'am' : 'pm'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{cell.service}</p>
                                      </>
                                    );
                                  })()}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <div className="flex-1 min-h-0 rounded-xl border border-border bg-card p-4 sm:p-6">
          <p className="text-sm text-muted-foreground">Appointment log view — list or table of past appointments can go here.</p>
        </div>
      )}
    </div>
  );
}
