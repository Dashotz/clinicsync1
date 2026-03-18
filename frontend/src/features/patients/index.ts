/** Patients feature – list, details, charting, modals, data */

export * from './data/patient-data';
export { getToothDisplayName, TOOTH_NUMBER_TO_NAME } from './utils/tooth-names';
export { PatientDetailsView } from './components/patient-details-view';
export { AddToothRecordModal } from './components/add-tooth-record-modal';
export { AddTreatmentModal } from './components/add-treatment-modal';
export { LinkToVisitModal, type LinkToVisitTreatment } from './components/link-to-visit-modal';
