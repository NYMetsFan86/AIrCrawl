import React from 'react';
import { CrawlStatus } from '@/types';

interface CrawlJobsFilterProps {
  currentFilter: CrawlStatus | 'all';
  onFilterChange: (filter: CrawlStatus | 'all') => void;
}

export const CrawlJobsFilter: React.FC<CrawlJobsFilterProps> = ({ 
  currentFilter, 
  onFilterChange 
}) => {
  const filters = [
    { value: 'all', label: 'All' },
    { value: CrawlStatus.PENDING, label: 'Pending' },
    { value: CrawlStatus.IN_PROGRESS, label: 'In Progress' },
    { value: CrawlStatus.COMPLETED, label: 'Completed' },
    { value: CrawlStatus.FAILED, label: 'Failed' },
  ];

  return (
    <div className="flex space-x-2 text-sm">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value as CrawlStatus | 'all')}
          className={`px-3 py-1 rounded-full ${
            currentFilter === filter.value
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
