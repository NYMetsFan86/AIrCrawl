import { createClient } from '@/utils/supabase/client';
import { CrawlJob, CrawlFormData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Define types for Supabase crawl-specific features
interface SupabaseCrawlJob extends CrawlJob {
  analysis_result?: string;
  alert_count?: number;
  matched_content?: string[];
}

interface CrawlRunStatus {
  id: string;
  crawl_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error?: string;
  pages_processed: number;
}

interface CrawlAlert {
  id: string;
  crawl_id: string;
  type: 'text' | 'image' | 'video';
  confidence: number;
  matched_content: string;
  url: string;
  status: 'new' | 'reviewed' | 'dismissed';
  created_at: string;
}

class SupabaseCrawlService {
  private supabase = createClient();

  /**
   * Create a new crawl job in Supabase
   */
  async createCrawlJob(crawlData: CrawlFormData): Promise<{ id: string }> {
    try {
      // Convert from CrawlFormData to Supabase format
      const supabaseCrawlJob = {
        id: crawlData.id || uuidv4(),
        name: crawlData.name,
        url: crawlData.url,
        use_global_media: crawlData.useGlobalMedia,
        status: crawlData.status || 'pending',
        created_at: crawlData.createdAt || new Date().toISOString(),
        user_id: crawlData.userId,
        is_recurring: crawlData.isRecurring || false,
        schedule: crawlData.schedule || null,
      };

      const { error, data } = await this.supabase
        .from('crawl_jobs')
        .insert(supabaseCrawlJob)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating crawl job in Supabase:', error);
        throw new Error(`Failed to create crawl job: ${error.message}`);
      }

      return { id: data.id };
    } catch (error) {
      console.error('Error in createCrawlJob:', error);
      throw error;
    }
  }

  /**
   * Get all crawl jobs for a user
   */
  async getCrawlJobs(userId: string): Promise<SupabaseCrawlJob[]> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_jobs')
        .select(`
          *,
          crawl_runs:crawl_runs(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching crawl jobs:', error);
        throw new Error(`Failed to fetch crawl jobs: ${error.message}`);
      }

      // Convert from Supabase format to app format
      return data.map((job: any): SupabaseCrawlJob => ({
        id: job.id,
        name: job.name,
        url: job.url,
        status: job.status,
        createdAt: job.created_at,
        startTime: job.crawl_runs[0]?.started_at,
        endTime: job.crawl_runs[0]?.completed_at,
        useGlobalMedia: job.use_global_media,
        userId: job.user_id,
        isRecurring: job.is_recurring,
        schedule: job.schedule,
        analysis_result: job.analysis_result,
        alert_count: job.alert_count
      }));
    } catch (error) {
      console.error('Error in getCrawlJobs:', error);
      throw error;
    }
  }

  /**
   * Get a single crawl job by ID
   */
  async getCrawlJobById(id: string): Promise<SupabaseCrawlJob | null> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_jobs')
        .select(`
          *,
          crawl_runs:crawl_runs(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching crawl job:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        url: data.url,
        status: data.status,
        createdAt: data.created_at,
        startTime: data.crawl_runs[0]?.started_at,
        endTime: data.crawl_runs[0]?.completed_at,
        useGlobalMedia: data.use_global_media,
        userId: data.user_id,
        isRecurring: data.is_recurring,
        schedule: data.schedule,
        analysis_result: data.analysis_result,
        alert_count: data.alert_count
      };
    } catch (error) {
      console.error('Error in getCrawlJobById:', error);
      return null;
    }
  }

  /**
   * Update an existing crawl job
   */
  async updateCrawlJob(id: string, updates: Partial<CrawlFormData>): Promise<boolean> {
    try {
      // Convert from app format to Supabase format
      const supabaseUpdates: any = {};
      
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.url) supabaseUpdates.url = updates.url;
      if (updates.status) supabaseUpdates.status = updates.status;
      if ('useGlobalMedia' in updates) supabaseUpdates.use_global_media = updates.useGlobalMedia;
      if ('isRecurring' in updates) supabaseUpdates.is_recurring = updates.isRecurring;
      if ('schedule' in updates) supabaseUpdates.schedule = updates.schedule;

      const { error } = await this.supabase
        .from('crawl_jobs')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating crawl job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateCrawlJob:', error);
      return false;
    }
  }

  /**
   * Delete a crawl job
   */
  async deleteCrawlJob(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('crawl_jobs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting crawl job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCrawlJob:', error);
      return false;
    }
  }

  /**
   * Start a crawl job run
   */
  async startCrawlRun(crawlId: string): Promise<{ id: string }> {
    try {
      const runId = uuidv4();
      const { error } = await this.supabase
        .from('crawl_runs')
        .insert({
          id: runId,
          crawl_id: crawlId,
          status: 'in-progress',
          started_at: new Date().toISOString(),
          pages_processed: 0
        });

      if (error) {
        console.error('Error starting crawl run:', error);
        throw new Error(`Failed to start crawl run: ${error.message}`);
      }

      // Update crawl job status
      await this.updateCrawlJob(crawlId, { status: 'in-progress' });

      return { id: runId };
    } catch (error) {
      console.error('Error in startCrawlRun:', error);
      throw error;
    }
  }

  /**
   * Complete a crawl run with results
   */
  async completeCrawlRun(
    runId: string, 
    crawlId: string, 
    results: any, 
    analysisResult?: string
  ): Promise<boolean> {
    try {
      const { error: runError } = await this.supabase
        .from('crawl_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          results_data: JSON.stringify(results)
        })
        .eq('id', runId);

      if (runError) {
        console.error('Error completing crawl run:', runError);
        return false;
      }

      // Update crawl job with analysis results
      if (analysisResult) {
        const { error: jobError } = await this.supabase
          .from('crawl_jobs')
          .update({
            status: 'completed',
            analysis_result: analysisResult
          })
          .eq('id', crawlId);

        if (jobError) {
          console.error('Error updating job with analysis:', jobError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in completeCrawlRun:', error);
      return false;
    }
  }

  /**
   * Record an error in a crawl run
   */
  async recordCrawlError(runId: string, crawlId: string, error: string): Promise<boolean> {
    try {
      const { error: runError } = await this.supabase
        .from('crawl_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: error
        })
        .eq('id', runId);

      if (runError) {
        console.error('Error recording crawl failure:', runError);
        return false;
      }

      // Update crawl job status
      await this.updateCrawlJob(crawlId, { status: 'failed' });

      return true;
    } catch (error) {
      console.error('Error in recordCrawlError:', error);
      return false;
    }
  }

  /**
   * Get alerts for a crawl
   */
  async getCrawlAlerts(crawlId: string): Promise<CrawlAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_alerts')
        .select('*')
        .eq('crawl_id', crawlId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching crawl alerts:', error);
        return [];
      }

      return data.map((alert: any): CrawlAlert => ({
        id: alert.id,
        crawl_id: alert.crawl_id,
        type: alert.type,
        confidence: alert.confidence,
        matched_content: alert.matched_content,
        url: alert.url,
        status: alert.status,
        created_at: alert.created_at
      }));
    } catch (error) {
      console.error('Error in getCrawlAlerts:', error);
      return [];
    }
  }

  /**
   * Create a new alert for a crawl
   */
  async createCrawlAlert(alert: Omit<CrawlAlert, 'id' | 'created_at'>): Promise<string> {
    try {
      const alertId = uuidv4();
      const { error } = await this.supabase
        .from('crawl_alerts')
        .insert({
          id: alertId,
          crawl_id: alert.crawl_id,
          type: alert.type,
          confidence: alert.confidence,
          matched_content: alert.matched_content,
          url: alert.url,
          status: alert.status || 'new',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating crawl alert:', error);
        throw new Error(`Failed to create alert: ${error.message}`);
      }

      // Update alert count on crawl job
      await this.incrementAlertCount(alert.crawl_id);

      return alertId;
    } catch (error) {
      console.error('Error in createCrawlAlert:', error);
      throw error;
    }
  }

  /**
   * Upload media file for a crawl
   */
  async uploadMediaFile(crawlId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `crawl-media/${crawlId}/${fileName}`;

      const { error: uploadError } = await this.supabase
        .storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get the public URL for the file
      const { data } = this.supabase
        .storage
        .from('media')
        .getPublicUrl(filePath);

      // Register the media item in the database
      const { error: dbError } = await this.supabase
        .from('media_items')
        .insert({
          id: uuidv4(),
          crawl_id: crawlId,
          file_path: filePath,
          public_url: data.publicUrl,
          file_name: file.name,
          mime_type: file.type,
          size: file.size,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error registering media item:', dbError);
      }

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadMediaFile:', error);
      throw error;
    }
  }

  /**
   * Increment alert count on a crawl job
   */
  private async incrementAlertCount(crawlId: string): Promise<void> {
    try {
      // First get the current count
      const { data, error: countError } = await this.supabase
        .from('crawl_jobs')
        .select('alert_count')
        .eq('id', crawlId)
        .single();

      if (countError) {
        console.error('Error fetching alert count:', countError);
        return;
      }

      const currentCount = data?.alert_count || 0;

      // Update with incremented count
      const { error: updateError } = await this.supabase
        .from('crawl_jobs')
        .update({ alert_count: currentCount + 1 })
        .eq('id', crawlId);

      if (updateError) {
        console.error('Error updating alert count:', updateError);
      }
    } catch (error) {
      console.error('Error in incrementAlertCount:', error);
    }
  }
}

export const supabaseCrawlService = new SupabaseCrawlService();
