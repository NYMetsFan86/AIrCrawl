import { crawlScheduler } from './services/scheduler';

export async function initializeServer() {
  // Initialize the crawl scheduler
  await crawlScheduler.initialize();
  
  console.log('Server services initialized');
}