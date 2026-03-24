import Link from 'next/link';
import BackButton from '@/components/common/BackButton';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <p className="text-8xl font-extrabold text-[#ec5c33]">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-[#141413]">Page not found</h1>
        <p className="mt-3 text-[#504d46]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#ec5c33] px-4 text-sm font-medium text-white hover:bg-[#d54a29]"
          >
            Go home
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
