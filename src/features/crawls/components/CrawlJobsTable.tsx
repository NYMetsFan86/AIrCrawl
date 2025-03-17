import React from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Play, 
  RefreshCw, 
  MoreHorizontal, 
  AlertCircle, 
  CheckCircle, 
  Clock
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrawlJob } from '@/types';
import { formatDate, timeAgo, cn } from '@/lib/utils';

interface CrawlJobsTableProps {
  jobs: CrawlJob[];
  title?: string;
}

export function CrawlJobsTable({ jobs, title = "Recent Crawl Jobs" }: CrawlJobsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800" variant="outline"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800" variant="outline"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800" variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800" variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'N/A';
    try {
      return timeAgo(new Date(timeString));
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{title}</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/crawls/new">New Crawl</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No crawl jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.url}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{formatTime(job.startTime)}</TableCell>
                  <TableCell>{job.endTime ? formatTime(job.endTime) : 'Running...'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}