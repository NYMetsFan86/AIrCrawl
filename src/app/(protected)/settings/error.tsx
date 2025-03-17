"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Alert className="mb-6 border-red-500 bg-red-50 text-red-900">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <div>Something went wrong in the settings page:</div>
        <div className="font-mono text-sm mt-2">{error.message}</div>
        <button 
          onClick={reset}
          className="mt-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Try again
        </button>
      </AlertDescription>
    </Alert>
  );
}