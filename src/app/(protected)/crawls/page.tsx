"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCrawlById } from "@/lib/crawlUtils";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { formatDate, cn } from '@/lib/utils';

type CrawlItem = {
  id: string;
  status: string;
  createdAt: string;
  url: string;
  title?: string;
  matchCount?: number;
};

export default function CrawlsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [crawls, setCrawls] = useState<CrawlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    async function fetchCrawls() {
      try {
        setLoading(true);
        
        // For now, mock retrieving crawls since we don't have a real endpoint
        // This would be replaced with an actual API call
        const mockCrawls = [];
        for (let i = 1; i <= 5; i++) {
          const id = `crawl-${i}`;
          mockCrawls.push(await getCrawlById(id));
        }
        
        setCrawls(mockCrawls.filter(Boolean) as CrawlItem[]);
      } catch (error) {
        console.error("Error fetching crawls:", error);
        toast({
          title: "Error",
          description: "Failed to load crawls. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      fetchCrawls();
    } else if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router, toast]);

  if (loading && authStatus !== "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Crawl Jobs</h1>
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crawl Jobs</h1>
        <Button
          onClick={() => router.push("/crawls/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          New Crawl
        </Button>
      </div>

      {crawls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-2">No crawls yet</h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first crawl job
          </p>
          <Button
            onClick={() => router.push("/crawls/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create First Crawl
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {crawls.map((crawl) => (
                <tr key={crawl.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {crawl.title || "Untitled"}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {crawl.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          crawl.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : crawl.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      `}
                    >
                      {crawl.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(crawl.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crawl.matchCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/crawls/${crawl.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
