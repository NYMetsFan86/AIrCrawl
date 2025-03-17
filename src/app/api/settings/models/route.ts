import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const providerModels = {
      openai: [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'gpt-4o-mini' // Added the gpt-4o-mini model
      ],
      anthropic: [
        'claude-3-opus',
        'claude-3-sonnet',
        'claude-3-haiku'
      ]
    };

    return NextResponse.json({ models: providerModels }, { status: 200 });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { message: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}