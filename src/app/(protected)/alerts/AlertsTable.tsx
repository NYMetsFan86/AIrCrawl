// app/alerts/AlertsTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define Alert type
type Alert = {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  type: 'infringement' | 'crawl' | 'system' | 'discovery';
  status: 'open' | 'resolved';
  date: string;
  crawlId?: string; // Optional crawl ID reference
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Helper to determine badge color based on severity
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'info':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper to determine status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'resolved':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface AlertsTableProps {
  crawlId?: string; // Optional prop to filter alerts by crawl ID
}

export function AlertsTable({ crawlId }: AlertsTableProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        
        // Build URL with optional crawlId filter
        let url = '/api/alerts';
        if (crawlId) {
          url += `?crawlId=${crawlId}`;
        }
        
        const response = await fetch(url);
        
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
    return <div className="w-full p-8 text-center">Loading alerts...</div>;
  }

  if (error) {
    return <div className="w-full p-4 bg-red-50 text-red-600 rounded">{error}</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-gray-50">
        <p className="text-gray-500">
          {crawlId 
            ? "No alerts found for this crawl." 
            : "No alerts found."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alert
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                <div className="text-sm text-gray-500">{alert.description}</div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className="capitalize">
                  {alert.type}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(alert.date)}
              </td>
              <td className="px-6 py-4 text-sm font-medium">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">View</Button>
                  {alert.status === 'open' && (
                    <Button variant="ghost" size="sm">Resolve</Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{alerts.length}</span> alert(s)
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}