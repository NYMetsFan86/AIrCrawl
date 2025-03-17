import React from 'react';
import { Play, Calendar, FileText, Plus } from "lucide-react";

export function QuickActions() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col space-y-2">
      <div className="group relative">
        <button 
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#860808] text-white shadow-lg hover:bg-[#860808]/80"
          title="Quick Actions"
        >
          <Plus size={24} />
        </button>
        
        <div className="absolute bottom-full right-0 mb-2 hidden flex-col space-y-2 group-hover:flex">
          <button 
            className="flex items-center rounded-lg bg-[#3f383b] px-3 py-2 text-sm text-white shadow-lg hover:bg-[#3f383b]/80"
            title="Start New Crawl"
          >
            <Play size={16} className="mr-2" />
            Start New Crawl
          </button>
          
          <button 
            className="flex items-center rounded-lg bg-[#3f383b] px-3 py-2 text-sm text-white shadow-lg hover:bg-[#3f383b]/80"
            title="Schedule Recurring Scans"
          >
            <Calendar size={16} className="mr-2" />
            Schedule Scans
          </button>
          
          <button 
            className="flex items-center rounded-lg bg-[#3f383b] px-3 py-2 text-sm text-white shadow-lg hover:bg-[#3f383b]/80"
            title="Generate Compliance Report"
          >
            <FileText size={16} className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}