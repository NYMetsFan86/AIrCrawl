import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { crawlerService } from "@/server/services/crawler";
import { TRPCError } from "@trpc/server";

export const crawlerRouter = createTRPCRouter({
  // Get all crawl jobs for the current user
  getCrawlJobs: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.crawlJob.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        crawlRuns: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }),
  
  // Get a single crawl job
  getCrawlJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.crawlJob.findUnique({
        where: { id: input.id },
        include: {
          mediaItems: true,
          crawlRuns: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
      
      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Crawl job not found',
        });
      }
      
      // Check ownership
      if (job.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this crawl job',
        });
      }
      
      return job;
    }),
  
  // Create a new crawl job
  createCrawlJob: protectedProcedure
    .input(z.object({
      name: z.string(),
      url: z.string().url(),
      isRecurring: z.boolean(),
      schedule: z.string().optional(),
      mediaItemIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, url, isRecurring, schedule, mediaItemIds = [] } = input;
      
      const crawlJob = await ctx.db.crawlJob.create({
        data: {
          name,
          url,
          isRecurring,
          schedule: isRecurring ? schedule : null,
          userId: ctx.session.user.id,
          mediaItems: {
            connect: mediaItemIds.map(id => ({ id })),
          },
        },
      });
      
      // For one-time crawls, immediately start processing
      if (!isRecurring) {
        // Process in background
        crawlerService.processCrawlJob(crawlJob.id).catch(error => {
          console.error('Error processing one-time crawl job:', error);
        });
      }
      
      return crawlJob;
    }),
  
  // Update a crawl job
  updateCrawlJob: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      url: z.string().url().optional(),
      isRecurring: z.boolean().optional(),
      schedule: z.string().optional().nullable(),
      mediaItemIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, mediaItemIds, ...data } = input;
      
      // Check ownership
      const existing = await ctx.db.crawlJob.findUnique({
        where: { id },
        select: { userId: true },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Crawl job not found',
        });
      }
      
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this crawl job',
        });
      }
      
      // Update crawl job
      const updateData: any = { ...data };
      
      // Handle media items if provided using a transaction to prevent race conditions
      if (mediaItemIds) {
        return ctx.db.$transaction(async (tx) => {
          // Update with media items in a single transaction
          return tx.crawlJob.update({
            where: { id },
            data: {
              ...updateData,
              mediaItems: {
                set: mediaItemIds.map(mediaId => ({ id: mediaId })),
              },
            },
          });
        });
      }
      
      // If no media items to update, just update the job
      return ctx.db.crawlJob.update({
        where: { id },
        data: updateData,
      });
    }),
  
  // Delete a crawl job
  deleteCrawlJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existing = await ctx.db.crawlJob.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Crawl job not found',
        });
      }
      
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this crawl job',
        });
      }
      
      // Use a transaction to handle related entities properly
      return ctx.db.$transaction(async (tx) => {
        // Delete related crawl runs first to avoid foreign key constraints
        await tx.crawlRun.deleteMany({
          where: { crawlJobId: input.id },
        });
        
        // Then delete the job itself
        return tx.crawlJob.delete({
          where: { id: input.id },
        });
      });
    }),
  
  // Manually run a crawl job
  runCrawlJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const crawlJob = await ctx.db.crawlJob.findUnique({
        where: { id: input.id },
        select: { userId: true, id: true },
      });
      
      if (!crawlJob) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Crawl job not found',
        });
      }
      
      if (crawlJob.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this crawl job',
        });
      }
      
      // Create a crawl run record first to track the job
      const crawlRun = await ctx.db.crawlRun.create({
        data: {
          crawlJobId: crawlJob.id,
          status: 'pending',
        }
      });
      
      // Start processing in background
      crawlerService.processCrawlJob(crawlJob.id, crawlRun.id)
        .catch(error => {
          console.error('Error manually running crawl job:', error);
          // Update the crawl run status to failed
          ctx.db.crawlRun.update({
            where: { id: crawlRun.id },
            data: { 
              status: 'failed',
              error: error.message || 'Unknown error occurred'
            }
          }).catch(updateError => {
            console.error('Failed to update crawl run status:', updateError);
          });
        });
      
      return { success: true, crawlRunId: crawlRun.id };
    }),
  
  // Get crawl results
  getCrawlResults: protectedProcedure
    .input(z.object({ crawlRunId: z.string() }))
    .query(async ({ ctx, input }) => {
      const crawlRun = await ctx.db.crawlRun.findUnique({
        where: { id: input.crawlRunId },
        include: {
          crawlJob: {
            select: { userId: true },
          },
        },
      });
      
      if (!crawlRun) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Crawl run not found',
        });
      }
      
      // Check ownership
      if (crawlRun.crawlJob.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this crawl run',
        });
      }
      
      return crawlRun;
    }),
});