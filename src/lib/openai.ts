// src/lib/openai.ts
import OpenAI from 'openai';
import { prisma } from './prisma';
import { LLMConfig } from '@/types';

export type AnalysisResult = {
  summary: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  entities?: { name: string; type: string }[];
  ipConcerns?: string[];
  categoryScores?: Record<string, number>;
};

export type ImageAnalysisResult = {
  description: string;
  objects: string[];
  ipConcerns?: string[];
  explicitContent: boolean;
};

export type ContentToAnalyze = {
  url: string;
  text: string;
  title?: string;
  html?: string;
  imageUrls?: string[];
};

class OpenAIService {
  private client: OpenAI | null = null;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    } else if (process.env.OPENAI_API_KEY) {
      this.initialize(process.env.OPENAI_API_KEY);
    }
  }

  initialize(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  private ensureInitialized() {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Provide an API key.');
    }
  }

  async analyzeContent(content: ContentToAnalyze): Promise<AnalysisResult> {
    this.ensureInitialized();
    
    const systemPrompt = `You are an expert content analyst. Analyze the following content from ${content.url} and provide:
    1. A concise summary (max 2 sentences)
    2. 5 relevant keywords
    3. Overall sentiment (positive, neutral, or negative)
    4. Entities mentioned (people, companies, products)
    5. Any potential intellectual property concerns
    6. Category relevance scores (0-1) for: technology, business, entertainment, health, science`;

    const userPrompt = `Title: ${content.title || 'N/A'}\n\nContent: ${content.text.substring(0, 4000)}`;
    
    const response = await this.client!.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        summary: result.summary || '',
        keywords: result.keywords || [],
        sentiment: result.sentiment || 'neutral',
        entities: result.entities,
        ipConcerns: result.ip_concerns || result.ipConcerns,
        categoryScores: result.category_scores || result.categoryScores
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return {
        summary: 'Analysis failed',
        keywords: [],
        sentiment: 'neutral'
      };
    }
  }

  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    this.ensureInitialized();
    
    const response = await this.client!.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and provide: 1) a brief description, 2) list of objects/elements in the image, 3) any potential copyright/IP concerns, 4) whether it contains explicit content." },
            { type: "image_url", image_url: { url: imageUrl } }
          ],
        },
      ],
      max_tokens: 300
    });

    const content = response.choices[0].message.content || '';
    
    // Parse the response in a basic way
    const description = content.match(/description:?(.*?)(?=objects|$)/is)?.[1]?.trim() || '';
    const objectsMatch = content.match(/objects:?(.*?)(?=concerns|$)/is)?.[1];
    const objects = objectsMatch ? 
      objectsMatch.split(',').map(item => item.trim().replace(/^-\s*/, '')) : [];
    const ipConcerns = content.match(/concerns:?(.*?)(?=explicit|$)/is)?.[1]?.trim() || '';
    const explicitContent = /explicit.*?(?:yes|true|contains)/i.test(content);

    return {
      description,
      objects,
      ipConcerns: ipConcerns ? [ipConcerns] : [],
      explicitContent
    };
  }

  async detectIntellectualProperty(content: string): Promise<string[]> {
    this.ensureInitialized();
    
    const response = await this.client!.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an intellectual property expert. Analyze the content and identify potential IP concerns like copyrighted material, trademarked phrases, or plagiarism. Return only a JSON array of specific concerns or an empty array if none are found."
        },
        { role: "user", content: content.substring(0, 4000) }
      ],
      response_format: { type: "json_object" }
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.concerns || [];
    } catch (error) {
      console.error('Error parsing IP detection response:', error);
      return [];
    }
  }
}

// Export a default instance using environment variable
export const openai = new OpenAIService();

// Also export the class for creating custom instances with user API keys
export default OpenAIService;

// Get available models for a given API key
export async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const openai = new OpenAI({ apiKey });
    const models = await openai.models.list();
    
    // Filter for commonly used models
    const availableModels = models.data
      .map(model => model.id)
      .filter(id => 
        id.includes('gpt-4') || 
        id.includes('gpt-3.5') || 
        id.includes('vision') ||
        id.includes('embedding')
      );
      
    return availableModels;
  } catch (error) {
    console.error('Error fetching available models:', error);
    return [];
  }
}

