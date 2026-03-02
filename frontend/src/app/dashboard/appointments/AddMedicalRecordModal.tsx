'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, Check, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ToothChart } from './ToothChart';
import type { Appointment } from './AppointmentDetailsModal';

const TREATMENT_OPTIONS = [
  'Cleaning',
  'General check-up',
  'Root canal treatment',
  'Filling',
  'Extraction',
  'Whitening',
  'Consultation',
];

const STEPS = [
  { id: 1, label: 'Treatments provided' },
  { id: 2, label: 'Tooth involvement' },
  { id: 3, label: 'Review' },
];

/** Mock pending treatments from previous visits (would come from API) */
const MOCK_PENDING_TREATMENTS = [
  { id: 'p1', name: 'RCT', tooth: 20, startedAt: 'Jan 4, 2026' },
];

export type MedicalRecordSavedData = {
  treatments: string[];
  selectedTeeth: number[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  /** Called when user clicks Save Record; use to update appointment treatment etc. */
  onSaveRecord?: (data: MedicalRecordSavedData) => void;
};

export function AddMedicalRecordModal({ open, onOpenChange, appointment, onSaveRecord }: Props) {
  const [step, setStep] = useState(1);
  const [treatments, setTreatments] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [addTreatmentValue, setAddTreatmentValue] = useState<string>('');
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  /** Step 3: status per new treatment (from step 1) */
  const [newTreatmentStatus, setNewTreatmentStatus] = useState<Record<string, 'done' | 'still_pending'>>({});
  /** Step 3: status per pending treatment (mock from previous visits) */
  const [pendingTreatmentStatus, setPendingTreatmentStatus] = useState<Record<string, 'done' | 'still_pending'>>({});

  // Reset and pre-fill when modal opens/closes
  useEffect(() => {
    if (open && appointment) {
      const service = appointment.service?.trim();
      const initial = service
        ? service.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      setTreatments(initial.length > 0 ? initial : []);
      setStep(1);
      setNotes('');
      setAddTreatmentValue('');
      setSelectedTeeth([]);
      setNewTreatmentStatus({});
      setPendingTreatmentStatus({});
    }
  }, [open, appointment?.id]);

  const removeTreatment = (t: string) => {
    setTreatments((prev) => prev.filter((x) => x !== t));
  };

  const addTreatment = (t: string) => {
    if (t && !treatments.includes(t)) {
      setTreatments((prev) => [...prev, t]);
      setAddTreatmentValue('');
    }
  };

  const availableToAdd = TREATMENT_OPTIONS.filter((t) => !treatments.includes(t));

  const handleContinue = () => {
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    // Step 3: Save record
    onSaveRecord?.({ treatments, selectedTeeth });
    toast.success('Medical record saved for this visit. You can mark this visit now as Complete.');
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="w-[calc(100%-2rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl mx-auto"
    >
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <DialogHeader className="p-0">
            <DialogTitle>Add Medical Record</DialogTitle>
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

        {/* Step indicator - 3 columns, number above text */}
        <div className="grid grid-cols-3 gap-4 pt-2 mt-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 text-center">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  step > s.id ? 'bg-primary text-primary-foreground' : step === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.id ? '✓' : s.id}
              </div>
              <span
                className={cn(
                  'text-sm',
                  step >= s.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h3 className="text-base font-semibold text-foreground mt-6">Treatments provided</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Confirm or update the treatments provided during this visit.
            </p>

            <div className="space-y-2 mt-4">
              <Label>Treatment</Label>
              <div className="flex flex-wrap gap-2 min-h-[36px] rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                {treatments.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTreatment(t)}
                      className="rounded hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${t}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <Select value={addTreatmentValue} onValueChange={(v) => addTreatment(v)}>
                  <SelectTrigger className="w-[140px] h-7 border-0 shadow-none focus:ring-0 p-0 gap-1">
                    <SelectValue placeholder="Add treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        All added
                      </SelectItem>
                    ) : (
                      availableToAdd.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                The scheduled treatment is pre-filled. You can add or remove treatments if needed.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add note or remarks about this visit"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="mt-6 flex flex-col min-h-0 flex-1 text-center">
            <h3 className="text-base font-semibold text-foreground">Tooth involvement</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Assign teeth to each treatment, if applicable.
            </p>
            {treatments.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {treatments.map((t) => (
                  <span
                    key={t}
                    className="inline-flex rounded-lg border border-border bg-muted/80 px-4 py-2 text-sm font-medium text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-card flex flex-col min-h-[280px]" style={{ aspectRatio: '450/700' }}>
              <ToothChart
                selectedTeeth={selectedTeeth}
                onSelectionChange={setSelectedTeeth}
                className="flex-1 min-h-0 w-full"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
              <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <p>
                Patient medical data is based on previous visits. Review and update it as needed for today.
              </p>
            </div>

            <h3 className="text-base font-semibold text-foreground">Review</h3>
            <p className="text-sm text-muted-foreground">
              Review the treatments and confirm their status for this visit. Mark a treatment as{' '}
              <span className="font-medium text-orange-600 dark:text-orange-400">Still Pending</span> if additional
              visits are needed to complete it.
            </p>

            {/* New treatments provided */}
            {treatments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  New treatments provided ({treatments.length})
                </h4>
                <div className="space-y-2">
                  {treatments.map((t) => {
                    const status = newTreatmentStatus[t] ?? 'done';
                    return (
                      <div
                        key={t}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="font-medium text-foreground">{t}</span>
                          {selectedTeeth.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              <span className="text-muted-foreground" aria-hidden>#</span>
                              {selectedTeeth.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant={status === 'done' ? 'default' : 'outline'}
                            className={cn(
                              'gap-1.5',
                              status === 'done' && 'bg-green-600 hover:bg-green-700 text-white border-0'
                            )}
                            onClick={() => setNewTreatmentStatus((prev) => ({ ...prev, [t]: 'done' }))}
                          >
                            <Check className="h-4 w-4" />
                            Done
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={status === 'still_pending' ? 'default' : 'outline'}
                            className={cn(
                              'gap-1.5',
                              status === 'still_pending' && 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                            )}
                            onClick={() => setNewTreatmentStatus((prev) => ({ ...prev, [t]: 'still_pending' }))}
                          >
                            <Hourglass className="h-4 w-4" />
                            Still Pending
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending treatments (from previous visits) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Pending treatments ({MOCK_PENDING_TREATMENTS.length})
              </h4>
              <div className="space-y-2">
                {MOCK_PENDING_TREATMENTS.map((item) => {
                  const status = pendingTreatmentStatus[item.id] ?? 'still_pending';
                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            <span className="text-muted-foreground" aria-hidden>#</span>
                            {item.tooth}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Started at {item.startedAt}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant={status === 'done' ? 'default' : 'outline'}
                          className={cn(
                            'gap-1.5',
                            status === 'done' && 'bg-green-600 hover:bg-green-700 text-white border-0'
                          )}
                          onClick={() => setPendingTreatmentStatus((prev) => ({ ...prev, [item.id]: 'done' }))}
                        >
                          <Check className="h-4 w-4" />
                          Done
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={status === 'still_pending' ? 'default' : 'outline'}
                          className={cn(
                            'gap-1.5',
                            status === 'still_pending' && 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                          )}
                          onClick={() => setPendingTreatmentStatus((prev) => ({ ...prev, [item.id]: 'still_pending' }))}
                        >
                          <Hourglass className="h-4 w-4" />
                          Still Pending
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Previous
            </Button>
          )}
          <Button type="button" onClick={handleContinue}>
            {step === 3 ? 'Save Record' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
