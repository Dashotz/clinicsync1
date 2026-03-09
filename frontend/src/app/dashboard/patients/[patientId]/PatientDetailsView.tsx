'use client';

import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';
import type { PatientDetails } from '../patientData';
import { ToothChart } from '@/app/dashboard/appointments/components/ToothChart';

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

type Props = { patient: PatientDetails };

export function PatientDetailsView({ patient }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [chartingSubTab, setChartingSubTab] = useState<ChartingSubTab>('Odontogram');
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);

  const isCharting = activeTab === 'Charting';

  return (
    <div
      className={cn(
        'h-full flex flex-col bg-background p-4 sm:p-6 lg:p-8',
        isCharting ? 'min-h-0 max-h-full flex-1 overflow-hidden' : 'overflow-auto'
      )}
    >
      <div className="flex-shrink-0 mb-3 text-xs text-muted-foreground">
        <Link href="/dashboard/patients" className="hover:text-foreground">
          Patient List
        </Link>
        <span className="mx-2 opacity-60">›</span>
        <span className="text-foreground/80">Patient Details</span>
      </div>

      <div className={cn('flex flex-col', isCharting ? 'flex-1 min-h-0 overflow-hidden gap-3 sm:gap-4' : 'gap-3 sm:gap-4')}>
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

        <div className="flex-shrink-0 border-b border-border/60">
          <div className="flex items-center gap-5 overflow-x-auto">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0 min-w-0">
            <div className="lg:col-span-2 min-w-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
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

            <div className="min-w-0 flex flex-col rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="h-12 w-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground mb-3">
                  <FileEdit className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-foreground">No records yet</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                  Select a tooth to add a condition or treatment, or add a general treatment.
                </p>
                <Button className="mt-4 gap-1.5" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Treatment
                </Button>
              </div>
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
  );
}
