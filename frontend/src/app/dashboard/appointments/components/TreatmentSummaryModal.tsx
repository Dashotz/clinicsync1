'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Appointment } from '../lib/types';

type DiscountEntry = {
  title: string;
  type: 'fixed' | 'percent';
  value: number;
};

type FeeEntry = {
  name: string;
  price: number;
};

/** Mock price per treatment name (would come from API/config) */
const TREATMENT_PRICES: Record<string, number> = {
  'Root canal treatment': 2500,
  'RCT': 2500,
  'Tooth filling': 600,
  'Filling': 600,
  'Cleaning': 800,
  'General check-up': 500,
  'Extraction': 1200,
  'Whitening': 3500,
  'Consultation': 300,
};

function getPrice(name: string): number {
  return TREATMENT_PRICES[name] ?? 500;
}

/** Tooth number to label (simplified; can be expanded) */
function toothLabel(num: number): string {
  const labels: Record<number, string> = {
    18: '3rd Molar', 17: '2nd Molar', 16: '1st Molar', 15: '2nd Bicuspid', 14: '1st Bicuspid',
    13: 'Cuspid', 12: 'Lateral', 11: 'Central',
    21: 'Central', 22: 'Lateral', 23: 'Cuspid', 24: '1st Bicuspid', 25: '2nd Bicuspid',
    26: '1st Molar', 27: '2nd Molar', 28: '3rd Molar',
    38: '3rd Molar', 37: '2nd Molar', 36: '1st Molar', 35: '2nd Bicuspid', 34: '1st Bicuspid',
    33: 'Cuspid', 32: 'Lateral', 31: 'Central',
    41: 'Central', 42: 'Lateral', 43: 'Cuspid', 44: '1st Bicuspid', 45: '2nd Bicuspid',
    46: '1st Molar', 47: '2nd Molar', 48: '3rd Molar',
  };
  return labels[num] ?? `Tooth #${num}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSaveContinue: () => void;
};

export function TreatmentSummaryModal({
  open,
  onOpenChange,
  appointment,
  onSaveContinue,
}: Props) {
  const treatments = appointment
    ? (appointment.service ? appointment.service.split(',').map((s) => s.trim()).filter(Boolean) : [])
    : [];
  const teeth = appointment?.teeth ?? [];
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());
  const [discount, setDiscount] = useState<DiscountEntry | null>(null);
  const [fee, setFee] = useState<FeeEntry | null>(null);

  useEffect(() => {
    if (open && treatments.length > 0) {
      setExpandedTreatments(new Set(treatments));
    }
  }, [open, treatments.join(',')]);

  if (!appointment) return null;

  const toggleExpanded = (name: string) => {
    setExpandedTreatments((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const subtotal = treatments.reduce((sum, t) => sum + getPrice(t), 0);
  const discountAmount = discount
    ? discount.type === 'percent'
      ? (subtotal * discount.value) / 100
      : discount.value
    : 0;
  const feeAmount = fee?.price ?? 0;
  const total = Math.max(0, subtotal - discountAmount + feeAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-full max-w-md">
      <DialogContent className="w-full max-h-[90vh] flex flex-col rounded-xl p-6 min-h-0">
        <div className="shrink-0 flex items-start justify-between gap-4">
          <DialogHeader className="p-0">
            <DialogTitle>Treatment Summary</DialogTitle>
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

        <div className="shrink-0 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground mt-2">
          <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <p>Review and confirm the final treatment prices before saving.</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mt-4 space-y-1">
          {treatments.map((name) => {
            const isExpanded = expandedTreatments.has(name) || treatments.length <= 3;
            const price = getPrice(name);
            return (
              <div
                key={name}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(name)}
                >
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-foreground">P{price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 pt-0 border-t border-border/50">
                    {teeth.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 mb-2">Tooth involved ({teeth.length})</p>
                    )}
                    {teeth.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {teeth.map((num) => (
                          <span
                            key={num}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          >
                            {toothLabel(num)} <span className="opacity-80">#{num}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {teeth.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">No teeth specified</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Discount</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={discount ? 'text-destructive h-8 text-xs' : 'text-primary h-8 text-xs'}
              onClick={() => (discount ? setDiscount(null) : setDiscount({ title: 'New Customer', type: 'fixed', value: 1200 }))}
            >
              {discount ? 'Remove Discount' : '+ Add Discount'}
            </Button>
          </div>
          {discount && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Discount Title</Label>
                <Input
                  value={discount.title}
                  onChange={(e) => setDiscount((d) => d ? { ...d, title: e.target.value } : null)}
                  placeholder="e.g. New Customer"
                  className="h-7 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Type</Label>
                  <Select
                    value={discount.type}
                    onValueChange={(v: 'fixed' | 'percent') => setDiscount((d) => d ? { ...d, type: v } : null)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                      <SelectItem value="percent">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Value</Label>
                  <Input
                    type="number"
                    min={0}
                    step={discount.type === 'percent' ? 1 : 0.01}
                    value={discount.value || ''}
                    onChange={(e) => setDiscount((d) => d ? { ...d, value: Number(e.target.value) || 0 } : null)}
                    placeholder={discount.type === 'percent' ? 'e.g. 10' : 'e.g. 1200'}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-muted-foreground">Discount amount</span>
                <span className="text-xs font-medium text-foreground">
                  ₱ {discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Additional Fee</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={fee ? 'text-destructive h-8 text-xs' : 'text-primary h-8 text-xs'}
              onClick={() => (fee ? setFee(null) : setFee({ name: '', price: 0 }))}
            >
              {fee ? 'Remove Fee' : '+ Add Fee'}
            </Button>
          </div>
          {fee && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Name of the fee</Label>
                  <Input
                    value={fee.name}
                    onChange={(e) => setFee((f) => f ? { ...f, name: e.target.value } : null)}
                    placeholder="e.g. Lab fee"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Price of the fee</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={fee.price || ''}
                    onChange={(e) => setFee((f) => f ? { ...f, price: Number(e.target.value) || 0 } : null)}
                    placeholder="e.g. 500"
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-muted-foreground">Fee amount</span>
                <span className="text-xs font-medium text-foreground">
                  ₱ {(fee?.price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
        </div>

        <div className="shrink-0 mt-4 pt-4 border-t border-border space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">P{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
          {discountAmount > 0 && discount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Discount{discount.title ? ` (${discount.title})` : ''}
              </span>
              <span className="text-foreground">- ₱{discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {feeAmount > 0 && fee && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {fee.name ? fee.name : 'Additional Fee'}
              </span>
              <span className="text-foreground">+ ₱{feeAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">P{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="shrink-0 mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSaveContinue();
              toast.success('Visit completed. Treatment summary saved.');
            }}
          >
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
