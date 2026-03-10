/** Appointments feature – calendar, modals, tooth chart, lib */

export * from './lib';
export { ToothChart, TOOTH_CHART_STATUS_COLORS, type ToothStatus } from './components/tooth-chart';
export { NewAppointmentModal, type Step1Data, type Step2Data, type NewAppointmentSavedData } from './components/new-appointment-modal';
export { EditAppointmentModal } from './components/edit-appointment-modal';
export { AppointmentDetailsModal } from './components/appointment-details-modal';
export { TreatmentSummaryModal } from './components/treatment-summary-modal';
export { AddMedicalRecordModal } from './components/add-medical-record-modal';
