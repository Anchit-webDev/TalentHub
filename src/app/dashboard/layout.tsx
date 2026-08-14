'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, User, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { syncedUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!syncedUser || syncedUser.role !== 'creator') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-stone-200 rounded-3xl text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900">Access Denied</h2>
        <p className="text-sm text-stone-600">This area is reserved for registered creator accounts.</p>
        <Link href="/login" className="inline-block btn-premium px-6 py-2.5 rounded-xl text-xs font-bold shadow-md">
          Login as Creator
        </Link>
      </div>
    );
  }

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Edit Profile & Portfolio', path: '/dashboard/profile', icon: User },
    { name: 'Inquiries / Leads', path: '/dashboard/inquiries', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-stone-50/40 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-stone-200/80 flex-shrink-0 shadow-sm">
        {/* Profile Card Header */}
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            {syncedUser.name ? syncedUser.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="truncate">
            <h4 className="text-sm font-extrabold text-stone-900 truncate leading-tight">{syncedUser.name || 'Creator'}</h4>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5 block">Creator Hub</span>
          </div>
        </div>

        {/* Links Panel */}
        <nav className="p-4 space-y-1.5 flex md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-0 border-b md:border-b-0 border-stone-150 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:w-full ${
                  active
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="hidden md:block my-4 border-t border-stone-100" />

          {/* View Public profile */}
          <Link
            href={`/creator/${syncedUser.id}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-stone-650 hover:bg-stone-50 hover:text-stone-900 whitespace-nowrap md:w-full"
          >
            <ExternalLink className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <span>View Public Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main child pages viewport */}
      <main className="flex-grow w-full bg-stone-50/20">
        {children}
      </main>

    </div>
  );
}
