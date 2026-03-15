"use client";

import { AlertTriangle, Package, TrendingDown, TrendingUp, Truck, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPIData {
  totalRisks: number;
  criticalStockouts: number;
  excessItems: number;
  supplierAlerts: number;
}

export function KPICards({ data }: { data: KPIData }) {
  const cards = [
    {
      title: "Total Active Risks",
      value: data.totalRisks,
      icon: AlertTriangle,
      trend: "+2 from last week",
      trendUp: true,
      gradient: "from-red-500 to-rose-600",
      lightBg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50",
      iconBg: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800/50",
    },
    {
      title: "Critical Stockouts",
      value: data.criticalStockouts,
      icon: TrendingDown,
      trend: "Requires immediate action",
      trendUp: true,
      gradient: "from-orange-500 to-amber-600",
      lightBg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800/50",
    },
    {
      title: "Excess Inventory",
      value: data.excessItems,
      icon: Package,
      trend: "~$492K carrying cost",
      trendUp: false,
      gradient: "from-amber-500 to-yellow-600",
      lightBg: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800/50",
    },
    {
      title: "Supplier Alerts",
      value: data.supplierAlerts,
      icon: Truck,
      trend: "2 suppliers below threshold",
      trendUp: true,
      gradient: "from-blue-500 to-indigo-600",
      lightBg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800/50",
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <div
          key={card.title}
          className={`relative overflow-hidden rounded-xl border ${card.borderColor} ${card.lightBg} p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
        >
          {/* Gradient accent bar */}
          <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${card.gradient}`} />

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {card.value}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {card.trendUp ? (
                  <ArrowUpRight className="h-3 w-3 text-red-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-amber-500" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>
            <div className={`rounded-xl p-3 ${card.iconBg}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
