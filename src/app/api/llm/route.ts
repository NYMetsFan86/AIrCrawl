import { NextRequest, NextResponse } from 'next/server'
import { llmService } from '@/lib/llm-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body
    
    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' }, 
        { status: 400 }
      )
    }
    
    const completion = await llmService.getCompletion(prompt)
    
    return NextResponse.json({ 
      completion,
      provider: llmService.getActiveProvider()
    })
  } catch (error: any) {
    console.error('LLM API error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to get completion' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const providers = await llmService.getAvailableProviders()
    const activeProvider = llmService.getActiveProvider()
    
    return NextResponse.json({ 
      providers,
      activeProvider
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to get LLM providers' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, model } = body
    
    if (!provider || !model) {
      return NextResponse.json(
        { message: 'Provider and model are required' }, 
        { status: 400 }
      )
    }
    
    const success = await llmService.setActiveProvider(provider, model)
    
    if (!success) {
      return NextResponse.json(
        { message: 'Failed to set active provider' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Active provider updated successfully',
      activeProvider: llmService.getActiveProvider()
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to update active provider' },
      { status: 500 }
    )
  }
}