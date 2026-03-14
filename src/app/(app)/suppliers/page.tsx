"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, TrendingDown } from "lucide-react";

interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  reliabilityScore: number;
  country: string;
  leadTimeDays: number;
  riskLevel: string;
  _count: { supply: number; risks: number };
}

function reliabilityColor(score: number) {
  if (score >= 0.9) return "text-green-600";
  if (score >= 0.7) return "text-amber-600";
  return "text-red-600";
}

function riskBadgeVariant(level: string) {
  switch (level) {
    case "CRITICAL": return "critical" as const;
    case "WARNING": return "warning" as const;
    default: return "success" as const;
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((data) => {
        setSuppliers(data);
        setLoading(false);
      });
  }, []);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.supplierId.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="Suppliers" />
      <div className="space-y-4 p-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                      <p className="text-xs text-gray-400">{supplier.supplierId}</p>
                    </div>
                    <Badge variant={riskBadgeVariant(supplier.riskLevel)}>{supplier.riskLevel}</Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" /> {supplier.country}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" /> {supplier.leadTimeDays} days lead time
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      <span className={reliabilityColor(supplier.reliabilityScore)}>
                        {(supplier.reliabilityScore * 100).toFixed(0)}% reliability
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
                    <span>{supplier._count.supply} purchase orders</span>
                    <span>{supplier._count.risks} active risks</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
