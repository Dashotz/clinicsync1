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

