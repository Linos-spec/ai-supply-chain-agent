"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setEmail(emails[role]);
    setPassword("password123");
    setLoading(true);
    const result = await signIn("credentials", {
      email: emails[role],
      password: "password123",
      redirect: false,
    });
    if (!result?.error) {
      router.push("/dashboard");
    } else {
      setError("Login failed. Make sure the database is seeded.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            AI Supply Chain Agent
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Supply chain intelligence platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="mb-3 text-center text-xs text-gray-500">Quick login (demo)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => loginAs("admin")}>
                  Admin
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => loginAs("planner")}>
                  Planner
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => loginAs("viewer")}>
                  Viewer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
