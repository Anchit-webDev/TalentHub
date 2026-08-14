'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, CheckCircle2, AlertCircle, Phone, Calendar, ArrowRight, User, Loader2, Star } from 'lucide-react';

interface DashboardData {
  profile: {
    name: string;
    verified: boolean;
    completeness: number;
    categories: string[];
    averageRating: number;
    reviewsCount: number;
  };
  stats: {
    totalCount: number;
    pendingCount: number;
    acceptedCount: number;
    completedCount: number;
  };
  recentInquiries: Array<{
    id: string;
    clientName: string;
    clientPhone: string;
    category: string;
    message: string;
    eventDate: string | null;
    status: string;
    createdAt: string;
  }>;
}

const CreatorDashboard: React.FC = () => {
  const router = useRouter();
  const { syncedUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!syncedUser) {
      router.push('/login');
      return;
    }

    if (syncedUser.role !== 'creator') {
      router.push('/explore');
      return;
    }

    // Fetch dashboard stats
    fetch(`/api/dashboard/stats?userId=${syncedUser.id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load dashboard statistics.');
      })
      .then((statsData) => {
        setData(statsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [syncedUser, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-900">Error Loading Dashboard</h2>
        <p className="text-sm text-stone-600 mt-2">{error || 'Please make sure your onboarding is completed.'}</p>
        <Link href="/onboarding" className="inline-block mt-4 btn-premium px-6 py-2.5 rounded-xl text-sm font-bold">
          Complete Onboarding
        </Link>
      </div>
    );
  }

  const { profile, stats, recentInquiries } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Aadab, {profile.name || syncedUser?.name || 'Creator'}!
            </h1>
            {profile.verified ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-150 px-2.5 py-1 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Verification Pending
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 mt-1.5 flex flex-wrap gap-1.5 items-center">
            Categories:{' '}
            {profile.categories.map((c) => (
              <span key={c} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-xs font-semibold border border-stone-200">
                {c}
              </span>
            ))}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/profile"
            className="px-4 py-2.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            Edit Profile
          </Link>
          <Link
            href="/dashboard/inquiries"
            className="btn-premium px-5 py-2.5 text-sm font-bold rounded-xl shadow-md"
          >
            View Inquiries
          </Link>
        </div>
      </div>

      {/* Info grids: Profile completeness + Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Completeness card */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Profile Completeness</h3>
            <span className="text-sm font-black text-amber-600">{profile.completeness}%</span>
          </div>

          <div className="w-full bg-stone-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profile.completeness}%` }}
            />
          </div>

          <p className="text-xs text-stone-500 font-medium">
            {profile.completeness < 100
              ? '💡 Tip: Add sample videos or photos in your portfolio to reach 100% and gain higher rank in explore results.'
              : '🌟 Excellent! Your profile is 100% complete. Keep your pricing and WhatsApp information updated.'}
          </p>
        </div>

        {/* Rating Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-2">Creator Rating</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-3xl font-black text-stone-900">
              {profile.averageRating > 0 ? profile.averageRating : 'N/A'}
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-xs text-stone-500">
              based on <span className="font-bold text-stone-700">{profile.reviewsCount}</span> client reviews
            </div>
          </div>
          <div className="text-[11px] text-stone-400 mt-2">
            Reviews are collected only after completing lead inquiry service.
          </div>
        </div>

      </div>

      {/* KPI stats metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-2xl border border-stone-200/85 shadow-sm text-center">
          <div className="text-2xl font-black text-stone-900">{stats.totalCount}</div>
          <div className="text-xs font-semibold text-stone-500 uppercase mt-1">Total Inquiries</div>
        </div>

        <div className="bg-[#fffbeb] p-6 rounded-2xl border border-amber-200/60 shadow-sm text-center">
          <div className="text-2xl font-black text-amber-700">{stats.pendingCount}</div>
          <div className="text-xs font-semibold text-amber-600 uppercase mt-1">Pending Inquiries</div>
        </div>

        <div className="bg-[#fdf2f8] p-6 rounded-2xl border border-pink-200/60 shadow-sm text-center">
          <div className="text-2xl font-black text-pink-700">{stats.acceptedCount}</div>
          <div className="text-xs font-semibold text-pink-600 uppercase mt-1">Active Deals</div>
        </div>

        <div className="bg-[#f0fdf4] p-6 rounded-2xl border border-emerald-200/60 shadow-sm text-center">
          <div className="text-2xl font-black text-emerald-700">{stats.completedCount}</div>
          <div className="text-xs font-semibold text-emerald-600 uppercase mt-1">Completed Gigs</div>
        </div>

      </div>

      {/* Recent inquiries list */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-900">Recent Booking Inquiries</h2>
          <Link
            href="/dashboard/inquiries"
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-bold transition-all"
          >
            <span>See all inquiries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            You don’t have any booking inquiries yet. Once clients search and submit booking requests, they will show up here.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/40 transition-colors">
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-stone-900">{inq.clientName || 'Recruiter'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      inq.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : inq.status === 'accepted'
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : inq.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}>
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 italic">"{inq.message}"</p>

                  <div className="flex flex-wrap gap-4 text-xs text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Date:{' '}
                      {inq.eventDate
                        ? new Date(inq.eventDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Flexible'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      WhatsApp: {inq.clientPhone}
                    </span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 text-[10px] uppercase font-bold border border-stone-200">
                      Tag: {inq.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/inquiries"
                    className="px-3.5 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 transition-all text-center"
                  >
                    Manage Lead
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CreatorDashboard;
