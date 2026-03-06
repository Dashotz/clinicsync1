'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, Check, Hourglass, Stethoscope, CheckCircle2 } from 'lucide-react';
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
import { ToothChart, type ToothStatus } from './ToothChart';
import type { Appointment } from '../lib/types';
import { TREATMENT_OPTIONS } from '../lib/constants';
import { formatDateDisplay, getTodayStr } from '../lib/utils';

const STEPS = [
  { id: 1, label: 'Treatments provided' },
  { id: 2, label: 'Tooth involvement' },
  { id: 3, label: 'Review' },
];

/** Universal numbering 1–32 to tooth name (e.g. for popup title). */
const TOOTH_NAMES: Record<number, string> = {
  1: '3rd Molar', 2: '2nd Molar', 3: '1st Molar', 4: '2nd Bicuspid', 5: '1st Bicuspid', 6: 'Cuspid', 7: 'Lateral Incisor', 8: 'Central Incisor',
  9: 'Central Incisor', 10: 'Lateral Incisor', 11: 'Cuspid', 12: '1st Bicuspid', 13: '2nd Bicuspid', 14: '1st Molar', 15: '2nd Molar', 16: '3rd Molar',
  17: 'Central Incisor', 18: 'Lateral Incisor', 19: 'Cuspid', 20: '2nd Bicuspid', 21: '2nd Bicuspid', 22: '1st Molar', 23: '2nd Molar', 24: '3rd Molar',
  25: '3rd Molar', 26: '2nd Molar', 27: '1st Molar', 28: '1st Bicuspid', 29: '2nd Bicuspid', 30: 'Cuspid', 31: 'Lateral Incisor', 32: 'Central Incisor',
};

const TOOTH_CONDITION_OPTIONS = [
  'Caries',
  'Cracked tooth',
  'Sensitivity',
  'Pain',
  'Infection',
  'Missing tooth',
  'Filling present',
  'Crown present',
];

/** Mock pending treatments from previous visits (would come from API) */
const MOCK_PENDING_TREATMENTS = [
  { id: 'p1', name: 'RCT', tooth: 20, startedAt: 'Jan 4, 2026' },
];

/** Teeth that show "has treatment before" and use the history panel when selected */
const TEETH_WITH_HISTORY: Record<number, boolean> = { 12: true };

/** Mock treatment history per tooth (would come from API). Date is YYYY-MM-DD. */
type ToothHistoryEntry = {
  date: string;
  condition: string;
  treatment: string;
  dentist: string;
  notes: string;
  status: 'done';
};
const MOCK_TOOTH_HISTORY: Record<number, ToothHistoryEntry[]> = {
  12: [
    { date: '2026-01-26', condition: 'Caries', treatment: 'Tooth filling', dentist: 'Dr. Juan Cruz', notes: 'Example notes added by the dentist.', status: 'done' },
    { date: '2025-12-02', condition: 'Caries', treatment: 'Tooth filling', dentist: 'Dr. Juan Cruz', notes: 'No notes added.', status: 'done' },
  ],
};

/** When true, modal uses two columns: history (left) + main flow (right). */
const HAS_TREATMENT_HISTORY = Object.keys(MOCK_TOOTH_HISTORY).length > 0;

function formatDateYearFirst(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(',', '');
}

