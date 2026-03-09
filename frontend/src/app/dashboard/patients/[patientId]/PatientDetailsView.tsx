'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MoreVertical,
  Plus,
  AlertTriangle,
  CircleDollarSign,
  CalendarDays,
  Stethoscope,
  Wallet,
  User,
  FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PatientDetails, ChartingRecord, ToothConditionRecord } from '../patientData';
import {
  getChartingRecordsByPatientId,
  getToothConditionsForTooth,
  getScheduledVisitsForPatient,
  getCompletedVisitsForPatient,
} from '../patientData';
import { ToothChart, type ToothStatus } from '@/app/dashboard/appointments/components/ToothChart';
import { formatDateDisplay } from '@/app/dashboard/appointments/lib/utils';
import { AddToothRecordModal } from './AddToothRecordModal';
import { AddTreatmentModal } from './AddTreatmentModal';
import { LinkToVisitModal, type LinkToVisitTreatment } from './LinkToVisitModal';

const TABS = ['Overview', 'Charting', 'Appointment', 'Billing', 'Documents', 'Patient Info', 'Internal Notes'] as const;
type Tab = (typeof TABS)[number];

const CHARTING_SUBTABS = ['Odontogram', 'Imaging'] as const;
type ChartingSubTab = (typeof CHARTING_SUBTABS)[number];

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-semibold text-foreground truncate">{value}</p>
        </div>
        <div className="h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground truncate">{value}</p>
    </div>
  );
}

/** Charting legend: Has treatment before (purple), In progress (orange), Planned (red) */
const CHARTING_LEGEND = [
  { label: 'Has treatment before', color: 'bg-[#9598FF]' },
  { label: 'In progress treatment', color: 'bg-[#FF956C]' },
  { label: 'Planned treatment', color: 'bg-destructive' },
] as const;

/** Map charting record status to ToothChart status (legend: has_treatment, pending, new = planned). */
function recordStatusToToothStatus(s: ChartingRecord['status']): ToothStatus {
  if (s === 'Done' || s === 'Completed') return 'has_treatment';
  if (s === 'In Progress') return 'pending';
  return 'new'; // Planned
}

type Props = { patient: PatientDetails };

