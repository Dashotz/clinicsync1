'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Stethoscope, Clock, MoreHorizontal, ClipboardList, Info, Trash2, Pencil, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '../lib/types';
import { formatDateDisplay, formatTimeRangeLong } from '../lib/utils';
import { STATUS_CONFIG } from '../lib/constants';
import { AddMedicalRecordModal } from './AddMedicalRecordModal';
import { TreatmentSummaryModal } from './TreatmentSummaryModal';
import { ToothChart, type ToothStatus } from './ToothChart';

/** Mock per-patient tooth status from previous visits (has_treatment) and current/pending (pending). */
const MOCK_PATIENT_TOOTH_HISTORY: Record<string, Partial<Record<number, ToothStatus>>> = {
  'Ivary Lapina': { 12: 'has_treatment', 20: 'pending' },
  'John Llyod': { 3: 'has_treatment', 14: 'has_treatment', 19: 'pending' },
  'Patient A': { 8: 'pending', 25: 'has_treatment' },
  'Patient B': {},
  'Patient C': { 30: 'has_treatment' },
  'Patient D': {},
};

/** Mock per-patient per-tooth history lines (for "click to view" panel). */
const MOCK_TOOTH_HISTORY_DETAILS: Record<string, Partial<Record<number, string[]>>> = {
  'Ivary Lapina': {
    12: ['Root canal treatment – Jan 2025', 'Filling – Dec 2024'],
    20: ['Planned: Extraction – current visit'],
  },
  'John Llyod': {
    3: ['Extraction – Nov 2024'],
    14: ['Filling – Oct 2024'],
    19: ['Planned: Crown – current visit'],
  },
  'Patient A': { 25: ['Cleaning – Sep 2024'] },
  'Patient C': { 30: ['Filling – Aug 2024'] },
};

type PatientInfo = {
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
};

const MOCK_PATIENT_INFO: Record<string, PatientInfo> = {
  'Ivary Lapina': {
    fullName: 'Ivary Lapina',
    age: 24,
    gender: 'Male',
    phone: '+63945498765',
    email: 'ivary@gmail.com',
    address: '1332 Maliksi 2, Bacoor Strike',
  },
  'John Llyod': {
    fullName: 'John Llyod',
    age: 30,
    gender: 'Male',
    phone: '+63912345678',
    email: 'john@example.com',
    address: '456 Sample St, City',
  },
  'Patient A': { fullName: 'Patient A', age: 28, gender: 'Female', phone: '-', email: '-', address: '-' },
  'Patient B': { fullName: 'Patient B', age: 35, gender: 'Male', phone: '-', email: '-', address: '-' },
  'Patient C': { fullName: 'Patient C', age: 22, gender: 'Female', phone: '-', email: '-', address: '-' },
  'Patient D': { fullName: 'Patient D', age: 40, gender: 'Male', phone: '-', email: '-', address: '-' },
};

