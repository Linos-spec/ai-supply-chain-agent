"use client";

import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Bell, Moon, Sun, User, Shield, Eye, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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

export function Header({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    fetch("/api/risks?status=OPEN")
      .then(r => r.json())
      .then(data => {
        const critical = Array.isArray(data) ? data.filter((r: { severity: string }) => r.severity === "CRITICAL").length : 0;
        setAlertCount(critical);
      })
      .catch(() => setAlertCount(0));
  }, []);

  const userName = session?.user?.name || "User";
  const userRole = (session?.user?.role || "VIEWER") as string;
  const RoleIcon = roleIcons[userRole] || User;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {alertCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <div className={`ml-1 flex items-center gap-2 rounded-full px-3 py-1.5 ${roleColors[userRole]}`}>
          <RoleIcon className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