export function PatientDetailsView({ patient }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [chartingSubTab, setChartingSubTab] = useState<ChartingSubTab>('Odontogram');
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [toothRecordModalOpen, setToothRecordModalOpen] = useState(false);
  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(null);
  const [chartingRecords, setChartingRecords] = useState<ChartingRecord[]>(() => getChartingRecordsByPatientId(patient.id));
  const [localConditionsByTooth, setLocalConditionsByTooth] = useState<Record<number, ToothConditionRecord[]>>({});
  const [linkToVisitModalOpen, setLinkToVisitModalOpen] = useState(false);
  const [linkToVisitTreatment, setLinkToVisitTreatment] = useState<LinkToVisitTreatment | null>(null);
  const [pendingLinkRecordId, setPendingLinkRecordId] = useState<string | null>(null);
  const [addTreatmentModalOpen, setAddTreatmentModalOpen] = useState(false);
  const isCharting = activeTab === 'Charting';

  useEffect(() => {
    setChartingRecords(getChartingRecordsByPatientId(patient.id));
  }, [patient.id]);

  const conditionsForSelectedTooth = useMemo(() => {
    if (selectedToothNumber == null) return [];
    const fromData = getToothConditionsForTooth(patient.id, selectedToothNumber);
    const local = localConditionsByTooth[selectedToothNumber] ?? [];
    return [...fromData, ...local];
  }, [patient.id, selectedToothNumber, localConditionsByTooth]);

  const handleSaveToothRecord = (toothNumber: number, data: Record<string, unknown>) => {
    const addCondition = data.condition != null && String(data.condition).trim() !== '';
    const addTreatment = data.treatment != null && String(data.treatment).trim() !== '';
    if (addCondition) {
      setLocalConditionsByTooth((prev) => ({
        ...prev,
        [toothNumber]: [
          ...(prev[toothNumber] ?? []),
          {
            id: `tc-${Date.now()}`,
            dateRecorded: new Date().toISOString().slice(0, 10),
            condition: String(data.condition),
            surface: String(data.conditionSurface ?? ''),
            severity: String(data.conditionSeverity ?? ''),
          },
        ],
      }));
    }
    if (addTreatment) {
      const status = (data.treatmentStatus as ChartingRecord['status']) || 'Planned';
      const completedDate =
        status === 'Completed' || status === 'Done' ? new Date().toISOString().slice(0, 10) : undefined;
      const newId = `cr-${Date.now()}`;
      setChartingRecords((prev) => [
        ...prev,
        {
          id: newId,
          toothNumber,
          treatment: String(data.treatment),
          status,
          provider: String(data.providerLabel ?? data.provider ?? 'TBD'),
          fee: Number(data.fee) || 0,
          date: undefined,
          completedDate,
        },
      ]);
      if (status === 'In Progress' || status === 'Completed') {
        setLinkToVisitTreatment({
          toothNumber,
          treatmentName: String(data.treatment),
          status,
          fee: Number(data.fee) || 0,
        });
        setPendingLinkRecordId(newId);
        setLinkToVisitModalOpen(true);
      }
    }
  };

  const handleSaveAddTreatment = (data: {
    toothNumber: number;
    treatment: string;
    fee: number;
    surface: string;
    status: string;
    provider: string;
    providerLabel: string;
    note: string;
  }) => {
    const status = data.status as ChartingRecord['status'];
    const completedDate =
      status === 'Completed' || status === 'Done'
        ? new Date().toISOString().slice(0, 10)
        : undefined;
    const newId = `cr-${Date.now()}`;
    setChartingRecords((prev) => [
      ...prev,
      {
        id: newId,
        toothNumber: data.toothNumber,
        treatment: data.treatment,
        status,
        provider: data.providerLabel,
        fee: data.fee,
        date: undefined,
        completedDate,
      },
    ]);
    if (status === 'In Progress' || status === 'Completed') {
      setLinkToVisitTreatment({
        toothNumber: data.toothNumber,
        treatmentName: data.treatment,
        status,
        fee: data.fee,
      });
      setPendingLinkRecordId(newId);
      setLinkToVisitModalOpen(true);
    }
  };

  const handleLinkVisitSkip = () => {
    setLinkToVisitTreatment(null);
    setPendingLinkRecordId(null);
  };

  const handleLinkVisit = (visitId: string) => {
    if (pendingLinkRecordId) {
      setChartingRecords((prev) =>
        prev.map((r) => (r.id === pendingLinkRecordId ? { ...r, linkedVisitId: visitId } : r))
      );
    }
    setPendingLinkRecordId(null);
    setLinkToVisitTreatment(null);
  };

  const handleEditTreatmentFromModal = (_record: ChartingRecord) => {
    toast.info('Edit treatment — coming soon');
  };

  const handleLinkToVisitFromModal = (record: ChartingRecord) => {
    const status = record.status === 'Done' ? 'Completed' : record.status;
    if (status !== 'In Progress' && status !== 'Completed') return;
    setLinkToVisitTreatment({
      toothNumber: record.toothNumber,
      treatmentName: record.treatment,
      status,
      fee: record.fee,
    });
    setPendingLinkRecordId(record.id);
    setLinkToVisitModalOpen(true);
  };

  const handleDeleteTreatmentFromModal = (recordId: string) => {
    setChartingRecords((prev) => prev.filter((r) => r.id !== recordId));
    toast.success('Treatment removed');
  };

  const updateRecordStatus = (recordId: string, status: ChartingRecord['status']) => {
    setChartingRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const completedDate =
          status === 'Completed' || status === 'Done'
            ? r.completedDate ?? new Date().toISOString().slice(0, 10)
            : undefined;
        return { ...r, status, completedDate };
      })
    );
    if (status === 'In Progress' || status === 'Completed') {
      const record = chartingRecords.find((r) => r.id === recordId);
      if (record && !record.linkedVisitId) {
        setLinkToVisitTreatment({
          toothNumber: record.toothNumber,
          treatmentName: record.treatment,
          status,
          fee: record.fee,
        });
        setPendingLinkRecordId(recordId);
        setLinkToVisitModalOpen(true);
      }
    }
  };

  const toothStatus = useMemo(() => {
    const statusByTooth: Partial<Record<number, ToothStatus>> = {};
    for (const r of chartingRecords) {
      const s = recordStatusToToothStatus(r.status);
      if (statusByTooth[r.toothNumber] === undefined) statusByTooth[r.toothNumber] = s;
      else if (s === 'has_treatment') statusByTooth[r.toothNumber] = 'has_treatment';
      else if (s === 'pending' && statusByTooth[r.toothNumber] !== 'has_treatment') statusByTooth[r.toothNumber] = 'pending';
      else if (s === 'new' && !statusByTooth[r.toothNumber]) statusByTooth[r.toothNumber] = 'new';
    }
    return statusByTooth;
  }, [chartingRecords]);

  const handleToothClick = (toothNumber: number) => {
    setSelectedToothNumber(toothNumber);
    setToothRecordModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col min-h-0 max-h-full flex-1 overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      <div className="flex-shrink-0 mb-3 text-xs text-muted-foreground">
        <Link href="/dashboard/patients" className="hover:text-foreground">
          Patient List
        </Link>
        <span className="mx-2 opacity-60">›</span>
        <span className="text-foreground/80">Patient Details</span>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden gap-3 sm:gap-4">
        <div className="flex-shrink-0 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full border border-border bg-muted/30 flex items-center justify-center text-sm font-semibold text-foreground flex-shrink-0">
              {patient.initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{patient.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {patient.alerts.map((a) => (
                  <div
                    key={a.label}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]',
                      a.variant === 'danger'
                        ? 'border-destructive/30 bg-destructive/10 text-destructive'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    )}
                  >
                    {a.variant === 'danger' ? (
                      <CircleDollarSign className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    <span className="font-medium">{a.label}:</span>
                    <span className="truncate">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-10 w-10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 border-b border-border/60 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-5">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={cn(
                  'relative py-3 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground',
                  activeTab === t && 'text-foreground font-medium'
                )}
              >
                {t}
                {activeTab === t && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'flex-1 min-h-0 min-w-0',
            isCharting ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
          )}
        >
        {activeTab === 'Overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Last Visit" value={patient.lastVisit} />
              <StatCard icon={<User className="h-4 w-4" />} label="Upcoming" value={patient.upcoming} />
              <StatCard icon={<Stethoscope className="h-4 w-4" />} label="Active Treatments" value={patient.activeTreatments} />
              <StatCard icon={<Wallet className="h-4 w-4" />} label="Balance" value={patient.balance} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Patient Profile</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                <ProfileField label="Age" value={String(patient.age)} />
                <ProfileField label="Date of Birth" value={patient.dateOfBirth} />
                <ProfileField label="Gender" value={patient.gender} />
                <ProfileField label="Phone number" value={patient.phoneNumber} />
                <ProfileField label="Email address" value={patient.emailAddress} />
                <ProfileField label="Address" value={patient.address} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'Charting' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0 min-w-0">
            <div className="min-w-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
              <div className="flex-shrink-0 flex border-b border-border/60 px-3">
                {CHARTING_SUBTABS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setChartingSubTab(st)}
                    className={cn(
                      'relative py-3 px-2 text-sm font-medium text-muted-foreground hover:text-foreground',
                      chartingSubTab === st && 'text-foreground'
                    )}
                  >
                    {st}
                    {chartingSubTab === st && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              {chartingSubTab === 'Odontogram' && (
                <div className="flex-1 min-h-0 p-4 flex flex-col min-w-0">
                  <div className="flex-1 min-h-0 min-w-0 w-full flex items-center justify-center">
                    <ToothChart
                      selectedTeeth={selectedTeeth}
                      onSelectionChange={setSelectedTeeth}
                      onToothClick={handleToothClick}
                      toothStatus={toothStatus}
                      hideLegend
                      hideSelectedHint
                      className="h-full w-full max-h-full max-w-full"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 flex-shrink-0 text-sm text-foreground">
                    {CHARTING_LEGEND.map(({ label, color }) => (
                      <span key={label} className="inline-flex items-center gap-2">
                        <span className={cn('w-4 h-4 rounded-sm shrink-0', color)} aria-hidden />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {chartingSubTab === 'Imaging' && (
                <div className="flex-1 min-h-[280px] p-4 flex items-center justify-center text-muted-foreground text-sm">
                  Imaging section — coming soon
                </div>
              )}
            </div>

            <div className="min-w-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
              {chartingRecords.length > 0 ? (
                <>
                  <div className="flex-shrink-0 p-3 border-b border-border/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <select className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Status</option>
                      </select>
                      <select className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Provider</option>
                      </select>
                      <select className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Sort</option>
                      </select>
                      <Button className="ml-auto gap-1 h-8 text-xs" size="sm" onClick={() => setAddTreatmentModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add Treatment
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto min-w-0">
                    <table className="w-full min-w-0 text-xs border-collapse table-fixed">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                          <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[18%] truncate">Date</th>
                          <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[22%] truncate">Treatment</th>
                          <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[10%]">Tooth</th>
                          <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[18%] truncate">Status</th>
                          <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[20%] truncate">Provider</th>
                          <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-[10%]">Fee</th>
                          <th className="w-[4%]" aria-label="Actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {chartingRecords.map((r) => (
                          <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20">
                            <td className="py-1.5 px-2 text-foreground truncate" title={r.date ? formatDateDisplay(r.date) : '-'}>{r.date ? formatDateDisplay(r.date) : '-'}</td>
                            <td className="py-1.5 px-2 text-foreground truncate" title={r.treatment}>{r.treatment}</td>
                            <td className="py-1.5 px-2 text-foreground">#{r.toothNumber}</td>
                            <td className="py-1.5 px-2">
                              <Select
                                value={r.status}
                                onValueChange={(v) => updateRecordStatus(r.id, v as ChartingRecord['status'])}
                              >
                                <SelectTrigger
                                  className="h-7 min-w-0 w-full border border-input/60 rounded shadow-none gap-1.5 py-0 px-2 text-xs font-normal [&>span]:flex [&>span]:items-center [&>span]:min-w-0"
                                  title={
                                    (r.status === 'Done' || r.status === 'Completed') && r.completedDate
                                      ? `Completed on ${formatDateDisplay(r.completedDate)}`
                                      : undefined
                                  }
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Done">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" aria-hidden />
                                      Done
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="Completed">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" aria-hidden />
                                      Completed
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="In Progress">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF956C] shrink-0" aria-hidden />
                                      In Progress
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="Planned">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" aria-hidden />
                                      Planned
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-1.5 px-2 text-foreground truncate" title={r.provider}>{r.provider}</td>
                            <td className="py-1.5 px-2 text-foreground whitespace-nowrap">₱{r.fee.toLocaleString()}</td>
                            <td className="py-1.5 px-1 w-8">
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Row actions">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 sm:px-6">
                  <div className="h-12 w-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground mb-3">
                    <FileEdit className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No records yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                    Select a tooth to add a condition or treatment, or add a general treatment.
                  </p>
                  <Button className="mt-4 gap-1.5" size="sm" onClick={() => setAddTreatmentModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Treatment
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'Overview' && activeTab !== 'Charting' && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            {activeTab} — coming soon
          </div>
        )}
        </div>
      </div>

      <AddToothRecordModal
        open={toothRecordModalOpen}
        onOpenChange={setToothRecordModalOpen}
        toothNumber={selectedToothNumber}
        treatmentsForTooth={selectedToothNumber != null ? chartingRecords.filter((r) => r.toothNumber === selectedToothNumber) : []}
        conditionsForTooth={conditionsForSelectedTooth}
        onSave={handleSaveToothRecord}
        onEditTreatment={handleEditTreatmentFromModal}
        onLinkToVisit={handleLinkToVisitFromModal}
        onDeleteTreatment={handleDeleteTreatmentFromModal}
      />

      <AddTreatmentModal
        open={addTreatmentModalOpen}
        onOpenChange={setAddTreatmentModalOpen}
        onSave={handleSaveAddTreatment}
      />

      <LinkToVisitModal
        open={linkToVisitModalOpen}
        onOpenChange={(open) => {
          setLinkToVisitModalOpen(open);
          if (!open) {
            setLinkToVisitTreatment(null);
            setPendingLinkRecordId(null);
          }
        }}
        treatment={linkToVisitTreatment}
        scheduledVisits={getScheduledVisitsForPatient(patient.id)}
        completedVisits={getCompletedVisitsForPatient(patient.id)}
        onSkip={handleLinkVisitSkip}
        onLinkVisit={handleLinkVisit}
      />
    </div>
  );
}
