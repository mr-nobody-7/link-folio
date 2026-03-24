import Skeleton from '@/components/common/Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 py-10">
      <div className="max-w-md mx-auto pt-16 flex flex-col items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="w-48 h-7" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-56 h-4" />

        <div className="w-full mt-4 space-y-3">
          <Skeleton className="w-full h-14 rounded-xl" />
          <Skeleton className="w-full h-14 rounded-xl" style={{ animationDelay: '100ms' }} />
          <Skeleton className="w-full h-14 rounded-xl" style={{ animationDelay: '200ms' }} />
          <Skeleton className="w-full h-14 rounded-xl" />
        </div>

        <Skeleton className="w-full h-28 rounded-xl mt-2" />
      </div>
    </div>
  );
}
