'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface TechnologyData {
  devices: Array<{ device_type: string; count: number }>
  browsers: Array<{ browser: string; count: number }>
}

interface TechnologyChartProps {
  data: TechnologyData
}

export default function TechnologyChart({ data }: TechnologyChartProps) {
  // Format device data for pie chart
  const deviceData = data.devices.map((device, index) => ({
    name: device.device_type || 'Unknown',
    value: Number(device.count),
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
  }))

  // Format browser data for bar chart
  const browserData = data.browsers
    .slice(0, 8) // Show top 8 browsers
    .map(browser => ({
      name: browser.browser || 'Unknown',
      visits: Number(browser.count)
    }))

  const DEVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const DeviceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = deviceData.reduce((sum, item) => sum + item.value, 0)
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0'
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} visits ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const BrowserTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} visits
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Technology Breakdown</h3>
        <p className="text-sm text-gray-600">Device types and browser usage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Types */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Device Types</h4>

          {deviceData.length > 0 ? (
            <>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DeviceTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {deviceData.map((device, index) => {
                  const total = deviceData.reduce((sum, item) => sum + item.value, 0)
                  const percentage = total > 0 ? ((device.value / total) * 100).toFixed(0) : '0'
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
                        ></div>
                        <span className="text-sm text-gray-700">{device.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{device.value}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No device data available</p>
            </div>
          )}
        </div>

        {/* Browsers */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Top Browsers</h4>

          {browserData.length > 0 ? (
            <>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip content={<BrowserTooltip />} />
                    <Bar
                      dataKey="visits"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {browserData.slice(0, 5).map((browser, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{browser.name}</span>
                    <span className="text-sm font-medium text-gray-900">{browser.visits}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No browser data available</p>
            </div>
          )}
        </div>
      </div>

      {deviceData.length === 0 && browserData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No technology data available</p>
          <p className="text-sm text-gray-400 mt-1">
            Device and browser information will appear here once analytics are collected
          </p>
        </div>
      )}
    </div>
  )
}
