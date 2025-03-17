import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { createCaller } from "../server/api/root";
import { createTRPCContext } from "../server/api/trpc";
import { createQueryClient } from "./query-client";
import { type AppRouter } from "@/server/api/root";

const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers(
  caller,
  getQueryClient
);

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use Vercel URL
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const serverClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});