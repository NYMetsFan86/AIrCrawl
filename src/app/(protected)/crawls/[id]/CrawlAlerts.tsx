// app/crawls/[id]/CrawlAlerts.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Alert = {
  id: string;
  createdAt: string;
  type: string; // 'text' | 'image' | 'video'
  confidence: number;
  matchedContent: string;
  url: string;
  status: string; // 'new' | 'reviewed' | 'dismissed'
};

export default function CrawlAlerts({ crawlId }: { crawlId: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        // Fetch alerts specifically for this crawl
        const response = await fetch(`/api/alerts?crawlId=${crawlId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError('Error loading alerts. Please try again.');
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, [crawlId]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading alerts...</div>;
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded text-red-600">{error}</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No alerts found for this crawl.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Alerts found during this crawl</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Matched Content</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>
              <Badge variant={
                alert.type === 'text' ? 'default' : 
                alert.type === 'image' ? 'medium' : 
                'high'
              }>
                {alert.type}
              </Badge>
            </TableCell>
            <TableCell>{(alert.confidence * 100).toFixed(1)}%</TableCell>
            <TableCell className="max-w-xs truncate">{alert.matchedContent}</TableCell>
            <TableCell className="max-w-xs truncate">
              <a href={alert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {alert.url}
              </a>
            </TableCell>
            <TableCell>{new Date(alert.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={
                alert.status === 'new' ? 'outline' : 
                alert.status === 'reviewed' ? 'medium' : 
                'default'
              }>
                {alert.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}