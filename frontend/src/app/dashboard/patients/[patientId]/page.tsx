import { notFound } from 'next/navigation';
import { getPatientDetailsById } from '../patientData';
import { PatientDetailsView } from './PatientDetailsView';

type PageProps = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientDetailsPage({ params }: PageProps) {
  const { patientId } = await params;
  const patient = getPatientDetailsById(patientId);
  if (!patient) notFound();
  return <PatientDetailsView patient={patient} />;
}

