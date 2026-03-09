export type PatientRow = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  lastVisit: string;
  status: 'Active' | 'Archive';
};

export const PATIENT_ROWS: PatientRow[] = [
  { id: 'p1', name: 'Francis Cruz', mobile: '+9454987652', email: 'francis@gmail.com', lastVisit: 'Today', status: 'Active' },
  { id: 'p2', name: 'Francis Cruz', mobile: '+9454987652', email: 'francis@gmail.com', lastVisit: '3 days ago', status: 'Active' },
  { id: 'p3', name: 'Francis Cruz', mobile: '+9454987652', email: 'francis@gmail.com', lastVisit: 'Jan 6, 2026', status: 'Archive' },
  ...Array.from({ length: 51 }, (_, i) => {
    const idx = i + 4;
    const name = ['Ivary Lapina', 'John Llyod', 'Patient A', 'Patient B', 'Patient C', 'Patient D'][i % 6];
    const last = ['Today', 'Yesterday', '3 days ago', 'Jan 6, 2026', 'Dec 12, 2025'][i % 5];
    return {
      id: `p${idx}`,
      name,
      mobile: '+63912345678',
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      lastVisit: last,
      status: i % 7 === 0 ? 'Archive' : 'Active',
    } satisfies PatientRow;
  }),
];

export type PatientDetails = {
  id: string;
  name: string;
  initials: string;
  age: number | string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  lastVisit: string;
  upcoming: string;
  activeTreatments: string;
  balance: string;
  alerts: Array<{ label: string; value: string; variant?: 'warning' | 'danger' }>;
};

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Per-tooth condition record (for Add Record modal when tooth has history). */
export type ToothConditionRecord = {
  id: string;
  dateRecorded: string;
  condition: string;
  surface: string;
  severity: string;
};

/** Returns condition history for a specific tooth (used in Add Record modal). */
export function getToothConditionsForTooth(patientId: string, toothNumber: number): ToothConditionRecord[] {
  const row = PATIENT_ROWS.find((r) => r.id === patientId);
  if (!row) return [];
  const name = row.name.toLowerCase();
  if (name === 'ivary lapina' && toothNumber === 29) {
    return [
      { id: 'tc-1', dateRecorded: '2026-03-02', condition: 'Caries', surface: 'D', severity: 'Moderate' },
    ];
  }
  return [];
}

/** Charting/treatment history record for the Charting tab (odontogram + table). */
export type ChartingRecord = {
  id: string;
  toothNumber: number;
  treatment: string;
  status: 'Done' | 'Completed' | 'Planned' | 'In Progress';
  provider: string;
  fee: number;
  /** Optional; planned treatments may have no date yet */
  date?: string;
  /** When status is Done/Completed, show "Completed on {date}" on hover */
  completedDate?: string;
  /** Set when user links this treatment to a visit via Link to Visit modal */
  linkedVisitId?: string;
};

/** Visit option for Link to Visit modal (scheduled or completed). */
export type VisitOption = {
  id: string;
  date: string;
  label: string;
};

/** Mock scheduled visits for a patient (would come from API). */
export function getScheduledVisitsForPatient(patientId: string): VisitOption[] {
  const row = PATIENT_ROWS.find((r) => r.id === patientId);
  if (!row) return [];
  return [
    { id: 's1', date: '2026-02-24', label: 'Root canal treatment, +2' },
  ];
}

/** Mock completed visits for a patient (would come from API). */
export function getCompletedVisitsForPatient(patientId: string): VisitOption[] {
  const row = PATIENT_ROWS.find((r) => r.id === patientId);
  if (!row) return [];
  return [
    { id: 'c1', date: '2026-01-12', label: 'Pulp Capping' },
    { id: 'c2', date: '2026-01-04', label: 'Consultation' },
    { id: 'c3', date: '2025-12-21', label: 'Amalgam Filling' },
  ];
}

/** Returns treatment history for a patient (used in Charting tab). Keyed by patient id for now. */
export function getChartingRecordsByPatientId(patientId: string): ChartingRecord[] {
  const row = PATIENT_ROWS.find((r) => r.id === patientId);
  if (!row) return [];
  const name = row.name.toLowerCase();

  if (name === 'ivary lapina') {
    return [
      {
        id: 'cr-ivary-1',
        toothNumber: 29,
        treatment: 'Root Canal Treatment',
        status: 'Planned',
        provider: 'Dr. Jeffrey Epstein',
        fee: 6500,
        date: undefined,
      },
    ];
  }

  if (name === 'francis cruz') {
    return [
      {
        id: 'cr-f1',
        toothNumber: 12,
        treatment: 'Tooth filling',
        status: 'Completed',
        provider: 'Dr. Juan Cruz',
        fee: 600,
        date: '2026-01-26',
        completedDate: '2026-01-26',
      },
      {
        id: 'cr-f2',
        toothNumber: 18,
        treatment: 'Cleaning',
        status: 'In Progress',
        provider: 'Dr. Juan Cruz',
        fee: 800,
        date: '2026-01-06',
      },
      {
        id: 'cr-f3',
        toothNumber: 6,
        treatment: 'Extraction',
        status: 'Planned',
        provider: 'Dr. Jeffrey Epstein',
        fee: 1200,
        date: undefined,
      },
    ];
  }

  return [];
}

export function getPatientDetailsById(patientId: string): PatientDetails | null {
  const row = PATIENT_ROWS.find((r) => r.id === patientId);
  if (!row) return null;

  const isIvary = row.name.toLowerCase() === 'ivary lapina';

  return {
    id: row.id,
    name: row.name,
    initials: initialsFromName(row.name) || 'P',
    age: isIvary ? 24 : 24,
    dateOfBirth: isIvary ? 'July 24, 2001' : 'July 24, 2001',
    gender: isIvary ? 'Male' : 'Male',
    phoneNumber: row.mobile,
    emailAddress: row.email,
    address: isIvary ? '1332 Maliksi 2, Bacoor City, Cavite' : '1332 Maliksi 2, Bacoor City, Cavite',
    lastVisit: row.lastVisit === 'Today' ? 'Jan 6, 2026' : row.lastVisit,
    upcoming: 'No appointment scheduled',
    activeTreatments: 'None',
    balance: isIvary ? '₱4,200' : '₱0',
    alerts: [
      { label: 'Allergy', value: 'Penicillin', variant: 'warning' },
      { label: 'Medical', value: 'Hypertension, +2', variant: 'warning' },
      { label: 'Balance overdue', value: isIvary ? '₱4,200' : '₱0', variant: isIvary ? 'danger' : 'warning' },
    ],
  };
}

