// app/alerts/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertsTable } from '@/app/(protected)/alerts/AlertsTable';
import { AlertFilters } from '@/app/(protected)/alerts/AlertFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import withAuth from "@/components/auth/withAuth";

function AlertsPage() {
  const searchParams = useSearchParams();
  const crawlId = searchParams?.get('crawlId') || null;
  const [crawlInfo, setCrawlInfo] = useState<any>(null);

  // If a crawlId is provided in the URL, fetch the crawl details
  useEffect(() => {
    if (crawlId) {
      async function fetchCrawlInfo() {
        try {
          const response = await fetch(`/api/crawls/${crawlId}`);
          if (response.ok) {
            const data = await response.json();
            setCrawlInfo(data);
          }
        } catch (err) {
          console.error('Error fetching crawl details:', err);
        }
      }
      
      fetchCrawlInfo();
    }
  }, [crawlId]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          {crawlInfo && (
            <p className="text-gray-500 mt-1">
              Filtered for crawl: {crawlInfo.url || crawlId}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button>Create Alert Rule</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Alert Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertFilters initialCrawlId={crawlId} />
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Alert Notifications</CardTitle>
          {crawlId && (
            <a 
              href="/alerts" 
              className="text-sm text-blue-600 hover:underline"
            >
              Clear crawl filter
            </a>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <AlertsTable crawlId={crawlId || undefined} />
        </CardContent>
      </Card>
    </div>
  );
}

// Export with auth protection
export default withAuth(AlertsPage);