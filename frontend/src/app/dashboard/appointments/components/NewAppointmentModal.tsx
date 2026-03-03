'use client';

import React, { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarPopover } from '@/components/ui/calendar-popover';
import { cn } from '@/lib/utils';
import { getTodayStr, formatDateDisplay } from '../lib/utils';
import { DENTISTS, TREATMENT_OPTIONS } from '../lib/constants';

const DENTIST_OPTIONS = DENTISTS;
const TREATMENTS = [...TREATMENT_OPTIONS];

const TIME_OPTIONS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM',
];

export type Step1Data = {
  dentistId: string;
  date: string;
  time: string;
  treatment: string;
  notes: string;
};

export type Step2Data = {
  patientName: string;
  age: string;
  gender: 'Male' | 'Female' | '';
  email: string;
  phone: string;
};

const defaultStep1: Step1Data = {
  dentistId: String(DENTIST_OPTIONS[0].id),
  date: getTodayStr(),
  time: '1:00 PM',
  treatment: '',
  notes: '',
};

const defaultStep2: Step2Data = {
  patientName: '',
  age: '',
  gender: '',
  email: '',
  phone: '',
};

export type NewAppointmentSavedData = {
  step1: Step1Data;
  step2: Step2Data;
};

export type NewAppointmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** Called when user saves the new appointment with form data (so parent can add to list) */
  onSave?: (data: NewAppointmentSavedData) => void;
  /** Optional title (default: "New appointment") */
  title?: string;
  /** Optional class for the dialog content (e.g. max width, shadows) */
  contentClassName?: string;
};

export function NewAppointmentModal({
  open,
  onOpenChange,
  onSuccess,
  onSave,
  title = 'New appointment',
  contentClassName,
}: NewAppointmentModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1Data>(defaultStep1);
  const [step2, setStep2] = useState<Step2Data>(defaultStep2);

  const resetForm = () => {
    setStep(1);
    setStep1(defaultStep1);
    setStep2(defaultStep2);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Submit: pass form data to parent so they can add the appointment to the table
      onSave?.({ step1, step2 });
      onSuccess?.();
      handleClose(false);
    }
  };

  const handlePrevious = () => {
    setStep(1);
  };

  const fieldClass = 'space-y-2';
  const inputShadowClass = 'shadow-md shadow-black/5';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn('w-[calc(100%-2rem)] max-w-lg mx-auto', contentClassName)}>
        <div className="flex items-start justify-between gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {/* Step indicator */}
            <div className="flex items-center gap-2 pt-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={cn('text-sm', step >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                Treatment & Dentist
              </span>
              <div className="h-px w-4 bg-border" />
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                2
              </div>
              <span className={cn('text-sm', step >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                Basic Information
              </span>
            </div>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleClose(false)}
            aria-label="Close"
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 px-4 py-4 space-y-4">
          {step === 1 && (
            <>
              <div className={fieldClass}>
                <Label htmlFor="dentist">Assigned Dentist</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                  <Select value={step1.dentistId} onValueChange={(v) => setStep1((s) => ({ ...s, dentistId: v }))}>
                    <SelectTrigger id="dentist" className={cn('w-full pl-9', inputShadowClass)}>
                      <SelectValue placeholder="Select dentist" />
                    </SelectTrigger>
                    <SelectContent>
                      {DENTIST_OPTIONS.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Appointment times are based on the dentist&apos;s schedule.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={fieldClass}>
                  <Label htmlFor="appointment-date">Appointment Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                    <CalendarPopover
                      id="appointment-date"
                      value={step1.date}
                      onChange={(d) => setStep1((s) => ({ ...s, date: d }))}
                      trigger={
                        <span className="block flex-1 truncate text-left">
                          {formatDateDisplay(step1.date) || 'Select date'}
                        </span>
                      }
                      triggerClassName={cn('pl-9', inputShadowClass)}
                    />
                  </div>
                </div>
                <div className={fieldClass}>
                  <Label htmlFor="appointment-time">Appointment Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                    <Select value={step1.time} onValueChange={(v) => setStep1((s) => ({ ...s, time: v }))}>
                      <SelectTrigger id="appointment-time" className={cn('w-full pl-9', inputShadowClass)}>
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
                <Label htmlFor="treatment">Treatment</Label>
                <Select value={step1.treatment || undefined} onValueChange={(v) => setStep1((s) => ({ ...s, treatment: v }))}>
                  <SelectTrigger id="treatment" className={cn('w-full', inputShadowClass)}>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREATMENTS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={fieldClass}>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={step1.notes}
                  onChange={(e) => setStep1((s) => ({ ...s, notes: e.target.value }))}
                  placeholder="Add scheduling notes or special requests"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={fieldClass}>
                <Label htmlFor="patient-name">Patient name</Label>
                <Input
                  id="patient-name"
                  type="text"
                  value={step2.patientName}
                  onChange={(e) => setStep2((s) => ({ ...s, patientName: e.target.value }))}
                  placeholder="Enter or select patient"
                  className={inputShadowClass}
                />
              </div>
              <div className={fieldClass}>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="text"
                  inputMode="numeric"
                  value={step2.age}
                  onChange={(e) => setStep2((s) => ({ ...s, age: e.target.value }))}
                  placeholder="Enter patient age"
                  className={inputShadowClass}
                />
              </div>
              <div className={fieldClass}>
                <Label>Gender</Label>
                <RadioGroup
                  value={step2.gender || undefined}
                  onValueChange={(v) => setStep2((s) => ({ ...s, gender: (v || '') as Step2Data['gender'] }))}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Male" id="gender-male" />
                    <Label htmlFor="gender-male" className="font-normal cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Female" id="gender-female" />
                    <Label htmlFor="gender-female" className="font-normal cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className={fieldClass}>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={step2.email}
                  onChange={(e) => setStep2((s) => ({ ...s, email: e.target.value }))}
                  placeholder="example@gmail.com"
                  className={inputShadowClass}
                />
              </div>
              <div className={fieldClass}>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={step2.phone}
                  onChange={(e) => setStep2((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className={inputShadowClass}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-wrap items-center justify-between sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button type="button" onClick={handleContinue}>
              {step === 1 ? 'Continue' : 'Create appointment'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
