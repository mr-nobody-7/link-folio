'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/api/linkfolioApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GuestOnlyRoute from '@/components/common/GuestOnlyRoute';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess('Password updated successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1200);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestOnlyRoute>
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4 py-10">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white shadow-xl border border-[#ec5c33]/20 animate-fade-in">
          <p className="text-sm text-[#888888] mb-2">Secure your account</p>
          <h2 className="text-3xl font-bold mb-6 text-[#ec5c33] font-display">
            Set New Password
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
            />

            <Input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
            />

            {error ? (
              <div className="text-sm text-[#504d46] bg-[#ec5c33]/10 border border-[#ec5c33]/25 rounded-lg px-3 py-2">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {success}
              </div>
            ) : null}

            <Button
              className="w-full rounded-xl bg-[#ec5c33] hover:bg-[#d54a29] text-white"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Update password'}
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
    </GuestOnlyRoute>
  );
}
