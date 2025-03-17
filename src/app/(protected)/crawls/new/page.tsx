'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StorageService } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { BRANDING } from '@/lib/constants';
import { useSession } from 'next-auth/react';
import { supabaseCrawlService } from '@/lib/crawl-service-supabase';

interface CrawlFormData {
  id?: string;
  name: string;
  url: string;
  useGlobalMedia: boolean;
  mediaFiles?: File[];
  status?: string;
  createdAt?: string;
  userId: string; // Make userId required
  isRecurring?: boolean;
  schedule?: string | null;
}

interface CrawlJob {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: string;
  useGlobalMedia: boolean;
  userId: string; // Add userId to interface
  isRecurring?: boolean;
  schedule?: string | null;
}

export default function NewCrawlPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [crawlName, setCrawlName] = useState('');
  const [useGlobalMedia, setUseGlobalMedia] = useState(false);
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [schedule, setSchedule] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('Session user object:', session.user);
      // Use the actual user ID from the session
      setUserId((session.user as any).id || null);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [status, session]);

  const handleToggleChange = () => {
    setUseGlobalMedia(!useGlobalMedia);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated || !userId) {
      setError('You must be logged in to create a crawl');
      toast({
        title: "Authentication required",
        description: "Please log in before creating a crawl",
        variant: "destructive",
      });
      return;
    }

    if (!crawlName.trim() || !website.trim()) {
      setError('Crawl name and website URL are required');
      return;
    }

    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setError('URL must use http or https protocol');
        return;
      }
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsLoading(true);

    try {
      const crawlId = uuidv4();
      const timestamp = new Date().toISOString();

      const crawlData: CrawlFormData = {
        id: crawlId,
        name: crawlName,
        url: website,
        useGlobalMedia: useGlobalMedia,
        userId: userId,
        isRecurring: isRecurring,
        schedule: isRecurring ? schedule : null,
        status: 'pending'
      };

      // Store in Prisma via API
      const response = await fetch('/api/crawls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(crawlData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const finalCrawlId = data?.data?.id || crawlId;

      // Also store in Supabase
      await supabaseCrawlService.createCrawlJob({
        id: finalCrawlId,
        name: crawlName,
        url: website,
        useGlobalMedia: useGlobalMedia,
        userId: userId,
        isRecurring: isRecurring,
        schedule: isRecurring ? schedule : null,
        status: 'pending',
        createdAt: timestamp
      });

      if (!useGlobalMedia && selectedFiles?.length) {
        const filesArray = Array.from(selectedFiles);
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          if (file) {
            const fileFormData = new FormData();
            fileFormData.append('file', file);

            const fileUploadResponse = await fetch(`/api/crawls/${finalCrawlId}/media`, {
              method: 'POST',
              body: fileFormData,
            });

            if (!fileUploadResponse.ok) {
              console.warn(`Failed to upload file ${file.name}`);
            }
            
            // Upload file to Supabase as well
            await supabaseCrawlService.uploadMediaFile(finalCrawlId, file);
          }
        }
      }

      await fetch(`/api/crawls/${finalCrawlId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pending' })
      });

      // Store in local storage as well for compatibility
      await StorageService.addCrawl({
        id: finalCrawlId,
        name: crawlName,
        url: website,
        useGlobalMedia,
        status: 'pending',
        createdAt: timestamp,
        userId: userId
      });

      toast({
        title: "Crawl created successfully",
        description: `Your crawl "${crawlName}" has been submitted and started.`,
        variant: "default",
      });

      router.push('/crawls');
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create crawl';
      toast({
        title: "Crawl creation failed",
        description: errorMessage,
        variant: "destructive",
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Add form fields for recurring crawl settings
  const renderRecurringOptions = () => {
    if (isRecurring) {
      return (
        <div className="mb-4">
          <label className="block mb-2" style={{ color: '#666666' }}>
            Schedule
          </label>
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full p-2 rounded"
            disabled={isLoading}
            style={{
              borderColor: '#cccccc',
              backgroundColor: '#f9f9f9',
              color: '#333333'
            }}
          >
            <option value="">Select a schedule</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8" style={{ backgroundColor: '#ffffff', color: '#333333' }}>
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#333333' }}>
          Create New {BRANDING.productName} Crawl
        </h1>
        <div className="px-4 py-3 rounded mb-4" style={{
          backgroundColor: BRANDING.colors.primary.main + '20',
          borderColor: BRANDING.colors.primary.main,
          color: BRANDING.colors.primary.main,
          borderWidth: '1px'
        }}>
          You must be logged in to create a crawl. Please log in and try again.
        </div>
        <button
          onClick={() => router.push('/login')} 
          className="py-2 px-4 rounded"
          style={{
            backgroundColor: BRANDING.colors.primary.main,
            color: '#ffffff'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ 
      backgroundColor: '#ffffff',
      color: '#333333' 
    }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#333333' }}>
        Create New {BRANDING.productName} Crawl
      </h1>
      
      {error && (
        <div className="px-4 py-3 rounded mb-4" style={{
        backgroundColor: BRANDING.colors.primary.main + '20',
        borderColor: BRANDING.colors.primary.main,
        color: BRANDING.colors.primary.main,
        borderWidth: '1px'
        }}>
        {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
        <label className="block mb-2" style={{ color: '#666666' }}>
          Crawl Name
        </label>
        <input
          type="text"
          value={crawlName}
          onChange={(e) => setCrawlName(e.target.value)}
          className="w-full p-2 rounded"
          disabled={isLoading}
          style={{
          borderColor: '#cccccc',
          backgroundColor: '#f9f9f9',
          color: '#333333'
          }}
        />
        </div>
        
        {/* Recurring toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                className="sr-only"
                disabled={isLoading}
              />
              <div className={`block w-14 h-8 rounded-full`}
                style={{
                  backgroundColor: isRecurring ? 
                    BRANDING.colors.primary.main : 
                    '#cccccc'
                }}
              ></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                isRecurring ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
            <span style={{ color: '#333333' }}>Make Recurring</span>
          </label>
        </div>
        
        {renderRecurringOptions()}
        
        <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <div className="relative">
          <input
            type="checkbox"
            checked={useGlobalMedia}
            onChange={handleToggleChange}
            className="sr-only"
            disabled={isLoading}
          />
          <div className={`block w-14 h-8 rounded-full`}
            style={{
            backgroundColor: useGlobalMedia ? 
              BRANDING.colors.primary.main : 
              '#cccccc'
            }}
          ></div>
          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
            useGlobalMedia ? 'transform translate-x-6' : ''
          }`}></div>
          </div>
          <span style={{ color: '#333333' }}>Use Global Media</span>
        </label>
        </div>
        
        {!useGlobalMedia && (
        <div className="mb-4">
          <label className="block mb-2" style={{ color: '#666666' }}>
          Media Upload
          </label>
          <div className="rounded-lg p-6 text-center" style={{
          borderWidth: '2px',
          borderStyle: 'dashed',
          borderColor: '#cccccc'
          }}>
          <input
            type="file"
            className="hidden"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            disabled={isLoading}
            onChange={handleFileChange}
          />
          <label 
            htmlFor="media-upload" 
            className="cursor-pointer hover:underline"
            style={{ color: BRANDING.colors.primary.main }}
          >
            Click to upload media files
          </label>
          <p style={{ color: '#666666' }} className="text-sm mt-1">
            or drag and drop files here
          </p>
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="mt-3 text-left">
            <p className="text-sm font-medium" style={{ color: '#333333' }}>
              Selected files:
            </p>
            <ul className="text-sm" style={{ color: '#666666' }}>
              {Array.from(selectedFiles).map((file, index) => (
              <li key={index} className="truncate">{file.name}</li>
              ))}
            </ul>
            </div>
          )}
          </div>
        </div>
        )}
        
        <div className="mb-4">
        <label className="block mb-2" style={{ color: '#666666' }}>
          Website URL
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full p-2 rounded"
          placeholder="https://example.com"
          disabled={isLoading}
          style={{
          borderColor: '#cccccc',
          backgroundColor: '#f9f9f9',
          color: '#333333'
          }}
        />
        </div>
        
        <button
        type="submit"
        className="w-full py-2 rounded transition"
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? 
          '#cccccc' : 
          BRANDING.colors.primary.main,
          color: '#ffffff',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
        >
        {isLoading ? 'Creating...' : 'Start Crawl'}
        </button>
      </form>
    </div>
  );
}