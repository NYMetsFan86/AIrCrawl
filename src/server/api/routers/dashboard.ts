import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  getPerformanceMetrics: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.performanceMetric.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { date: 'desc' },
      take: 3,
    });
  }),
  
  getDashboardStats: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return ctx.db.dashboardStat.findMany({
      where: { userId: ctx.session.user.id },
    });
  }),
  
  updatePerformanceMetric: protectedProcedure
    .input(z.object({
      name: z.string(),
      value: z.number(),
    }))
    .mutation(async ({ ctx }: { ctx: any, input: any }) => {
      return ctx.db.performanceMetric.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),
});