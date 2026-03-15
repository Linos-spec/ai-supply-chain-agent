"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, CheckCircle2, TrendingUp, Package } from "lucide-react";

interface InventoryItem {
  id: string;
  materialId: string;
  locationId: string;
  onHandQty: number;
  availableQty: number;
  safetyStock: number;
  reorderPoint: number;
  maxStock: number;
  material: { materialId: string; description: string; productFamily: string };
  location: { locationId: string; name: string; region: string };
}

type StockStatus = "out" | "below-safety" | "reorder" | "healthy" | "excess";

function getStockStatus(item: InventoryItem): { label: string; variant: "critical" | "warning" | "success"; status: StockStatus } {
  if (item.onHandQty <= 0) return { label: "Out of Stock", variant: "critical", status: "out" };
  if (item.onHandQty < item.safetyStock) return { label: "Below Safety", variant: "critical", status: "below-safety" };
  if (item.onHandQty < item.reorderPoint) return { label: "Reorder", variant: "warning", status: "reorder" };
  if (item.maxStock > 0 && item.onHandQty > item.maxStock) return { label: "Excess", variant: "warning", status: "excess" };
  return { label: "Healthy", variant: "success", status: "healthy" };
}

function StockBar({ item }: { item: InventoryItem }) {
  const maxVal = Math.max(item.onHandQty, item.maxStock || item.reorderPoint * 2, item.safetyStock * 3);
  const onHandPct = Math.min((item.onHandQty / maxVal) * 100, 100);
  const safetyPct = (item.safetyStock / maxVal) * 100;
  const { status } = getStockStatus(item);

  const barColor =
    status === "out" || status === "below-safety"
      ? "bg-gradient-to-r from-red-500 to-red-400"
      : status === "reorder"
      ? "bg-gradient-to-r from-amber-500 to-amber-400"
      : status === "excess"
      ? "bg-gradient-to-r from-amber-500 to-orange-400"
      : "bg-gradient-to-r from-emerald-500 to-green-400";

  return (
    <div className="relative w-full min-w-[140px]">
      <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${onHandPct}%` }}
        />
      </div>
      {/* Safety stock marker */}
      <div
        className="absolute top-0 h-2.5 w-0.5 bg-red-400 dark:bg-red-500"
        style={{ left: `${safetyPct}%` }}
        title={`Safety Stock: ${item.safetyStock}`}
      />
    </div>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => {
        setInventory(data);
        setLoading(false);
      });
  }, []);

  const filtered = inventory.filter(
    (i) =>
      i.material.description.toLowerCase().includes(search.toLowerCase()) ||
      i.material.materialId.toLowerCase().includes(search.toLowerCase()) ||
      i.location.name.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const belowSafety = inventory.filter((i) => i.onHandQty < i.safetyStock).length;
  const healthy = inventory.filter(
    (i) => i.onHandQty >= i.safetyStock && !(i.maxStock > 0 && i.onHandQty > i.maxStock)
  ).length;
  const excess = inventory.filter((i) => i.maxStock > 0 && i.onHandQty > i.maxStock).length;

  const summaryCards = [
    {
      title: "Below Safety Stock",
      value: belowSafety,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/50",
      border: "border-red-200 dark:border-red-800/50",
    },
    {
      title: "Healthy Stock",
      value: healthy,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      border: "border-emerald-200 dark:border-emerald-800/50",
    },
    {
      title: "Excess Inventory",
      value: excess,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      border: "border-amber-200 dark:border-amber-800/50",
    },
    {
      title: "Total Items",
      value: inventory.length,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      border: "border-blue-200 dark:border-blue-800/50",
    },
  ];

  return (
    <div>
      <Header title="Inventory" />
      <div className="space-y-6 p-6">
        {/* Summary Cards */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className={`flex items-center gap-4 rounded-xl border ${card.border} bg-white p-4 dark:bg-gray-950`}
              >
                <div className={`rounded-lg p-2.5 ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search materials, IDs, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} of {inventory.length} items
          </p>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm text-gray-500">Loading inventory...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm font-medium text-gray-500">No inventory items found</p>
                <p className="text-xs text-gray-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Material</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Location</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">On Hand</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Safety Stock</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Stock Level</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <tr key={item.id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-gray-900 dark:text-white">{item.material.description}</p>
                            <p className="text-xs text-gray-400">
                              {item.material.materialId} &middot; {item.material.productFamily}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-gray-700 dark:text-gray-300">{item.location.name}</p>
                            <p className="text-xs text-gray-400">{item.location.region}</p>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="font-mono font-semibold text-gray-900 dark:text-white">
                              {item.onHandQty.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="font-mono text-gray-500 dark:text-gray-400">
                              {item.safetyStock.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <StockBar item={item} />
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
