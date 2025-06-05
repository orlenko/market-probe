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

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get detailed analytics for the project
    const analytics = await db.analytics.getDetailedStats(projectId, days);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Detailed analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch detailed analytics' }, { status: 500 });
  }
}
