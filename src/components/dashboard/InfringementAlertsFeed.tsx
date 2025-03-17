import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Check } from "lucide-react";
import { InfringementAlert } from "@/types";  // Import from central types

interface InfringementAlertsFeedProps {
  alerts: InfringementAlert[];
}

export function InfringementAlertsFeed({ alerts }: InfringementAlertsFeedProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="high">🔴 High</Badge>;
      case 'medium':
        return <Badge variant="medium">🟡 Medium</Badge>;
      case 'low':
        return <Badge variant="low">🟢 Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Infringement Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="flex flex-col space-y-2 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{alert.content}</div>
                {getSeverityBadge(alert.severity)}
              </div>
              
              <div className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Confidence: {alert.confidenceScore}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {alert.timestamp}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  className="flex items-center rounded-md bg-[#3f383b] px-2 py-1 text-xs text-white hover:bg-[#3f383b]/80"
                >
                  <Download size={12} className="mr-1" />
                  Report
                </button>
                <button 
                  className="flex items-center rounded-md bg-[#860808] px-2 py-1 text-xs text-white hover:bg-[#860808]/80"
                >
                  <Check size={12} className="mr-1" />
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}