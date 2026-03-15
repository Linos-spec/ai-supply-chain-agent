"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Key, Bell, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function SettingsPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          ok: true,
          message: data.db || "Connected — PostgreSQL",
        });
      } else {
        setTestResult({ ok: false, message: "Connection failed: server error" });
      }
    } catch {
      setTestResult({ ok: false, message: "Connection failed: unable to reach server" });
    }
    setTesting(false);
  };

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
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>
                  {testing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Database className="mr-1.5 h-3.5 w-3.5" />}
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
                {testResult && (
                  <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    testResult.ok
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}>
                    {testResult.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {testResult.message}
                  </div>
                )}
              </div>
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
