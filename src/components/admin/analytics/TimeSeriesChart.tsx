'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface TimeSeriesData {
  pageViews: Array<{ date: string; count: number }>
  submissions: Array<{ date: string; count: number }>
}

interface TimeSeriesChartProps {
  data: TimeSeriesData
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  // Merge page views and submissions data by date
  const mergedData = () => {
    const dateMap = new Map()

    // Add page views
    data.pageViews.forEach(item => {
      const date = String(item.date)
      dateMap.set(date, {
        date,
        pageViews: Number(item.count),
        submissions: 0
      })
    })

    // Add submissions
    data.submissions.forEach(item => {
      const date = String(item.date)
      const existing = dateMap.get(date) || { date, pageViews: 0, submissions: 0 }
      existing.submissions = Number(item.count)
      dateMap.set(date, existing)
    })

    // Convert to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  const chartData = mergedData()

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d')
    } catch {
      return dateString
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Traffic Over Time</h3>
        <p className="text-sm text-gray-600">Page views and form submissions by day</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatDate}
            />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="pageViews"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Page Views"
            />
            <Line
              type="monotone"
              dataKey="submissions"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Form Submissions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available for the selected period</p>
        </div>
      )}
    </div>
  )
}
