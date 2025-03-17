import { NextResponse } from 'next/server';
import { processCrawlResults } from '../../../../lib/crawl-llm-integration';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Original functionality for GET, etc.
// ...

// Add a new POST handler to handle run requests for a specific crawl ID
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const crawlJobId = params.id;
  
  try {
    // Get the run command from the request body
    const body = await request.json();
    const isRunCommand = body.action === 'run';
    
    // If it's not a run command, pass to the regular POST handler
    if (!isRunCommand) {
      // Your existing POST handler logic
      return NextResponse.json({ 
        success: false, 
        message: 'Unknown action'
      });
    }
    
    console.log(`Starting crawl process for job ${crawlJobId}`);
    
    // Get the crawl job to get the URL
    const crawlJob = await prisma.crawlJob.findUnique({
      where: { id: crawlJobId },
    });
    
    if (!crawlJob) {
      return NextResponse.json({ error: 'Crawl job not found' }, { status: 404 });
    }
    
    // Create a new crawl run
    const crawlRun = await prisma.crawlRun.create({
      data: {
        status: 'in-progress',
        startedAt: new Date(),
        crawlJobId,
      },
    });
    
    // Perform the crawl
    const crawlData = await performWebCrawl(crawlJob.url);
    
    // Process the results with OpenAI
    const analysisResult = await processCrawlResults(crawlJobId, crawlData);
    
    // Update the crawl run status
    await prisma.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: analysisResult.success ? 'completed' : 'failed',
        completedAt: new Date(),
        results: crawlData,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Crawl completed successfully',
      runId: crawlRun.id
    });
  } catch (error) {
    console.error('Error running crawl:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

// Enhanced web crawling function
async function performWebCrawl(url: string) {
  console.log(`Crawling URL: ${url}`);
  
  try {
    // Fetch the page content
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Basic extraction of title and content
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'No title found';
    
    // Simple content extraction - removes HTML tags
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    
    // Limit content length to avoid potential issues
    content = content.substring(0, 10000) + (content.length > 10000 ? '...' : '');
    
    // Extract any links for potential future crawling
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith('#') && !match[1].startsWith('javascript:')) {
        try {
          // Resolve relative URLs
          const resolvedUrl = new URL(match[1], url).href;
          links.push(resolvedUrl);
        } catch (e) {
          console.warn(`Could not resolve URL: ${match[1]}`);
        }
      }
    }
    
    return {
      url,
      title,
      content,
      links: links.slice(0, 50), // Limit number of links
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return {
      url,
      title: 'Error',
      content: `Failed to crawl: ${error instanceof Error ? error.message : 'Unknown error'}`,
      links: [],
      timestamp: new Date().toISOString()
    };
  }
}