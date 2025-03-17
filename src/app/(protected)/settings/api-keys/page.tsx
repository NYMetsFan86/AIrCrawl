"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/keys');
        if (!response.ok) {
          throw new Error(`Failed to fetch API keys: ${response.status}`);
        }
        
        const data = await response.json();
        setApiKeys(data.keys || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load API keys:', err);
        setError('Failed to load API keys. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApiKeys();
  }, []);

  const generateNewKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your API key",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create API key: ${response.status}`);
      }
      
      const data = await response.json();
      
      setApiKeys([...apiKeys, data.key]);
      setNewKeyName("");
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    } catch (err) {
      console.error('Failed to generate API key:', err);
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeKey = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/settings/keys/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to revoke API key: ${response.status}`);
      }
      
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast({
        title: "Success",
        description: "API key revoked successfully",
      });
    } catch (err) {
      console.error('Failed to revoke API key:', err);
      toast({
        title: "Error",
        description: "Failed to revoke API key. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex space-x-4 mb-6">
        <Input
          placeholder="New API key name"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={generateNewKey} disabled={isLoading || !newKeyName.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : (
            "Generate New API Key"
          )}
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-md overflow-hidden">
        {isLoading && apiKeys.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading API keys...</span>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No API keys found. Generate your first API key above.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Key</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="border-b hover:bg-muted">
                  <td className="py-3 px-4">{apiKey.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-mono">•••••••••••••••{apiKey.key.slice(-4)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey.key);
                          toast({
                            description: "API key copied to clipboard",
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </td>
                  <td className="py-3 px-4">{apiKey.created}</td>
                  <td className="py-3 px-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => revokeKey(apiKey.id)}
                      disabled={isLoading}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}