"use client";

import { AlertTriangle, Package, TrendingDown, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Critical Stockouts",
      value: data.criticalStockouts,
      icon: TrendingDown,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Excess Inventory",
      value: data.excessItems,
      icon: Package,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Supplier Alerts",
      value: data.supplierAlerts,
      icon: Truck,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
