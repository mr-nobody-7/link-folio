'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DailyItem = {
  date: string;
  count: number;
};

type LinkItem = {
  _id: string;
  title: string;
  clicks: number;
};

type AnalyticsCardProps = {
  data: DailyItem[];
  todayCount: number;
  weekCount: number;
  days: number;
  links: LinkItem[];
  onDaysChange: (days: number) => void;
};

export default function AnalyticsCard({
  data,
  todayCount,
  weekCount,
  days,
  links,
  onDaysChange,
}: AnalyticsCardProps) {
  const allTimeCount = links.reduce((total, link) => total + (link.clicks || 0), 0);
  const hasChartData = data.some((item) => item.count > 0);

  const topLinks = [...links]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  const maxClicks = topLinks.reduce(
    (max, item) => Math.max(max, item.clicks || 0),
    0
  );

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm md:col-span-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-3xl font-bold text-[#ec5c33] mt-1">{todayCount}</p>
          <p className="text-xs text-gray-500 mt-1">clicks today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">This week</p>
          <p className="text-3xl font-bold text-[#ec5c33] mt-1">{weekCount}</p>
          <p className="text-xs text-gray-500 mt-1">clicks this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">All time</p>
          <p className="text-3xl font-bold text-[#ec5c33] mt-1">{allTimeCount}</p>
          <p className="text-xs text-gray-500 mt-1">total clicks</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="font-semibold text-black">Clicks over time</h3>
        <div className="flex items-center gap-2">
          {[7, 14, 30].map((option) => {
            const isActive = days === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onDaysChange(option)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#ec5c33] text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option}d
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {!hasChartData ? (
          <div className="h-[200px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
            No clicks yet in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                formatter={(value) => [Number(value ?? 0), 'clicks']}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString('en', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <Bar dataKey="count" fill="#ec5c33" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-black mb-3">Link performance</h4>

        {maxClicks === 0 ? (
          <p className="text-sm text-gray-500">No clicks recorded yet</p>
        ) : (
          <div>
            <div className="grid grid-cols-[minmax(0,1.2fr)_100px_minmax(0,1fr)] text-xs font-medium text-gray-500 pb-2 border-b border-gray-100">
              <span>Link title</span>
              <span className="text-right">Total clicks</span>
              <span className="pl-4">Bar</span>
            </div>

            {topLinks.map((link, index) => {
              const width = maxClicks > 0 ? (link.clicks / maxClicks) * 100 : 0;
              return (
                <div
                  key={link._id}
                  className={`grid grid-cols-[minmax(0,1.2fr)_100px_minmax(0,1fr)] items-center gap-4 py-2 ${
                    index === topLinks.length - 1 ? '' : 'border-b border-gray-100'
                  }`}
                >
                  <span className="text-sm text-black truncate">{link.title}</span>
                  <span className="text-sm text-right text-gray-700">{link.clicks}</span>
                  <div className="h-2 rounded-full bg-[#ec5c33]/20 overflow-hidden">
                    <div
                      className="h-full bg-[#ec5c33]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
