import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { promises as fsPromises } from 'fs'

// Define the path to store API keys (for development only)
const DATA_FILE = path.join(process.cwd(), 'data', 'api-keys.json')

// Ensure the data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fsPromises.access(dataDir)
  } catch {
    await fsPromises.mkdir(dataDir, { recursive: true })
  }
  
  // Create empty file if it doesn't exist
  try {
    await fsPromises.access(DATA_FILE)
  } catch {
    await fsPromises.writeFile(DATA_FILE, JSON.stringify({ keys: [] }))
  }
}

// Read API keys from file
const readKeys = async () => {
  await ensureDataDir()
  
  try {
    const data = await fsPromises.readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading API keys:', error)
    return { keys: [] }
  }
}

// Write API keys to file
const writeKeys = async (data: any) => {
  await ensureDataDir()
  
  try {
    await fsPromises.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing API keys:', error)
    throw new Error('Failed to save API keys')
  }
}

// GET handler
export async function GET() {
  try {
    const data = await readKeys()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve API keys' }, { status: 500 })
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, key, models, selectedModel } = body
    
    if (!provider || !key || !selectedModel) {
      return NextResponse.json(
        { message: 'Provider, API key, and model are required' }, 
        { status: 400 }
      )
    }
    
    const data = await readKeys()
    
    // Check if provider already exists
    const existingKeyIndex = data.keys.findIndex((k: any) => k.provider === provider)
    if (existingKeyIndex !== -1) {
      data.keys[existingKeyIndex] = { provider, key, models, selectedModel }
    } else {
      data.keys.push({ provider, key, models, selectedModel })
    }
    
    await writeKeys(data)
    
    return NextResponse.json({ 
      message: 'API key added successfully',
      key: { provider, key: '••••••••••••••••', models, selectedModel }
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to add API key' },
      { status: 500 }
    )
  }
}

// DELETE handler
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    
    if (!provider) {
      return NextResponse.json(
        { message: 'Provider is required' }, 
        { status: 400 }
      )
    }
    
    const data = await readKeys()
    data.keys = data.keys.filter((key: any) => key.provider !== provider)
    
    await writeKeys(data)
    
    return NextResponse.json({ message: 'API key removed successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to remove API key' },
      { status: 500 }
    )
  }
}