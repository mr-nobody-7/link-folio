import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-sm text-[#888888] -mt-6">Loading profile...</p>
      </div>
    </div>
  );
}
