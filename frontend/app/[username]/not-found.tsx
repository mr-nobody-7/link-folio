import Link from 'next/link';

export default function ProfileNotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#ec5c33]/15 text-[#ec5c33] text-4xl font-bold flex items-center justify-center">
          ?
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[#141413]">Profile not found</h1>
        <p className="mt-2 text-[#504d46]">
          This username doesn&apos;t exist on LinkFolio yet.
        </p>

        <Link
          href="/auth/signup"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#ec5c33] px-5 text-sm font-medium text-white hover:bg-[#d54a29]"
        >
          Create your own LinkFolio
        </Link>
      </div>
    </div>
  );
}
