"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import {
  StockoutByLocationChart,
  ExcessByLocationChart,
  RiskDistributionChart,
} from "@/components/dashboard/risk-charts";
import { RecentRisksTable } from "@/components/dashboard/recent-risks-table";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, X, DollarSign } from "lucide-react";

interface DashboardData {
  kpis: {
    totalRisks: number;
    criticalStockouts: number;
    excessItems: number;
    supplierAlerts: number;
  };
  recentRisks: Array<{
    id: string;
    riskType: string;
    severity: string;
    materialDescription: string;
    locationName: string;
    recommendation: string;
    detectedAt: string;
  }>;
  stockoutByLocation: Array<{ location: string; count: number }>;
  excessByLocation: Array<{ location: string; count: number }>;
  riskDistribution: Array<{ name: string; value: number }>;
}

interface DetectionResult {
  detected: number;
  newRisks: number;
  stockout: number;
  excess: number;
  supplier: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("");
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [showResultBanner, setShowResultBanner] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const runDetection = async () => {
    setDetecting(true);
    setDetectionResult(null);
    setShowResultBanner(false);

    const steps = [
      "Scanning inventory levels...",
      "Analyzing demand forecasts...",
      "Evaluating supplier reliability...",
      "Computing risk scores...",
    ];

    let stepIdx = 0;
    setDetectionStatus(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setDetectionStatus(steps[stepIdx]);
      }
    }, 1200);

    try {
      const res = await fetch("/api/risks/detect", { method: "POST" });
      const result = await res.json();
      clearInterval(interval);
      setDetectionResult(result);
      setShowResultBanner(true);
      setDetectionStatus("");
      await fetchData();
    } catch {
      clearInterval(interval);
      setDetectionStatus("");
    }
    setDetecting(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Estimate financial exposure: excess carrying cost + stockout delay cost
  const excessCost = (data.kpis.excessItems || 0) * 164000;
  const stockoutCost = (data.kpis.criticalStockouts || 0) * 85000;
  const financialExposure = excessCost + stockoutCost;

  return (
    <div>
      <Header title="Executive Dashboard" />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supply chain risk overview and actionable insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            {detecting && detectionStatus && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>{detectionStatus}</span>
              </div>
            )}
            <Button onClick={runDetection} disabled={detecting} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${detecting ? "animate-spin" : ""}`} />
              {detecting ? "Analyzing..." : "Run Risk Detection"}
            </Button>
          </div>
        </div>

        {/* Detection Result Banner */}
        {showResultBanner && detectionResult && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Risk detection complete — {detectionResult.detected} risks analyzed, {detectionResult.newRisks} new risk{detectionResult.newRisks !== 1 ? "s" : ""} detected
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {detectionResult.stockout} stockout · {detectionResult.excess} excess · {detectionResult.supplier} supplier
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowResultBanner(false)}>
              <X className="h-4 w-4 text-emerald-600" />
            </Button>
          </div>
        )}

        {/* KPI Cards — 5 cards including Financial Exposure */}
        <div className="relative z-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KPICards data={data.kpis} />
            {/* Financial Exposure KPI */}
            <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-violet-800/50 dark:from-violet-950/50 dark:to-purple-950/50">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Financial Exposure</p>
                  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    ${(financialExposure / 1000).toFixed(0)}K
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-3 w-3 text-violet-500" />
                    <span>Carrying + delay cost</span>
                  </div>
                </div>
                <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/50">
                  <DollarSign className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-0 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StockoutByLocationChart data={data.stockoutByLocation} />
          <ExcessByLocationChart data={data.excessByLocation} />
        </div>

        <div className="relative z-0 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentRisksTable risks={data.recentRisks} />
          </div>
          <RiskDistributionChart data={data.riskDistribution} />
        </div>
      </div>
    </div>
  );
}
