import Skeleton from '@/components/common/Skeleton';

const cardDelayStyles = [{}, { animationDelay: '100ms' }, { animationDelay: '200ms' }];

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="w-full border-b bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-20 h-9 rounded-lg" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-5 md:col-span-2 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 pt-1">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4 mt-2" />
              <Skeleton className="w-64 h-4 mt-2" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-24 h-9 rounded-lg" />
          </div>

          <div className="space-y-3">
            {cardDelayStyles.map((delayStyle, index) => (
              <div
                key={index}
                className="w-full rounded-xl border border-gray-200 p-3 shadow-sm"
                style={delayStyle}
              >
                <div className="h-16 flex items-center justify-between gap-3">
                  <Skeleton className="w-4 h-4 rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="w-40 h-4" />
                    <Skeleton className="w-56 h-3 mt-2" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full" />
                  <Skeleton className="w-14 h-8 rounded-lg" />
                  <Skeleton className="w-14 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm md:col-span-2">
          <Skeleton className="w-40 h-6 mb-4" />
          <div className="space-y-3">
            <Skeleton className="w-full h-12 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-lg [animation-delay:100ms]" />
          </div>
        </section>
      </main>
    </div>
  );
}
