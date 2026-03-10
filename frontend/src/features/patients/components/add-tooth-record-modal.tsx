'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronDown, MoreVertical, Pencil, Link2, Trash2 } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { formatDateDisplay } from '@/features/appointments/lib/utils';
import type { ChartingRecord } from '@/features/patients/data/patient-data';
import type { ToothConditionRecord } from '@/features/patients/data/patient-data';
import { getToothDisplayName } from '@/features/patients/utils/tooth-names';

const TOOTH_STATUS_OPTIONS = ['Permanent', 'Missing', 'Unerupted', 'Deciduous'] as const;
const CONDITION_OPTIONS = ['Caries', 'Fracture', 'Discoloration', 'Abscess', 'Other'];
const SURFACE_OPTIONS = ['Mesial', 'Distal', 'Occlusal', 'Facial', 'Lingual'];
const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];

/** Treatment with tooth-scope: categorized for dropdown */
const TREATMENT_CATEGORIES: { label: string; options: string[] }[] = [
  { label: 'Endodontic', options: ['Root Canal Therapy', 'Pulpectomy', 'Pulp Capping', 'RCT Retreatment'] },
  { label: 'Oral Surgery', options: ['Simple Extraction', 'Surgical Extraction'] },
];

const TREATMENT_STATUS_OPTIONS = [
  { value: 'Planned', label: 'Planned', dotColor: 'bg-red-500' },
  { value: 'In Progress', label: 'In Progress', dotColor: 'bg-orange-500' },
  { value: 'Completed', label: 'Completed', dotColor: 'bg-purple-500' },
] as const;

/** Provider: Internal (TBD, Dr. Ang Avatar, Dr. Betong Sumaya) and External. External disabled when status = Planned or In Progress. */
const PROVIDER_CATEGORIES: { label: string; options: { value: string; label: string }[] }[] = [
  {
    label: 'Internal',
    options: [
      { value: 'tbd', label: 'TBD To be determined' },
      { value: 'aa', label: 'AA Dr. Ang Avatar' },
      { value: 'bs', label: 'BS Dr. Betong Sumaya' },
    ],
  },
  {
    label: 'External',
    options: [{ value: 'external', label: 'External Provider' }],
  },
];

const EXTERNAL_PROVIDER_VALUE = 'external';

