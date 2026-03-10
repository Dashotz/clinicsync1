'use client';

import React, { useMemo, useState } from 'react';
import { Download, MoreVertical, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/features/appointments/lib/types';
import { DENTISTS, STATUS_CONFIG, VALID_STATUSES } from '@/features/appointments/lib/constants';
import { formatDateDisplay, formatTimeRange, getTodayStr, parseTime, parseTimeTo24, addOneHour } from '@/features/appointments/lib/utils';
import type { NewAppointmentSavedData } from '@/features/appointments/components/new-appointment-modal';
import { NewAppointmentModal } from '@/features/appointments/components/new-appointment-modal';
import { AppointmentDetailsModal } from '@/features/appointments/components/appointment-details-modal';
import { EditAppointmentModal } from '@/features/appointments/components/edit-appointment-modal';

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

function sortByDateThenTimeDesc(list: Appointment[]): Appointment[] {
  return [...list].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return parseTime(b.start) - parseTime(a.start);
  });
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'log'>('calendar');
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(() => sortByDateThenTimeDesc(getAllMockAppointments()));

  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const [query, setQuery] = useState('');
  const [dentistFilter, setDentistFilter] = useState<string>('All Dentist');
  const [statusFilter, setStatusFilter] = useState<string>('Status');

  const filtered = useMemo(() => {
    let list = [...appointmentsList];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((a) => a.patientName.toLowerCase().includes(q));

    if (dentistFilter !== 'All Dentist') {
      const id = Number(dentistFilter);
      if (!Number.isNaN(id)) list = list.filter((a) => a.dentistId === id);
    }
    if (statusFilter !== 'Status' && VALID_STATUSES.includes(statusFilter as AppointmentStatus)) {
      list = list.filter((a) => a.status === (statusFilter as AppointmentStatus));
    }
    return sortByDateThenTimeDesc(list);
  }, [appointmentsList, query, dentistFilter, statusFilter]);

  const patientOptions = useMemo(
    () => [...new Set(appointmentsList.map((a) => a.patientName))].sort(),
    [appointmentsList]
  );

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-3 sm:p-6 lg:p-8 bg-background">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 flex-shrink-0">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground">Appointment</h1>
        <Button className="w-full sm:w-fit shrink-0" onClick={() => setNewAppointmentOpen(true)}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Appointment
          </span>
        </Button>
      </header>

      <div className="flex border-b border-border mb-3 sm:mb-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={cn(
            'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors',
            activeTab === 'calendar'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Calendar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('log')}
          className={cn(
            'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors',
            activeTab === 'log'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Appointment log
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search by patient name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            className="rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground min-w-[120px]"
            value={dentistFilter}
            onChange={(e) => setDentistFilter(e.target.value)}
          >
            <option value="All Dentist">Doctor</option>
            {DENTISTS.map((d, i) => (
              <option key={d.id} value={String(d.id)}>
                {d.name} {i + 1}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground min-w-[110px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Status">Status</option>
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Calendar tab = grouped list by date (keeps it simple/scalable) */}
      {activeTab === 'calendar' && (
        <div className="flex-1 min-h-0 overflow-auto border border-border rounded-lg sm:rounded-xl bg-card">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No appointments match the filters.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((apt) => {
                const dentist = DENTISTS.find((d) => d.id === apt.dentistId);
                const { icon: Icon } = STATUS_CONFIG[apt.status];
                return (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => setSelectedAppointment(apt)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-medium text-foreground truncate">{apt.patientName}</p>
                          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium', STATUS_CONFIG[apt.status].badge)}>
                            <Icon className="w-3 h-3 shrink-0" />
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateDisplay(apt.date)} • {formatTimeRange(apt.start, apt.end)} • {dentist?.name ?? '-'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{apt.service}</p>
                      </div>
                      <span className="text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Log tab = same data, table view */}
      {activeTab === 'log' && (
        <div className="flex-1 min-h-0 overflow-auto border border-border rounded-lg sm:rounded-xl bg-card">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Appointment Date</th>
                <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Dentist Assigned</th>
                <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Treatments</th>
                <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="w-12 py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No appointments match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => {
                  const dentist = DENTISTS.find((d) => d.id === apt.dentistId);
                  const { icon: Icon } = STATUS_CONFIG[apt.status];
                  return (
                    <tr key={apt.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                      <td className="py-2 px-3 text-sm font-medium text-primary">
                        <button type="button" onClick={() => setSelectedAppointment(apt)} className="hover:underline">
                          {apt.patientName}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-sm text-foreground">
                        <div>{formatDateDisplay(apt.date)}</div>
                        <div className="text-muted-foreground text-xs">{formatTimeRange(apt.start, apt.end)}</div>
                      </td>
                      <td className="py-2 px-3 text-sm text-muted-foreground">{dentist?.name ?? '-'}</td>
                      <td className="py-2 px-3 text-sm text-muted-foreground">{apt.service}</td>
                      <td className="py-2 px-3">
                        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', STATUS_CONFIG[apt.status].badge)}>
                          <Icon className="w-3 h-3 shrink-0" />
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                          aria-label="Edit"
                          onClick={() => {
                            setAppointmentToEdit(apt);
                            setEditAppointmentOpen(true);
                          }}
                          disabled={apt.status === 'Completed'}
                          title={apt.status === 'Completed' ? 'Edit appointment is disabled for completed appointments.' : undefined}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <NewAppointmentModal
        open={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        preselected={null}
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
          setAppointmentsList((prev) => sortByDateThenTimeDesc([...prev, newAppointment]));
        }}
      />

      <AppointmentDetailsModal
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
        appointment={selectedAppointment}
        dentistName={selectedAppointment ? (DENTISTS.find((d) => d.id === selectedAppointment.dentistId)?.name ?? '') : ''}
        onStatusChange={(id, newStatus) => {
          setAppointmentsList((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
          setSelectedAppointment((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
        }}
        onMedicalRecordSaved={(id, data) => {
          const service = data.treatments.join(', ');
          const teeth = data.selectedTeeth;
          setAppointmentsList((prev) => prev.map((a) => (a.id === id ? { ...a, service, teeth } : a)));
          setSelectedAppointment((prev) => (prev && prev.id === id ? { ...prev, service, teeth } : prev));
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
        patientOptions={patientOptions}
        onSave={(appointmentId, updates) => {
          setAppointmentsList((prev) =>
            prev.map((a) =>
              a.id === appointmentId
                ? { ...a, patientName: updates.patientName, date: updates.date, start: updates.start, end: updates.end, service: updates.service }
                : a
            )
          );
          setSelectedAppointment((prev) =>
            prev?.id === appointmentId
              ? { ...prev, patientName: updates.patientName, date: updates.date, start: updates.start, end: updates.end, service: updates.service }
              : prev
          );
        }}
      />
    </div>
  );
}

