// src/lib/agent.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeContent(content: string, url: string) {
  try {
    const response = await openai.chat.completions.create({
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
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Error analyzing content:', error);
    return { error: 'Failed to analyze content' };
  }
}