function ToothHistoryPanel({
  toothNumber,
  toothName,
  history,
}: {
  toothNumber: number;
  toothName: string;
  history: ToothHistoryEntry[];
}) {
  const byYear = history.reduce<Record<number, ToothHistoryEntry[]>>((acc, entry) => {
    const year = new Date(entry.date + 'T12:00:00').getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 shrink-0 px-4 py-3 border-b border-border">
        <Stethoscope className="h-5 w-5 text-muted-foreground" aria-hidden />
        <h4 className="font-semibold text-sm text-foreground">
          {toothName} ({toothNumber})
        </h4>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {years.map((year) => (
          <div key={year}>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">{year}</h5>
            <div className="space-y-3">
              {byYear[year]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((entry, i) => (
                  <div
                    key={`${entry.date}-${i}`}
                    className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1.5"
                  >
                    <p className="font-medium text-foreground">{formatDateYearFirst(entry.date)}</p>
                    <div className="grid gap-1 text-muted-foreground">
                      <p><span className="text-foreground">Condition:</span> {entry.condition}</p>
                      <p><span className="text-foreground">Treatment:</span> {entry.treatment}</p>
                      <p><span className="text-foreground">Dentist:</span> {entry.dentist}</p>
                      {entry.notes && <p><span className="text-foreground">Notes:</span> {entry.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="text-xs font-medium">Done</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type MedicalRecordSavedData = {
  treatments: string[];
  selectedTeeth: number[];
};

type ToothDetailPopoverProps = {
  toothNumber: number;
  toothName: string;
  condition: string;
  treatment: string;
  notes: string;
  treatmentStartedAt?: string;
  treatmentOptions: string[];
  onConditionChange: (v: string) => void;
  onTreatmentChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

function ToothDetailPopover({
  toothNumber,
  toothName,
  condition,
  treatment,
  notes,
  treatmentStartedAt,
  treatmentOptions,
  onConditionChange,
  onTreatmentChange,
  onNotesChange,
  onCancel,
  onSave,
}: ToothDetailPopoverProps) {
  /** Only show summary when this tooth was saved before (has a start date). Prevents flipping to summary when user selects a condition, selects a treatment, or types in notes. */
  const wasSavedBefore = !!treatmentStartedAt;
  const [isEditing, setIsEditing] = useState(false);

  const showSummary = wasSavedBefore && !isEditing;
  /** 8→25 counter-clockwise (1–8, 25–32) → popup right; 9→24 clockwise (9–24) → popup left, so the popup doesn't cover the selected tooth. */
  const popupOnRight = (toothNumber >= 1 && toothNumber <= 8) || (toothNumber >= 25 && toothNumber <= 32);
  const popupSide = popupOnRight ? 'right' : 'left';

  return (
    <div
      className={cn(
        'absolute top-1/2 z-50 w-[260px] max-w-[calc(100vw-2rem)] sm:w-[280px] -translate-y-1/2 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg p-2.5 sm:p-3',
        popupSide === 'left' ? 'left-1 sm:left-2' : 'right-1 sm:right-2'
      )}
      role="dialog"
      aria-labelledby="tooth-popup-title"
    >
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <h4 id="tooth-popup-title" className="font-semibold text-xs sm:text-sm text-foreground truncate">
          {toothName}
        </h4>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          <Stethoscope className="h-3 w-3" aria-hidden />
          {toothNumber}
        </span>
      </div>

      {showSummary ? (
        <>
          <div className="space-y-2 text-sm">
            {condition && (
              <div>
                <span className="text-muted-foreground">Condition: </span>
                <span className="text-foreground">{condition}</span>
              </div>
            )}
            {treatment && (
              <div>
                <span className="text-muted-foreground">Treatment: </span>
                <span className="text-foreground">{treatment}</span>
              </div>
            )}
            {notes && (
              <div>
                <span className="text-muted-foreground">Notes: </span>
                <span className="text-foreground">{notes}</span>
              </div>
            )}
            {treatmentStartedAt && (
              <div>
                <span className="text-muted-foreground">Treatment started: </span>
                <span className="text-foreground">{formatDateDisplay(treatmentStartedAt)}</span>
              </div>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="w-full mt-4" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="tooth-condition" className="text-xs">Condition</Label>
              <Select value={condition || undefined} onValueChange={onConditionChange}>
                <SelectTrigger id="tooth-condition" className="h-8 text-sm">
                  <SelectValue placeholder="Select tooth condition" />
                </SelectTrigger>
                <SelectContent>
                  {TOOTH_CONDITION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tooth-treatment" className="text-xs">Treatment</Label>
              <Select value={treatment || undefined} onValueChange={onTreatmentChange}>
                <SelectTrigger id="tooth-treatment" className="h-8 text-sm">
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tooth-notes" className="text-xs">Notes</Label>
              <Textarea
                id="tooth-notes"
                placeholder="Enter notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={2}
                className="resize-none text-sm min-h-0"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" size="sm" className="flex-1" onClick={onSave}>
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

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
  /** Step 2: which tooth has the detail popup open (null = closed) */
  const [toothPopupTooth, setToothPopupTooth] = useState<number | null>(null);
  /** Step 2: per-tooth condition, treatment, notes, treatmentStartedAt (from popup Save) */
  const [toothDetails, setToothDetails] = useState<Record<number, { condition: string; treatment: string; notes: string; treatmentStartedAt?: string }>>({});
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
      setToothPopupTooth(null);
      setToothDetails({});
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

  const showHistoryColumn = HAS_TREATMENT_HISTORY && step === 2;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] mx-auto',
        showHistoryColumn ? 'max-w-4xl xl:max-w-5xl' : 'max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl'
      )}
    >
      <DialogContent className={cn('w-full max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto flex flex-col p-4 sm:p-6', showHistoryColumn && 'flex-row gap-0')}>
        {showHistoryColumn && (
          <aside className="hidden lg:flex w-[260px] xl:w-[320px] shrink-0 flex-col min-h-0 border-r border-border pr-4">
            {toothPopupTooth !== null && TEETH_WITH_HISTORY[toothPopupTooth] && (MOCK_TOOTH_HISTORY[toothPopupTooth]?.length ?? 0) > 0 ? (
              <ToothHistoryPanel
                toothNumber={toothPopupTooth}
                toothName={TOOTH_NAMES[toothPopupTooth] ?? `Tooth ${toothPopupTooth}`}
                history={MOCK_TOOTH_HISTORY[toothPopupTooth] ?? []}
              />
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Treatment history</p>
                <p>Select a tooth with prior treatments on the chart to view its history here.</p>
              </div>
            )}
          </aside>
        )}
        <div className={cn('flex flex-col min-w-0', showHistoryColumn && 'flex-1 lg:pl-4')}>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <DialogHeader className="p-0 min-w-0">
            <DialogTitle className="text-base sm:text-lg">Add Medical Record</DialogTitle>
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

        {/* Step indicator - 3 columns, number above text */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 mt-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1 sm:gap-1.5 text-center">
              <div
                className={cn(
                  'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  step >= s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.id ? '✓' : s.id}
              </div>
              <span
                className={cn(
                  'text-[10px] sm:text-sm',
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
            <h3 className="text-sm sm:text-base font-semibold text-foreground mt-4 sm:mt-6">Treatments provided</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Confirm or update the treatments provided during this visit.
            </p>

            <div className="space-y-2 mt-3 sm:mt-4">
              <Label htmlFor="visit-treatment-select" className="text-xs sm:text-sm">Treatment</Label>
              <div className="flex flex-wrap gap-2 min-h-[36px] rounded-md border border-input bg-transparent px-2.5 sm:px-3 py-2 text-xs sm:text-sm">
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
                  <SelectTrigger id="visit-treatment-select" className="w-[120px] sm:w-[140px] h-7 border-0 shadow-none focus:ring-0 p-0 gap-1 text-xs sm:text-sm">
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

            <div className="space-y-2 mt-3 sm:mt-4">
              <Label htmlFor="visit-notes" className="text-xs sm:text-sm">Notes (Optional)</Label>
              <Textarea
                id="visit-notes"
                placeholder="Add note or remarks about this visit"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none text-xs sm:text-sm"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="mt-4 sm:mt-6 flex flex-col min-h-0 flex-1">
            <div className="flex items-start gap-2 sm:gap-3 rounded-lg border border-primary/20 bg-primary/5 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary mt-0.5" />
              <p className="min-w-0">Patient medical data is based on previous visits. Review and update it as needed for today.</p>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground text-center">Tooth involvement</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 text-center">
              Assign teeth to each treatment, if applicable.
            </p>
            {treatments.length > 0 && (
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {treatments.map((t) => (
                  <span
                    key={t}
                    className="inline-flex rounded-lg border border-border bg-muted/80 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 sm:mt-4 w-full min-w-0 flex min-h-[260px] sm:min-h-[320px]">
              {!HAS_TREATMENT_HISTORY && toothPopupTooth !== null && TEETH_WITH_HISTORY[toothPopupTooth] && (MOCK_TOOTH_HISTORY[toothPopupTooth]?.length ?? 0) > 0 && (
                <div className="hidden sm:flex w-[260px] lg:w-[320px] shrink-0 flex-col min-h-0 mr-4">
                  <ToothHistoryPanel
                    toothNumber={toothPopupTooth}
                    toothName={TOOTH_NAMES[toothPopupTooth] ?? `Tooth ${toothPopupTooth}`}
                    history={MOCK_TOOTH_HISTORY[toothPopupTooth] ?? []}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 overflow-hidden rounded-lg border border-border bg-card flex flex-col min-h-[220px] sm:min-h-[280px] relative" style={{ aspectRatio: '450/700' }}>
                <ToothChart
                  selectedTeeth={selectedTeeth}
                  onSelectionChange={setSelectedTeeth}
                  onToothClick={(num) => setToothPopupTooth(num)}
                  toothStatus={{ 12: 'has_treatment', 20: 'pending' }}
                  className="flex-1 min-h-0 w-full"
                />
                {toothPopupTooth !== null && !TEETH_WITH_HISTORY[toothPopupTooth] && (
                  <ToothDetailPopover
                  toothNumber={toothPopupTooth}
                  toothName={TOOTH_NAMES[toothPopupTooth] ?? `Tooth ${toothPopupTooth}`}
                  condition={toothDetails[toothPopupTooth]?.condition ?? ''}
                  treatment={toothDetails[toothPopupTooth]?.treatment ?? ''}
                  notes={toothDetails[toothPopupTooth]?.notes ?? ''}
                  treatmentStartedAt={toothDetails[toothPopupTooth]?.treatmentStartedAt}
                  treatmentOptions={treatments.length > 0 ? treatments : [...TREATMENT_OPTIONS]}
                  onConditionChange={(v) =>
                    setToothDetails((prev) => ({
                      ...prev,
                      [toothPopupTooth]: { ...(prev[toothPopupTooth] ?? { condition: '', treatment: '', notes: '' }), condition: v },
                    }))
                  }
                  onTreatmentChange={(v) =>
                    setToothDetails((prev) => ({
                      ...prev,
                      [toothPopupTooth]: { ...(prev[toothPopupTooth] ?? { condition: '', treatment: '', notes: '' }), treatment: v },
                    }))
                  }
                  onNotesChange={(v) =>
                    setToothDetails((prev) => ({
                      ...prev,
                      [toothPopupTooth]: { ...(prev[toothPopupTooth] ?? { condition: '', treatment: '', notes: '' }), notes: v },
                    }))
                  }
                  onCancel={() => setToothPopupTooth(null)}
                  onSave={() => {
                    const current = toothDetails[toothPopupTooth];
                    const startedAt = current?.treatmentStartedAt ?? getTodayStr();
                    setToothDetails((prev) => ({
                      ...prev,
                      [toothPopupTooth]: { ...(prev[toothPopupTooth] ?? { condition: '', treatment: '', notes: '' }), treatmentStartedAt: startedAt },
                    }));
                    if (!selectedTeeth.includes(toothPopupTooth)) {
                      setSelectedTeeth((prev) => [...prev, toothPopupTooth].sort((a, b) => a - b));
                    }
                    setToothPopupTooth(null);
                    toast.success('Tooth details saved.');
                  }}
                />
              )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-2 sm:gap-3 rounded-lg border border-primary/20 bg-primary/5 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-foreground">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary mt-0.5" />
              <p className="min-w-0">Patient medical data is based on previous visits. Review and update it as needed for today.</p>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-foreground">Review</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review the treatments and confirm their status for this visit. Mark a treatment as{' '}
              <span className="font-medium text-orange-600 dark:text-orange-400">Still Pending</span> if additional
              visits are needed to complete it.
            </p>

            {/* New treatments provided */}
            {treatments.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-medium text-foreground">
                  New treatments provided ({treatments.length})
                </h4>
                <div className="space-y-2">
                  {treatments.map((t) => {
                    const status = newTreatmentStatus[t] ?? 'done';
                    return (
                      <div
                        key={t}
                        className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 sm:px-4 py-2.5 sm:py-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="font-medium text-foreground text-sm">{t}</span>
                          {selectedTeeth.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-primary">
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
                              'gap-1 h-8 text-xs sm:text-sm',
                              status === 'done' && 'bg-green-600 hover:bg-green-700 text-white border-0'
                            )}
                            onClick={() => setNewTreatmentStatus((prev) => ({ ...prev, [t]: 'done' }))}
                          >
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Done
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={status === 'still_pending' ? 'default' : 'outline'}
                            className={cn(
                              'gap-1 h-8 text-xs sm:text-sm',
                              status === 'still_pending' && 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                            )}
                            onClick={() => setNewTreatmentStatus((prev) => ({ ...prev, [t]: 'still_pending' }))}
                          >
                            <Hourglass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-medium text-foreground">
                Pending treatments ({MOCK_PENDING_TREATMENTS.length})
              </h4>
              <div className="space-y-2">
                {MOCK_PENDING_TREATMENTS.map((item) => {
                  const status = pendingTreatmentStatus[item.id] ?? 'still_pending';
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 sm:px-4 py-2.5 sm:py-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground text-sm">{item.name}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-primary">
                            <span className="text-muted-foreground" aria-hidden>#</span>
                            {item.tooth}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Started at {item.startedAt}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant={status === 'done' ? 'default' : 'outline'}
                          className={cn(
                            'gap-1 h-8 text-xs sm:text-sm',
                            status === 'done' && 'bg-green-600 hover:bg-green-700 text-white border-0'
                          )}
                          onClick={() => setPendingTreatmentStatus((prev) => ({ ...prev, [item.id]: 'done' }))}
                        >
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Done
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={status === 'still_pending' ? 'default' : 'outline'}
                          className={cn(
                            'gap-1 h-8 text-xs sm:text-sm',
                            status === 'still_pending' && 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                          )}
                          onClick={() => setPendingTreatmentStatus((prev) => ({ ...prev, [item.id]: 'still_pending' }))}
                        >
                          <Hourglass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="w-full sm:w-auto">
              Previous
            </Button>
          )}
          <Button type="button" onClick={handleContinue} className="w-full sm:w-auto">
            {step === 3 ? 'Save Record' : 'Continue'}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
