import { notFound } from 'next/navigation';
import { getPatientDetailsById } from '@/features/patients/data/patient-data';
import { PatientDetailsView } from '@/features/patients/components/patient-details-view';

type PageProps = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;
  const patient = getPatientDetailsById(patientId);
  if (!patient) notFound();
  return <PatientDetailsView patient={patient} />;
}
