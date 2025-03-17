import { db } from '../db';
import { crawlerService } from './crawler';
import { CronJob } from 'cron';

class CrawlScheduler {
  private jobs: Record<string, CronJob> = {};
  
  async initialize() {
    // Clear any existing jobs
    this.stopAllJobs();
    
    // Load all recurring crawl jobs
    const recurringJobs = await db.crawlJob.findMany({
      where: {
        isRecurring: true,
        schedule: { not: null },
      },
    });
    
    // Schedule each job
    for (const job of recurringJobs) {
      this.scheduleJob(job.id, job.schedule as string);
    }
    
    console.log(`Initialized ${recurringJobs.length} scheduled crawl jobs`);
  }
  
  /**
   * Schedule a new crawl job
   */
  scheduleJob(jobId: string, schedule: string) {
    // Convert friendly schedule to cron expression
    const cronExpression = this.scheduleStringToCron(schedule);
    
    // If job already exists, stop it first
    if (this.jobs[jobId]) {
      this.jobs[jobId].stop();
    }
    
    // Create new cron job
    this.jobs[jobId] = new CronJob(
      cronExpression,
      async () => {
        try {
          console.log(`Running scheduled crawl job ${jobId}`);
          await crawlerService.processCrawlJob(jobId);
        } catch (error) {
          console.error(`Error running scheduled crawl job ${jobId}:`, error);
        }
      },
      null, // onComplete
      true, // start immediately
      'UTC' // timezone
    );
    
    console.log(`Scheduled crawl job ${jobId} with schedule: ${schedule} (${cronExpression})`);
  }
  
  /**
   * Remove a scheduled job
   */
  unscheduleJob(jobId: string) {
    if (this.jobs[jobId]) {
      this.jobs[jobId].stop();
      delete this.jobs[jobId];
      console.log(`Unscheduled crawl job ${jobId}`);
    }
  }
  
  /**
   * Stop all scheduled jobs
   */
  stopAllJobs() {
    for (const jobId in this.jobs) {
      this.jobs[jobId].stop();
      delete this.jobs[jobId];
    }
    console.log('Stopped all scheduled crawl jobs');
  }
  
  /**
   * Convert user-friendly schedule string to cron expression
   */
  private scheduleStringToCron(schedule: string): string {
    switch (schedule.toLowerCase()) {
      case 'daily':
        return '0 0 * * *'; // Every day at midnight
      case 'weekly':
        return '0 0 * * 0'; // Every Sunday at midnight
      case 'monthly':
        return '0 0 1 * *'; // First day of each month at midnight
      default:
        throw new Error(`Invalid schedule: ${schedule}`);
    }
  }
}

export const crawlScheduler = new CrawlScheduler();