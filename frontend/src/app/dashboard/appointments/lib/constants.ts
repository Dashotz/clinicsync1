/** Shared constants for appointments (calendar + modals) */

import { Clock, User, Check, XCircle } from 'lucide-react';
import type { AppointmentStatus, Dentist } from './types';

export const TIME_SLOTS = ['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm'];
export const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

export const DENTISTS: Dentist[] = [
  { id: 1, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 2, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 3, name: 'Dr. Ang Avatar', initials: 'AA' },
  { id: 4, name: 'Dr. Ang Avatar', initials: 'AA' },
];

export const NOT_AVAILABLE_SLOTS: { dentistId: number; slotIndex: number }[] = [
  { dentistId: 1, slotIndex: 2 },
];

export const VALID_STATUSES: readonly AppointmentStatus[] = ['Scheduled', 'Check-in', 'Completed', 'Not seen'];

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { icon: typeof Clock; bg: string; iconCircle: string; statusText: string }
> = {
  Scheduled: {
    icon: Clock,
    bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    iconCircle: 'bg-amber-700 text-white dark:bg-amber-600',
    statusText: 'text-amber-800 dark:text-amber-200',
  },
  'Check-in': {
    icon: User,
    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
    iconCircle: 'bg-emerald-600 text-white dark:bg-emerald-500',
    statusText: 'text-emerald-800 dark:text-emerald-200',
  },
  Completed: {
    icon: Check,
    bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    iconCircle: 'bg-green-600 text-white dark:bg-green-500',
    statusText: 'text-green-800 dark:text-green-200',
  },
  'Not seen': {
    icon: XCircle,
    bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    iconCircle: 'bg-red-600 text-white dark:bg-red-500',
    statusText: 'text-red-800 dark:text-red-200',
  },
};

export const CARD_STYLES: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-amber-50/90 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50',
  'Check-in': 'bg-emerald-50/90 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50',
  Completed: 'bg-green-50/90 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
  'Not seen': 'bg-red-50/90 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50',
};

export const TREATMENT_OPTIONS = [
  'Cleaning',
  'General check-up',
  'Root canal treatment',
  'Tooth filling',
  'Filling',
  'Extraction',
  'Whitening',
  'Consultation',
] as const;
