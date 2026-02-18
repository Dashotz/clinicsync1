'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, [breakpoint]);
  return isMobile;
}

const CASHFLOW_RANGES = [
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 7 days', value: '7d' },
] as const;

type CashflowRangeValue = (typeof CASHFLOW_RANGES)[number]['value'];

function getCashflowDateRangeLabel(range: CashflowRangeValue): string {
  const now = new Date();
  const start = new Date(now);
  if (range === '7d') {
    start.setDate(start.getDate() - 6);
    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: start.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
    const endStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  }
  if (range === '3m') {
    start.setMonth(start.getMonth() - 3);
  } else {
    start.setMonth(start.getMonth() - 6);
  }
  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

// Full cashflow data: monthly (Aug–Jan) and daily for last 7 days
const CASHFLOW_MONTHLY = [
  { month: 'Aug', value: 4000 },
  { month: 'Sept', value: 5500 },
  { month: 'Oct', value: 5200 },
  { month: 'Nov', value: 6000 },
  { month: 'Dec', value: 5800 },
  { month: 'Jan', value: 16000 },
];

const CASHFLOW_DAILY_7D = [
  { day: 'Mon', value: 1200 },
  { day: 'Tue', value: 800 },
  { day: 'Wed', value: 2400 },
  { day: 'Thu', value: 1500 },
  { day: 'Fri', value: 900 },
  { day: 'Sat', value: 2100 },
  { day: 'Sun', value: 1600 },
];

// Patients by period: { new, returning }
const PATIENTS_BY_PERIOD: Record<string, { new: number; returning: number }> = {
  'This month': { new: 5, returning: 22 },
  'Last 3 months': { new: 18, returning: 64 },
  'Last 6 months': { new: 42, returning: 128 },
};

// Popular treatments by period (treatment name -> count). Same treatments, different counts.
const TREATMENTS_BY_PERIOD: Record<string, { name: string; count: number }[]> = {
  'This month': [
    { name: 'Tooth Filling', count: 45 },
    { name: 'General Checkup', count: 32 },
    { name: 'Extraction', count: 18 },
    { name: 'RCT', count: 15 },
    { name: 'Caries', count: 8 },
  ],
  'Last 3 months': [
    { name: 'Tooth Filling', count: 112 },
    { name: 'General Checkup', count: 89 },
    { name: 'Extraction', count: 54 },
    { name: 'RCT', count: 41 },
    { name: 'Caries', count: 28 },
  ],
  'Last 6 months': [
    { name: 'Tooth Filling', count: 218 },
    { name: 'General Checkup', count: 165 },
    { name: 'Extraction', count: 98 },
    { name: 'RCT', count: 72 },
    { name: 'Caries', count: 45 },
  ],
};

const TREATMENT_COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [cashflowRange, setCashflowRange] = useState<CashflowRangeValue>('6m');
  const [patientsPeriod, setPatientsPeriod] = useState('This month');
  const [treatmentPeriod, setTreatmentPeriod] = useState('This month');
  const [patientsOpen, setPatientsOpen] = useState(false);
  const [treatmentOpen, setTreatmentOpen] = useState(false);

  const dateStr = useMemo(() => formatDate(), []);

  const cashflowChartHeight = isMobile ? 200 : 256;
  const barChartHeight = isMobile ? 180 : 220;
  const barChartYAxisWidth = isMobile ? 88 : 120;

  // Cashflow: filter data and total by range
  const { cashflowChartData, cashflowTotal, cashflowDataKey, cashflowLabelKey, cashflowYMax } = useMemo(() => {
    if (cashflowRange === '7d') {
      const data = CASHFLOW_DAILY_7D;
      const total = data.reduce((s, d) => s + d.value, 0);
      const maxVal = Math.max(...data.map((d) => d.value));
      const yMax = Math.ceil((maxVal * 1.15) / 500) * 500;
      return {
        cashflowChartData: data,
        cashflowTotal: total,
        cashflowDataKey: 'day' as const,
        cashflowLabelKey: 'day' as const,
        cashflowYMax: yMax,
      };
    }
    const slice =
      cashflowRange === '6m' ? CASHFLOW_MONTHLY :
      cashflowRange === '3m' ? CASHFLOW_MONTHLY.slice(-3) :
      CASHFLOW_MONTHLY; // 7d handled above; fallback
    const total = slice.reduce((s, d) => s + d.value, 0);
    const maxVal = Math.max(...slice.map((d) => d.value));
    const yMax = Math.ceil((maxVal * 1.15) / 5000) * 5000;
    return {
      cashflowChartData: slice,
      cashflowTotal: total,
      cashflowDataKey: 'month' as const,
      cashflowLabelKey: 'month' as const,
      cashflowYMax: yMax,
    };
  }, [cashflowRange]);

  // Patients: counts and percentages by period
  const patientsStats = useMemo(() => {
    const { new: newCount, returning: returningCount } = PATIENTS_BY_PERIOD[patientsPeriod] ?? PATIENTS_BY_PERIOD['This month'];
    const total = newCount + returningCount;
    const newPct = total === 0 ? 0 : Math.round((newCount / total) * 100);
    const returningPct = total === 0 ? 0 : Math.round((returningCount / total) * 100);
    return { newCount, returningCount, total, newPct, returningPct };
  }, [patientsPeriod]);

  // Patients: donut chart (New = dark blue, Returning = light blue)
  const patientsDonutData = useMemo(
    () => [
      { name: 'New patients', value: patientsStats.newCount, fill: '#2563eb' },
      { name: 'Returning patients', value: patientsStats.returningCount, fill: '#93c5fd' },
    ],
    [patientsStats.newCount, patientsStats.returningCount]
  );

  // Popular treatments: by period with bar colors
  const treatmentChartData = useMemo(() => {
    const rows = TREATMENTS_BY_PERIOD[treatmentPeriod] ?? TREATMENTS_BY_PERIOD['This month'];
    return rows.map((row, i) => ({
      ...row,
      fill: TREATMENT_COLORS[i % TREATMENT_COLORS.length],
    }));
  }, [treatmentPeriod]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="h-full flex flex-col overflow-auto p-4 sm:p-6 lg:p-8 bg-background">
      {/* Header: greeting + date */}
      <header className="flex flex-col gap-0.5 sm:gap-1 mb-4 sm:mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          {greeting}, User!
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm truncate max-w-full">{dateStr}</p>
      </header>

      {/* Cashflow card */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Cashflow</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Cash</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 break-all">
              ₱{cashflowTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 overflow-x-auto -mx-1 px-1 pb-1 sm:mx-0 sm:overflow-visible sm:pb-0 sm:pt-0.5">
            <p className="text-xs sm:text-sm text-muted-foreground shrink-0" aria-live="polite">
              {getCashflowDateRangeLabel(cashflowRange)}
            </p>
            <ButtonGroup aria-label="Cashflow date range" className="shrink-0 flex-nowrap sm:flex-wrap">
              {CASHFLOW_RANGES.map(({ label, value }) => (
                <Button
                  key={value}
                  type="button"
                  variant={cashflowRange === value ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setCashflowRange(value)}
                  className="whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-3"
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
        <div className="w-full min-w-0" style={{ height: cashflowChartHeight, minHeight: cashflowChartHeight }}>
          <ResponsiveContainer width="100%" height={cashflowChartHeight} minWidth={0} minHeight={cashflowChartHeight}>
            <AreaChart data={cashflowChartData} margin={{ top: 8, right: 4, left: isMobile ? -8 : 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey={cashflowLabelKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                domain={[0, cashflowYMax]}
                width={isMobile ? 32 : 40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => [`₱${(value ?? 0).toLocaleString()}`, 'Cash']}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#cashflowGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Two cards: Patients + Popular Treatment — stack below 1280px so 1024px has full-width cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Patients */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col min-w-0 min-h-[280px] xl:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">Patients</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setPatientsOpen((o) => !o); setTreatmentOpen(false); }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground hover:bg-muted/50 shrink-0 min-w-0"
              >
                <span className="truncate">{patientsPeriod}</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${patientsOpen ? 'rotate-180' : ''}`} />
              </button>
              {patientsOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 rounded-lg border border-border bg-card shadow-lg z-10 min-w-[130px] sm:min-w-[140px]">
                  {['This month', 'Last 3 months', 'Last 6 months'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setPatientsPeriod(opt); setPatientsOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/80 text-foreground"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-full min-w-0 flex-1 flex flex-col items-center justify-center min-h-[180px]">
            <div className="relative flex items-center justify-center w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={180}>
                <PieChart>
                  <Pie
                    data={patientsDonutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="100%"
                    strokeWidth={0}
                    paddingAngle={0}
                  >
                    {patientsDonutData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload, coordinate }) => {
                      if (!active || !payload?.length || !coordinate) return null;
                      const entry = payload[0].payload as { name: string; value: number; fill: string };
                      const fill = entry.fill;
                      // Position tooltip outside the chart (to the right of cursor)
                      const x = coordinate.x + (isMobile ? 12 : 20);
                      const y = coordinate.y;
                      return (
                        <div
                          className="rounded-lg px-3 py-2 text-sm font-medium shadow-md border-0"
                          style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            transform: 'translateY(-50%)',
                            backgroundColor: fill,
                            color: fill === '#93c5fd' ? '#1e3a5f' : '#fff',
                            pointerEvents: 'none',
                            zIndex: 10,
                          }}
                        >
                          {entry.name} : {entry.value}
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{patientsStats.total}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Patients</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" aria-hidden />
                New patients
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#93c5fd]" aria-hidden />
                Returning patients
              </span>
            </div>
          </div>
        </section>

        {/* Popular Treatment */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col min-w-0 min-h-[280px] xl:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">Popular Treatment</h2>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => { setTreatmentOpen((o) => !o); setPatientsOpen(false); }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground hover:bg-muted/50 min-w-0"
              >
                <span className="truncate">{treatmentPeriod}</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${treatmentOpen ? 'rotate-180' : ''}`} />
              </button>
              {treatmentOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 rounded-lg border border-border bg-card shadow-lg z-10 min-w-[130px] sm:min-w-[140px]">
                  {['This month', 'Last 3 months', 'Last 6 months'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setTreatmentPeriod(opt); setTreatmentOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/80 text-foreground"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-full min-w-0" style={{ height: barChartHeight, minHeight: barChartHeight }}>
            <ResponsiveContainer width="100%" height={barChartHeight} minWidth={0} minHeight={barChartHeight}>
              <BarChart
                data={treatmentChartData}
                layout="vertical"
                margin={{ top: 0, right: isMobile ? 8 : 16, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={barChartYAxisWidth}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: isMobile ? 10 : 12 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={isMobile ? 20 : 28}>
                  {treatmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
