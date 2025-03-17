// Define your error types here
export interface ApiError {
  message: string;
  code: number;
  details?: string;
}

export class CrawlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CrawlerError';
  }
}