'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficSource {
  utm: Array<{ utmSource: string; _count: { utmSource: number } }>;
  referrers: Array<{ referrer: string; _count: { referrer: number } }>;
}

interface TrafficSourcesChartProps {
  data: TrafficSource;
}

export default function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  // Combine UTM sources and referrers
  const formatTrafficData = () => {
    const sources: Array<{ name: string; visits: number; type: string }> = [];

    // Add UTM sources
    data.utm.forEach(item => {
      if (item.utmSource) {
        sources.push({
          name: item.utmSource,
          visits: item._count.utmSource,
          type: 'UTM Source',
        });
      }
    });

    // Add top referrers (limit to avoid clutter)
    data.referrers.slice(0, 5).forEach(item => {
      if (item.referrer) {
        const domain = extractDomain(item.referrer);
        sources.push({
          name: domain,
          visits: item._count.referrer,
          type: 'Referrer',
        });
      }
    });

    // Sort by visits and take top 10
    return sources.sort((a, b) => b.visits - a.visits).slice(0, 10);
  };

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  const chartData = formatTrafficData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{data.visits} visits</p>
          <p className="text-xs text-gray-500">{data.type}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Traffic Sources</h3>
        <p className="text-sm text-gray-600">Where your visitors are coming from</p>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visits" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic source breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Top Sources</h4>
            {chartData.slice(0, 5).map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{source.name}</p>
                    <p className="text-xs text-gray-500">{source.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{source.visits}</p>
                  <p className="text-xs text-gray-500">visits</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No traffic source data available</p>
          <p className="text-sm text-gray-400 mt-1">
            UTM parameters and referrer data will appear here once collected
          </p>
        </div>
      )}
    </div>
  );
}
