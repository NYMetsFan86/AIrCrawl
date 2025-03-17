// src/app/api/crawls/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name || !body.url) return NextResponse.json({ success: false, message: "Name and URL required" }, { status: 400 });

  try {
    new URL(body.url);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid URL" }, { status: 400 });
  }

  const crawlJob = await prisma.crawlJob.create({
    data: {
      name: body.name,
      url: body.url,
      userId: session.user.id,
      isRecurring: Boolean(body.isRecurring),
      schedule: body.schedule || null,
      useGlobalMedia: Boolean(body.useGlobalMedia),
    },
  });

  return NextResponse.json({ success: true, data: crawlJob });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
  const skip = (page - 1) * pageSize;

  const totalCount = await prisma.crawlJob.count({ where: { userId: session.user.id } });
  const crawlJobs = await prisma.crawlJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { crawlRuns: { take: 1, orderBy: { createdAt: "desc" } } },
    skip,
    take: pageSize,
  });

  return NextResponse.json({
    success: true,
    data: crawlJobs,
    pagination: { page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
  });
}