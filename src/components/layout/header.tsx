"use client";

import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Bell, Moon, Sun, User, Shield, Eye, Clipboard, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const roleIcons: Record<string, typeof Shield> = {
  ADMIN: Shield,
  PLANNER: Clipboard,
  VIEWER: Eye,
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  PLANNER: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  VIEWER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

interface RiskAlert {
  id: string;
  riskType: string;
  severity: string;
  materialDescription: string;
  locationName: string;
  detectedAt: string;
  acknowledged: boolean;
}

export function Header({ title }: { title: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/risks?status=OPEN")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlerts(
            data.map((r: Record<string, unknown>) => ({
              id: String(r.id),
              riskType: String(r.riskType),
              severity: String(r.severity),
              materialDescription: String((r.material as Record<string, unknown>)?.description || r.materialDescription || "Unknown"),
              locationName: String((r.location as Record<string, unknown>)?.name || r.locationName || "Unknown"),
              detectedAt: String(r.detectedAt),
              acknowledged: false,
            }))
          );
        }
      })
      .catch(() => setAlerts([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    }
    if (drawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [drawerOpen]);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const clearAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  const userName = session?.user?.name || "User";
  const userRole = (session?.user?.role || "VIEWER") as string;
  const RoleIcon = roleIcons[userRole] || User;
  const isDark = resolvedTheme === "dark";

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={drawerRef}>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" onClick={() => setDrawerOpen(!drawerOpen)}>
            <Bell className="h-5 w-5" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                {unacknowledgedCount}
              </span>
            )}
          </Button>

          {drawerOpen && (
            <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unacknowledgedCount > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-400">
                      {unacknowledgedCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unacknowledgedCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 gap-1 px-2 text-xs text-gray-500 hover:text-gray-900">
                      <Trash2 className="h-3 w-3" /> Clear all
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDrawerOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          alert.acknowledged ? "bg-white opacity-60 dark:bg-gray-900" : "bg-blue-50/50 dark:bg-blue-950/20"
                        }`}
                      >
                        <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${alert.severity === "CRITICAL" ? "bg-red-500" : alert.severity === "WARNING" ? "bg-amber-500" : "bg-blue-500"}`} />
                        <div className="flex-1 min-w-0">
                          <Link href={`/risks/${alert.id}`} onClick={() => setDrawerOpen(false)} className="text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                            {alert.materialDescription}
                          </Link>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{alert.riskType} risk at {alert.locationName}</p>
                          <p className="mt-0.5 text-[11px] text-gray-400">{formatDate(alert.detectedAt)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Badge variant={alert.severity === "CRITICAL" ? "critical" : alert.severity === "WARNING" ? "warning" : "success"} className="text-[10px]">
                            {alert.severity}
                          </Badge>
                          {!alert.acknowledged && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); acknowledgeAlert(alert.id); }} title="Acknowledge">
                              <Check className="h-3 w-3 text-emerald-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
                <Link href="/risks" onClick={() => setDrawerOpen(false)} className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  View all risks →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
          {mounted ? (isDark ? <Moon className="h-5 w-5 text-blue-400" /> : <Sun className="h-5 w-5 text-amber-500" />) : <Sun className="h-5 w-5" />}
        </Button>

        {/* User badge */}
        <div className={`ml-1 flex items-center gap-2 rounded-full px-3 py-1.5 ${roleColors[userRole]}`}>
          <RoleIcon className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{userName}</span>
        </div>
      </div>
    </header>
  );
}
