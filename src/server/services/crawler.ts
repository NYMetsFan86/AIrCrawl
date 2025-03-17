import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@/server/db';
import { analyzeCrawlWithLLM } from '@/lib/crawl-llm-integration';
import { startCrawl, processCrawlResults } from '@/lib/crawl-service';
import { llmService } from "@/lib/llm-service";

export class CrawlerService {
  // Add method to process crawl job and handle media assets
  async processCrawlJob(jobId: string, crawlRunId?: string) {
    // Fetch the crawl job
    const job = await db.crawlJob.findUnique({
      where: { id: jobId },
      include: {
        mediaItems: true
      }
    });
    
    if (!job) {
      throw new Error(`Crawl job ${jobId} not found`);
    }
    
    // Create a crawl run if not provided
    let runId = crawlRunId;
    if (!runId) {
      const run = await db.crawlRun.create({
        data: {
          crawlJobId: jobId,
          status: 'running',
          startedAt: new Date()
        }
      });
      runId = run.id;
    } else {
      // Update existing run to running status
      await db.crawlRun.update({
        where: { id: runId },
        data: {
          status: 'running',
          startedAt: new Date()
        }
      });
    }
    
    try {
      // Call the startCrawl function instead of crawlWebsite
      const results = await startCrawl(
        jobId,
        { 
          depth: 10 // Default to depth of 10
        }
      );
      
      // Extract text content for analysis
      const content = results.pages?.map(result => 
        `Page: ${result.title}\n${result.text?.substring(0, 1000) || ''}`
      ).join('\n\n').substring(0, 5000) || '';
      
      // Get media assets for this run
      const mediaAssets = await db.mediaAsset.findMany({
        where: { crawlRunId: runId }
      });
      
      // Analyze content with LLM
      const analysis = await this.analyzeCrawlContent(
        job.name,
        content,
        mediaAssets.map(asset => ({
          id: asset.id,
          type: asset.mimeType || 'image',
          url: asset.url
        }))
      );
      
      // Update the crawl run with results and analysis
      await db.crawlRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          result: JSON.stringify(results),
          analysis,
          completedAt: new Date()
        }
      });
      
      return { success: true, runId };
    } catch (error) {
      console.error(`Error processing crawl job ${jobId}:`, error);
      
      // Update the crawl run with error
      await db.crawlRun.update({
        where: { id: runId },
        data: {
          status: 'failed',
          error: error.message || 'Unknown error',
          completedAt: new Date()
        }
      });
      
      throw error;
    }
  }
  
  /**
   * Use LLM to analyze the crawled content
   */
  async analyzeCrawlContent(title: string, content: string, mediaItems: { id: string, type: string, url: string }[] = []) {
    try {
      let analysisResult = "";
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          analysisResult = await analyzeCrawlWithLLM({
            title,
            content: processedContent,
            mediaItems: mediaDetails
          });
          break; // Success, exit retry loop
        } catch (retryError) {
          retries++;
          console.warn(`LLM analysis retry ${retries}/${maxRetries}:`, retryError);
          
          if (retries >= maxRetries) {
            throw retryError; // Max retries exceeded
          }
          
          // Wait before retrying (with exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
      
      return analysisResult;
    } catch (error) {
      console.error("Error analyzing content with LLM:", error);
      return `Error analyzing content with AI: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later or with a smaller content sample.`;
    }
  }
  
  // Rest of the class remains unchanged
}

export const crawlerService = new CrawlerService();