// Create a function to get the OpenAI client with the right API key
async function getOpenAIClient() {
  try {
    // Try to get settings from database (most recent default setting)
    const settings = await prisma.lLMSettings.findFirst({
      where: { provider: 'openai', isDefault: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Use settings from DB or fall back to env var
    const apiKey = settings?.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }
    
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    // Fall back to env var as last resort
    if (process.env.OPENAI_API_KEY) {
      return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    throw new Error('Failed to initialize OpenAI client');
  }
}

// Get the preferred model, with proper fallbacks to available models
async function getPreferredModel(defaultModel = 'gpt-4o') {
  try {
    const settings = await prisma.lLMSettings.findFirst({ 
      where: { provider: 'openai', isDefault: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Try preferred model first
    const preferredModel = settings?.model || defaultModel;
    
    // If we have the API key, check if the preferred model is available
    if (settings?.apiKey) {
      try {
        const availableModels = await getAvailableModels(settings.apiKey);
        
        // If preferred model is available, use it
        if (availableModels.includes(preferredModel)) {
          return preferredModel;
        }
        
        // Otherwise use the first available compatible model
        // Try gpt-4 models first, then fall back to gpt-3.5
        const fallbackModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo-0125'];
        for (const model of fallbackModels) {
          if (availableModels.includes(model)) {
            console.log(`Preferred model ${preferredModel} not available, using ${model} instead`);
            return model;
          }
        }
      } catch (error) {
        console.error('Error checking available models:', error);
      }
    }
    
    return preferredModel;
  } catch (error) {
    return defaultModel;
  }
}

export async function analyzeCrawlContent(content: string) {
  console.log('Starting OpenAI content analysis');
  
  try {
    const openai = await getOpenAIClient();
    const model = await getPreferredModel('gpt-4o');
    
    console.log(`Using model: ${model} for content analysis`);
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { 
          role: "system", 
          content: "You are an assistant that analyzes web content for potential intellectual property infringements." 
        },
        { 
          role: "user", 
          content: `Analyze the following web content and identify any potential IP violations: ${content}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    console.log('OpenAI API call successful');
    if (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
      return completion.choices[0].message.content;
    } else {
      throw new Error('Invalid response from OpenAI API');
    }
  } catch (error: any) {
    console.error('Error analyzing content with OpenAI:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Image analysis function
export async function analyzeImage(imageUrl: string) {
  console.log(`Analyzing image: ${imageUrl}`);
  
  try {
    const openai = await getOpenAIClient();
    // For vision tasks, we need to use a model that supports vision
    const model = 'gpt-4-vision-preview';
    
    console.log(`Using model: ${model} for image analysis`);
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an assistant that analyzes images for potential intellectual property infringements."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image for any intellectual property elements:" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 300
    });
    
    console.log('OpenAI image analysis successful');
    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      return {
        description: response.choices[0].message.content,
        analyzed: true
      };
    } else {
      throw new Error('Invalid response from OpenAI Image API');
    }
  } catch (error: any) {
    console.error('Error analyzing image with OpenAI:', error);
    console.error('Error details:', error.message);
    
    // Return error in structured format
    return {
      error: error.message || 'Failed to analyze image',
      analyzed: false
    };
  }
}

// Function to check if the OpenAI configuration is valid
export async function verifyOpenAIConfig(): Promise<boolean> {
  try {
    const openai = await getOpenAIClient();
    const model = await getPreferredModel();
    
    // Make a simple API call to verify credentials
    await openai.models.list();
    
    return true;
  } catch (error) {
    console.error('OpenAI configuration verification failed:', error);
    return false;
  }
}

// Helper function to create a proper analysis object
export async function createFullContentAnalysis(content: string, url: string) {
  try {
    const analysisText = await analyzeCrawlContent(content);
    
    // Parse the analysis to extract structured data
    // This is a simple implementation - you may want to make this more sophisticated
    const hasCopyright = analysisText.toLowerCase().includes('copyright');
    const hasTrademark = analysisText.toLowerCase().includes('trademark');
    const hasPatent = analysisText.toLowerCase().includes('patent');
    
    return {
      url,
      content: content.substring(0, 500) + '...', // Store truncated content
      analysis: analysisText,
      flags: {
        hasCopyright,
        hasTrademark,
        hasPatent,
        potentialIssue: hasCopyright || hasTrademark || hasPatent
      },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error in full content analysis:', error);
    
    return {
      url,
      content: content.substring(0, 500) + '...', 
      analysis: 'Analysis failed: ' + (error.message || 'Unknown error'),
      flags: {
        error: true
      },
      timestamp: new Date().toISOString()
    };
  }
}