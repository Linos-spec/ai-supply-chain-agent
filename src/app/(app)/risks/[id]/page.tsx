"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, riskTypeLabel } from "@/lib/utils";
import { ArrowLeft, Brain, CheckCircle, Loader2, Sparkles } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface RiskDetail {
  risk: {
    id: string;
    riskType: string;
    severity: string;
    confidence: number;
    description: string;
    recommendation: string;
    aiExplanation: string | null;
    status: string;
    projectedImpact: string | null;
    detectedAt: string;
    resolvedAt: string | null;
    material: { materialId: string; description: string; productFamily: string } | null;
    location: { locationId: string; name: string; region: string } | null;
    supplier: { supplierId: string; name: string; country: string; reliabilityScore: number } | null;
  };
  supplyDemandTimeline: Array<{ date: string; demand: number; supply: number; inventory: number }>;
}

function severityBadgeVariant(severity: string) {
  switch (severity) {
    case "CRITICAL": return "critical" as const;
    case "WARNING": return "warning" as const;
    default: return "success" as const;
  }
}

export default function RiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<RiskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const autoTriggered = useRef(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/risks/${params.id}`);
    const json = await res.json();
    setData(json);
    setExplanation(json.risk?.aiExplanation || null);
    setLoading(false);
    return json;
  }, [params.id]);

  const requestExplanation = useCallback(async () => {
    if (explaining) return;
    setExplaining(true);
    setStreamedText("");

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskId: params.id }),
      });
      const json = await res.json();
      const fullText = json.explanation || json.error || "Failed to generate explanation.";

      // Simulate streaming effect for better UX
      let idx = 0;
      const chunkSize = 3;
      const streamInterval = setInterval(() => {
        idx += chunkSize;
        if (idx >= fullText.length) {
          setStreamedText(fullText);
          setExplanation(fullText);
          clearInterval(streamInterval);
          setExplaining(false);
        } else {
          setStreamedText(fullText.slice(0, idx));
        }
      }, 15);
    } catch {
      setExplanation("Failed to connect to AI service.");
      setStreamedText("");
      setExplaining(false);
    }
  }, [explaining, params.id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/risks/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  useEffect(() => {
    fetchData().then((json) => {
      // Auto-trigger AI analysis for critical risks without existing explanation
      if (
        !autoTriggered.current &&
        json?.risk?.severity === "CRITICAL" &&
        !json?.risk?.aiExplanation
      ) {
        autoTriggered.current = true;
        // Small delay for UI to render first
        setTimeout(() => requestExplanation(), 500);
      }
    });
  }, [fetchData, requestExplanation]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const { risk, supplyDemandTimeline } = data;
  const displayExplanation = explaining ? streamedText : explanation;

  return (
    <div>
      <Header title="Risk Detail" />
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Worklist
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{risk.material?.description || "Supplier Risk"}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">{risk.material?.materialId} | {risk.location?.name || "Multiple Locations"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={severityBadgeVariant(risk.severity)}>{risk.severity}</Badge>
                    <Badge variant="outline">{riskTypeLabel(risk.riskType)}</Badge>
                    <Badge variant="outline">{risk.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{risk.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Recommendation</h4>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{risk.recommendation}</p>
                </div>
                {risk.projectedImpact && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Projected Impact</h4>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{risk.projectedImpact}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {risk.status === "OPEN" && (
                    <Button onClick={() => updateStatus("ACKNOWLEDGED")} variant="outline">
                      <CheckCircle className="mr-2 h-4 w-4 text-amber-500" /> Acknowledge
                    </Button>
                  )}
                  {(risk.status === "OPEN" || risk.status === "ACKNOWLEDGED") && (
                    <Button onClick={() => updateStatus("RESOLVED")} variant="outline">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {supplyDemandTimeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Supply vs Demand Timeline (30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={supplyDemandTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="inventory" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.3} name="Projected Inventory" />
                      <Area type="monotone" dataKey="demand" stroke="#ef4444" fill="#fca5a5" fillOpacity={0.3} name="Daily Demand" />
                      <Area type="monotone" dataKey="supply" stroke="#22c55e" fill="#86efac" fillOpacity={0.3} name="Inbound Supply" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Explanation Panel */}
          <div className="space-y-6">
            <Card className={explaining ? "ring-2 ring-purple-200 dark:ring-purple-800/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-5 w-5 text-purple-600" /> AI Analysis
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={requestExplanation} disabled={explaining}>
                    {explaining ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                    {explaining ? "Analyzing..." : explanation ? "Re-analyze" : "Generate"}
                  </Button>
                </div>
                {risk.severity === "CRITICAL" && !explanation && !explaining && (
                  <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                    Auto-generates for critical risks
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {displayExplanation ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {displayExplanation}
                    {explaining && <span className="inline-block h-4 w-1 animate-pulse bg-purple-500 ml-0.5" />}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Click &quot;Generate&quot; to get an AI-powered root cause analysis and action recommendations.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">{(risk.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Detected</span>
                  <span>{formatDate(risk.detectedAt)}</span>
                </div>
                {risk.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resolved</span>
                    <span>{formatDate(risk.resolvedAt)}</span>
                  </div>
                )}
                {risk.material && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product Family</span>
                    <span>{risk.material.productFamily}</span>
                  </div>
                )}
                {risk.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Region</span>
                    <span>{risk.location.region}</span>
                  </div>
                )}
                {risk.supplier && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Supplier</span>
                      <span>{risk.supplier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reliability</span>
                      <span>{(risk.supplier.reliabilityScore * 100).toFixed(0)}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
