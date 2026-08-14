'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Shield, XCircle, AlertTriangle, UserCheck, Trash2, Loader2, Sparkles, MapPin } from 'lucide-react';

interface CreatorUser {
  id: string;
  name: string | null;
  phone: string | null;
  creatorProfile: {
    bio: string;
    city: string;
    categories: string[];
    verified: boolean;
    priceRangeMin: number;
    priceRangeMax: number;
  } | null;
}

const AdminPanel: React.FC = () => {
  const router = useRouter();
  const { syncedUser, loading: authLoading } = useAuth();
  
  const [creators, setCreators] = useState<CreatorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Mock reported items for demonstration since no Report model is in standard schema
  const [reportedItems, setReportedItems] = useState([
    { id: '1', reporter: 'Rohan Gupta', subject: 'Simulated User Profile', reason: 'Pasting unrelated external video link', targetId: 'mock-creator-1', targetName: 'DJ Rahul' },
    { id: '2', reporter: 'Priya Sen', subject: 'Simulated Review Spam', reason: 'Unprofessional commentary', targetId: 'mock-review-2', targetName: 'Review Comment ID 293' }
  ]);

  const fetchCreators = () => {
    fetch('/api/admin/creators')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load creators list for admin.');
      })
      .then((data) => {
        setCreators(data.creators || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (authLoading) return;

    // Direct redirection protection
    if (!syncedUser) {
      router.push('/login');
      return;
    }

    if (syncedUser.role !== 'admin') {
      router.push('/explore');
      return;
    }

    fetchCreators();
  }, [syncedUser, authLoading, router]);

  const handleApprove = async (userId: string, currentStatus: boolean) => {
    setError('');
    setUpdatingId(userId);

    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified: !currentStatus }),
      });

      if (res.ok) {
        fetchCreators();
      } else {
        setError('Failed to update verification status.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReport = (id: string) => {
    setReportedItems(reportedItems.filter(item => item.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const unverifiedCreators = creators.filter((c) => c.creatorProfile && !c.creatorProfile.verified);
  const verifiedCreators = creators.filter((c) => c.creatorProfile && c.creatorProfile.verified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-850 shadow flex items-center gap-4">
        <span className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
          <Shield className="w-8 h-8" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Moderation Console</h1>
          <p className="text-xs text-stone-400 mt-1">Approve partner verifications and moderate flagged community reports</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Verifications Queue */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Verifications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Pending Verifications Queue ({unverifiedCreators.length})
            </h2>

            {unverifiedCreators.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm border border-dashed border-stone-200 rounded-2xl">
                No creators are currently in the verification queue.
              </div>
            ) : (
              <div className="space-y-4">
                {unverifiedCreators.map((c) => {
                  const profile = c.creatorProfile!;
                  return (
                    <div key={c.id} className="p-5 border border-stone-200 rounded-2xl space-y-3 bg-stone-50/50">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="font-extrabold text-stone-900 text-base">{c.name}</span>
                          <div className="text-[10px] text-stone-550 flex items-center gap-1.5 font-semibold mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {profile.city} • WhatsApp: {c.phone}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleApprove(c.id, false)}
                          disabled={updatingId === c.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          {updatingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          <span>Approve Profile</span>
                        </button>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {profile.bio}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {profile.categories.map((cat) => (
                          <span key={cat} className="bg-white text-stone-700 text-[10px] px-2 py-0.5 rounded border border-stone-200 font-bold">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Verified Partners */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verified Partners Directory ({verifiedCreators.length})
            </h2>

            {verifiedCreators.length === 0 ? (
              <div className="py-6 text-center text-stone-450 text-xs">
                No partners verified yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-150">
                {verifiedCreators.map((c) => (
                  <div key={c.id} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">{c.name}</span>
                      <span className="text-[10px] text-stone-500 block font-semibold">{c.creatorProfile?.city} • {c.creatorProfile?.categories.slice(0, 3).join(', ')}</span>
                    </div>

                    <button
                      onClick={() => handleApprove(c.id, true)}
                      disabled={updatingId === c.id}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      Revoke Approval
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Moderation reported items */}
        <div className="col-span-1">
          
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Flagged Community Reports ({reportedItems.length})
            </h2>

            <div className="space-y-4">
              {reportedItems.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs font-medium">
                  Clean state. No active profile reports.
                </div>
              ) : (
                reportedItems.map((item) => (
                  <div key={item.id} className="p-4 border border-stone-200 rounded-2xl bg-stone-50/50 space-y-2.5 text-xs">
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <span className="font-bold text-stone-900 block">{item.subject}</span>
                        <span className="text-[10px] text-stone-500">Reported by {item.reporter}</span>
                      </div>
                      
                      <button
                        onClick={() => deleteReport(item.id)}
                        className="text-stone-400 hover:text-red-500 p-1 rounded-md transition-colors"
                        title="Dismiss report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-stone-150 text-[11px] text-stone-600 leading-relaxed font-semibold">
                      <span className="font-bold text-stone-700 block mb-0.5">Report Reason:</span>
                      "{item.reason}"
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-stone-500 pt-1">
                      <span>Target: {item.targetName}</span>
                      <button className="font-bold text-rose-600 hover:underline">
                        Take Action
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminPanel;
