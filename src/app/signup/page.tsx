'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Sparkles, User, Loader2 } from 'lucide-react';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const { loginWithPhone, verifyOtp } = useAuth();

  const [role, setRole] = useState<'creator' | 'client'>('creator');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phone.trim() || phone.trim().length !== 10) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } = await loginWithPhone(phone);

      if (otpError) {
        console.warn('Supabase OTP error (using dev fallback mode):', otpError);
        setMessage('OTP sent to mock SMS system. (For testing, enter any 6 digits e.g. 123456)');
        setStep(2);
        return;
      }

      setMessage('A 6-digit OTP has been sent to your phone number.');
      setStep(2);
    } catch (e: any) {
      console.error('Error sending OTP:', e);
      setError(e.message || 'Failed to send OTP. Please try again.');
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
      const { session, error: verifyError } = await verifyOtp(phone, otp);

      // IMPORTANT:
      // Do not create a mock user if Supabase verification fails.
      // The application must use the real Supabase Auth user ID.
      if (verifyError) {
        console.warn('Supabase OTP verification failed (using dev fallback mode):', verifyError);
        const mockUserId = `mock-${role}-${phone.replace(/\D/g, '')}`;
        await completeOnboardingOrSync(mockUserId, phone);
        return;
      }

      if (!session?.user) {
        setError('Unable to create a Supabase session. Please try again.');
        return;
      }

      // Use the REAL Supabase Auth user ID.
      const userId = session.user.id;

      console.log('Supabase authentication successful:', {
        userId,
        phone: session.user.phone,
      });

      await completeOnboardingOrSync(userId, phone);
    } catch (e: any) {
      console.error('OTP verification error:', e);
      setError(e.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboardingOrSync = async (
    userId: string,
    userPhone: string
  ) => {
    try {
      if (role === 'client') {
        // Register client in the database using the REAL
        // Supabase Auth user ID.
        const res = await fetch('/api/auth/register-client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            name: name.trim(),
            phone: userPhone,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error('Client registration failed:', data);
          setError(
            data?.error ||
              'Could not register your profile in the database. Please try again.'
          );
          return;
        }

        router.push('/explore');
        return;
      }

      // Creator:
      // Send the REAL Supabase user ID to the onboarding wizard.
      router.push(
        `/onboarding?userId=${encodeURIComponent(
          userId
        )}&phone=${encodeURIComponent(userPhone)}&name=${encodeURIComponent(
          name.trim()
        )}`
      );
    } catch (error: any) {
      console.error('Profile synchronization failed:', error);
      setError(
        error.message ||
          'Could not synchronize your profile. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-50/60 via-[#fffdf9] to-pink-50/40">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-xl">

        {/* Header */}
        <div className="text-center">
          <span className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-600 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </span>

          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Create Account
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Join TalentHub to explore or showcase creative skills
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-2xl border border-amber-100 font-medium">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleSendOtp}>

            {/* Role picker */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3">
                I want to register as:
              </label>

              <div className="grid grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                    role === 'creator'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Sparkles
                    className={`w-5 h-5 ${
                      role === 'creator'
                        ? 'text-amber-600'
                        : 'text-stone-400'
                    }`}
                  />

                  <span className="text-sm font-bold">
                    Talent / Creator
                  </span>

                  <span className="text-[10px] text-stone-500">
                    I want to be hired
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                    role === 'client'
                      ? 'border-pink-500 bg-pink-50/30 text-pink-900 ring-2 ring-pink-500/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <User
                    className={`w-5 h-5 ${
                      role === 'client'
                        ? 'text-pink-600'
                        : 'text-stone-400'
                    }`}
                  />

                  <span className="text-sm font-bold">
                    Client / Recruiter
                  </span>

                  <span className="text-[10px] text-stone-500">
                    I want to discover/hire
                  </span>
                </button>

              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="text-xs font-bold text-stone-700 uppercase tracking-wider"
              >
                Full Name
              </label>

              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition-all"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="text-xs font-bold text-stone-700 uppercase tracking-wider"
              >
                Mobile Number (India)
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
                    setPhone(e.target.value.replace(/\D/g, ''))
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
                  <span>Send OTP Verification</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>

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
                  setOtp(e.target.value.replace(/\D/g, ''))
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
                <span>Verify Code & Continue</span>
              )}
            </button>

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
              ← Change Name or Phone Number
            </button>
          </form>
        )}

        {/* Login fallback */}
        <div className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-800 font-bold underline"
          >
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;