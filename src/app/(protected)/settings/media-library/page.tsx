"use client";

import { MediaLibrary } from "@/components/media/MediaLibrary";

export default function SettingsMediaLibraryPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Media Library Settings</h1>
      <MediaLibrary />
    </div>
  );
}