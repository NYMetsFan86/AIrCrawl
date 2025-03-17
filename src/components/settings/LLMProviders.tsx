'use client'

import React, { useState, useEffect } from 'react'

export function LLMProviders({ embedded = false }) {
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKey, setNewKey] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [selectedModel, setSelectedModel] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)

  const providerModels = {
    openai: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4o'],
    anthropic: ['claude-3-opus', 'claude-3.5-sonnet', 'claude-3-haiku']
  }

  useEffect(() => {
    // Load stored API keys
    const loadApiKeys = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/settings/keys')
        if (response.ok) {
          const data = await response.json()
          setApiKeys(data.keys || [])
        }
      } catch (error) {
        console.error('Failed to load API keys:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadApiKeys()
  }, [])

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value)
    setSelectedModel('')
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value)
  }

  const handleAddKey = async () => {
    if (!newKey || !selectedModel) {
      setMessage({ type: 'error', text: 'API key and model are required' })
      return
    }

    try {
      setLoading(true)
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
        setApiKeys(prev => {
          // Replace if provider exists, otherwise add
          const exists = prev.some(k => k.provider === selectedProvider)
          if (exists) {
            return prev.map(k => k.provider === selectedProvider ? result.key : k)
          }
          return [...prev, result.key]
        })
        setNewKey('')
        setMessage({ type: 'success', text: 'API key added successfully' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to add API key' })
      }
    } catch (error: any) {
      console.error('Error adding API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while adding the API key' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveKey = async (provider: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/settings/keys?provider=${provider}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.provider !== provider))
        setMessage({ type: 'success', text: `${provider} API key removed` })
      } else {
        const errorText = await response.text()
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText }
        }
        setMessage({ type: 'error', text: error.message || 'Failed to remove API key' })
      }
    } catch (error: any) {
      console.error('Error removing API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while removing the API key' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">LLM Provider Management</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Your LLM Providers</h3>
        
        {loading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No LLM providers configured</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Provider</th>
                <th className="text-left py-2">Model</th>
                <th className="text-left py-2">API Key</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.provider} className="border-b">
                  <td className="py-4 capitalize">{apiKey.provider}</td>
                  <td className="py-4">{apiKey.selectedModel}</td>
                  <td className="py-4">•••••••••••••••••</td>
                  <td className="py-4">
                    <button 
                      className="text-red-500 text-sm"
                      onClick={() => handleRemoveKey(apiKey.provider)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Add LLM Provider</h3>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select 
              className="w-full border rounded px-3 py-2"
              value={selectedProvider}
              onChange={handleProviderChange}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select 
              className="w-full border rounded px-3 py-2"
              value={selectedModel}
              onChange={handleModelChange}
            >
              <option value="">Select model</option>
              {providerModels[selectedProvider as keyof typeof providerModels]?.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder={`Enter your ${selectedProvider} API key`}
            />
          </div>
          
          <button 
            className="bg-gray-900 text-white px-4 py-2 rounded"
            onClick={handleAddKey}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Provider'}
          </button>
        </div>
      </div>
    </div>
  )
}