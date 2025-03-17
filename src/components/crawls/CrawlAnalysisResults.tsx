import React from 'react';
import { AlertTriangle, CheckCircle, Info, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/types/crawls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CrawlAnalysisResultsProps {
  results: AnalysisResults | undefined;
  isLoading?: boolean;
  title?: string;
  showActions?: boolean;
}

export function CrawlAnalysisResults({
  results,
  isLoading = false,
  title = 'Content Analysis',
  showActions = true,
}: CrawlAnalysisResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 text-center">
              <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
              <div className="animate-pulse h-4 w-64 bg-gray-200 rounded mx-auto"></div>
            </div>
            <Progress value={65} className="w-2/3 animate-pulse" />
            <p className="text-sm text-muted-foreground mt-2">Processing content analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || !results.analysisComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10 text-center">
            <Info className="h-10 w-10 text-blue-500 mr-2" />
            <div>
              <p className="text-muted-foreground">No analysis results available yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Run a crawl to generate content analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { matchesFound, matchDetails } = results;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        {matchesFound && <Badge variant="destructive">Matches Found</Badge>}
        {!matchesFound && <Badge variant="outline" className="bg-green-50 text-green-700">No Matches</Badge>}
      </CardHeader>
      <CardContent>
        {!matchesFound ? (
          <div className="flex items-center text-green-700 bg-green-50 p-4 rounded-lg">
            <CheckCircle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-medium">No content matches detected</p>
              <p className="text-sm text-muted-foreground">
                The analyzed content appears to be original.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center text-amber-700 bg-amber-50 p-4 rounded-lg">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <div>
                <p className="font-medium">Potential content matches detected</p>
                <p className="text-sm text-muted-foreground">
                  {matchDetails.length} potential {matchDetails.length === 1 ? 'match' : 'matches'} found.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {matchDetails.map((match, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Match #{i + 1}</h4>
                    <Badge variant={match.matchConfidence > 75 ? "destructive" : "outline"}>
                      {match.matchConfidence.toFixed(1)}% Confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="font-semibold text-xs text-gray-500 mb-1">MATCHED CONTENT:</div>
                      <div className="italic">"{match.matchedContent}"</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="font-semibold text-xs text-gray-500 mb-1">POTENTIAL SOURCE:</div>
                      <div>{match.potentialSource}</div>
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Flag
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Source
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex justify-end mt-4">
            <Button variant="outline">
              Export Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
