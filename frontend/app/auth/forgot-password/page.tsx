'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/api/linkfolioApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = (await requestPasswordReset({
        email: normalizedEmail,
      })) as { message?: string };

      setMessage(
        response?.message ||
          'If an account with that email exists, a password reset link has been sent.'
      );
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to request password reset'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4 py-10">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white shadow-xl border border-[#ec5c33]/20 animate-fade-in">
        <p className="text-sm text-[#888888] mb-2">Recover your account</p>
        <h2 className="text-3xl font-bold mb-6 text-[#ec5c33] font-display">
          Forgot Password
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            type="email"
            required
            placeholder="Enter your account email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
          />

          {error ? (
            <div className="text-sm text-[#504d46] bg-[#ec5c33]/10 border border-[#ec5c33]/25 rounded-lg px-3 py-2">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {message}
            </div>
          ) : null}

          <Button
            className="w-full rounded-xl bg-[#ec5c33] hover:bg-[#d54a29] text-white"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Send reset link'}
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-[#504d46]">
          Back to{' '}
          <Link
            href="/auth/login"
            className="text-[#ec5c33] underline hover:text-[#d54a29]"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
