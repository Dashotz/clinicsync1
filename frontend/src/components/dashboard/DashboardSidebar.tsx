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

const navItems = [
  { label: 'Today', href: '/dashboard', icon: Home },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Insights', href: '/dashboard/insights', icon: BarChart3 },
];

export function DashboardSidebar() {
  return (
    <aside className="w-20 flex flex-col items-center py-6 bg-card border-r border-border min-h-screen">
      <Link
        href="/dashboard"
        className="mb-8 flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden"
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

      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1.5 py-3 px-4 rounded-lg min-w-[4rem] transition-colors ${
              href === '/dashboard'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1 pt-4 border-t border-border">
        <button
          type="button"
          className="p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="mt-4 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          IL
        </div>
      </div>
    </aside>
  );
}
