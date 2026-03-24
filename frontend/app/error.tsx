'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ec5c33]/10 text-[#ec5c33]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M12 3 2.5 20.5h19L12 3Z" />
            <path d="M12 9v5" />
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#141413]">Something went wrong</h1>
        <p className="mt-3 text-[#504d46]">
          An unexpected error occurred. Our team has been notified.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#ec5c33] px-4 text-sm font-medium text-white hover:bg-[#d54a29]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#ec5c33]/35 bg-white px-4 text-sm font-medium text-[#504d46] hover:bg-[#ec5c33]/5"
          >
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
