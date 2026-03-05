'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Download, Plus, Ban, CalendarCheck, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { cn } from '@/lib/utils';
import type { Appointment } from './lib/types';
import {
  DENTISTS,
  TIME_SLOTS,
  SLOT_HOURS,
  NOT_AVAILABLE_SLOTS,
  VALID_STATUSES,
  STATUS_CONFIG,
  CARD_STYLES,
} from './lib/constants';
import {
  getTodayStr,
  parseTimeTo24,
  addOneHour,
  parseTime,
  formatTimeRange,
  slotKey,
} from './lib/utils';
import type { NewAppointmentSavedData } from './components/NewAppointmentModal';

const NewAppointmentModal = dynamic(
  () => import('./components/NewAppointmentModal').then((m) => ({ default: m.NewAppointmentModal })),
  { ssr: false }
);

const AppointmentDetailsModal = dynamic(
  () => import('./components/AppointmentDetailsModal').then((m) => ({ default: m.AppointmentDetailsModal })),
  { ssr: false }
);

const EditAppointmentModal = dynamic(
  () => import('./components/EditAppointmentModal').then((m) => ({ default: m.EditAppointmentModal })),
  { ssr: false }
);

// Mock appointments (Jan 6, 2026)
const MOCK_APPOINTMENTS_JAN6: Appointment[] = [
  { id: '1', dentistId: 1, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled', date: '2026-01-06' },
  { id: '2', dentistId: 2, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Root canal treatment', status: 'Check-in', date: '2026-01-06' },
  { id: '3', dentistId: 2, patientName: 'Ivary Lapina', start: '9:00', end: '9:30', service: 'Cleaning', status: 'Not seen', date: '2026-01-06' },
  { id: '4', dentistId: 2, patientName: 'John Llyod', start: '9:30', end: '10:00', service: 'General check-up', status: 'Scheduled', date: '2026-01-06' },
  { id: '5', dentistId: 3, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Completed', date: '2026-01-06' },
  { id: '6', dentistId: 4, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled', date: '2026-01-06' },
];

function getAllMockAppointments(): Appointment[] {
  const todayStr = getTodayStr();
  if (todayStr === '2026-01-06') return MOCK_APPOINTMENTS_JAN6;
  const forToday: Appointment[] = [
    { id: 't1', dentistId: 1, patientName: 'Patient A', start: '9:00', end: '10:00', service: 'Check-up', status: 'Scheduled', date: todayStr },
    { id: 't2', dentistId: 2, patientName: 'Patient B', start: '10:00', end: '11:00', service: 'Cleaning', status: 'Check-in', date: todayStr },
    { id: 't3', dentistId: 3, patientName: 'Patient C', start: '11:00', end: '12:00', service: 'Filling', status: 'Completed', date: todayStr },
    { id: 't4', dentistId: 1, patientName: 'Patient D', start: '2:00', end: '3:00', service: 'Cleaning', status: 'Not seen', date: todayStr },
  ];
  return [...MOCK_APPOINTMENTS_JAN6, ...forToday];
}

/** Generate more appointments for log so pagination and summary cards look realistic */
function getLogMockAppointments(): Appointment[] {
  const base = getAllMockAppointments();
  const extra: Appointment[] = [
    { id: 'log-1', dentistId: 1, patientName: 'Francis Cruz', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled', date: '2026-09-20' },
    { id: 'log-2', dentistId: 1, patientName: 'Francis Cruz', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Check-in', date: '2026-09-07' },
    { id: 'log-3', dentistId: 1, patientName: 'Francis Cruz', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Completed', date: '2026-09-01' },
  ];
  const names = ['Francis Cruz', 'Ivary Lapina', 'John Llyod', 'Patient A', 'Patient B', 'Patient C'];
  const services = ['Cleaning', 'General check-up', 'Root canal treatment', 'Filling', 'Extraction'];
  const statuses: Appointment['status'][] = ['Scheduled', 'Check-in', 'Completed', 'Not seen'];
  const list = [...base, ...extra];
  for (let i = 0; list.length < 54; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(i / 3));
    const dateStr = d.toISOString().slice(0, 10);
    list.push({
      id: `log-${list.length + 1}`,
      dentistId: (i % DENTISTS.length) + 1,
      patientName: names[i % names.length],
      start: `${(9 + (i % 8))}:00`,
      end: `${(10 + (i % 8))}:00`,
      service: services[i % services.length],
      status: statuses[i % statuses.length],
      date: dateStr,
    });
  }
  return list.slice(0, 54);
}

const INITIAL_APPOINTMENTS = getLogMockAppointments();

function filterByDateAndFilters(
  list: Appointment[],
  opts: { date?: string; dentistFilter: string; statusFilter: string }
): Appointment[] {
  let out = opts.date ? list.filter((a) => a.date === opts.date) : [...list];
  if (opts.dentistFilter !== 'All Dentist') {
    const dentistId = Number(opts.dentistFilter);
    if (!Number.isNaN(dentistId) && DENTISTS.some((d) => d.id === dentistId)) {
      out = out.filter((a) => a.dentistId === dentistId);
    }
  }
  if (opts.statusFilter !== 'Status' && VALID_STATUSES.includes(opts.statusFilter as Appointment['status'])) {
    out = out.filter((a) => a.status === opts.statusFilter);
  }
  return out;
}

function AppointmentCard({ cell }: { cell: Appointment }) {
  const { icon: Icon, iconCircle, statusText } = STATUS_CONFIG[cell.status];
  return (
    <div className="flex flex-col gap-1.5 h-full">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconCircle}`}
            aria-hidden
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
          <p className="font-medium text-foreground text-sm truncate">{cell.patientName}</p>
        </div>
        <span className={`text-xs font-medium shrink-0 ${statusText}`}>{cell.status}</span>
      </div>
      <p className="text-xs text-muted-foreground">{formatTimeRange(cell.start, cell.end)}</p>
      <div className="mt-0.5">
        <span className="inline-block rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-xs text-foreground">
          {cell.service}
        </span>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'log'>('calendar');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dentistFilter, setDentistFilter] = useState('All Dentist');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  /** When opening from a calendar slot click, pre-fill date/time/dentist in the new-appointment modal */
  const [newAppointmentPreselected, setNewAppointmentPreselected] = useState<{
    date: string;
    time: string;
    dentistId: number;
  } | null>(null);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(() => INITIAL_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  /** User-toggled "not available" slots: key = "dentistId-slotIndex" */
  const [userNotAvailableSlots, setUserNotAvailableSlots] = useState<Set<string>>(new Set());
  /** Slots from NOT_AVAILABLE_SLOTS that user chose to make available: key = "dentistId-slotIndex" */
  const [userAvailableOverrides, setUserAvailableOverrides] = useState<Set<string>>(new Set());

  const dateLabel = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isToday = useMemo(() => {
    const t = new Date();
    return selectedDate.getDate() === t.getDate() && selectedDate.getMonth() === t.getMonth() && selectedDate.getFullYear() === t.getFullYear();
  }, [selectedDate]);

  const selectedDateStr = useMemo(
    () =>
      `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
    [selectedDate]
  );

  const appointments = useMemo(
    () => filterByDateAndFilters(appointmentsList, { date: selectedDateStr, dentistFilter, statusFilter }),
    [appointmentsList, selectedDateStr, dentistFilter, statusFilter]
  );
  const totalCount = appointments.length;

  const [logSearch, setLogSearch] = useState('');
  const [logDateFilter, setLogDateFilter] = useState('All');
  const [logPage, setLogPage] = useState(1);
  const [logRowsPerPage, setLogRowsPerPage] = useState(9);
  const [logSelectedIds, setLogSelectedIds] = useState<Set<string>>(new Set());
  const [logActionMenuId, setLogActionMenuId] = useState<string | null>(null);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const todayStr = getTodayStr();
  const next7DaysEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }, []);
  const appointmentsNext7Days = useMemo(() => {
    return appointmentsList.filter((a) => a.date >= todayStr && a.date <= next7DaysEnd).length;
  }, [appointmentsList, todayStr, next7DaysEnd]);

  const logAppointmentsFiltered = useMemo(() => {
    let list = filterByDateAndFilters(appointmentsList, { dentistFilter, statusFilter });
    if (logSearch.trim()) {
      const q = logSearch.trim().toLowerCase();
      list = list.filter((a) => a.patientName.toLowerCase().includes(q));
    }
    if (logDateFilter === 'Today') list = list.filter((a) => a.date === todayStr);
    if (logDateFilter === 'Next 7 days') list = list.filter((a) => a.date >= todayStr && a.date <= next7DaysEnd);
    return list.sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : parseTime(b.start) - parseTime(a.start);
    });
  }, [appointmentsList, dentistFilter, statusFilter, logSearch, logDateFilter, todayStr, next7DaysEnd]);
  const logTotalCount = logAppointmentsFiltered.length;

  const logPaginated = useMemo(() => {
    const start = (logPage - 1) * logRowsPerPage;
    return logAppointmentsFiltered.slice(start, start + logRowsPerPage);
  }, [logAppointmentsFiltered, logPage, logRowsPerPage]);
  const logTotalPages = Math.max(1, Math.ceil(logTotalCount / logRowsPerPage));

  const logSelectAll = () => {
    if (logSelectedIds.size === logPaginated.length) {
      setLogSelectedIds(new Set());
    } else {
      setLogSelectedIds(new Set(logPaginated.map((a) => a.id)));
    }
  };
  const logToggleOne = (id: string) => {
    setLogSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const logPatientOptions = useMemo(
    () => [...new Set(appointmentsList.map((a) => a.patientName))].sort(),
    [appointmentsList]
  );

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

  const [currentHour, setCurrentHour] = useState(() => new Date().getHours() + new Date().getMinutes() / 60);
  useEffect(() => {
    const tick = () => setCurrentHour(new Date().getHours() + new Date().getMinutes() / 60);
    tick();
    let id: ReturnType<typeof setInterval> | null = null;
    const onVisibility = () => {
      if (document.hidden) {
        if (id) clearInterval(id);
        id = null;
      } else {
        tick();
        id = setInterval(tick, 60_000);
      }
    };
    id = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (id) clearInterval(id);
    };
  }, []);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [calendarWidth, setCalendarWidth] = useState<number>(0);
  const [timeColumnWidth, setTimeColumnWidth] = useState<number>(0);
  useEffect(() => {
    if (activeTab !== 'calendar') return;
    const el = tableScrollRef.current;
    if (!el) return;
    const update = () => {
      setCalendarWidth(el.clientWidth);
      const firstTh = el.querySelector('thead th:first-child');
      if (firstTh) setTimeColumnWidth(firstTh.getBoundingClientRect().width);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const onWheel = (e: WheelEvent) => {
      el.scrollTop += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener('wheel', onWheel);
    };
  }, [activeTab]);

  const gridBySlot = useMemo(() => {
    const grid: Record<number, Record<number, (Appointment | 'not-available')[]>> = {};
    SLOT_HOURS.forEach((_, slotIdx) => {
      grid[slotIdx] = {};
      DENTISTS.forEach((d) => {
        grid[slotIdx][d.id] = [];
      });
    });
    NOT_AVAILABLE_SLOTS.forEach(({ dentistId, slotIndex }) => {
      const key = slotKey(dentistId, slotIndex);
      if (grid[slotIndex] && !userAvailableOverrides.has(key)) grid[slotIndex][dentistId] = ['not-available'];
    });
    userNotAvailableSlots.forEach((key) => {
      const [dentistId, slotIndex] = key.split('-').map(Number);
      if (grid[slotIndex] && grid[slotIndex][dentistId]?.length === 0) {
        grid[slotIndex][dentistId] = ['not-available'];
      }
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
  }, [appointments, userNotAvailableSlots, userAvailableOverrides]);

  const toggleSlotNotAvailable = (dentistId: number, slotIndex: number) => {
    const key = slotKey(dentistId, slotIndex);
    setUserNotAvailableSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        setUserAvailableOverrides((o) => { const n = new Set(o); n.delete(key); return n; });
      }
      return next;
    });
  };

  const appointmentCountByDentist = useMemo(() => {
    const count: Record<number, number> = {};
    DENTISTS.forEach((d) => { count[d.id] = appointments.filter((a) => a.dentistId === d.id).length; });
    return count;
  }, [appointments]);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-3 sm:p-6 lg:p-8 bg-background">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 flex-shrink-0">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground">Appointment</h1>
        <Button
          className="w-full sm:w-fit shrink-0"
          onClick={() => {
            setNewAppointmentPreselected(null);
            setNewAppointmentOpen(true);
          }}
        >
          + New Appointment
        </Button>
        <NewAppointmentModal
          open={newAppointmentOpen}
          onOpenChange={(open) => {
            if (!open) setNewAppointmentPreselected(null);
            setNewAppointmentOpen(open);
          }}
          preselected={newAppointmentPreselected}
          onSave={(data: NewAppointmentSavedData) => {
            const { step1, step2 } = data;
            const start = parseTimeTo24(step1.time);
            const end = addOneHour(start);
            const newAppointment: Appointment = {
              id: `new-${Date.now()}`,
              dentistId: Number(step1.dentistId),
              patientName: step2.patientName || 'New Patient',
              start,
              end,
              service: step1.treatment || 'General check-up',
              status: 'Scheduled',
              date: step1.date,
            };
            setAppointmentsList((prev) => [...prev, newAppointment]);
          }}
        />
        <AppointmentDetailsModal
          open={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
          appointment={selectedAppointment}
          dentistName={selectedAppointment ? (DENTISTS.find((d) => d.id === selectedAppointment.dentistId)?.name ?? '') : ''}
          onStatusChange={(id, newStatus) => {
            setAppointmentsList((prev) =>
              prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
            );
            setSelectedAppointment((prev) =>
              prev && prev.id === id ? { ...prev, status: newStatus } : prev
            );
          }}
          onMedicalRecordSaved={(id, data) => {
            const service = data.treatments.join(', ');
            const teeth = data.selectedTeeth;
            setAppointmentsList((prev) =>
              prev.map((a) => (a.id === id ? { ...a, service, teeth } : a))
            );
            setSelectedAppointment((prev) =>
              prev && prev.id === id ? { ...prev, service, teeth } : prev
            );
          }}
          onDelete={(id) => {
            setAppointmentsList((prev) => prev.filter((a) => a.id !== id));
            setSelectedAppointment(null);
          }}
        />
        <EditAppointmentModal
          open={editAppointmentOpen}
          onOpenChange={(open) => {
            if (!open) setAppointmentToEdit(null);
            setEditAppointmentOpen(open);
          }}
          appointment={appointmentToEdit}
          patientOptions={logPatientOptions}
          onSave={(appointmentId, updates) => {
            setAppointmentsList((prev) =>
              prev.map((a) =>
                a.id === appointmentId
                  ? {
                      ...a,
                      patientName: updates.patientName,
                      date: updates.date,
                      start: updates.start,
                      end: updates.end,
                      service: updates.service,
                    }
                  : a
              )
            );
            setSelectedAppointment((prev) =>
              prev?.id === appointmentId
                ? {
                    ...prev,
                    patientName: updates.patientName,
                    date: updates.date,
                    start: updates.start,
                    end: updates.end,
                    service: updates.service,
                  }
                : prev
            );
          }}
        />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 flex-shrink-0">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Appointments</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{appointmentsList.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Appointments Next 7 Days</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{appointmentsNext7Days}</p>
        </div>
      </div>

      <div className="flex border-b border-border mb-3 sm:mb-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
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
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'log'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Appointment log
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden min-h-[420px]">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
            <span className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">{totalCount} Total appointments</span>
            <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={goToday} className={isToday ? 'bg-primary/10 border-primary/30' : ''}>
                Today
              </Button>
              <ButtonGroup className="inline-flex border border-input rounded-md bg-background shadow-sm [&>*]:-ml-px [&>*]:rounded-none [&>*:first-child]:rounded-l-[5px] [&>*:last-child]:rounded-r-[5px] [&>*:first-child]:ml-0">
                <Button variant="outline" size="icon" onClick={goPrevDay} aria-label="Previous day">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <ButtonGroupText className="min-w-[100px] sm:min-w-[120px] text-center font-medium text-foreground text-xs sm:text-sm border border-transparent border-l-border bg-background h-8 sm:h-9 flex items-center justify-center">
                  {dateLabel}
                </ButtonGroupText>
                <Button variant="outline" size="icon" onClick={goNextDay} aria-label="Next day">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </ButtonGroup>
              <select
                className="rounded-lg border border-border bg-background px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-foreground min-w-0"
                value={dentistFilter}
                onChange={(e) => setDentistFilter(e.target.value)}
              >
                <option value="All Dentist">All Dentist</option>
                {DENTISTS.map((d, i) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name} {i + 1}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-border bg-background px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-foreground min-w-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Status">Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Check-in">Check-in</option>
                <option value="Completed">Completed</option>
                <option value="Not seen">Not seen</option>
              </select>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 justify-self-end order-3 w-full sm:w-auto">
              <Download className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Download Calendar</span>
            </Button>
          </div>

          <div
            ref={tableScrollRef}
            className="flex-1 min-h-0 overflow-auto border border-border rounded-lg sm:rounded-xl bg-card overscroll-auto min-h-[280px] sm:min-h-[320px] -mx-1 px-1 sm:mx-0 sm:px-0"
            style={{ contain: 'layout' }}
          >
            <table className="w-full border-collapse table-fixed" style={{ minWidth: 560 }}>
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-14 sm:w-24 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground pl-2 sm:pl-3" />
                  {DENTISTS.map((d) => (
                    <th key={d.id} className="p-2 sm:p-3 text-left min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-[10px] sm:text-xs font-medium text-muted-foreground shrink-0">
                          {d.initials}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate">{d.name}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {appointmentCountByDentist[d.id] ?? 0} Apt.
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((label, slotIdx) => {
                  const slotStart = SLOT_HOURS[slotIdx];
                  const slotEnd = SLOT_HOURS[slotIdx + 1] ?? slotStart + 1;
                  const isCurrentTime = isToday && currentHour >= slotStart && currentHour < slotEnd;
                  const fractionThroughSlot = isCurrentTime
                    ? (currentHour - slotStart) / (slotEnd - slotStart)
                    : 0;
                  return (
                  <tr key={label} className="border-b border-border last:border-b-0 relative">
                    <td className="py-1.5 sm:py-2 pl-2 sm:pl-3 text-xs sm:text-sm text-muted-foreground align-top w-14 sm:w-24 relative">
                      {label}
                      {isCurrentTime && (
                        <div
                          className="absolute z-10 pointer-events-none flex items-center"
                          style={{
                            top: `${fractionThroughSlot * 100}%`,
                            transform: 'translateY(-50%)',
                            left: timeColumnWidth,
                            width: Math.max(0, calendarWidth - timeColumnWidth),
                          }}
                          aria-hidden
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <span className="h-0.5 bg-red-500 flex-1 min-w-0" />
                        </div>
                      )}
                    </td>
                    {DENTISTS.map((d) => {
                      const cellList = gridBySlot[slotIdx]?.[d.id] ?? [];
                      const isNotAvailable = cellList.length === 1 && cellList[0] === 'not-available';
                      const isUserMarkedNotAvailable = userNotAvailableSlots.has(slotKey(d.id, slotIdx));
                      const apts = cellList.filter((c): c is Appointment => c !== 'not-available');
                      return (
                        <td key={d.id} className="relative p-1.5 sm:p-2 align-top border-l border-border first:border-l-0 overflow-hidden min-h-[56px] sm:min-h-[60px]">
                          {(cellList.length === 0 || isNotAvailable) && (
                            <div
                              className={cn(
                                'absolute inset-0 flex gap-0.5 rounded-lg',
                                isNotAvailable && 'bg-red-500/5'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const hour = SLOT_HOURS[slotIdx];
                                  const timeStr =
                                    hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
                                  setNewAppointmentPreselected({
                                    date: selectedDateStr,
                                    time: timeStr,
                                    dentistId: d.id,
                                  });
                                  setNewAppointmentOpen(true);
                                }}
                                className="group flex-1 min-w-0 rounded-l-lg flex items-center justify-center text-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset transition-colors cursor-pointer"
                                aria-label="Create new appointment"
                              >
                                <Plus className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const key = slotKey(d.id, slotIdx);
                                  if (isNotAvailable) {
                                    if (isUserMarkedNotAvailable) toggleSlotNotAvailable(d.id, slotIdx);
                                    else setUserAvailableOverrides((prev) => new Set(prev).add(key));
                                  } else {
                                    toggleSlotNotAvailable(d.id, slotIdx);
                                  }
                                }}
                                className={cn(
                                  'group flex-1 min-w-0 rounded-r-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset transition-colors cursor-pointer',
                                  isNotAvailable
                                    ? 'text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600'
                                    : 'text-red-400/80 hover:bg-red-500/10 hover:text-red-500'
                                )}
                                title={isNotAvailable ? 'Mark as available' : 'Mark as not available'}
                                aria-label={isNotAvailable ? 'Mark as available' : 'Mark as not available'}
                              >
                                {isNotAvailable ? (
                                  <CalendarCheck className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                  <Ban className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                              {isNotAvailable && (
                                <div
                                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none text-red-400/90"
                                  aria-hidden
                                >
                                  <Ban className="h-5 w-5 shrink-0" />
                                  <span className="text-[10px] font-medium hidden sm:block">Not available</span>
                                </div>
                              )}
                            </div>
                          )}
                          {apts.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {apts.map((cell) => (
                                <div
                                  key={cell.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedAppointment(cell)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedAppointment(cell);
                                    }
                                  }}
                                  className={`rounded-lg p-2 sm:p-2.5 min-h-[64px] sm:min-h-[72px] border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-shadow shadow-sm text-sm ${CARD_STYLES[cell.status]}`}
                                >
                                  <AppointmentCard cell={cell} />
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
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search by patient name"
                value={logSearch}
                onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                className="rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground min-w-[100px]"
                value={logDateFilter}
                onChange={(e) => { setLogDateFilter(e.target.value); setLogPage(1); }}
              >
                <option value="All">Date</option>
                <option value="Today">Today</option>
                <option value="Next 7 days">Next 7 days</option>
              </select>
              <select
                className="rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground min-w-[100px]"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setLogPage(1); }}
              >
                <option value="Status">Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Check-in">Check-in</option>
                <option value="Completed">Completed</option>
                <option value="Not seen">Not seen</option>
              </select>
              <select
                className="rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground min-w-[120px]"
                value={dentistFilter}
                onChange={(e) => { setDentistFilter(e.target.value); setLogPage(1); }}
              >
                <option value="All Dentist">Doctor</option>
                {DENTISTS.map((d, i) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name} {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto border border-border rounded-lg sm:rounded-xl bg-card overscroll-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-10 py-2.5 sm:py-3 px-2 sm:px-3 text-left">
                    <input
                      type="checkbox"
                      checked={logPaginated.length > 0 && logSelectedIds.size === logPaginated.length}
                      onChange={logSelectAll}
                      className="rounded border-input"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-muted-foreground">Appointment Date</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-muted-foreground">Dentist Assigned</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-muted-foreground">Treatments</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="w-12 py-2.5 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {logPaginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
                      No appointments match the filters.
                    </td>
                  </tr>
                ) : (
                  logPaginated.map((apt) => {
                    const dentist = DENTISTS.find((d) => d.id === apt.dentistId);
                    const { icon: Icon, bg } = STATUS_CONFIG[apt.status];
                    const dateFormatted = new Date(apt.date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const timeDisplay = (() => {
                      const [h, m] = apt.start.split(':').map(Number);
                      const am = (h ?? 0) < 12;
                      const h12 = (h ?? 0) % 12 || 12;
                      return `${h12}:${String(m ?? 0).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
                    })();
                    const isMenuOpen = logActionMenuId === apt.id;
                    return (
                      <tr key={apt.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                        <td className="py-2 px-2 sm:px-3 align-middle">
                          <input
                            type="checkbox"
                            checked={logSelectedIds.has(apt.id)}
                            onChange={() => logToggleOne(apt.id)}
                            className="rounded border-input"
                            aria-label={`Select ${apt.patientName}`}
                          />
                        </td>
                        <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm align-middle">
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(apt)}
                            className="text-primary hover:underline text-left font-medium truncate max-w-[120px] sm:max-w-[160px] block"
                          >
                            {apt.patientName}
                          </button>
                        </td>
                        <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-foreground align-middle">
                          <div>{dateFormatted}</div>
                          <div className="text-muted-foreground">{timeDisplay}</div>
                        </td>
                        <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-[140px] align-middle">
                          {dentist?.name ?? '-'}
                        </td>
                        <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-[140px] align-middle">
                          {apt.service}
                        </td>
                        <td className="py-2 px-2 sm:px-3 align-middle">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium',
                            apt.status === 'Scheduled' && 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700',
                            apt.status === 'Check-in' && 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700',
                            apt.status === 'Completed' && 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
                            apt.status === 'Not seen' && 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700'
                          )}>
                            <Icon className="w-3 h-3 shrink-0" />
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:px-3 align-middle relative">
                          <button
                            type="button"
                            onClick={() => setLogActionMenuId(isMenuOpen ? null : apt.id)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground"
                            aria-label="Actions"
                            aria-expanded={isMenuOpen}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                aria-hidden
                                onClick={() => setLogActionMenuId(null)}
                              />
                              <div
                                className="absolute right-2 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-popover text-popover-foreground shadow-md py-1"
                                role="menu"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => { setSelectedAppointment(apt); setLogActionMenuId(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 focus:bg-primary/10 focus:outline-none text-left font-medium"
                                >
                                  View details
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={apt.status === 'Completed'}
                                  onClick={() => {
                                    if (apt.status !== 'Completed') {
                                      setAppointmentToEdit(apt);
                                      setEditAppointmentOpen(true);
                                      setLogActionMenuId(null);
                                    }
                                  }}
                                  className={cn(
                                    'flex w-full items-center gap-2 px-3 py-2 text-sm focus:outline-none text-left',
                                    apt.status === 'Completed'
                                      ? 'cursor-not-allowed opacity-60 text-muted-foreground'
                                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10'
                                  )}
                                  title={apt.status === 'Completed' ? 'Edit appointment is disabled for completed appointments.' : undefined}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={apt.status === 'Completed'}
                                  onClick={() => {
                                    if (apt.status !== 'Completed') {
                                      setAppointmentsList((prev) =>
                                        prev.map((a) => (a.id === apt.id ? { ...a, status: 'Not seen' as const } : a))
                                      );
                                      setLogActionMenuId(null);
                                    }
                                  }}
                                  className={cn(
                                    'flex w-full items-center gap-2 px-3 py-2 text-sm focus:outline-none text-left',
                                    apt.status === 'Completed'
                                      ? 'cursor-not-allowed opacity-60 text-muted-foreground'
                                      : 'text-destructive hover:bg-destructive/10 focus:bg-destructive/10'
                                  )}
                                  title={apt.status === 'Completed' ? 'Cancel is disabled for completed appointments.' : undefined}
                                >
                                  Cancel appointment
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 sm:py-4 flex-shrink-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {logTotalCount === 0
                ? 'Showing 0 of 0'
                : `Showing ${(logPage - 1) * logRowsPerPage + 1}-${Math.min(logPage * logRowsPerPage, logTotalCount)} of ${logTotalCount}`}
            </p>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  disabled={logPage <= 1}
                  className="h-8 px-2 sm:px-3 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                >
                  &lt; Previous
                </Button>
                {logTotalPages <= 5
                  ? Array.from({ length: logTotalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={logPage === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogPage(p)}
                        className={cn(
                          'h-8 w-8 p-0 text-xs min-w-8',
                          logPage !== p && 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary'
                        )}
                      >
                        {p}
                      </Button>
                    ))
                  : (
                    <>
                      {[1, 2, 3].map((p) => (
                        <Button
                          key={p}
                          variant={logPage === p ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLogPage(p)}
                          className={cn(
                            'h-8 w-8 p-0 text-xs min-w-8',
                            logPage !== p && 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          {p}
                        </Button>
                      ))}
                      <span className="px-1 text-muted-foreground text-xs">...</span>
                      <Button
                        variant={logPage === logTotalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogPage(logTotalPages)}
                        className={cn(
                          'h-8 w-8 p-0 text-xs min-w-8',
                          logPage !== logTotalPages && 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary'
                        )}
                      >
                        {logTotalPages}
                      </Button>
                    </>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
                  disabled={logPage >= logTotalPages}
                  className="h-8 px-2 sm:px-3 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                >
                  Next &gt;
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
                <select
                  value={logRowsPerPage}
                  onChange={(e) => { setLogRowsPerPage(Number(e.target.value)); setLogPage(1); }}
                  className="rounded-md border border-input bg-background h-8 px-2 text-xs text-foreground"
                >
                  <option value={5}>5</option>
                  <option value={9}>9</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
