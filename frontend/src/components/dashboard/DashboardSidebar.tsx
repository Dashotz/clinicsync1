'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const navItems = [
  { label: 'Today', href: '/dashboard', icon: Home },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Insights', href: '/dashboard/insights', icon: BarChart3 },
];

export function DashboardSidebar() {
  return (
    <aside className="w-32 flex flex-col items-center py-6 bg-card border-r border-border min-h-screen overflow-hidden shrink-0 shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_12px_-4px_rgba(0,0,0,0.25)]">
      <Link
        href="/dashboard"
        className="mb-8 flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/50 dark:ring-border/30"
        aria-label="ClinicSync"
      >
        <Image
          src="/brand/logo-lgt.svg"
          alt=""
          width={40}
          height={40}
          className="block dark:hidden"
        />
        <Image
          src="/brand/logo-drk.svg"
          alt=""
          width={40}
          height={40}
          className="hidden dark:block"
        />
      </Link>

      <nav className="flex flex-col items-center gap-1 flex-1 w-full min-w-0 px-2">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`w-full min-w-0 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-all duration-200 box-border ${
              href === '/dashboard'
                ? 'bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/15 dark:ring-primary/25'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-sm dark:hover:bg-muted/60'
            }`}
          >
            <Icon className="w-6 h-6 shrink-0" />
            <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1 pt-4 border-t border-border w-full min-w-0 px-2 shrink-0">
        <button
          type="button"
          className="w-full flex items-center justify-center p-3 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-sm transition-all duration-200 dark:hover:bg-muted/60"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center p-3 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-sm transition-all duration-200 dark:hover:bg-muted/60"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-full flex items-center justify-center p-2">
          <ModeToggle />
        </div>
        <div className="mt-2 w-9 h-9 rounded-full bg-primary/15 text-primary font-semibold text-sm shrink-0 ring-1 ring-primary/20 dark:bg-primary/20 dark:ring-primary/25 shadow-sm flex items-center justify-center">
          IL
        </div>
      </div>
    </aside>
  );
}
