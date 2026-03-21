'use client';

import Link from 'next/link';

type PublicProfileErrorProps = {
  error: Error;
  reset: () => void;
};

export default function PublicProfileError({
  error,
  reset,
}: PublicProfileErrorProps) {
  return (
    <div className="min-h-screen bg-white px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center border border-[#ec5c33]/20 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-2">Something went wrong</h2>
        <p className="text-sm text-[#504d46] mb-5">
          {error.message || 'Unable to load this profile right now.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-[#ec5c33] text-white hover:bg-[#d54a29]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-[#ec5c33]/30 text-[#ec5c33] hover:bg-[#ec5c33]/5"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
