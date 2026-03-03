/** Shared appointment types for calendar and modals */

export type AppointmentStatus = 'Scheduled' | 'Check-in' | 'Completed' | 'Not seen';

export type Appointment = {
  id: string;
  dentistId: number;
  patientName: string;
  start: string;
  end: string;
  service: string;
  status: AppointmentStatus;
  date: string;
  teeth?: number[];
};

export type Dentist = {
  id: number;
  name: string;
  initials: string;
};
