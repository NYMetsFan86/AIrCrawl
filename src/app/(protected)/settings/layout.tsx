"use client";

import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function FallbackComponent({ error }: { error: Error }) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <div>Something went wrong in the settings page:</div>
        <div className="font-mono text-sm mt-2">{error.message}</div>
      </AlertDescription>
    </Alert>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        {children}
      </ErrorBoundary>
    </div>
  );
}