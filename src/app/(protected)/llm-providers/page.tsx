'use client'

import React from 'react'
import Link from 'next/link'
import { LLMProviders } from '@/components/settings/LLMProviders'

export default function LLMProvidersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex">
        <div className="w-1/4 pr-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">General</h3>
              <ul className="space-y-2">
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/application">Application</Link>
                </li>
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/profile">Profile</Link>
                </li>
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/api-keys">API Keys</Link>
                </li>
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/media-library">Media Library</Link>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border-t">
              <h3 className="text-lg font-medium mb-4">Teams</h3>
              <ul className="space-y-2">
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/team-management">Team Management</Link>
                </li>
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/user-permissions">User Permissions</Link>
                </li>
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/invitations">Invitations</Link>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border-t">
              <h3 className="text-lg font-medium mb-4">AI & LLM</h3>
              <ul className="space-y-2">
                <li className="py-1 px-2 rounded bg-blue-500 text-white">
                  <Link href="/settings/llm-providers">LLM Providers</Link>
                </li>
                <li className="py-1 px-2 rounded hover:bg-gray-100">
                  <Link href="/settings/llm-test">Test LLM</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="w-3/4">
          <div className="bg-white rounded-lg shadow p-6">
            <LLMProviders />
          </div>
        </div>
      </div>
    </div>
  )
}