'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Calendar, Phone, MessageSquare, Check, X, CheckCircle, Loader2 } from 'lucide-react';

interface Inquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  category: string;
  message: string;
  eventDate: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  client: {
    name: string;
    phone: string;
  };
}

const InquiriesPage: React.FC = () => {
  const router = useRouter();
  const { syncedUser, loading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchInquiries = () => {
    if (!syncedUser) return;
    fetch(`/api/inquiries?userId=${syncedUser.id}&role=creator`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load inquiries list.');
      })
      .then((data) => {
        setInquiries(data.inquiries || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

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

    fetchInquiries();
  }, [syncedUser, authLoading, router]);

  const handleUpdateStatus = async (inquiryId: string, newStatus: 'accepted' | 'declined' | 'completed') => {
    setError('');
    setActionLoadingId(inquiryId);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status: newStatus }),
      });

      if (res.ok) {
        // Refetch updated list
        fetchInquiries();
      } else {
        setError('Failed to update inquiry status. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Booking Inquiries</h1>
          <p className="text-xs text-stone-500">Manage client booking requests, view messages, and share contact details</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* Main List */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 text-stone-400 text-sm">
            You don't have any incoming booking requests yet.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white rounded-3xl border p-6 shadow-sm transition-all space-y-4 ${
                inq.status === 'pending'
                  ? 'border-amber-250 ring-2 ring-amber-500/5'
                  : 'border-stone-200'
              }`}
            >
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-stone-900">{inq.client.name}</span>
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
                  <span className="text-[10px] text-stone-400 font-medium">
                    Received on {new Date(inq.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-full font-bold border border-stone-200 uppercase">
                    {inq.category}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1 bg-stone-50 p-4 rounded-2xl border border-stone-150">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Client Message
                </span>
                <p className="text-sm text-stone-850 italic font-medium leading-relaxed">
                  "{inq.message}"
                </p>
              </div>

              {/* Metadata details */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  Event Date:{' '}
                  {inq.eventDate
                    ? new Date(inq.eventDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Flexible'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  Contact: {inq.client.phone}
                </span>
              </div>

              {/* Status Action Block */}
              {inq.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'accepted')}
                    disabled={actionLoadingId === inq.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionLoadingId === inq.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Accept & Share Contact</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'declined')}
                    disabled={actionLoadingId === inq.id}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 px-4 rounded-xl text-xs font-bold border border-stone-200 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              )}

              {inq.status === 'accepted' && (
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="font-semibold">
                      🤝 Deal Active! WhatsApp details shared. Chat directly to close.
                    </span>
                    <a
                      href={`https://wa.me/${inq.client.phone.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm self-start sm:self-auto"
                    >
                      <Phone className="w-3 h-3 fill-white" />
                      <span>WhatsApp Client</span>
                    </a>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'completed')}
                    disabled={actionLoadingId === inq.id}
                    className="w-full bg-stone-900 hover:bg-stone-850 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    {actionLoadingId === inq.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Service as Completed</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {inq.status === 'completed' && (
                <div className="pt-2 border-t border-stone-100">
                  <div className="p-3 bg-stone-50 text-stone-600 text-xs rounded-xl border border-stone-200 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4 text-stone-400" />
                    Service completed. Client is now eligible to leave a review on your profile.
                  </div>
                </div>
              )}

              {inq.status === 'declined' && (
                <div className="pt-2 border-t border-stone-100">
                  <div className="text-xs text-stone-400 font-medium">
                    You declined this inquiry lead.
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default InquiriesPage;
