'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getToken, isTokenExpired } from '@/api/linkfolioApi';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem('lf_token');
      localStorage.removeItem('lf_user');
      router.replace('/auth/login');
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
