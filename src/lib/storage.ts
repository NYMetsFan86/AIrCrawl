import { CrawlJob } from "@/types";
import { createClient } from '@supabase/supabase-js';

// Storage service for local crawl data management
// Path: /lib/storage.ts

interface StorableCrawl {
  id: string;
  name: string;
  url: string;
  useGlobalMedia: boolean;
  status?: string;
  createdAt?: string;
  userId: string; // Add userId field
  isRecurring?: boolean;
}

const STORAGE_KEY = 'aircrawl_data';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to determine if we should use Supabase
const useSupabase = () => {
  if (typeof window === 'undefined') return false;
  return StorageService.getPreference('useSupabase', false);
};

// Helper to get current user ID from Supabase
const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || 'anonymous';
};

export const StorageService = {
  // Storage preference toggle
  enableSupabaseStorage: () => {
    StorageService.setPreference('useSupabase', true);
  },
  
  disableSupabaseStorage: () => {
    StorageService.setPreference('useSupabase', false);
  },
  
  // Crawl jobs storage
  getCrawls: async (): Promise<CrawlJob[]> => {
    if (typeof window === 'undefined') return [];
    
    if (useSupabase()) {
      try {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('crawls')
          .select('*')
          .eq('userId', userId);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error getting crawls from Supabase:', error);
        return [];
      }
    } else {
      try {
        const crawls = localStorage.getItem('crawls');
        return crawls ? JSON.parse(crawls) : [];
      } catch (error) {
        console.error('Error getting crawls from storage:', error);
        return [];
      }
    }
  },
  
  addCrawl: async (crawl: CrawlJob): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (useSupabase()) {
      try {
        const { error } = await supabase
          .from('crawls')
          .insert([crawl]);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error adding crawl to Supabase:', error);
      }
    } else {
      try {
        const crawls = await StorageService.getCrawls();
        const updatedCrawls = [crawl, ...crawls];
        localStorage.setItem('crawls', JSON.stringify(updatedCrawls));
      } catch (error) {
        console.error('Error adding crawl to storage:', error);
      }
    }
  },
  
  updateCrawl: async (crawl: CrawlJob): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (useSupabase()) {
      try {
        const { error } = await supabase
          .from('crawls')
          .update(crawl)
          .eq('id', crawl.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error updating crawl in Supabase:', error);
      }
    } else {
      try {
        const crawls = await StorageService.getCrawls();
        const updatedCrawls = crawls.map(c => c.id === crawl.id ? crawl : c);
        localStorage.setItem('crawls', JSON.stringify(updatedCrawls));
      } catch (error) {
        console.error('Error updating crawl in storage:', error);
      }
    }
  },
  
  removeCrawl: async (id: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (useSupabase()) {
      try {
        const { error } = await supabase
          .from('crawls')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error removing crawl from Supabase:', error);
      }
    } else {
      try {
        const crawls = await StorageService.getCrawls();
        const updatedCrawls = crawls.filter(c => c.id !== id);
        localStorage.setItem('crawls', JSON.stringify(updatedCrawls));
      } catch (error) {
        console.error('Error removing crawl from storage:', error);
      }
    }
  },
  
  // Migration utilities
  migrateToSupabase: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get all crawls from localStorage
      const localCrawls = await StorageService.getCrawls();
      if (localCrawls.length === 0) return;
      
      // Get user ID for association
      const userId = await getCurrentUserId();
      
      // Ensure all crawls have userId
      const crawlsWithUserId = localCrawls.map(crawl => ({
        ...crawl,
        userId: crawl.userId || userId
      }));
      
      // Insert all crawls to Supabase
      const { error } = await supabase
        .from('crawls')
        .upsert(crawlsWithUserId);
      
      if (error) throw error;
      
      // Enable Supabase storage after successful migration
      StorageService.enableSupabaseStorage();
    } catch (error) {
      console.error('Error migrating crawls to Supabase:', error);
    }
  },
  
  // User preferences storage
  setPreference: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting preference ${key}:`, error);
    }
  },
  
  getPreference: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const value = localStorage.getItem(`pref_${key}`);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Error getting preference ${key}:`, error);
      return defaultValue;
    }
  }
};