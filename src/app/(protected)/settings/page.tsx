"use client";

import withAuth from "@/components/auth/withAuth";
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import GeneralSettings from "./general/page";
import UserProfile from "@/app/(protected)/settings/profile/page";
import ApiKeysPage from "./api-keys/page";
import { LLMProvidersContent } from "@/components/settings/LLMProviders";
import MediaLibraryPage from "./media-library/page";
import TeamManagementPage from "./team/page";
import { Settings, User, Users, Database, FolderOpen } from "lucide-react";

// Custom hook to handle tab management
function useSettingsTabs(defaultTab = "general") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams?.get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    router.push(`/settings?tab=${value}`, { scroll: false });
  }, [router]);

  return { activeTab, handleTabChange };
}

function SettingsPage() {
  const { activeTab, handleTabChange } = useSettingsTabs();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-lg border shadow-sm">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <div className="px-6 pt-6">
            <TabsList className="w-full border-b grid grid-cols-1 md:grid-cols-5">
              <TabsTrigger value="general" className="flex items-center justify-center">
                <Settings className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center justify-center">
                <User className="mr-2 h-4 w-4" />
                User Profile
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center justify-center">
                <Users className="mr-2 h-4 w-4" />
                Team Management
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center justify-center">
                <Database className="mr-2 h-4 w-4" />
                LLM / Integrations
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center justify-center">
                <FolderOpen className="mr-2 h-4 w-4" />
                Media Library
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="general" className="mt-0">
              <GeneralSettings />
            </TabsContent>
            
            <TabsContent value="profile" className="mt-0">
              <UserProfile />
            </TabsContent>
            
            <TabsContent value="team" className="mt-0">
              <TeamManagementPage />
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-0">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Integrations</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                    <ApiKeysPage />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">LLM Providers</h3>
                    <LLMProvidersContent />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="mt-0">
              <MediaLibraryPage />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Export with auth protection
export default withAuth(SettingsPage);