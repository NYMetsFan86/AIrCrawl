import { useState } from 'react';
import { trpc, handleApiError } from '@/lib/api/client';
import { CrawlJob, CreateCrawlJobParams, PaginationParams } from '@/types';

export function useCrawls() {
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useContext();
  
  const { data: crawlJobs, isLoading: isLoadingCrawls } = 
    trpc.crawls.list.useQuery();
  
  const createMutation = trpc.crawls.create.useMutation({
    onSuccess: () => {
      utils.crawls.list.invalidate();
    },
  });
  
  const deleteMutation = trpc.crawls.delete.useMutation({
    onSuccess: () => {
      utils.crawls.list.invalidate();
    },
  });
  
  const createCrawlJob = async (params: CreateCrawlJobParams): Promise<CrawlJob> => {
    try {
      setIsLoading(true);
      const result = await createMutation.mutateAsync(params);
      return result;
    } catch (error) {
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteCrawlJob = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await deleteMutation.mutateAsync({ id });
      return true;
    } catch (error) {
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    crawlJobs,
    isLoading: isLoading || isLoadingCrawls,
    createCrawlJob,
    deleteCrawlJob,
  };
}