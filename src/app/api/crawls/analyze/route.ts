import { NextResponse } from 'next/server';
import { analyzeCrawlContent } from '@/lib/agent';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { content, url, crawlRunId } = await request.json();
    
    const analysis = await analyzeCrawlContent(content, url);
    
    // Store analysis in database
    if (crawlRunId) {
      await supabase
        .from('crawl_runs')
        .update({ 
          results: { content, analysis: analysis },
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .match({ id: crawlRunId });
    }
    
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error in analysis API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}