"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Key, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="h-5 w-5" /> API Configuration
              </CardTitle>
              <CardDescription>Configure your AI and integration API keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Anthropic API Key</label>
                <Input type="password" placeholder="sk-ant-..." disabled value="••••••••••••••••" />
                <p className="mt-1 text-xs text-gray-400">Configured via environment variable</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5" /> Database
              </CardTitle>
              <CardDescription>Database connection and management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Database URL</label>
                <Input type="password" disabled value="••••••••••••••••" />
                <p className="mt-1 text-xs text-gray-400">Configured via environment variable</p>
              </div>
              <Button variant="outline" size="sm">Test Connection</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" /> Notifications
              </CardTitle>
              <CardDescription>Configure alert channels and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-500">
              <p>Email and Slack notification settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
