import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvailableModels } from '@/lib/openai';

// GET handler to retrieve LLM settings
export async function GET() {
  try {
    const settings = await prisma.lLMSettings.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching LLM settings:', error);
    return NextResponse.json({ error: 'Failed to fetch LLM settings' }, { status: 500 });
  }
}

// POST handler to create/update LLM settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate input
    if (!data.provider || !data.apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 });
    }
    
    // Verify the API key works by testing it
    if (data.provider === 'openai') {
      try {
        const availableModels = await getAvailableModels(data.apiKey);
        if (!availableModels || availableModels.length === 0) {
          return NextResponse.json({ 
            error: 'Invalid API key or no models available' 
          }, { status: 400 });
        }
        
        // If model isn't specified or not available, select first available model
        if (!data.model || !availableModels.includes(data.model)) {
          data.model = availableModels[0];
        }
        
        // Set available models list
        data.availableModels = availableModels;
      } catch (error) {
        return NextResponse.json({ 
          error: 'Failed to verify API key' 
        }, { status: 400 });
      }
    }
    
    // Create or update settings
    const settings = await prisma.lLMSettings.create({
      data: {
        provider: data.provider,
        model: data.model,
        apiKey: data.apiKey,
        isDefault: data.isDefault || false,
        configuration: JSON.stringify({
          availableModels: data.availableModels || [],
          temperature: data.temperature || 0.7,
          maxTokens: data.maxTokens || 500
        })
      }
    });
    
    // If this is set as default, update other settings
    if (data.isDefault) {
      await prisma.lLMSettings.updateMany({
        where: {
          provider: data.provider,
          id: { not: settings.id }
        },
        data: { isDefault: false }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      settings,
      availableModels: data.availableModels || []
    });
  } catch (error) {
    console.error('Error saving LLM settings:', error);
    return NextResponse.json({ error: 'Failed to save LLM settings' }, { status: 500 });
  }
}