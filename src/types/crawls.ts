// Types related to crawl functionality

export enum CrawlStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface CrawlJob {
  id: string;
  name: string;
  url: string;
  status: string;
  createdAt?: string;
  startTime?: string;
  endTime?: string | null;
  scheduledTime?: string;
  useGlobalMedia?: boolean;
  userId: string;
  isRecurring?: boolean;
  schedule?: string | null;
}

export interface CreateCrawlJobParams {
  name: string;
  url: string;
  isRecurring?: boolean;
  schedule?: string;
  mediaItemIds?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CrawlResult {
  url: string;
  title?: string;
  text?: string;
  images?: { url: string; localPath?: string; alt?: string; id?: string }[];
  links?: string[];
  timestamp?: string;
}

export interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
}

export interface CrawlFormData {
  id?: string;
  name: string;
  url: string;
  useGlobalMedia: boolean;
  mediaFiles?: File[];
  status?: string;
  createdAt?: string;
  userId: string;
  isRecurring?: boolean;
}

export interface ContextSource {
  id: string;
  type: 'file' | 'text';
  filename?: string;
  fileType?: string;
  fileSize?: number;
  content?: string;
  status: 'processed' | 'processing' | 'error';
  createdAt: string;
}

export interface TextSnippet {
  id: number;
  text: string;
}

// Analysis results interfaces
export interface MatchDetail {
  sourceId: string;
  matchConfidence: number;
  matchedContent: string;
  potentialSource: string;
}

export interface AnalysisResults {
  analysisComplete: boolean;
  matchesFound: boolean;
  matchDetails: MatchDetail[];
}

export interface CrawlData {
  id: string;
  url: string;
  status: string;
  contextSources: ContextSource[];
  results?: AnalysisResults;
}