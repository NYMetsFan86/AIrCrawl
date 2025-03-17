import { llmService } from '@/lib/llm-service';

interface AnalyzeCrawlParams {
  title: string;
  content: string;
  mediaItems: Array<{
    name?: string;
    type: string;
    url: string;
    id?: string;
  }>;
}

export async function analyzeCrawlWithLLM({ title, content, mediaItems = [] }: AnalyzeCrawlParams): Promise<string> {
  // Input validation
  if (!content || content.trim() === '') {
    throw new Error('Content to analyze cannot be empty');
  }

  // Filter invalid media items
  const validMediaItems = mediaItems.filter(item => 
    item && item.url && typeof item.url === 'string' && 
    (item.url.startsWith('http://') || item.url.startsWith('https://'))
  );

  try {
    // Prepare media prompt if media items exist
    const mediaPrompt = mediaItems.length > 0 ? `Media items found: ${mediaItems.map(item => item.url).join(', ')}` : 'No media items found.';
    
    const prompt = `Analyze this web content:
Title: ${title || 'Untitled'}
Content: ${content}
${mediaPrompt}

Provide a structured analysis with:
1. Summary of the content (2-3 sentences)
2. Main topics covered
3. Potential intellectual property items identified (images, text, designs, etc.)
4. Notable mentions of products, services, or brands
5. Visual elements analysis (if images were found)
   - Describe what appears in the images
   - Note any potential brand elements, logos, or trademarks visible
   - Indicate if images appear to be stock photos or unique content
6. Identify multiple media and digital asset types within the content`;

    // Use llmService instead of direct OpenAI integration
    const completion = await llmService.getCompletion(prompt);
    
    if (!completion) {
      throw new Error('LLM returned empty analysis');
    }
    
    return completion;
  } catch (error) {
    console.error("Error in LLM analysis:", error);
    throw new Error(`LLM analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
