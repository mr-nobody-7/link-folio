'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getToken, isTokenExpired } from '@/api/linkfolioApi';

type GuestOnlyRouteProps = {
  children: React.ReactNode;
};

export default function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setChecking(false);
      return;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem('lf_token');
      localStorage.removeItem('lf_user');
      setChecking(false);
      return;
    }

    router.replace('/dashboard');
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
