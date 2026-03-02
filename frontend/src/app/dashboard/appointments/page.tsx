'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  User,
  Check,
  XCircle,
  Plus,
  Ban,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { cn } from '@/lib/utils';
import { NewAppointmentModal, type NewAppointmentSavedData } from './NewAppointmentModal';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

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
  date: string; // YYYY-MM-DD
  teeth?: number[];
};

const DENTISTS = [
  { id: 1, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 2, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 3, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 4, name: 'Dr. Ang Avatar', initials: 'AA' },
];

// Mock appointments (Jan 6, 2026)
const MOCK_APPOINTMENTS_JAN6: Appointment[] = [
  { id: '1', dentistId: 1, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled', date: '2026-01-06' },
  { id: '2', dentistId: 2, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Root canal treatment', status: 'Check-in', date: '2026-01-06' },
  { id: '3', dentistId: 2, patientName: 'Ivary Lapina', start: '9:00', end: '9:30', service: 'Cleaning', status: 'Not seen', date: '2026-01-06' },
  { id: '4', dentistId: 2, patientName: 'John Llyod', start: '9:30', end: '10:00', service: 'General check-up', status: 'Scheduled', date: '2026-01-06' },
  { id: '5', dentistId: 3, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Completed', date: '2026-01-06' },
  { id: '6', dentistId: 4, patientName: 'Ivary Lapina', start: '9:00', end: '10:00', service: 'Cleaning', status: 'Scheduled', date: '2026-01-06' },
];

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Parse "9:00 AM" / "1:30 PM" to 24h "09:00" / "13:30" */
function parseTimeTo24(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  let hour = Number(match[1]);
  const min = match[2];
  const pm = match[3].toUpperCase() === 'PM';
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${min}`;
}

/** Add 1 hour to "HH:MM" */
function addOneHour(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

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

const INITIAL_APPOINTMENTS = getAllMockAppointments();

const NOT_AVAILABLE_SLOTS: { dentistId: number; slotIndex: number }[] = [
  { dentistId: 1, slotIndex: 2 },
];

const VALID_STATUSES: readonly AppointmentStatus[] = ['Scheduled', 'Check-in', 'Completed', 'Not seen'];

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { icon: typeof Clock; bg: string; iconCircle: string; statusText: string }
> = {
  Scheduled: {
    icon: Clock,
    bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    iconCircle: 'bg-amber-700 text-white dark:bg-amber-600',
    statusText: 'text-amber-800 dark:text-amber-200',
  },
  'Check-in': {
    icon: User,
    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
    iconCircle: 'bg-emerald-600 text-white dark:bg-emerald-500',
    statusText: 'text-emerald-800 dark:text-emerald-200',
  },
  Completed: {
    icon: Check,
    bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    iconCircle: 'bg-green-600 text-white dark:bg-green-500',
    statusText: 'text-green-800 dark:text-green-200',
  },
  'Not seen': {
    icon: XCircle,
    bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    iconCircle: 'bg-red-600 text-white dark:bg-red-500',
    statusText: 'text-red-800 dark:text-red-200',
  },
};

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

const CARD_STYLES: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-amber-50/90 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50',
  'Check-in': 'bg-emerald-50/90 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50',
  Completed: 'bg-green-50/90 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
  'Not seen': 'bg-red-50/90 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50',
};

function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const am = h < 12;
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${am ? 'am' : 'pm'}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
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

  const appointments = useMemo(() => {
    let list = appointmentsList.filter((apt) => apt.date === selectedDateStr);
    if (dentistFilter !== 'All Dentist') {
      const dentistId = Number(dentistFilter);
      const validIds = new Set(DENTISTS.map((d) => d.id));
      if (!Number.isNaN(dentistId) && validIds.has(dentistId)) {
        list = list.filter((apt) => apt.dentistId === dentistId);
      }
    }
    if (statusFilter !== 'Status' && VALID_STATUSES.includes(statusFilter as AppointmentStatus)) {
      list = list.filter((apt) => apt.status === statusFilter);
    }
    return list;
  }, [appointmentsList, selectedDateStr, dentistFilter, statusFilter]);
  const totalCount = appointments.length;

  const logAppointments = useMemo(() => {
    let list = [...appointmentsList];
    if (dentistFilter !== 'All Dentist') {
      const dentistId = Number(dentistFilter);
      const validIds = new Set(DENTISTS.map((d) => d.id));
      if (!Number.isNaN(dentistId) && validIds.has(dentistId)) {
        list = list.filter((apt) => apt.dentistId === dentistId);
      }
    }
    if (statusFilter !== 'Status' && VALID_STATUSES.includes(statusFilter as AppointmentStatus)) {
      list = list.filter((apt) => apt.status === statusFilter);
    }
    return list.sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : (parseTime(b.start) - parseTime(a.start));
    });
  }, [appointmentsList, dentistFilter, statusFilter]);
  const logTotalCount = logAppointments.length;

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
      const key = `${dentistId}-${slotIndex}`;
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
    const key = `${dentistId}-${slotIndex}`;
    setUserNotAvailableSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else {
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
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 bg-background">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Appointment</h1>
        <Button className="w-fit shrink-0" onClick={() => setNewAppointmentOpen(true)}>
          + New Appointment
        </Button>
        <NewAppointmentModal
          open={newAppointmentOpen}
          onOpenChange={setNewAppointmentOpen}
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
        />
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
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 mb-4 flex-shrink-0">
            <span className="text-sm text-muted-foreground order-2 sm:order-1">{totalCount} Total appointments</span>
            <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={goToday} className={isToday ? 'bg-primary/10 border-primary/30' : ''}>
                Today
              </Button>
              <ButtonGroup className="inline-flex border border-input rounded-md bg-background shadow-sm [&>*]:-ml-px [&>*]:rounded-none [&>*:first-child]:rounded-l-[5px] [&>*:last-child]:rounded-r-[5px] [&>*:first-child]:ml-0">
                <Button variant="outline" size="icon" onClick={goPrevDay} aria-label="Previous day">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <ButtonGroupText className="min-w-[120px] text-center font-medium text-foreground border border-transparent border-l-border bg-background h-9 flex items-center justify-center">
                  {dateLabel}
                </ButtonGroupText>
                <Button variant="outline" size="icon" onClick={goNextDay} aria-label="Next day">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </ButtonGroup>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
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
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
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
            <Button variant="outline" size="sm" className="gap-2 justify-self-end order-3">
              <Download className="w-4 h-4" />
              Download Calendar
            </Button>
          </div>

          <div
            ref={tableScrollRef}
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
                  const slotStart = SLOT_HOURS[slotIdx];
                  const slotEnd = SLOT_HOURS[slotIdx + 1] ?? slotStart + 1;
                  const isCurrentTime = isToday && currentHour >= slotStart && currentHour < slotEnd;
                  const fractionThroughSlot = isCurrentTime
                    ? (currentHour - slotStart) / (slotEnd - slotStart)
                    : 0;
                  return (
                  <tr key={label} className="border-b border-border last:border-b-0 relative">
                    <td className="py-2 pl-3 text-sm text-muted-foreground align-top w-20 sm:w-24 relative">
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
                      const isUserMarkedNotAvailable = userNotAvailableSlots.has(`${d.id}-${slotIdx}`);
                      const apts = cellList.filter((c): c is Appointment => c !== 'not-available');
                      return (
                        <td key={d.id} className="relative p-2 align-top border-l border-border first:border-l-0 overflow-hidden min-h-[60px]">
                          {(cellList.length === 0 || isNotAvailable) && (
                            <div
                              className={cn(
                                'absolute inset-0 flex gap-0.5 rounded-lg',
                                isNotAvailable && 'bg-red-500/5'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setNewAppointmentOpen(true)}
                                className="group flex-1 min-w-0 rounded-l-lg flex items-center justify-center text-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset transition-colors cursor-pointer"
                                aria-label="Create new appointment"
                              >
                                <Plus className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const key = `${d.id}-${slotIdx}`;
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
                                  className={`rounded-lg p-2.5 min-h-[72px] border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-shadow shadow-sm ${CARD_STYLES[cell.status]}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 mb-4 flex-shrink-0">
            <span className="text-sm text-muted-foreground order-2 sm:order-1">{logTotalCount} Total appointments</span>
            <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap order-1 sm:order-2">
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
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
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
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
            <Button variant="outline" size="sm" className="gap-2 justify-self-end order-3">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto border border-border rounded-xl bg-card overscroll-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-3 px-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="py-3 px-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                  <th className="py-3 px-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                  <th className="py-3 px-3 text-left text-xs font-medium text-muted-foreground">Dentist</th>
                  <th className="py-3 px-3 text-left text-xs font-medium text-muted-foreground">Service</th>
                  <th className="py-3 px-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {logAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No appointments match the filters.
                    </td>
                  </tr>
                ) : (
                  logAppointments.map((apt) => {
                    const dentist = DENTISTS.find((d) => d.id === apt.dentistId);
                    const { icon: Icon, bg } = STATUS_CONFIG[apt.status];
                    const dateFormatted = new Date(apt.date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    return (
                      <tr key={apt.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                        <td className="py-2 px-3 text-sm text-foreground">{dateFormatted}</td>
                        <td className="py-2 px-3 text-sm text-muted-foreground">
                          {apt.start} - {apt.end}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-foreground truncate max-w-[140px]">{apt.patientName}</td>
                        <td className="py-2 px-3 text-sm text-muted-foreground truncate max-w-[120px]">{dentist?.name ?? '-'}</td>
                        <td className="py-2 px-3 text-sm text-muted-foreground truncate max-w-[140px]">{apt.service}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${bg}`}>
                            <Icon className="w-3 h-3" />
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
