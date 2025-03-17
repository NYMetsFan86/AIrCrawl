// src/app/api/crawls/[id]/run/route.ts
import { NextResponse } from "next/server";
import { startCrawl, processCrawlResults } from "@/lib/crawl-service";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const crawlJob = await prisma.crawlJob.findUnique({ where: { id: params.id, userId: session.user.id } });
  if (!crawlJob) return NextResponse.json({ error: "Crawl job not found or unauthorized" }, { status: 404 });

  const { turbo = false, maxPages = 10 } = await request.json().catch(() => ({}));
  console.log(`Starting ${turbo ? "TURBO" : "standard"} crawl for job ${params.id}, URL: ${crawlJob.url}`);

  const result = await startCrawl(params.id, { maxPages: Number(maxPages), turbo });

  if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });

  const processedResult = await processCrawlResults(result);

  return NextResponse.json({
    success: true,
    message: processedResult.message || `Crawl completed. Processed ${processedResult.pages} pages with ${processedResult.images} images.`,
    runId: processedResult.runId,
    turboMode: turbo,
  });
}