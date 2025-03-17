// src/server/api/root.ts

import { createTRPCRouter } from './trpc';
import { crawlerRouter } from './routers/crawler';
import { dashboardRouter } from './routers/dashboard';
import { mediaRouter } from './routers/media';
import { postRouter } from './routers/post';

export const appRouter = createTRPCRouter({
  crawler: crawlerRouter,
  dashboard: dashboardRouter,
  media: mediaRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = appRouter.createCaller;
