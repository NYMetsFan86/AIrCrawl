import React, { useState } from 'react';
import { useCrawls } from '../../api/useCrawls';
import { CrawlJobsListItem } from './CrawlJobsListItem';
import { CrawlJobsFilter } from './CrawlJobsFilter';
import { Button, Card, EmptyState, Spinner, Alert } from '@/components/ui';
import { CrawlJob, CrawlStatus } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Define error type if not already defined
type ErrorWithMessage = {
  message?: string;
};

const CrawlJobsList = () => {
  const [filter, setFilter] = useState<CrawlStatus | 'all'>('all');
  const { crawlJobs, isLoading, deleteCrawlJob } = useCrawls();
  const [error, setError] = useState<ErrorWithMessage | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  
interface CrawlJobsListProps {
    crawlJobs: CrawlJob[];
    filter: CrawlStatus | 'all';
}

const filteredJobs: CrawlJob[] = (crawlJobs?.filter(
    (job: CrawlJob) => filter === 'all' || job.status === filter
) || []);

  const handleDelete = (jobId: string) => {
    if (deleteConfirmation === jobId) {
      deleteCrawlJob(jobId);
      setDeleteConfirmation(null);
    } else {
      setDeleteConfirmation(jobId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
      ? (error as ErrorWithMessage).message 
      : 'Please try again later';
      
    return (
      <Alert variant="destructive" className="mb-4">
        <h3 className="font-semibold">Error loading crawl jobs</h3>
        <p>{errorMessage}</p>
      </Alert>
    );
  }
  
  if (!crawlJobs?.length) {
    return (
      <EmptyState
        title="No crawl jobs found"
        description="Create your first crawl job to get started"
        action={<Button onClick={() => window.location.href = "/crawls/new"}>Create Crawl Job</Button>}
      />
    );
  }
  
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold">Crawl Jobs</h2>
        <div className="flex gap-2">
          <CrawlJobsFilter currentFilter={filter} onFilterChange={setFilter} />
          <Button onClick={() => window.location.href = "/crawls/new"} size="sm">New Job</Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <EmptyState 
            title="No matching crawl jobs" 
            description={`No jobs found with status: ${filter}`}
            action={<Button onClick={() => setFilter('all')}>Show All</Button>}
          />
        ) : (
          filteredJobs.map(job => (
            <ErrorBoundary key={job.id} fallback={<div>Error loading job</div>}>
              <CrawlJobsListItem
                job={job}
                onDelete={() => handleDelete(job.id)}
                // Use type assertion to ensure this prop is accepted
                {...{isConfirmingDelete: deleteConfirmation === job.id} as any}
              />
            </ErrorBoundary>
          ))
        )}
      </div>
    </Card>
  );
};

export default CrawlJobsList;
