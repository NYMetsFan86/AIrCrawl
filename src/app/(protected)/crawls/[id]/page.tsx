"use client";

import React, { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { getCrawlById } from "@/lib/crawlUtils";
import { AlertsTable } from "@/app/(protected)/alerts/AlertsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CrawlDetailsPage() {
  // useParams() returns a Record<string, string | string[]> | null.
  const params = useParams() as { id?: string };
  // Narrow the type: if params.id exists and is a string, use it; otherwise undefined.
  const id = (params?.id && typeof params.id === "string") ? params.id : undefined;

  const [crawlDetails, setCrawlDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.error("❌ No crawl ID found in params.");
      setLoading(false);
      return;
    }

    const fetchCrawl = async () => {
      try {
        console.log("✅ Using Crawl ID:", id);
        const crawl = await getCrawlById(id);
        if (!crawl) {
          console.error("❌ Crawl not found in database.");
          setCrawlDetails(null);
        } else {
          console.log("🔍 Crawl details fetched:", crawl);
          setCrawlDetails(crawl);
        }
      } catch (error) {
        console.error("❌ Error fetching crawl:", error);
        setCrawlDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCrawl();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!crawlDetails) {
    // This will trigger Next.js's 404 page.
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Buttons */}
      <div className="flex space-x-4 mb-6">
        <Link href="/crawls">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Crawl Jobs
          </Button>
        </Link>
        <Link href="/alerts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            View All Alerts
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        Crawl Details: {crawlDetails.url || "Unnamed Crawl"}
      </h1>

      {/* Crawl Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Crawl Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">ID</p>
              <p>{crawlDetails.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p>{crawlDetails.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p>{formatDate(new Date(crawlDetails.createdAt))}</p>
            </div>
            <div>
              <p className="text-gray-500">URL</p>
              <p>{crawlDetails.url}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alerts</CardTitle>
          <a
            href={`/alerts?crawlId=${id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            View all alerts
          </a>
        </CardHeader>
        <CardContent className="p-0">
          <AlertsTable crawlId={id!} />
        </CardContent>
      </Card>
    </div>
  );
}
