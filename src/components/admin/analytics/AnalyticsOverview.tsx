import {
  ChartBarIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsOverviewProps {
  data: {
    pageViews: number;
    formSubmissions: number;
    conversionRate: number;
    period: { days: number; from: Date; to: Date };
  };
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const metrics = [
    {
      title: 'Page Views',
      value: formatNumber(data.pageViews),
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `In the last ${data.period.days} days`,
    },
    {
      title: 'Form Submissions',
      value: formatNumber(data.formSubmissions),
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `In the last ${data.period.days} days`,
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(data.conversionRate),
      icon: ArrowTrendingUpIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Submissions / Page Views',
    },
    {
      title: 'Click-through',
      value:
        data.pageViews > 0 ? formatPercentage((data.formSubmissions / data.pageViews) * 100) : '0%',
      icon: CursorArrowRaysIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Engagement rate',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map(metric => (
        <div key={metric.title} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${metric.bgColor} rounded-lg p-3`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
