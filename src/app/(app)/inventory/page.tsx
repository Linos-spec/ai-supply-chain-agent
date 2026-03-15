"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, CheckCircle2, TrendingUp, Package, Info } from "lucide-react";

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
  const [showTooltip, setShowTooltip] = useState(false);
  const maxVal = Math.max(item.onHandQty, item.maxStock || item.reorderPoint * 2, item.safetyStock * 3);
  const onHandPct = Math.min((item.onHandQty / maxVal) * 100, 100);
  const safetyPct = (item.safetyStock / maxVal) * 100;
  const reorderPct = item.reorderPoint > 0 ? (item.reorderPoint / maxVal) * 100 : 0;
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
    <div className="relative w-full min-w-[140px]" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${onHandPct}%` }} />
      </div>
      {safetyPct > 0 && safetyPct < 100 && (
        <div className="absolute top-0 h-2.5 w-0.5 bg-red-400 dark:bg-red-500" style={{ left: `${safetyPct}%` }} />
      )}
      {reorderPct > 0 && reorderPct < 100 && reorderPct !== safetyPct && (
        <div className="absolute top-0 h-2.5 w-0.5 bg-amber-400 dark:bg-amber-500" style={{ left: `${reorderPct}%` }} />
      )}
      {showTooltip && (
        <div className="absolute -top-20 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
              <span className="text-gray-500">On Hand:</span>
              <span className="font-semibold">{item.onHandQty.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-0.5 bg-red-400" />
              <span className="text-gray-500">Safety Stock:</span>
              <span className="font-semibold">{item.safetyStock.toLocaleString()}</span>
            </div>
            {item.reorderPoint > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-0.5 bg-amber-400" />
                <span className="text-gray-500">Reorder Point:</span>
                <span className="font-semibold">{item.reorderPoint.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        </div>
      )}
    </div>
  );
}

type StatusFilter = "all" | "below-safety" | "healthy" | "excess";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [familyFilter, setFamilyFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => { setInventory(data); setLoading(false); });
  }, []);

  const productFamilies = useMemo(() => {
    const families = new Set(inventory.map((i) => i.material.productFamily).filter(Boolean));
    return Array.from(families).sort();
  }, [inventory]);

  const filtered = inventory.filter((i) => {
    const matchesSearch =
      i.material.description.toLowerCase().includes(search.toLowerCase()) ||
      i.material.materialId.toLowerCase().includes(search.toLowerCase()) ||
      i.location.name.toLowerCase().includes(search.toLowerCase());
    const status = getStockStatus(i);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "below-safety" && (status.status === "below-safety" || status.status === "out" || status.status === "reorder")) ||
      (statusFilter === "healthy" && status.status === "healthy") ||
      (statusFilter === "excess" && status.status === "excess");
    const matchesFamily = familyFilter === "all" || i.material.productFamily === familyFilter;
    return matchesSearch && matchesStatus && matchesFamily;
  });

  const belowSafety = inventory.filter((i) => i.onHandQty < i.safetyStock).length;
  const healthy = inventory.filter((i) => i.onHandQty >= i.safetyStock && !(i.maxStock > 0 && i.onHandQty > i.maxStock)).length;
  const excess = inventory.filter((i) => i.maxStock > 0 && i.onHandQty > i.maxStock).length;

  const summaryCards = [
    { title: "Below Safety Stock", value: belowSafety, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50", border: "border-red-200 dark:border-red-800/50" },
    { title: "Healthy Stock", value: healthy, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", border: "border-emerald-200 dark:border-emerald-800/50" },
    { title: "Excess Inventory", value: excess, icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/50", border: "border-amber-200 dark:border-amber-800/50" },
    { title: "Total Items", value: inventory.length, icon: Package, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-200 dark:border-blue-800/50" },
  ];

  const statusFilterButtons: { label: string; value: StatusFilter; count: number }[] = [
    { label: "All", value: "all", count: inventory.length },
    { label: "Below Safety", value: "below-safety", count: belowSafety },
    { label: "Healthy", value: "healthy", count: healthy },
    { label: "Excess", value: "excess", count: excess },
  ];

  return (
    <div>
      <Header title="Inventory" />
      <div className="space-y-6 p-6">
        {!loading && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.title} className={`flex items-center gap-4 rounded-xl border ${card.border} bg-white p-4 dark:bg-gray-950`}>
                <div className={`rounded-lg p-2.5 ${card.iconBg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                <div>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search materials, IDs, or locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} of {inventory.length} items</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="mr-1 text-xs font-medium text-gray-500 dark:text-gray-400">Status:</span>
              {statusFilterButtons.map((btn) => (
                <button key={btn.value} onClick={() => setStatusFilter(btn.value)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${statusFilter === btn.value ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
                  {btn.label} ({btn.count})
                </button>
              ))}
            </div>
            {productFamilies.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs font-medium text-gray-500 dark:text-gray-400">Family:</span>
                <button onClick={() => setFamilyFilter("all")} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${familyFilter === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"}`}>All</button>
                {productFamilies.map((fam) => (
                  <button key={fam} onClick={() => setFamilyFilter(fam)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${familyFilter === fam ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"}`}>{fam}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/30">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Info className="h-3 w-3" /><span className="font-medium">Legend:</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="h-2.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" /><span>On-hand qty</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="h-2.5 w-0.5 bg-red-400" /><span>Safety stock</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="h-2.5 w-0.5 bg-amber-400" /><span>Reorder point</span></div>
        </div>

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
                <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
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
                            <p className="text-xs text-gray-400">{item.material.materialId} &middot; {item.material.productFamily}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-gray-700 dark:text-gray-300">{item.location.name}</p>
                            <p className="text-xs text-gray-400">{item.location.region}</p>
                          </td>
                          <td className="px-4 py-3.5 text-right"><span className="font-mono font-semibold text-gray-900 dark:text-white">{item.onHandQty.toLocaleString()}</span></td>
                          <td className="px-4 py-3.5 text-right"><span className="font-mono text-gray-500 dark:text-gray-400">{item.safetyStock.toLocaleString()}</span></td>
                          <td className="px-4 py-3.5"><StockBar item={item} /></td>
                          <td className="px-4 py-3.5"><Badge variant={status.variant}>{status.label}</Badge></td>
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
