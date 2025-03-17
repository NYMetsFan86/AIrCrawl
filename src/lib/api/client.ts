import { createTRPCNext } from '@trpc/next';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { AppRouter } from '@/server/api/routers';
import { ApplicationError } from '@/lib/error-utils';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) => 
            process.env.NODE_ENV === 'development' || 
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL || ''}/api/trpc`,
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false;
              }
              return failureCount < 3;
            },
            staleTime: 5 * 1000,
          },
        },
      },
    };
  },
  ssr: false,
  transformer: undefined,
});

export async function handleApiError(error: unknown): Promise<never> {
  if (error instanceof ApplicationError) {
    throw error;
  }
  
  // Transform tRPC errors
  if (error && typeof error === 'object' && 'data' in error) {
    const tRpcError = error as any;
    throw new ApplicationError(
      tRpcError.message || 'An error occurred',
      tRpcError.data?.httpStatus || 500
    );
  }
  
  // Unknown errors
  throw new ApplicationError('An unexpected error occurred', 500);
}
