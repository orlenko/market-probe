import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = parseInt(searchParams.get('projectId') || '0');
    const days = parseInt(searchParams.get('days') || '30');
    const format = searchParams.get('format') || 'json';

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json({ error: 'Format must be csv or json' }, { status: 400 });
    }

    // Get detailed analytics for export
    const analytics = await db.analytics.getDetailedStats(projectId, days);

    if (format === 'json') {
      return NextResponse.json(analytics, {
        headers: {
          'Content-Disposition': `attachment; filename="analytics-${projectId}-${days}days.json"`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Convert to CSV format
    const csvData = convertToCSV(analytics);

    return new NextResponse(csvData, {
      headers: {
        'Content-Disposition': `attachment; filename="analytics-${projectId}-${days}days.csv"`,
        'Content-Type': 'text/csv',
      },
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 });
  }
}

function convertToCSV(analytics: any): string {
  const lines: string[] = [];

  // Add summary section
  lines.push('Summary');
  lines.push('Metric,Value');
  lines.push(`Page Views,${analytics.summary.pageViews}`);
  lines.push(`Form Submissions,${analytics.summary.formSubmissions}`);
  lines.push(`Conversion Rate,${analytics.summary.conversionRate.toFixed(2)}%`);
  lines.push('');

  // Add time series data
  lines.push('Daily Page Views');
  lines.push('Date,Page Views');
  analytics.timeSeries.pageViews.forEach((item: any) => {
    lines.push(`${item.date},${item.count}`);
  });
  lines.push('');

  lines.push('Daily Form Submissions');
  lines.push('Date,Submissions');
  analytics.timeSeries.submissions.forEach((item: any) => {
    lines.push(`${item.date},${item.count}`);
  });
  lines.push('');

  // Add UTM sources
  if (analytics.sources.utm.length > 0) {
    lines.push('UTM Sources');
    lines.push('Source,Visits');
    analytics.sources.utm.forEach((item: any) => {
      lines.push(`${item.utmSource},${item._count.utmSource}`);
    });
    lines.push('');
  }

  // Add referrers
  if (analytics.sources.referrers.length > 0) {
    lines.push('Top Referrers');
    lines.push('Referrer,Visits');
    analytics.sources.referrers.forEach((item: any) => {
      lines.push(`"${item.referrer}",${item._count.referrer}`);
    });
    lines.push('');
  }

  // Add device types
  if (analytics.technology.devices.length > 0) {
    lines.push('Device Types');
    lines.push('Device,Count');
    analytics.technology.devices.forEach((item: any) => {
      lines.push(`${item.device_type},${item.count}`);
    });
    lines.push('');
  }

  // Add browsers
  if (analytics.technology.browsers.length > 0) {
    lines.push('Browsers');
    lines.push('Browser,Count');
    analytics.technology.browsers.forEach((item: any) => {
      lines.push(`${item.browser},${item.count}`);
    });
  }

  return lines.join('\n');
}
