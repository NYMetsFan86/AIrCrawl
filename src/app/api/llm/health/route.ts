import { NextRequest, NextResponse } from 'next/server'
import { llmService } from '@/lib/llm-service'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT = 5; // Requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  // Clear expired entries
  if (record && record.resetTime < now) {
    rateLimitMap.delete(ip);
  }
  
  // Initialize or get current record
  const currentRecord = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Check if limit exceeded
  if (currentRecord.count >= RATE_LIMIT) {
    return false;
  }
  
  // Update rate limit record
  rateLimitMap.set(ip, {
    count: currentRecord.count + 1,
    resetTime: currentRecord.resetTime
  });
  
  return true;
}

export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Apply rate limiting
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const providers = await llmService.getAvailableProviders();
    const activeProvider = llmService.getActiveProvider();
    const results = [];
    
    // Test active provider
    if (activeProvider) {
      try {
        const testPrompt = "Respond with 'OK' if you are functioning correctly.";
        const startTime = Date.now();
        const response = await llmService.getCompletion(testPrompt);
        const duration = Date.now() - startTime;
        
        const responseStatus = 
          response.includes('OK') ? 'ok' :
          response.length > 0 ? 'warning' : 'error';
        
        results.push({
          provider: activeProvider.provider,
          model: activeProvider.model,
          status: responseStatus,
          latency: duration,
          response: response?.substring(0, 100)
        });
      } catch (error) {
        results.push({
          provider: activeProvider.provider, 
          model: activeProvider.model,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      activeProvider,
      availableProviders: providers,
      healthChecks: results
    });
  } catch (error: any) {
    console.error('LLM health check error:', error);
    
    return NextResponse.json(
      { 
        timestamp: new Date().toISOString(),
        message: error.message || 'Failed to check LLM health',
        error: process.env.NODE_ENV === 'development' ? (error.stack || '') : undefined
      },
      { status: 500 }
    );
  }
}
