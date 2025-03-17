// src/lib/utils/index.ts

import { format } from 'date-fns';

// General Utilities
export function cn(...inputs: (string | boolean | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function parseBoolean(value: string | boolean): boolean {
  return value === 'true' || value === true;
}

export function ensureDirectoryExists(path: string): void {
  // This function cannot use fs directly in client components
  console.warn('ensureDirectoryExists cannot be used in client components');
  // The actual implementation should be moved to a server action or API route
}

export function formatNumber(num: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', options).format(num);
}

// Date Utilities (Merged from date.ts)
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
}

export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Export all utilities
export * from './status';
export * from './storage';
export * from './validation';
export * from './auth';