// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const crawlId = searchParams.get('crawlId');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    let where: any = {};
    
    if (crawlId) {
      where.crawlJobId = crawlId;
    }
    
    if (severity) {
      where.severity = severity;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Fetch alerts from database
    const alerts = await prisma.alert.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: 100, // Limit for pagination
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}