function TreatmentDropdown({
  value,
  onChange,
  search,
  onSearchChange,
  filteredCategories,
  placeholder,
  searchPlaceholder,
  open,
  onOpenChange,
  triggerClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filteredCategories: { label: string; options: string[] }[];
  placeholder: string;
  searchPlaceholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      el.scrollTop += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open]);

  const displayLabel = value || placeholder;
  return (
    <div ref={ref} className="relative w-full sm:flex-1">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
          triggerClassName
        )}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{displayLabel}</span>
        <span className="h-4 w-4 opacity-50 shrink-0">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <div className="border-b border-border p-2" onPointerDown={(e) => e.stopPropagation()}>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div ref={scrollRef} className="max-h-48 overflow-y-auto overflow-x-hidden p-1">
            {filteredCategories.map((cat) => (
              <div key={cat.label} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {cat.label} ({cat.options.length})
                </div>
                {cat.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="flex w-full items-center justify-between rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onChange(opt);
                      onOpenChange(false);
                      onSearchChange('');
                    }}
                  >
                    {opt}
                    {value === opt && <span className="h-4 w-4 text-primary">✓</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DROPDOWN_PANEL_GAP = 4;

function ProviderDropdown({
  value,
  onChange,
  search,
  onSearchChange,
  filteredCategories,
  disableExternal,
  placeholder,
  searchPlaceholder,
  open,
  onOpenChange,
  triggerClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filteredCategories: { label: string; options: { value: string; label: string }[] }[];
  disableExternal: boolean;
  placeholder: string;
  searchPlaceholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const providerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const el = triggerRef.current;
    if (!el) return;

    const updatePosition = () => {
      const rect = el.getBoundingClientRect();
      const padding = 8;
      const width = rect.width;
      let left = rect.left;
      let top = rect.bottom + DROPDOWN_PANEL_GAP;
      if (left + width > window.innerWidth - padding) left = window.innerWidth - width - padding;
      if (left < padding) left = padding;
      if (top + 280 > window.innerHeight - padding) top = rect.top - 280 - DROPDOWN_PANEL_GAP;
      if (top < padding) top = padding;
      setPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || !position) return;
    const el = providerScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      el.scrollTop += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, position]);

  const selectedLabel = PROVIDER_CATEGORIES.flatMap((c) => c.options).find((o) => o.value === value)?.label ?? placeholder;

  const panelContent = position && (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        minWidth: position.width,
        zIndex: 9999,
      }}
      className="max-h-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
    >
      <div className="border-b border-border p-2" onPointerDown={(e) => e.stopPropagation()}>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>
      <div ref={providerScrollRef} className="max-h-48 overflow-y-auto overflow-x-hidden p-1">
            {filteredCategories.map((cat) => (
              <div key={cat.label} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {cat.label} ({cat.options.length})
                </div>
                {cat.options.map((o) => {
                  const disabled = disableExternal && o.value === EXTERNAL_PROVIDER_VALUE;
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    'flex w-full items-center justify-between rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                      onClick={() => {
                        if (disabled) return;
                        onChange(o.value);
                        onOpenChange(false);
                        onSearchChange('');
                      }}
                >
                  {o.label}
                  {value === o.value && <span className="h-4 w-4 text-primary">✓</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring [&>span]:line-clamp-1',
          triggerClassName
        )}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{selectedLabel}</span>
        <span className="h-4 w-4 opacity-50 shrink-0">▼</span>
      </button>
      {typeof document !== 'undefined' && open && panelContent && createPortal(panelContent, document.body)}
    </div>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number | null;
  /** Treatments for this tooth (when present, modal shows history view with tables). */
  treatmentsForTooth?: ChartingRecord[];
  /** Conditions for this tooth (when present with treatments, modal shows history view). */
  conditionsForTooth?: ToothConditionRecord[];
  onSave?: (toothNumber: number, data: Record<string, unknown>) => void;
  onEditTreatment?: (record: ChartingRecord) => void;
  onLinkToVisit?: (record: ChartingRecord) => void;
  onDeleteTreatment?: (recordId: string) => void;
};

const EXTERNAL_PROVIDER_LABEL = 'External Provider';

export function AddToothRecordModal({
  open,
  onOpenChange,
  toothNumber,
  treatmentsForTooth = [],
  conditionsForTooth = [],
  onSave,
  onEditTreatment,
  onLinkToVisit,
  onDeleteTreatment,
}: Props) {
  const hasHistory = (treatmentsForTooth?.length ?? 0) > 0 || (conditionsForTooth?.length ?? 0) > 0;
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const [toothStatus, setToothStatus] = useState<string>('Permanent');
  const [condition, setCondition] = useState('');
  const [conditionSurface, setConditionSurface] = useState('');
  const [conditionSeverity, setConditionSeverity] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [treatment, setTreatment] = useState('');
  const [fee, setFee] = useState('0.00');
  const [treatmentSurface, setTreatmentSurface] = useState('');
  const [treatmentStatus, setTreatmentStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [treatmentNote, setTreatmentNote] = useState('');
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'treatment' | 'provider' | null>(null);
  const [errors, setErrors] = useState<{ condition?: string; treatment?: string; treatmentStatus?: string; provider?: string; fee?: string }>({});

  useEffect(() => {
    if (!open) {
      setOpenDropdown(null);
      setErrors({});
      setShowConditionForm(false);
      setShowTreatmentForm(false);
      setOpenActionMenuId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!openActionMenuId) return;
    const onDown = (e: MouseEvent) => {
      if (actionMenuRef.current?.contains(e.target as Node)) return;
      setOpenActionMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openActionMenuId]);

  const disableExternalProvider =
    treatmentStatus === 'Planned' || treatmentStatus === 'In Progress';

  const setTreatmentStatusAndClearExternal = (value: string) => {
    setTreatmentStatus(value);
    if (value === 'Planned' || value === 'In Progress') {
      setProvider((p) => (p === EXTERNAL_PROVIDER_VALUE ? '' : p));
    }
  };

  const filteredTreatmentCategories = useMemo(() => {
    const q = treatmentSearch.trim().toLowerCase();
    if (!q)
      return TREATMENT_CATEGORIES.map((c) => ({
        label: c.label,
        options: c.options,
      }));
    return TREATMENT_CATEGORIES.map((cat) => ({
      label: cat.label,
      options: cat.options.filter((o) => o.toLowerCase().includes(q)),
    })).filter((cat) => cat.options.length > 0);
  }, [treatmentSearch]);

  const filteredProviderCategories = useMemo(() => {
    const q = providerSearch.trim().toLowerCase();
    if (!q)
      return PROVIDER_CATEGORIES.map((c) => ({
        label: c.label,
        options: c.options,
      }));
    return PROVIDER_CATEGORIES.map((cat) => ({
      label: cat.label,
      options: cat.options.filter(
        (o) => o.label.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.options.length > 0);
  }, [providerSearch]);

  const handleSave = () => {
    if (toothNumber == null) return;

    const savingConditionOnly = hasHistory && showConditionForm && !showTreatmentForm;
    const savingTreatmentOnly = hasHistory && showTreatmentForm && !showConditionForm;
    const savingBoth = !hasHistory;

    const newErrors: typeof errors = {};
    if (savingConditionOnly) {
      if (!condition?.trim()) {
        newErrors.condition = 'Condition is required';
      }
    } else if (savingTreatmentOnly || savingBoth) {
      if (!treatment?.trim()) {
        newErrors.treatment = 'Treatment is required';
      }
      if (treatment?.trim() && !treatmentStatus?.trim()) {
        newErrors.treatmentStatus = 'Treatment status is required';
      }
      if (treatment?.trim() && !provider?.trim()) {
        newErrors.provider = 'Provider is required';
      }
      const feeNum = parseFloat(fee);
      if (fee !== '' && (Number.isNaN(feeNum) || feeNum < 0)) {
        newErrors.fee = 'Fee must be 0 or a positive number';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const providerLabel = PROVIDER_CATEGORIES.flatMap((c) => c.options).find((o) => o.value === provider)?.label ?? provider;

    onSave?.(toothNumber, {
      toothStatus,
      condition,
      conditionSurface,
      conditionSeverity,
      conditionNote,
      treatment,
      fee,
      treatmentSurface,
      treatmentStatus,
      provider,
      providerLabel,
      treatmentNote,
    });
    toast.success('Record saved');
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const toothName = toothNumber != null ? getToothDisplayName(toothNumber) : '';
  const title = toothNumber != null ? `Add record for ${toothName} 🦷 ${toothNumber}` : 'Add tooth record';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-xl mx-auto max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <DialogHeader className="min-w-0">
            <DialogTitle className="text-base sm:text-lg pr-8 flex items-center gap-2 flex-wrap">
              {toothNumber != null && (
                <>
                  <span>Add record for {toothName}</span>
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>🦷</span>
                    <span className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-sm font-medium">
                      {toothNumber}
                    </span>
                  </span>
                </>
              )}
              {toothNumber == null && title}
            </DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close"
            className="h-8 w-8 shrink-0 absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 mt-2">
          {/* Tooth Status - always shown */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tooth Status</Label>
            <RadioGroup
              value={toothStatus}
              onValueChange={setToothStatus}
              className="grid grid-cols-2 gap-3"
            >
              {TOOTH_STATUS_OPTIONS.map((opt) => (
                <Label
                  key={opt}
                  htmlFor={`status-${opt}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary has-[[data-state=checked]]:border-primary/50"
                >
                  <RadioGroupItem value={opt} id={`status-${opt}`} />
                  <span aria-hidden className="text-muted-foreground">🦷</span>
                  <span className="text-sm font-normal">{opt}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {hasHistory ? (
            <>
              {/* Tooth Conditions section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium">Tooth Conditions</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1">
                      Filter <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1">
                      Sort <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" className="h-8 text-xs gap-1" onClick={() => setShowConditionForm(true)}>
                      + Add Tooth Condition
                    </Button>
                  </div>
                </div>
                {(conditionsForTooth?.length ?? 0) === 0 && !showConditionForm && (
                  <p className="text-sm text-muted-foreground">No tooth condition recorded yet.</p>
                )}
                {(conditionsForTooth?.length ?? 0) > 0 && (
                  <div className="rounded-md border border-border overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Date Recorded</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Condition</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Surface</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Severity</th>
                          <th className="w-8" aria-label="Actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {conditionsForTooth?.map((c) => (
                          <tr key={c.id} className="border-b border-border/40 hover:bg-muted/20">
                            <td className="py-2 px-3">{formatDateDisplay(c.dateRecorded)}</td>
                            <td className="py-2 px-3">{c.condition}</td>
                            <td className="py-2 px-3">{c.surface}</td>
                            <td className="py-2 px-3">{c.severity}</td>
                            <td className="py-2 px-2">
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Row actions">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {showConditionForm && (
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                    <Label className="text-sm font-medium">New tooth condition</Label>
                    <Select value={condition} onValueChange={(v) => { setCondition(v); setErrors((e) => ({ ...e, condition: undefined })); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tooth condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Select value={conditionSurface} onValueChange={setConditionSurface}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Surface (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {SURFACE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={conditionSeverity} onValueChange={setConditionSeverity}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Severity (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Add tooth condition notes"
                      value={conditionNote}
                      onChange={(e) => setConditionNote(e.target.value)}
                      className="min-h-[60px] resize-y text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Treatments section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium">Treatments</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1">
                      Filter <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1">
                      Sort <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" className="h-8 text-xs gap-1" onClick={() => setShowTreatmentForm(true)}>
                      + Add Treatment
                    </Button>
                  </div>
                </div>
                {(treatmentsForTooth?.length ?? 0) > 0 && (
                  <div className="rounded-md border border-border overflow-visible">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Treatment Date</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Treatment</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Provider</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Fee</th>
                          <th className="w-8" aria-label="Actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentsForTooth?.map((r) => (
                          <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20">
                            <td className="py-2 px-3">{r.date ? formatDateDisplay(r.date) : '—'}</td>
                            <td className="py-2 px-3">{r.treatment}</td>
                            <td
                              className="py-2 px-3"
                              title={
                                (r.status === 'Done' || r.status === 'Completed') && r.completedDate
                                  ? `Completed on ${formatDateDisplay(r.completedDate)}`
                                  : undefined
                              }
                            >
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full shrink-0',
                                    r.status === 'Done' && 'bg-green-500',
                                    r.status === 'Completed' && 'bg-purple-500',
                                    r.status === 'In Progress' && 'bg-[#FF956C]',
                                    r.status === 'Planned' && 'bg-destructive'
                                  )}
                                  aria-hidden
                                />
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 truncate max-w-[100px]">{r.provider}</td>
                            <td className="py-2 px-3">₱{r.fee.toLocaleString()}</td>
                            <td className="py-2 px-2 relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Row actions"
                                onClick={() => setOpenActionMenuId(openActionMenuId === r.id ? null : r.id)}
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                              {openActionMenuId === r.id && (
                                <div
                                  ref={actionMenuRef}
                                  className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-popover py-1 shadow-md"
                                >
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => {
                                      onEditTreatment?.(r);
                                      setOpenActionMenuId(null);
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                  {(r.status === 'In Progress' || r.status === 'Completed') &&
                                    !r.provider?.includes('External') &&
                                    !r.linkedVisitId && (
                                      <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                          onLinkToVisit?.(r);
                                          setOpenActionMenuId(null);
                                        }}
                                      >
                                        <Link2 className="h-3.5 w-3.5" />
                                        Link to Visit
                                      </button>
                                    )}
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      onDeleteTreatment?.(r.id);
                                      setOpenActionMenuId(null);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {showTreatmentForm && (
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                    <Label className="text-sm font-medium">New treatment</Label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                      <div className="flex-1 min-w-0 space-y-1">
                        <TreatmentDropdown
                          value={treatment}
                          onChange={(v) => { setTreatment(v); setErrors((e) => ({ ...e, treatment: undefined })); }}
                          search={treatmentSearch}
                          onSearchChange={setTreatmentSearch}
                          filteredCategories={filteredTreatmentCategories}
                          placeholder="Select Treatment"
                          searchPlaceholder="Search treatment..."
                          open={openDropdown === 'treatment'}
                          onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'treatment' : null)}
                          triggerClassName={errors.treatment ? 'border-destructive' : undefined}
                        />
                        {errors.treatment && <p className="text-xs text-destructive">{errors.treatment}</p>}
                      </div>
                      <div className="flex flex-col gap-1 sm:w-28">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-muted-foreground">₱</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={fee}
                            onChange={(e) => { setFee(restrictToDecimal(e.target.value)); setErrors((e) => ({ ...e, fee: undefined })); }}
                            className={cn('h-9', errors.fee && 'border-destructive')}
                          />
                        </div>
                        {errors.fee && <p className="text-xs text-destructive">{errors.fee}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder="Surface (optional)"
                        value={treatmentSurface}
                        onChange={(e) => setTreatmentSurface(e.target.value)}
                        className="h-9"
                      />
                      <div className="space-y-1">
                        <Select
                          value={treatmentStatus}
                          onValueChange={(v) => { setTreatmentStatusAndClearExternal(v); setErrors((e) => ({ ...e, treatmentStatus: undefined })); }}
                        >
                          <SelectTrigger className={cn('w-full', errors.treatmentStatus && 'border-destructive')}>
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
                        {errors.treatmentStatus && <p className="text-xs text-destructive">{errors.treatmentStatus}</p>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <ProviderDropdown
                        value={provider}
                        onChange={(v) => { setProvider(v); setErrors((e) => ({ ...e, provider: undefined })); }}
                        search={providerSearch}
                        onSearchChange={setProviderSearch}
                        filteredCategories={filteredProviderCategories}
                        disableExternal={disableExternalProvider}
                        placeholder="Select Provider"
                        searchPlaceholder="Search provider..."
                        open={openDropdown === 'provider'}
                        onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'provider' : null)}
                        triggerClassName={errors.provider ? 'border-destructive' : undefined}
                      />
                      {errors.provider && <p className="text-xs text-destructive">{errors.provider}</p>}
                    </div>
                    <Textarea
                      placeholder="Add treatment notes or special requests"
                      value={treatmentNote}
                      onChange={(e) => setTreatmentNote(e.target.value)}
                      className="min-h-[60px] resize-y text-sm"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* No history: single combined form */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tooth Condition</Label>
                <div className="space-y-2">
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tooth condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select value={conditionSurface} onValueChange={setConditionSurface}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Surface (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {SURFACE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={conditionSeverity} onValueChange={setConditionSeverity}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Severity (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Add tooth condition notes"
                    value={conditionNote}
                    onChange={(e) => setConditionNote(e.target.value)}
                    className="min-h-[80px] resize-y"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Treatment</Label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                    <div className="flex-1 min-w-0 space-y-1">
                      <TreatmentDropdown
                        value={treatment}
                        onChange={(v) => { setTreatment(v); setErrors((e) => ({ ...e, treatment: undefined })); }}
                        search={treatmentSearch}
                        onSearchChange={setTreatmentSearch}
                        filteredCategories={filteredTreatmentCategories}
                        placeholder="Select Treatment"
                        searchPlaceholder="Search treatment..."
                        open={openDropdown === 'treatment'}
                        onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'treatment' : null)}
                        triggerClassName={errors.treatment ? 'border-destructive' : undefined}
                      />
                      {errors.treatment && <p className="text-xs text-destructive">{errors.treatment}</p>}
                    </div>
                    <div className="flex flex-col gap-1 sm:w-28">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">₱</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={fee}
                          onChange={(e) => { setFee(restrictToDecimal(e.target.value)); setErrors((e) => ({ ...e, fee: undefined })); }}
                          className={cn('h-9', errors.fee && 'border-destructive')}
                        />
                      </div>
                      {errors.fee && <p className="text-xs text-destructive">{errors.fee}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Surface (optional)"
                      value={treatmentSurface}
                      onChange={(e) => setTreatmentSurface(e.target.value)}
                      className="h-9"
                    />
                    <div className="space-y-1">
                      <Select
                        value={treatmentStatus}
                        onValueChange={(v) => { setTreatmentStatusAndClearExternal(v); setErrors((e) => ({ ...e, treatmentStatus: undefined })); }}
                      >
                        <SelectTrigger className={cn('w-full', errors.treatmentStatus && 'border-destructive')}>
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
                      {errors.treatmentStatus && <p className="text-xs text-destructive">{errors.treatmentStatus}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <ProviderDropdown
                      value={provider}
                      onChange={(v) => { setProvider(v); setErrors((e) => ({ ...e, provider: undefined })); }}
                      search={providerSearch}
                      onSearchChange={setProviderSearch}
                      filteredCategories={filteredProviderCategories}
                      disableExternal={disableExternalProvider}
                      placeholder="Select Provider"
                      searchPlaceholder="Search provider..."
                      open={openDropdown === 'provider'}
                      onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'provider' : null)}
                      triggerClassName={errors.provider ? 'border-destructive' : undefined}
                    />
                    {errors.provider && <p className="text-xs text-destructive">{errors.provider}</p>}
                  </div>
                  <Textarea
                    placeholder="Add treatment notes or special requests"
                    value={treatmentNote}
                    onChange={(e) => setTreatmentNote(e.target.value)}
                    className="min-h-[80px] resize-y"
                  />
                  <button type="button" className="text-sm text-primary hover:underline">
                    + Add Another Treatment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {(!hasHistory || showConditionForm || showTreatmentForm) && (
            <Button type="button" onClick={handleSave}>
              Save Record
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
