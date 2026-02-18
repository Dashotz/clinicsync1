'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewAppointmentPage() {
  return (
    <div className="h-full flex flex-col overflow-auto p-4 sm:p-6 lg:p-8 bg-background">
      <header className="flex items-center gap-4 mb-6 flex-shrink-0">
        <Button variant="ghost" size="icon" asChild aria-label="Back to appointments">
          <Link href="/dashboard/appointments">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">New Appointment</h1>
      </header>
      <div className="flex-1 rounded-xl border border-border bg-card p-6">
        <p className="text-muted-foreground">New appointment form — placeholder. Add patient, dentist, date/time, and service fields here.</p>
      </div>
    </div>
  );
}
