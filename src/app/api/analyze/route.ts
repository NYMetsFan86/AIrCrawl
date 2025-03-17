import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openai, ContentToAnalyze, AnalysisResult } from '@/lib/openai';
import OpenAIService from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    // Get the request data
    const body = await req.json();
    const { content, userApiKey } = body as { 
      content: ContentToAnalyze, 
      userApiKey?: string 
    };

    // Validate input
    if (!content || !content.url || !content.text) {
      return NextResponse.json(
        { error: 'Missing required content fields (url, text)' },
        { status: 400 }
      );
    }

    // Get the current user for authorization
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the user has provided their own API key or use the default
    let analysisService = openai;
    
    if (userApiKey) {
      // Use the user-provided API key
      analysisService = new OpenAIService(userApiKey);
    } else {
      // Check if we have a default API key
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
    }

    // Perform the content analysis
    const analysisResult = await analysisService.analyzeContent(content);

    // If there are images, analyze the first one as an example
    let imageAnalysis = null;
    if (content.imageUrls && content.imageUrls.length > 0) {
      try {
        imageAnalysis = await analysisService.analyzeImage(content.imageUrls[0]);
      } catch (error) {
        console.error('Image analysis failed:', error);
        // Continue without image analysis
      }
    }

    // Store the analysis result in the database
    const { error: dbError } = await supabase
      .from('content_analyses')
      .insert({
        user_id: session.user.id,
        url: content.url,
        content_sample: content.text.substring(0, 500),
        analysis_result: analysisResult,
        image_analysis: imageAnalysis,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error storing analysis:', dbError);
      // Continue anyway as this shouldn't block returning results to the user
    }

    // Return the analysis results
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      imageAnalysis
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Allow a GET method to check if the API is available
export async function GET() {
  return NextResponse.json({
    status: 'available',
    capabilities: [
      'content analysis',
      'sentiment analysis',
      'keyword extraction',
      'image analysis',
      'ip detection'
    ]
  });
}
