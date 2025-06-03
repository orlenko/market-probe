'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface ConversionChartProps {
  pageViews: number
  formSubmissions: number
}

export default function ConversionChart({ pageViews, formSubmissions }: ConversionChartProps) {
  const conversionRate = pageViews > 0 ? (formSubmissions / pageViews) * 100 : 0
  const bounceRate = 100 - conversionRate

  const data = [
    {
      name: 'Converted',
      value: formSubmissions,
      percentage: conversionRate.toFixed(1),
      color: '#10b981'
    },
    {
      name: 'Bounced',
      value: pageViews - formSubmissions,
      percentage: bounceRate.toFixed(1),
      color: '#e5e7eb'
    }
  ]

  const COLORS = ['#10b981', '#e5e7eb']

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} visitors ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Conversion Funnel</h3>
        <p className="text-sm text-gray-600">Visitor behavior breakdown</p>
      </div>

      <div className="flex items-center">
        <div className="w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="ml-8 flex-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Converted</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{formSubmissions}</div>
                <div className="text-sm text-gray-500">{conversionRate.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Bounced</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{pageViews - formSubmissions}</div>
                <div className="text-sm text-gray-500">{bounceRate.toFixed(1)}%</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Visitors</span>
                <span className="text-lg font-bold text-gray-900">{pageViews}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pageViews === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No visitor data available</p>
        </div>
      )}
    </div>
  )
}
