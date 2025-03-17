import { CrawlData, ContextSource } from '@/types';

interface AIServiceConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface AIAnalysisResult {
  matchesFound: boolean;
  matchDetails: Array<{
    sourceId: string;
    matchConfidence: number;
    matchedContent: string;
    potentialSource: string;
  }>;
}

export async function analyzeWithAI(
  crawl: CrawlData, 
  config: AIServiceConfig, 
  context: Array<{type: string, content: string}>
): Promise<AIAnalysisResult> {
  try {
    switch (config.provider) {
      case 'openai':
        return await analyzeWithOpenAI(crawl, config, context);
      case 'anthropic':
        return await analyzeWithAnthropic(crawl, config, context);
      case 'ollama':
        return await analyzeWithOllama(crawl, config, context);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

async function analyzeWithOpenAI(
  crawl: CrawlData, 
  config: AIServiceConfig, 
  context: Array<{type: string, content: string}>
): Promise<AIAnalysisResult> {
  const prompt = generatePrompt(crawl, context);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an intellectual property detection system. Analyze the provided content and detect any potential IP infringements or content matches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return parseAIResponse(data.choices[0].message.content);
}

// Similar implementations for other providers
async function analyzeWithAnthropic(crawl: CrawlData, config: AIServiceConfig, context: any[]): Promise<AIAnalysisResult> {
  // Implement Anthropic Claude API call
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4000,
      system: "You are an intellectual property detection system. Analyze the provided content and detect any potential IP infringements or content matches.",
      messages: [
        {
          role: 'user',
          content: generatePrompt(crawl, context)
        }
      ]
    })
  });
  
  // Process response similar to OpenAI
  const data = await response.json();
  return parseAIResponse(data.content[0].text);
}

async function analyzeWithOllama(crawl: CrawlData, config: AIServiceConfig, context: any[]): Promise<AIAnalysisResult> {
  // Local Ollama implementation
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      prompt: generatePrompt(crawl, context),
      system: "You are an intellectual property detection system. Analyze the provided content and detect any potential IP infringements or content matches.",
    })
  });
  
  const data = await response.json();
  return parseAIResponse(data.response);
}

function generatePrompt(crawl: CrawlData, context: Array<{type: string, content: string}>): string {
  let prompt = `Analyze the following content for potential intellectual property matches:\n\n`;
  
  context.forEach((item, index) => {
    prompt += `### Content ${index + 1} (${item.type}):\n${item.content}\n\n`;
  });
  
  prompt += `\nPlease analyze the above content and identify any potential IP issues. Format your response as JSON with the following structure:
  {
    "matchesFound": boolean,
    "matchDetails": [
      {
        "sourceId": "identifier",
        "matchConfidence": number, // 0-100
        "matchedContent": "text that matched",
        "potentialSource": "potential original source"
      }
    ]
  }`;
  
  return prompt;
}

function parseAIResponse(responseText: string): AIAnalysisResult {
  try {
    // Extract JSON from response text (handles cases where AI adds explanatory text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback result if no valid JSON found
    return {
      matchesFound: false,
      matchDetails: []
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      matchesFound: false,
      matchDetails: []
    };
  }
}