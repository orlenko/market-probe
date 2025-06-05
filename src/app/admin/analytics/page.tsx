'use client';

import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import AnalyticsOverview from '@/components/admin/analytics/AnalyticsOverview';
import TimeSeriesChart from '@/components/admin/analytics/TimeSeriesChart';
import ConversionChart from '@/components/admin/analytics/ConversionChart';
import TrafficSourcesChart from '@/components/admin/analytics/TrafficSourcesChart';
import TechnologyChart from '@/components/admin/analytics/TechnologyChart';

interface Project {
  id: number;
  slug: string;
  title: string;
  status: string;
  pageViews: number;
  formSubmissions: number;
  conversionRate: number;
}

interface AnalyticsData {
  summary: {
    pageViews: number;
    formSubmissions: number;
    conversionRate: number;
    period: { days: number; from: Date; to: Date };
  };
  timeSeries: {
    pageViews: Array<{ date: string; count: number }>;
    submissions: Array<{ date: string; count: number }>;
  };
  sources: {
    utm: Array<{ utmSource: string; _count: { utmSource: number } }>;
    referrers: Array<{ referrer: string; _count: { referrer: number } }>;
  };
  technology: {
    devices: Array<{ device_type: string; count: number }>;
    browsers: Array<{ browser: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState(30);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects overview
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/admin/analytics/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);

        // Auto-select first project if available
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [selectedProject]);

  // Fetch detailed analytics for selected project
  useEffect(() => {
    if (!selectedProject) {
      setAnalyticsData(null);
      return;
    }

    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/analytics/detailed?projectId=${selectedProject}&days=${timePeriod}`
        );
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedProject, timePeriod]);

  const handleExportData = async (format: 'csv' | 'json') => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `/api/admin/analytics/export?projectId=${selectedProject}&days=${timePeriod}&format=${format}`
      );
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${projects.find(p => p.id === selectedProject)?.slug}-${timePeriod}days.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track performance and user behavior across your projects
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Export buttons */}
          {selectedProject && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExportData('csv')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => handleExportData('json')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Project selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Project:</label>
            <select
              value={selectedProject || ''}
              onChange={e => setSelectedProject(Number(e.target.value))}
              className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title} ({project.status})
                </option>
              ))}
            </select>
          </div>

          {/* Time period selector */}
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={timePeriod}
              onChange={e => setTimePeriod(Number(e.target.value))}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* No project selected */}
      {!selectedProject && !loading && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Project Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a project above to view its analytics data.
          </p>
        </div>
      )}

      {/* Analytics content */}
      {selectedProject && analyticsData && (
        <div className="space-y-6">
          {/* Overview cards */}
          <AnalyticsOverview data={analyticsData.summary} />

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time series chart */}
            <div className="lg:col-span-2">
              <TimeSeriesChart data={analyticsData.timeSeries} />
            </div>

            {/* Conversion chart */}
            <ConversionChart
              pageViews={analyticsData.summary.pageViews}
              formSubmissions={analyticsData.summary.formSubmissions}
            />

            {/* Traffic sources */}
            <TrafficSourcesChart data={analyticsData.sources} />

            {/* Technology breakdown */}
            <div className="lg:col-span-2">
              <TechnologyChart data={analyticsData.technology} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
