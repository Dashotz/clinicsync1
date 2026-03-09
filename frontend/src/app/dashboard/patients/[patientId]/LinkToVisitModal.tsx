'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { VisitOption } from '../patientData';
import { formatDateDisplay } from '@/app/dashboard/appointments/lib/utils';
import { getToothDisplayName } from './toothNames';
import { cn } from '@/lib/utils';

export type LinkToVisitTreatment = {
  toothNumber: number;
  treatmentName: string;
  status: 'In Progress' | 'Completed';
  fee: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: LinkToVisitTreatment | null;
  scheduledVisits: VisitOption[];
  completedVisits: VisitOption[];
  onSkip: () => void;
  onLinkVisit: (visitId: string) => void;
};

export function LinkToVisitModal({
  open,
  onOpenChange,
  treatment,
  scheduledVisits,
  completedVisits,
  onSkip,
  onLinkVisit,
}: Props) {
  const [selectedVisitId, setSelectedVisitId] = useState<string>('');

  const visits =
    treatment?.status === 'In Progress'
      ? scheduledVisits
      : treatment?.status === 'Completed'
        ? completedVisits
        : [];

  const handleLinkVisit = () => {
    if (!selectedVisitId?.trim()) return;
    const toothName = treatment ? getToothDisplayName(treatment.toothNumber) : '';
    const toothNum = treatment?.toothNumber ?? 0;
    onLinkVisit(selectedVisitId);
    toast.success(`Tooth ${toothNum} (${toothName}) record saved and linked to visit`);
    setSelectedVisitId('');
    onOpenChange(false);
  };

  const handleSkip = () => {
    setSelectedVisitId('');
    onSkip();
    onOpenChange(false);
  };

  if (!treatment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-md mx-auto p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <DialogHeader className="min-w-0">
            <DialogTitle className="text-base sm:text-lg pr-8">Link to Visit</DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="h-8 w-8 shrink-0 absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          This treatment isn&apos;t linked to a visit. Linking it helps keep the patient&apos;s clinical history organized.
        </p>
        <div className="rounded-lg border border-border bg-muted/20 p-4 mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">
              {treatment.treatmentName} ({treatment.toothNumber})
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                treatment.status === 'In Progress'
                  ? 'border-[#FF956C]/50 bg-[#FF956C]/10 text-[#EA580C]'
                  : 'border-green-600/50 bg-green-500/10 text-green-700 dark:text-green-400'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  treatment.status === 'In Progress' ? 'bg-[#FF956C]' : 'bg-green-500'
                )}
                aria-hidden
              />
              {treatment.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">₱{treatment.fee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="link-visit-select">Select Visit</Label>
          <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
            <SelectTrigger id="link-visit-select" className="w-full">
              <SelectValue placeholder="Select Visit" />
            </SelectTrigger>
            <SelectContent>
              {visits.length === 0 ? (
                <SelectItem value="_none" disabled>
                  No {treatment.status === 'In Progress' ? 'scheduled' : 'completed'} visits
                </SelectItem>
              ) : (
                visits.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {formatDateDisplay(v.date)} — {v.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
          <Button type="button" variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleLinkVisit}
            disabled={!selectedVisitId || selectedVisitId === '_none'}
          >
            Link Visit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
