"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

  const getStockStatus = (item: InventoryItem) => {
    if (item.onHandQty <= 0) return { label: "Out of Stock", variant: "critical" as const };
    if (item.onHandQty < item.safetyStock) return { label: "Below Safety", variant: "critical" as const };
    if (item.onHandQty < item.reorderPoint) return { label: "Reorder", variant: "warning" as const };
    if (item.maxStock > 0 && item.onHandQty > item.maxStock) return { label: "Excess", variant: "warning" as const };
    return { label: "Healthy", variant: "success" as const };
  };

  return (
    <div>
      <Header title="Inventory" />
      <div className="space-y-4 p-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search materials or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Material</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Region</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">On Hand</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Available</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Safety Stock</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Reorder Pt</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 dark:text-white">{item.material.description}</p>
                            <p className="text-xs text-gray-400">{item.material.materialId} | {item.material.productFamily}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.location.name}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.location.region}</td>
                          <td className="px-4 py-3 text-right font-mono">{item.onHandQty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">{item.availableQty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">{item.safetyStock.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">{item.reorderPoint.toLocaleString()}</td>
                          <td className="px-4 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
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
