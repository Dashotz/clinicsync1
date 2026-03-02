'use client';

import React, { useState } from 'react';
import { X, Stethoscope, User, Clock, MoreHorizontal, ClipboardList, Check, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AddMedicalRecordModal } from './AddMedicalRecordModal';
import { TreatmentSummaryModal } from './TreatmentSummaryModal';

export type AppointmentStatus = 'Scheduled' | 'Check-in' | 'Completed' | 'Not seen';

export type Appointment = {
  id: string;
  dentistId: number;
  patientName: string;
  start: string;
  end: string;
  service: string;
  status: AppointmentStatus;
  date: string;
  teeth?: number[];
};

type PatientInfo = {
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
};

// Mock patient details for display in General Info
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

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const am = h < 12;
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

type TabId = 'general' | 'medical';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  dentistName: string;
  onStatusChange?: (appointmentId: string, newStatus: AppointmentStatus) => void;
  /** Called when a medical record is saved; use to update appointment treatment in the list */
  onMedicalRecordSaved?: (appointmentId: string, data: { treatments: string[]; selectedTeeth: number[] }) => void;
};

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  dentistName,
  onStatusChange,
  onMedicalRecordSaved,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [addMedicalRecordOpen, setAddMedicalRecordOpen] = useState(false);
  const [treatmentSummaryOpen, setTreatmentSummaryOpen] = useState(false);

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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'general', label: 'General Info' },
    { id: 'medical', label: 'Medical History' },
  ];

  const statusConfig = {
    Scheduled: { icon: Clock, badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700', iconCircle: 'bg-amber-700 text-white dark:bg-amber-600' },
    'Check-in': { icon: User, badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700', iconCircle: 'bg-emerald-600 text-white dark:bg-emerald-500' },
    Completed: { icon: Check, badge: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700', iconCircle: 'bg-green-600 text-white dark:bg-green-500' },
    'Not seen': { icon: XCircle, badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700', iconCircle: 'bg-red-600 text-white dark:bg-red-500' },
  } as const;
  const statusStyle = statusConfig[appointment.status];
  const StatusIcon = statusStyle.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} fullHeight className="w-full flex justify-end">
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md h-full overflow-y-auto flex flex-col rounded-xl sm:rounded-l-xl sm:rounded-r-none border border-border sm:border-r">
        <div className="flex items-start justify-between gap-4">
          <DialogHeader className="p-0">
            <DialogTitle>Appointment details</DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="h-8 w-8 shrink-0 -mr-2 -mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="font-semibold text-foreground text-base">{patientInfo.fullName}</h3>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
                statusStyle.badge
              )}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${statusStyle.iconCircle}`}>
                <StatusIcon className="h-2.5 w-2.5" />
              </span>
              {appointment.status}
            </span>
          </div>
          <button type="button" className="p-1 rounded hover:bg-muted text-muted-foreground shrink-0" aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-foreground">{appointment.service}</span>
          </div>
          <div className="flex items-start gap-3">
            <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-foreground">{dentistName}</span>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground">{formatDate(appointment.date)}</p>
              <p className="text-muted-foreground">{formatTimeRange(appointment.start, appointment.end)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex gap-4 border-b border-border shrink-0">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'pb-2 text-sm font-medium -mb-px border-b-2 transition-colors',
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
            <div className="mt-4 overflow-y-auto min-h-0">
              <h4 className="text-sm font-medium text-foreground mb-3">General info</h4>
              <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Full Name</span>
                <span className="text-foreground text-right">{patientInfo.fullName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Age</span>
                <span className="text-foreground">{patientInfo.age || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Gender</span>
                <span className="text-foreground">{patientInfo.gender}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="text-foreground">{patientInfo.phone}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Email Address</span>
                <span className="text-foreground break-all">{patientInfo.email}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Address</span>
                <span className="text-foreground text-right">{patientInfo.address}</span>
              </div>
              </div>
            </div>
          )}
          {activeTab === 'medical' && (
            <div className="mt-4 text-sm text-muted-foreground">Medical history will appear here.</div>
          )}
        </div>

        <div className="mt-6 shrink-0 pt-4 border-t border-border">
          {appointment.status === 'Check-in' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={handleMarkNotSeen} className="w-full">
                  Mark as Not Seen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 text-primary w-full"
                  onClick={() => setAddMedicalRecordOpen(true)}
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />
                  Add Medical Record
                </Button>
              </div>
              <Button type="button" onClick={handleCompleteClick} className="w-full">
                Complete
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Add a medical record to complete this visit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={handleMarkNotSeen} className="w-full">
                Mark as Not Seen
              </Button>
              <Button type="button" onClick={handleMarkCheckIn} className="w-full">
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
