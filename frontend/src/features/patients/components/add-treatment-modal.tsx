'use client';

import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { restrictToDecimal } from '@/lib/inputRestrictions';
import { getToothDisplayName, TOOTH_NUMBER_TO_NAME } from '@/features/patients/utils/tooth-names';

const TOOTH_NUMBERS = Object.keys(TOOTH_NUMBER_TO_NAME)
  .map(Number)
  .filter((n) => !Number.isNaN(n))
  .sort((a, b) => a - b);

const TREATMENT_OPTIONS = [
  'Root Canal Therapy',
  'Pulpectomy',
  'Pulp Capping',
  'RCT Retreatment',
  'Simple Extraction',
  'Surgical Extraction',
];

const TREATMENT_STATUS_OPTIONS = [
  { value: 'Planned', label: 'Planned', dotColor: 'bg-red-500' },
  { value: 'In Progress', label: 'In Progress', dotColor: 'bg-orange-500' },
  { value: 'Completed', label: 'Completed', dotColor: 'bg-purple-500' },
] as const;

const PROVIDER_OPTIONS = [
  { value: 'tbd', label: 'TBD To be determined' },
  { value: 'aa', label: 'Dr. Ang Avatar' },
  { value: 'bs', label: 'Dr. Betong Sumaya' },
  { value: 'external', label: 'External Provider' },
];
const EXTERNAL_VALUE = 'external';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { toothNumber: number; treatment: string; fee: number; surface: string; status: string; provider: string; providerLabel: string; note: string }) => void;
};

export function AddTreatmentModal({ open, onOpenChange, onSave }: Props) {
  const [toothNumber, setToothNumber] = useState<number | null>(null);
  const [treatment, setTreatment] = useState('');
  const [fee, setFee] = useState('0.00');
  const [surface, setSurface] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const disableExternal = status === 'Planned' || status === 'In Progress';
  const providerOptions = useMemo(
    () => (disableExternal ? PROVIDER_OPTIONS.filter((o) => o.value !== EXTERNAL_VALUE) : PROVIDER_OPTIONS),
    [disableExternal]
  );

  const resetForm = () => {
    setToothNumber(null);
    setTreatment('');
    setFee('0.00');
    setSurface('');
    setStatus('');
    setProvider('');
    setNote('');
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (toothNumber == null) e.toothNumber = 'Select a tooth';
    if (!treatment?.trim()) e.treatment = 'Treatment is required';
    if (!status?.trim()) e.status = 'Status is required';
    if (!provider?.trim()) e.provider = 'Provider is required';
    const feeNum = parseFloat(fee);
    if (fee !== '' && (Number.isNaN(feeNum) || feeNum < 0)) e.fee = 'Fee must be 0 or greater';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const providerLabel = PROVIDER_OPTIONS.find((o) => o.value === provider)?.label ?? provider;
    onSave({
      toothNumber: toothNumber!,
      treatment: treatment.trim(),
      fee: feeNum,
      surface: surface.trim(),
      status,
      provider,
      providerLabel,
      note: note.trim(),
    });
    toast.success('Treatment saved');
    handleOpenChange(false);
  };

  const handleAddAnother = () => {
    if (toothNumber == null) return;
    const e: Record<string, string> = {};
    if (!treatment?.trim()) e.treatment = 'Treatment is required';
    if (!status?.trim()) e.status = 'Status is required';
    if (!provider?.trim()) e.provider = 'Provider is required';
    const feeNum = parseFloat(fee);
    if (fee !== '' && (Number.isNaN(feeNum) || feeNum < 0)) e.fee = 'Fee must be 0 or greater';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const providerLabel = PROVIDER_OPTIONS.find((o) => o.value === provider)?.label ?? provider;
    onSave({
      toothNumber,
      treatment: treatment.trim(),
      fee: feeNum,
      surface: surface.trim(),
      status,
      provider,
      providerLabel,
      note: note.trim(),
    });
    toast.success('Treatment saved');
    setTreatment('');
    setFee('0.00');
    setSurface('');
    setStatus('');
    setProvider('');
    setNote('');
    setErrors({});
  };

  const toothName = toothNumber != null ? getToothDisplayName(toothNumber) : '';
  const title = toothNumber != null ? `Add treatment for ${toothName}` : 'Add treatment';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <DialogHeader className="min-w-0">
            <DialogTitle className="text-base sm:text-lg pr-8 flex items-center gap-2 flex-wrap">
              {title}
              {toothNumber != null && (
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>🦷</span>
                  <span className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-sm font-medium">
                    {toothNumber}
                  </span>
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenChange(false)} aria-label="Close" className="h-8 w-8 shrink-0 absolute top-4 right-4">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Tooth</Label>
            <Select
              value={toothNumber != null ? String(toothNumber) : ''}
              onValueChange={(v) => {
                setToothNumber(v ? Number(v) : null);
                setErrors((e) => { const { toothNumber: _, ...rest } = e; return rest; });
              }}
            >
              <SelectTrigger className={cn(errors.toothNumber && 'border-destructive')}>
                <SelectValue placeholder="Select tooth" />
              </SelectTrigger>
              <SelectContent>
                {TOOTH_NUMBERS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {getToothDisplayName(n)} ({n})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.toothNumber && <p className="text-xs text-destructive">{errors.toothNumber}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
            <div className="flex-1 min-w-0 space-y-2">
              <Label>Treatment</Label>
              <Select value={treatment} onValueChange={(v) => { setTreatment(v); setErrors((e) => { const { treatment: _, ...rest } = e; return rest; }); }}>
                <SelectTrigger className={cn(errors.treatment && 'border-destructive')}>
                  <SelectValue placeholder="Select Treatment" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.treatment && <p className="text-xs text-destructive">{errors.treatment}</p>}
            </div>
            <div className="space-y-2 sm:w-28">
              <Label>Fee</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">₱</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={fee}
                  onChange={(ev) => { setFee(restrictToDecimal(ev.target.value)); setErrors((e) => { const { fee: _, ...rest } = e; return rest; }); }}
                  className={cn('h-9', errors.fee && 'border-destructive')}
                />
              </div>
              {errors.fee && <p className="text-xs text-destructive">{errors.fee}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Surface (optional)</Label>
            <Input
              placeholder="Surface"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                if (v === 'Planned' || v === 'In Progress') setProvider((p) => (p === EXTERNAL_VALUE ? '' : p));
                setErrors((e) => { const { status: _, ...rest } = e; return rest; });
              }}
            >
              <SelectTrigger className={cn(errors.status && 'border-destructive')}>
                <SelectValue placeholder="Select treatment status" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full shrink-0', s.dotColor)} aria-hidden />
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => { setProvider(v); setErrors((e) => { const { provider: _, ...rest } = e; return rest; }); }}>
              <SelectTrigger className={cn(errors.provider && 'border-destructive')}>
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} disabled={o.value === EXTERNAL_VALUE && disableExternal}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provider && <p className="text-xs text-destructive">{errors.provider}</p>}
          </div>

          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Textarea
              placeholder="Add treatment notes or special requests"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <button type="button" className="text-sm text-primary hover:underline" onClick={handleAddAnother}>
            + Add Another Treatment
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Treatment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
