'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarPopover } from '@/components/ui/calendar-popover';
import { cn } from '@/lib/utils';
import { formatDateDisplay, time24ToDisplay, toTime24, parseTimeTo24, addOneHour } from '../lib/utils';
import type { Appointment } from '../lib/types';
import { DENTISTS, TREATMENT_OPTIONS, TIME_OPTIONS } from '../lib/constants';

export type EditAppointmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  /** Unique patient names for the Patient dropdown (e.g. from appointments list) */
  patientOptions: string[];
  onSave: (appointmentId: string, updates: { patientName: string; date: string; start: string; end: string; service: string; notes?: string }) => void;
};

const inputShadowClass = 'shadow-md shadow-black/5';

export function EditAppointmentModal({
  open,
  onOpenChange,
  appointment,
  patientOptions,
  onSave,
}: EditAppointmentModalProps) {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('9:00 AM');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && appointment) {
      setPatientName(appointment.patientName);
      setDate(appointment.date);
      setTime(time24ToDisplay(toTime24(appointment.start)));
      setTreatment(appointment.service || '');
      setNotes('');
    }
  }, [open, appointment]);

  const handleSave = () => {
    if (!appointment) return;
    const start24 = parseTimeTo24(time);
    const end24 = addOneHour(start24);
    onSave(appointment.id, {
      patientName,
      date,
      start: start24,
      end: end24,
      service: treatment || appointment.service,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  const dentist = appointment ? DENTISTS.find((d) => d.id === appointment.dentistId) : null;
  const patientOptionsWithCurrent = React.useMemo(
    () => (appointment?.patientName ? [...new Set([appointment.patientName, ...patientOptions])] : patientOptions),
    [appointment?.patientName, patientOptions]
  );
  const fieldClass = 'space-y-2';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-xl mx-auto max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6')}>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <DialogHeader className="min-w-0">
            <DialogTitle className="text-base sm:text-lg">Edit appointment</DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 sm:mt-4 rounded-lg border border-border/60 bg-muted/30 px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
          <div className={fieldClass}>
            <Label htmlFor="edit-patient" className="text-xs sm:text-sm">Patient</Label>
            <Select value={patientName} onValueChange={setPatientName}>
              <SelectTrigger id="edit-patient" className={cn('w-full', inputShadowClass)}>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patientOptionsWithCurrent.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={fieldClass}>
            <Label htmlFor="edit-dentist" className="text-xs sm:text-sm">Assigned Dentist</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="edit-dentist"
                readOnly
                value={dentist?.name ?? ''}
                className={cn('pl-9 bg-muted/50 cursor-not-allowed', inputShadowClass)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Appointment times are based on the dentist&apos;s schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className={fieldClass}>
              <Label htmlFor="edit-date" className="text-xs sm:text-sm">Appointment Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <CalendarPopover
                  id="edit-date"
                  value={date}
                  onChange={setDate}
                  trigger={
                    <span className="block flex-1 truncate text-left">
                      {date ? formatDateDisplay(date) : 'Select date'}
                    </span>
                  }
                  triggerClassName={cn('pl-9', inputShadowClass)}
                />
              </div>
            </div>
            <div className={fieldClass}>
              <Label htmlFor="edit-time" className="text-xs sm:text-sm">Appointment Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger id="edit-time" className={cn('w-full pl-9', inputShadowClass)}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className={fieldClass}>
            <Label htmlFor="edit-treatment" className="text-xs sm:text-sm">Treatment (Optional)</Label>
            <Select value={treatment || undefined} onValueChange={setTreatment}>
              <SelectTrigger id="edit-treatment" className={cn('w-full', inputShadowClass)}>
                <SelectValue placeholder="Select treatment" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={fieldClass}>
            <Label htmlFor="edit-notes" className="text-xs sm:text-sm">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add scheduling notes or special requests"
              rows={3}
              className={cn('resize-none', inputShadowClass)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row flex-wrap items-stretch sm:items-center justify-between sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
