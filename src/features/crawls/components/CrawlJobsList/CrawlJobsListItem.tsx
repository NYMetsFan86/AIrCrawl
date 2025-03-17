import React from 'react';
import { CrawlJob, CrawlStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';

export interface CrawlJobsListItemProps {
  job: CrawlJob;
  onDelete: (id: string) => void;
}

export const CrawlJobsListItem: React.FC<CrawlJobsListItemProps> = ({ 
  job, 
  onDelete 
}) => {
  const statusColor = {
    [CrawlStatus.PENDING]: 'text-yellow-600',
    [CrawlStatus.IN_PROGRESS]: 'text-blue-600',
    [CrawlStatus.COMPLETED]: 'text-green-600',
    [CrawlStatus.FAILED]: 'text-red-600',
  };

  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium">{job.name}</h3>
        <p className="text-sm text-gray-500">{job.url}</p>
        <div className="flex space-x-3 mt-2 text-xs">
          <span className={`${statusColor[job.status]}`}>
            {job.status}
          </span>
          <span>Created: {formatDate(job.createdAt)}</span>
        </div>
      </div>
      
      <button 
        onClick={() => onDelete(job.id)}
        className="text-red-500 hover:text-red-700" 
      >
        Delete
      </button>
    </div>
  );
};
