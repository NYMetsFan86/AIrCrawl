"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function ApplicationSettings() {
  // Crawl Configuration
  const [crawlFrequency, setCrawlFrequency] = useState("daily");
  const [textContent, setTextContent] = useState(true);
  const [imageContent, setImageContent] = useState(true);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log({
      crawlFrequency,
      textContent,
      imageContent
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6">Application Settings</h2>
      
      <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h3 className="text-lg font-medium mb-4">Crawl Configuration</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block mb-2">Default Crawl Frequency</label>
              <select 
                className="w-full max-w-md p-2 border rounded-md"
                value={crawlFrequency}
                onChange={(e) => setCrawlFrequency(e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block mb-3">Content-Type Priorities</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Switch
                    checked={textContent}
                    onCheckedChange={setTextContent}
                    id="text-content"
                  />
                  <label htmlFor="text-content" className="ml-2">Text Content</label>
                </div>
                <div className="flex items-center">
                  <Switch
                    checked={imageContent}
                    onCheckedChange={setImageContent}
                    id="image-content"
                  />
                  <label htmlFor="image-content" className="ml-2">Image Content</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="bg-[#011627] text-white hover:bg-[#01111b]"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}