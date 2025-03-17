"use client";

import { Search, AlertCircle, BarChart3, Globe, Clock } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { CrawlJobsTable } from "@/features/crawls/components/CrawlJobsTable";
import { InfringementAlertsFeed } from "@/components/dashboard/InfringementAlertsFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CrawlJob, InfringementAlert, AnalysisResults } from "@/types";  // Import from central types
import { CrawlAnalysisResults } from "@/components/crawls/CrawlAnalysisResults";

function DashboardPage() {
  // Empty data arrays - we'll use these instead of mock data
  const emptyJobs: CrawlJob[] = [];
  const emptyAlerts: InfringementAlert[] = [];

  // Mock AI analysis results for demonstration
  const mockAnalysisResults: AnalysisResults = {
    analysisComplete: true,
    matchesFound: true,
    matchDetails: [
      {
        sourceId: "sample-1",
        matchConfidence: 82.5,
        matchedContent: "The proprietary algorithm leverages natural language processing to identify semantic matches that may not be exact word-for-word copies.",
        potentialSource: "https://example.com/ai-technology-whitepaper"
      },
      {
        sourceId: "sample-2",
        matchConfidence: 67.8,
        matchedContent: "Our innovative approach to machine learning enables real-time adaptation to emerging content patterns.",
        potentialSource: "https://competitor-site.com/about-us"
      }
    ]
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="relative overflow-hidden border-dashed">
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-500">Coming Soon</p>
            </div>
          </div>
          <CardHeader className="opacity-50">
            <CardTitle>Crawls Completed</CardTitle>
          </CardHeader>
          <CardContent className="opacity-50">
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-dashed">
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-500">Coming Soon</p>
            </div>
          </div>
          <CardHeader className="opacity-50">
            <CardTitle>Active Crawls</CardTitle>
          </CardHeader>
          <CardContent className="opacity-50">
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-dashed">
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-500">Coming Soon</p>
            </div>
          </div>
          <CardHeader className="opacity-50">
            <CardTitle>Infringements Detected</CardTitle>
          </CardHeader>
          <CardContent className="opacity-50">
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - takes 2/3 of space on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights Section */}
          <CrawlAnalysisResults 
            results={mockAnalysisResults}
            title="AI Content Analysis" 
          />
          
          <Card className="relative overflow-hidden border-dashed">
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <div className="text-center">
                <Clock className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="font-medium text-gray-500">Crawl Data Coming Soon</p>
              </div>
            </div>
            <CardHeader className="opacity-50">
              <CardTitle>Recent Crawl Jobs</CardTitle>
            </CardHeader>
            <CardContent className="opacity-50">
              <div className="h-64"></div> {/* Placeholder */}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - takes 1/3 of space on large screens */}
        <div className="space-y-6">
          <InfringementAlertsFeed alerts={emptyAlerts} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
