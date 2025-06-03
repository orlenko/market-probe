import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get time period from query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get all projects with analytics overview
    const projects = await db.analytics.getAllProjectsStats(days)

    return NextResponse.json(projects)

  } catch (error) {
    console.error('Projects analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects analytics' },
      { status: 500 }
    )
  }
}
