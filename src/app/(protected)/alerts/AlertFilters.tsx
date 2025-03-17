// app/alerts/AlertFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface AlertFiltersProps {
  initialCrawlId?: string | null;
}

export function AlertFilters({ initialCrawlId }: AlertFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('last-7-days');
  const [status, setStatus] = useState('all');
  const [crawlId, setCrawlId] = useState(initialCrawlId || '');
  
  // Initialize selected alert types and severities
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  
  // Toggle selection for alert types
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Toggle selection for severities
  const toggleSeverity = (severity: string) => {
    setSelectedSeverities(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (dateRange !== 'last-7-days') params.set('dateRange', dateRange);
    if (status !== 'all') params.set('status', status);
    if (crawlId) params.set('crawlId', crawlId);
    
    if (selectedTypes.length > 0) {
      params.set('types', selectedTypes.join(','));
    }
    
    if (selectedSeverities.length > 0) {
      params.set('severities', selectedSeverities.join(','));
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setDateRange('last-7-days');
    setStatus('all');
    // Don't reset crawlId if it was provided as a prop
    if (!initialCrawlId) {
      setCrawlId('');
    }
    setSelectedTypes([]);
    setSelectedSeverities([]);
    
    // If initialCrawlId exists, keep it in the URL
    if (initialCrawlId) {
      router.push(`${pathname || ''}?crawlId=${initialCrawlId}`);
    } else {
      router.push(pathname || '');
    }
  };
  
  // Get badge class based on selection state
  const getTypeBadgeClass = (type: string) => {
    const baseClass = "cursor-pointer ";
    return baseClass + (selectedTypes.includes(type) 
      ? "bg-indigo-500 text-white hover:bg-indigo-600"
      : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200");
  };
  
  const getSeverityBadgeClass = (severity: string) => {
    const baseClass = "cursor-pointer ";
    if (!selectedSeverities.includes(severity)) {
      switch (severity) {
        case 'high': return baseClass + "bg-red-100 text-red-800 hover:bg-red-200";
        case 'medium': return baseClass + "bg-amber-100 text-amber-800 hover:bg-amber-200";
        case 'low': return baseClass + "bg-blue-100 text-blue-800 hover:bg-blue-200";
        case 'info': return baseClass + "bg-gray-100 text-gray-800 hover:bg-gray-200";
        default: return baseClass;
      }
    } else {
      switch (severity) {
        case 'high': return baseClass + "bg-red-500 text-white hover:bg-red-600";
        case 'medium': return baseClass + "bg-amber-500 text-white hover:bg-amber-600";
        case 'low': return baseClass + "bg-blue-500 text-white hover:bg-blue-600";
        case 'info': return baseClass + "bg-gray-500 text-white hover:bg-gray-600";
        default: return baseClass;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Alerts
          </label>
          <Input
            id="search"
            type="text"
            placeholder="Search by keyword or domain..."
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="date-range"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>
      
      {initialCrawlId && (
        <div className="bg-blue-50 p-2 rounded-md flex items-center">
          <span className="text-sm text-blue-700">
            Filtering alerts for crawl ID: {initialCrawlId}
          </span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Alert Types:</span>
        <Badge 
          className={getTypeBadgeClass('infringement')}
          onClick={() => toggleType('infringement')}
        >
          Infringement
        </Badge>
        <Badge 
          className={getTypeBadgeClass('crawl')}
          onClick={() => toggleType('crawl')}
        >
          Crawl
        </Badge>
        <Badge 
          className={getTypeBadgeClass('system')}
          onClick={() => toggleType('system')}
        >
          System
        </Badge>
        <Badge 
          className={getTypeBadgeClass('discovery')}
          onClick={() => toggleType('discovery')}
        >
          Discovery
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Severity:</span>
        <Badge 
          className={getSeverityBadgeClass('high')}
          onClick={() => toggleSeverity('high')}
        >
          High
        </Badge>
        <Badge 
          className={getSeverityBadgeClass('medium')}
          onClick={() => toggleSeverity('medium')}
        >
          Medium
        </Badge>
        <Badge 
          className={getSeverityBadgeClass('low')}
          onClick={() => toggleSeverity('low')}
        >
          Low
        </Badge>
        <Badge 
          className={getSeverityBadgeClass('info')}
          onClick={() => toggleSeverity('info')}
        >
          Info
        </Badge>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <Switch id="auto-refresh" />
          <label htmlFor="auto-refresh" className="text-sm text-gray-600">
            Auto-refresh
          </label>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}