type TabId = 'general' | 'medical' | 'more';
type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  dentistName: string;
  onStatusChange?: (appointmentId: string, newStatus: AppointmentStatus) => void;
  /** Called when a medical record is saved; use to update appointment treatment in the list */
  onMedicalRecordSaved?: (appointmentId: string, data: { treatments: string[]; selectedTeeth: number[] }) => void;
  /** Called when user chooses to delete the appointment; close modal and remove from list */
  onDelete?: (appointmentId: string) => void;
};

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  dentistName,
  onStatusChange,
  onMedicalRecordSaved,
  onDelete,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [addMedicalRecordOpen, setAddMedicalRecordOpen] = useState(false);
  const [treatmentSummaryOpen, setTreatmentSummaryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentTooltipOpen, setPaymentTooltipOpen] = useState(false);
  const [selectedToothForHistory, setSelectedToothForHistory] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setMenuOpen(false);
      setSelectedToothForHistory(null);
    }
  }, [open]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (!appointment) return null;

  const patientInfo = MOCK_PATIENT_INFO[appointment.patientName] ?? {
    fullName: appointment.patientName,
    age: 0,
    gender: '-',
    phone: '-',
    email: '-',
    address: '-',
  };

  const handleMarkNotSeen = () => {
    onStatusChange?.(appointment.id, 'Not seen');
    onOpenChange(false);
  };

  const handleMarkCheckIn = () => {
    onStatusChange?.(appointment.id, 'Check-in');
    onOpenChange(false);
  };

  const handleComplete = () => {
    onStatusChange?.(appointment.id, 'Completed');
    onOpenChange(false);
  };

  const handleCompleteClick = () => {
    if (appointment.status === 'Check-in') {
      setTreatmentSummaryOpen(true);
    } else {
      handleComplete();
    }
  };

  const handleSaveContinue = () => {
    handleComplete();
    setTreatmentSummaryOpen(false);
  };

  const tabs = useMemo<{ id: TabId; label: string }[]>(() => [
    { id: 'general', label: 'General Info' },
    { id: 'medical', label: 'Medical History' },
    ...(appointment.status === 'Completed' ? [{ id: 'more' as const, label: 'More Info' }] : []),
  ], [appointment.status]);

  /** Mock billing for completed appointments (would come from API) */
  const billNumber = '23211';
  const billTotal = 2300;
  const paymentStatus: PaymentStatus = 'Partially Paid' as PaymentStatus;
  /** Mock last payment for tooltip (would come from API) */
  const lastPayment =
    paymentStatus === 'Unpaid'
      ? null
      : { amount: paymentStatus === 'Paid' ? billTotal : 500, date: paymentStatus === 'Paid' ? 'Jan 6, 2026' : 'Jan 5, 2026' };
  const paymentStatusTooltip =
    paymentStatus === 'Unpaid'
      ? 'No payments yet'
      : paymentStatus === 'Paid'
        ? `Fully paid on ${lastPayment!.date}`
        : `Last payment (₱${lastPayment!.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}) on ${lastPayment!.date}`;

  const statusStyle = STATUS_CONFIG[appointment.status];
  const StatusIcon = statusStyle.icon;

  const medicalToothStatus = useMemo<Partial<Record<number, ToothStatus>>>(() => {
    const fromHistory = MOCK_PATIENT_TOOTH_HISTORY[appointment.patientName] ?? {};
    const fromVisit = (appointment.teeth ?? []).reduce<Partial<Record<number, ToothStatus>>>(
      (acc, t) => ({ ...acc, [t]: fromHistory[t] ?? 'pending' }),
      {}
    );
    return { ...fromHistory, ...fromVisit };
  }, [appointment.patientName, appointment.teeth]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} fullHeight className="w-full flex justify-end">
      <DialogContent className="pointer-events-auto w-full max-w-[calc(100%-1rem)] sm:max-w-md h-full overflow-y-auto flex flex-col rounded-xl sm:rounded-l-xl sm:rounded-r-none border border-border sm:border-r p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <DialogHeader className="p-0 min-w-0">
            <DialogTitle className="text-base sm:text-lg truncate pr-2">Appointment details</DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="h-8 w-8 shrink-0 -mr-1 -mt-1 sm:-mr-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 sm:mt-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{patientInfo.fullName}</h3>
            <span
              className={cn(
                'inline-flex items-center gap-1 sm:gap-1.5 rounded-md border px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium shrink-0',
                statusStyle.badge
              )}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${statusStyle.iconCircle}`}>
                <StatusIcon className="h-2.5 w-2.5" />
              </span>
              {appointment.status}
            </span>
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              aria-label="More options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-popover text-popover-foreground shadow-md py-1"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onDelete?.(appointment.id);
                    onOpenChange(false);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive destructive-shine hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  Delete appointment
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-foreground truncate">{appointment.service}</span>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-foreground truncate">{dentistName}</span>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-foreground">{formatDateDisplay(appointment.date)}</p>
              <p className="text-muted-foreground text-xs">{formatTimeRangeLong(appointment.start, appointment.end)}</p>
            </div>
          </div>
        </div>

        {appointment.status === 'Completed' && (
          <div className="mt-5 sm:mt-6 pl-5 border-l-4 border-red-500/80 flex flex-nowrap items-center gap-2 min-w-0 w-full py-1">
            <span className="text-xs font-medium text-foreground shrink-0">Bill # {billNumber}</span>
            <div className="relative shrink-0">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium cursor-default',
                  paymentStatus === 'Unpaid'
                    ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
                    : paymentStatus === 'Partially Paid'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                )}
                onMouseEnter={() => setPaymentTooltipOpen(true)}
                onMouseLeave={() => setPaymentTooltipOpen(false)}
              >
                {paymentStatus}
              </span>
              {paymentTooltipOpen && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2.5 py-1.5 rounded-md bg-zinc-800 text-zinc-100 text-xs font-normal shadow-lg whitespace-nowrap pointer-events-none"
                  role="tooltip"
                >
                  {paymentStatusTooltip}
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground shrink-0">Total P {billTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            <Button type="button" size="sm" className="gap-1 shrink-0 h-6 px-2 text-[10px] font-medium ml-auto">
              <DollarSign className="h-3 w-3 shrink-0" />
              + Record Payment
            </Button>
          </div>
        )}

        <div className="mt-4 sm:mt-6 border-t border-border pt-3 sm:pt-4 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex gap-3 sm:gap-4 border-b border-border shrink-0">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'pb-2 text-xs sm:text-sm font-medium -mb-px border-b-2 transition-colors',
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <div className="mt-3 sm:mt-4 overflow-y-auto min-h-0">
              <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">General info</h4>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Full Name</span>
                <span className="text-foreground text-right truncate min-w-0 pl-2">{patientInfo.fullName}</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Age</span>
                <span className="text-foreground">{patientInfo.age || '-'}</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Gender</span>
                <span className="text-foreground">{patientInfo.gender}</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Phone Number</span>
                <span className="text-foreground break-all min-w-0">{patientInfo.phone}</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Email Address</span>
                <span className="text-foreground break-all text-right min-w-0 pl-2">{patientInfo.email}</span>
              </div>
              <div className="flex justify-between gap-2 sm:gap-4">
                <span className="text-muted-foreground shrink-0">Address</span>
                <span className="text-foreground text-right break-words min-w-0 pl-2">{patientInfo.address}</span>
              </div>
              </div>
            </div>
          )}
          {activeTab === 'medical' && (
            <div className="mt-3 sm:mt-4 overflow-y-auto min-h-0 flex flex-col gap-3 sm:gap-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
                Patient medical data shown here is based on previous visits.
              </p>
              <h4 className="text-xs sm:text-sm font-medium text-foreground">Medical History</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Click a tooth to view its medical history.</p>
              <div className="flex-1 min-h-[220px] sm:min-h-[280px] flex flex-col">
                <ToothChart
                  selectedTeeth={[]}
                  onSelectionChange={() => {}}
                  toothStatus={medicalToothStatus}
                  onToothClick={(num) => setSelectedToothForHistory((prev) => (prev === num ? null : num))}
                  hideSelectedHint
                  legendOnlyHistory
                  className="min-h-[200px] sm:min-h-[260px]"
                />
              </div>
              {selectedToothForHistory !== null && (
                <div className="rounded-lg border border-border bg-card p-2.5 sm:p-3 text-xs sm:text-sm">
                  <h5 className="font-medium text-foreground mb-1.5 sm:mb-2">History for tooth #{selectedToothForHistory}</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {(() => {
                      const lines = MOCK_TOOTH_HISTORY_DETAILS[appointment.patientName]?.[selectedToothForHistory] ?? [];
                      return lines.length > 0
                        ? lines.map((line) => <li key={line}>{line}</li>)
                        : <li>No recorded history for this tooth.</li>;
                    })()}
                  </ul>
                </div>
              )}
            </div>
          )}
          {activeTab === 'more' && (
            <div className="mt-3 sm:mt-4 overflow-y-auto min-h-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Additional notes and information for this visit.</p>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-4 shrink-0 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <p className="text-xs font-semibold text-foreground mb-1.5">Note</p>
          <ul className="text-[11px] sm:text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Only Scheduled, Not seen &amp; Check-in status are editable.</li>
            <li>Disable Edit appointment for Completed status.</li>
          </ul>
        </div>

        <div className="mt-4 sm:mt-6 shrink-0 pt-3 sm:pt-4 border-t border-border">
          {appointment.status === 'Completed' ? (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-1.5 text-xs sm:text-sm"
              onClick={() => setAddMedicalRecordOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Edit Medical Record
            </Button>
          ) : appointment.status === 'Check-in' ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={handleMarkNotSeen} className="w-full text-xs sm:text-sm">
                  Mark as Not Seen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 text-primary w-full text-xs sm:text-sm"
                  onClick={() => setAddMedicalRecordOpen(true)}
                >
                  <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  Add Medical Record
                </Button>
              </div>
              <Button type="button" onClick={handleCompleteClick} className="w-full text-xs sm:text-sm">
                Complete
              </Button>
              <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                Add a medical record to complete this visit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={handleMarkNotSeen} className="w-full text-xs sm:text-sm">
                Mark as Not Seen
              </Button>
              <Button type="button" onClick={handleMarkCheckIn} className="w-full text-xs sm:text-sm">
                Mark as Check-in
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <AddMedicalRecordModal
        open={addMedicalRecordOpen}
        onOpenChange={setAddMedicalRecordOpen}
        appointment={appointment}
        onSaveRecord={
          onMedicalRecordSaved
            ? (data) => onMedicalRecordSaved(appointment.id, data)
            : undefined
        }
      />
      <TreatmentSummaryModal
        open={treatmentSummaryOpen}
        onOpenChange={setTreatmentSummaryOpen}
        appointment={appointment}
        onSaveContinue={handleSaveContinue}
      />
    </Dialog>
  );
}
