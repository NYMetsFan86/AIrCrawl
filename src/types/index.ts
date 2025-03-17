export * from './auth';
export * from './crawls';
export type { PaginationParams as CommonPaginationParams } from './common';
export * from './errors';
export * from './alert';

// Central exports for all types

// Basic shared types
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface CrawlData {
  id: string;
  url: string;
  content?: string;
  title?: string;
  timestamp?: string;
}

// Define types for the application

// Media and crawl related types
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'video' | 'text';
  url: string;
  global: boolean;
  userId?: string;
  createdAt?: string;
  content?: string;
}

export interface CrawlJob {
  id: string;
  name?: string;
  url: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime: string;
  endTime: string | null;
  scheduledTime?: string;
  isRecurring?: boolean;
  userId?: string;
  useGlobalMedia?: boolean;
}

export interface CrawlResult {
  url: string;
  title?: string;
  text?: string;
  images?: { url: string; localPath?: string; alt?: string; id?: string }[];
  links?: string[];
  timestamp: string;
}

// Alert related types
export interface InfringementAlert {
  id: string;
  content: string;
  confidenceScore: number;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface ContextSource {
  id: string;
  type: string;
  content: string;
  source?: string;
}

// LLM related types
export interface LLMProvider {
  name: string;
  id: string;
  models: string[];
}

export interface LLMConfig {
  provider: string;
  model: string;
  apiKey?: string;
}