import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

/**
 * Get a status badge component based on job status
 */
export function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="low">✅ Completed</Badge>;
    case 'in-progress':
      return <Badge variant="medium">⏳ In Progress</Badge>;
    case 'failed':
      return <Badge variant="high">❌ Failed</Badge>;
    case 'scheduled':
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
    case 'pending':
      return <Badge variant="outline">⏳ Pending</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}