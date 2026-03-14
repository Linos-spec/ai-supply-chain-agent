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
import { RefreshCw } from "lucide-react";

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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const runDetection = async () => {
    setDetecting(true);
    await fetch("/api/risks/detect", { method: "POST" });
    await fetchData();
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
          <Button onClick={runDetection} disabled={detecting} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${detecting ? "animate-spin" : ""}`} />
            {detecting ? "Analyzing..." : "Run Risk Detection"}
          </Button>
        </div>

        <KPICards data={data.kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StockoutByLocationChart data={data.stockoutByLocation} />
          <ExcessByLocationChart data={data.excessByLocation} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentRisksTable risks={data.recentRisks} />
          </div>
          <RiskDistributionChart data={data.riskDistribution} />
        </div>
      </div>
    </div>
  );
}
