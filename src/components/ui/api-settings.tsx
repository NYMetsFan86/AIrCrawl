'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, Info } from 'lucide-react'

interface ApiKey {
  provider: string
  key: string
  models: string[]
  selectedModel: string
}

export function ApiSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [selectedModel, setSelectedModel] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const providerModels = {
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  }

  useEffect(() => {
    // Load stored API keys
    const loadApiKeys = async () => {
      try {
        const response = await fetch('/api/settings/keys')
        if (response.ok) {
          const data = await response.json()
          setApiKeys(data.keys || [])
        }
      } catch (error) {
        console.error('Failed to load API keys:', error)
      }
    }
    
    loadApiKeys()
  }, [])

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value)
    setSelectedModel('')
  }

  const handleAddKey = async () => {
    if (!newKey || !selectedModel) {
      setMessage({ type: 'error', text: 'API key and model are required' })
      return
    }

    try {
      const response = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          key: newKey,
          models: providerModels[selectedProvider as keyof typeof providerModels] || [],
          selectedModel
        })
      })

      if (response.ok) {
        const result = await response.json()
        setApiKeys(prev => [...prev, result.key])
        setNewKey('')
        setMessage({ type: 'success', text: 'API key added successfully' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to add API key' })
      }
    } catch (error) {
      console.error('Error adding API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while adding the API key' })
    }
  }

  const handleRemoveKey = async (provider: string) => {
    try {
      const response = await fetch(`/api/settings/keys?provider=${provider}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.provider !== provider))
        setMessage({ type: 'success', text: `${provider} API key removed` })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to remove API key' })
      }
    } catch (error) {
      console.error('Error removing API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while removing the API key' })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>Configure API keys for language models</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add">
          <TabsList>
            <TabsTrigger value="add">Add New API Key</TabsTrigger>
            <TabsTrigger value="manage">Manage Keys</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels[selectedProvider as keyof typeof providerModels]?.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={`Enter your ${selectedProvider} API key`}
                />
              </div>

              <Button onClick={handleAddKey}>Add API Key</Button>

              {message.text && (
                <Alert className={message.type === 'error' ? 'alert-destructive' : 'alert-info'}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manage">
            {apiKeys.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No API keys added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.provider} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <h4 className="font-medium">{apiKey.provider}</h4>
                      <p className="text-sm text-muted-foreground">Model: {apiKey.selectedModel}</p>
                      <p className="text-sm text-muted-foreground">Key: ••••••••••••••••</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveKey(apiKey.provider)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}