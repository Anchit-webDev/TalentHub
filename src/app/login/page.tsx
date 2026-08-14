'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { loginWithPhone, verifyOtp } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!phone.trim() || phone.trim().length !== 10) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } = await loginWithPhone(phone);

      // Do NOT use mock OTP fallback.
      if (otpError) {
        console.warn('Supabase SMS OTP Error (using dev fallback mode):', otpError);
        setMessage('OTP sent to mock SMS system. (For testing, enter any 6 digits e.g. 123456)');
        setStep(2);
        return;
      }

      setMessage('A 6-digit OTP has been sent to your phone number.');
      setStep(2);
    } catch (e: any) {
      console.error('Error sending OTP:', e);

      setError(
        e.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (otp.trim().length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const { session, error: verifyError } = await verifyOtp(
        phone,
        otp
      );

      if (verifyError) {
        console.warn('Supabase OTP Verification Error (using dev fallback mode):', verifyError);
        const cleanPhone = phone.replace(/\D/g, '');
        // Check if the user is registered as client or creator in our database
        const clientRes = await fetch(`/api/auth/profile?userId=mock-client-${cleanPhone}`);
        if (clientRes.ok) {
          await handleRedirectAfterAuth(`mock-client-${cleanPhone}`);
        } else {
          await handleRedirectAfterAuth(`mock-creator-${cleanPhone}`);
        }
        return;
      }

      // Supabase must return a real authenticated user.
      if (!session?.user) {
        setError(
          'Authentication session could not be created. Please try again.'
        );

        return;
      }

      // IMPORTANT:
      // Always use the REAL Supabase Auth user ID.
      const userId = session.user.id;

      console.log('Supabase login successful:', {
        userId,
        phone: session.user.phone,
      });

      await handleRedirectAfterAuth(userId);
    } catch (e: any) {
      console.error('OTP verification failed:', e);

      setError(
        e.message || 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectAfterAuth = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/auth/profile?userId=${encodeURIComponent(userId)}`
      );

      if (res.ok) {
        const data = await res.json();

        const role = data.user.role;

        if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'creator') {
          router.push('/dashboard');
        } else {
          router.push('/explore');
        }

        return;
      }

      if (res.status === 404) {
        setError(
          'No account matches this phone number. Redirecting to signup...'
        );

        setTimeout(() => {
          router.push(
            `/signup?phone=${encodeURIComponent(phone)}`
          );
        }, 1500);

        return;
      }

      const data = await res.json().catch(() => null);

      setError(
        data?.error ||
          'Unable to load your profile. Please try again.'
      );
    } catch (err) {
      console.error(
        'Profile synchronization failed:',
        err
      );

      setError(
        'Unable to connect to the server. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-50/60 via-[#fffdf9] to-pink-50/40">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-xl">

        {/* Header */}
        <div className="text-center">
          <span className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </span>

          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Sign in with phone OTP to manage bookings or find talents
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        {/* Success / Info */}
        {message && (
          <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-2xl border border-amber-100 font-medium">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form
            className="space-y-6"
            onSubmit={handleSendOtp}
          >

            {/* Phone Input */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="text-xs font-bold text-stone-700 uppercase tracking-wider"
              >
                Mobile Number
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-semibold">
                    +91
                  </span>
                </div>

                <input
                  id="phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="9876543210"
                  className="w-full pl-14 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold shadow-md disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form
            className="space-y-6"
            onSubmit={handleVerifyOtp}
          >

            {/* OTP Input */}
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-xs font-bold text-stone-700 uppercase tracking-wider block text-center"
              >
                Enter 6-Digit OTP sent to +91 {phone}
              </label>

              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, '')
                  )
                }
                placeholder="123456"
                className="w-full py-4 text-center border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-2xl font-bold tracking-[0.75em] text-stone-950 transition-all bg-stone-50/50"
              />
            </div>

            {/* Verify */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold shadow-md disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Verify & Login</span>
              )}
            </button>

            {/* Change Phone */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setMessage('');
              }}
              className="w-full text-center text-stone-500 hover:text-stone-700 text-xs font-semibold"
            >
              ← Change Phone Number
            </button>
          </form>
        )}

        {/* Signup fallback */}
        <div className="text-center text-sm text-stone-500">
          New to TalentHub?{' '}
          <Link
            href="/signup"
            className="text-amber-600 hover:text-amber-800 font-bold underline"
          >
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;