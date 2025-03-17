import OpenAI from 'openai';
import { supabase } from '@/lib/supabase/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeCrawlContent(content: string, url: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI crawler that analyzes web content to identify potential intellectual property issues."
        },
        {
          role: "user",
          content: `Analyze this web content from ${url}:\n\n${content}`
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "saveContentAnalysis",
            description: "Save the analysis of crawled content",
            parameters: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "Brief summary of the content"
                },
                potentialIssues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["trademark", "copyright", "patent", "other"]
                      },
                      description: {
                        type: "string"
                      },
                      confidence: {
                        type: "number",
                        minimum: 0,
                        maximum: 1
                      }
                    }
                  }
                }
              },
              required: ["summary"]
            }
          }
        }
      ]
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}