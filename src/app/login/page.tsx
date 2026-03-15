"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brain, Loader2, Shield, Clipboard, Eye, Zap, BarChart3, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const loginAs = async (role: string) => {
    const emails: Record<string, string> = {
      admin: "admin@supplychain.ai",
      planner: "planner@supplychain.ai",
      viewer: "viewer@supplychain.ai",
    };
    setLoadingRole(role);
    setEmail(emails[role]);
    setPassword("password123");
    setError("");

    const result = await signIn("credentials", {
      email: emails[role],
      password: "password123",
      redirect: false,
    });
    if (!result?.error) {
      router.push("/dashboard");
    } else {
      setError("Login failed. Make sure the database is seeded.");
      setLoadingRole(null);
    }
  };

  const roleButtons = [
    { key: "admin", label: "Admin", icon: Shield, color: "text-purple-600 dark:text-purple-400", bg: "hover:bg-purple-50 dark:hover:bg-purple-950/50", border: "border-purple-200 dark:border-purple-800" },
    { key: "planner", label: "Planner", icon: Clipboard, color: "text-blue-600 dark:text-blue-400", bg: "hover:bg-blue-50 dark:hover:bg-blue-950/50", border: "border-blue-200 dark:border-blue-800" },
    { key: "viewer", label: "Viewer", icon: Eye, color: "text-gray-600 dark:text-gray-400", bg: "hover:bg-gray-50 dark:hover:bg-gray-800", border: "border-gray-200 dark:border-gray-700" },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20" />
      <div className="absolute top-1/4 left-1/4 h-40 w-40 rounded-full bg-purple-200/20 blur-2xl dark:bg-purple-900/10" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Brain className="h-9 w-9 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            AI Supply Chain Agent
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Intelligent supply chain risk detection and management
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: Zap, text: "AI-Powered Insights" },
            { icon: BarChart3, text: "Real-Time Dashboard" },
            { icon: Bell, text: "Risk Alerts" },
          ].map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/60 px-3 py-1 text-xs text-gray-600 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/60 dark:text-gray-400"
            >
              <feature.icon className="h-3 w-3" />
              {feature.text}
            </div>
          ))}
        </div>

        {/* Login Card */}
        <Card className="border-gray-200/80 shadow-xl shadow-gray-200/50 backdrop-blur-sm dark:border-gray-800 dark:shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              )}
              <Button type="submit" className="h-10 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>

            {/* Demo Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 dark:bg-gray-950 dark:text-gray-500">Demo Access</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {roleButtons.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => loginAs(role.key)}
                    disabled={loadingRole !== null}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border ${role.border} bg-white px-3 py-3 transition-all duration-200 ${role.bg} disabled:opacity-50 dark:bg-gray-950`}
                  >
                    {loadingRole === role.key ? (
                      <Loader2 className={`h-5 w-5 animate-spin ${role.color}`} />
                    ) : (
                      <role.icon className={`h-5 w-5 ${role.color}`} />
                    )}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Powered by Claude AI &middot; Built with Next.js
        </p>
      </div>
    </div>
  );
}
