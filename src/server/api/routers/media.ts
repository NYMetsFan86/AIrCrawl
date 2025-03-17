import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const mediaRouter = createTRPCRouter({
  // Get all media items for the current user
  getMediaItems: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.mediaItem.findMany({
      where: {
        OR: [
          { userId: ctx.session.user.id },
          { global: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }),
  
  // Get a single media item
  getMediaItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const mediaItem = await ctx.db.mediaItem.findUnique({
        where: { id: input.id },
      });
      
      if (!mediaItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media item not found',
        });
      }
      
      // Check access
      if (!mediaItem.global && mediaItem.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this media item',
        });
      }
      
      return mediaItem;
    }),
  
  // Create a new media item
  createMediaItem: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(['image', 'pdf', 'video']),
      global: z.boolean().default(false),
      url: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mediaItem.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),
  
  // Update a media item
  updateMediaItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      type: z.enum(['image', 'pdf', 'video']).optional(),
      global: z.boolean().optional(),
      url: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Check ownership
      const existing = await ctx.db.mediaItem.findUnique({
        where: { id },
        select: { userId: true },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media item not found',
        });
      }
      
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this media item',
        });
      }
      
      return ctx.db.mediaItem.update({
        where: { id },
        data,
      });
    }),
  
  // Delete a media item
  deleteMediaItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existing = await ctx.db.mediaItem.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media item not found',
        });
      }
      
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this media item',
        });
      }
      
      return ctx.db.mediaItem.delete({
        where: { id: input.id },
      });
    }),
});