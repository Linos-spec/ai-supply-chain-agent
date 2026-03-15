"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Truck, Package2 } from "lucide-react";

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

function riskBadgeVariant(level: string) {
  switch (level) {
    case "CRITICAL": return "critical" as const;
    case "WARNING": return "warning" as const;
    default: return "success" as const;
  }
}

function ReliabilityRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score * circumference);
  const color = score >= 0.9 ? "#10b981" : score >= 0.7 ? "#f59e0b" : "#ef4444";
  const bgColor = score >= 0.9 ? "#d1fae5" : score >= 0.7 ? "#fef3c7" : "#fee2e2";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke={bgColor} strokeWidth="5" className="dark:opacity-30" />
        <circle
          cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-lg font-bold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
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

  const avgReliability = suppliers.length > 0
    ? suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length
    : 0;
  const atRisk = suppliers.filter((s) => s.riskLevel === "CRITICAL" || s.riskLevel === "WARNING").length;

  return (
    <div>
      <Header title="Suppliers" />
      <div className="space-y-6 p-6">
        {/* Summary Row */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-4 dark:border-blue-800/50 dark:bg-gray-950">
              <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/50">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{suppliers.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Suppliers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-800/50 dark:bg-gray-950">
              <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-900/50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(avgReliability * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Reliability</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-white p-4 dark:border-red-800/50 dark:bg-gray-950">
              <div className="rounded-lg bg-red-100 p-2.5 dark:bg-red-900/50">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{atRisk}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">At-Risk Suppliers</p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search suppliers, IDs, or countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Supplier Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-500">Loading suppliers...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Truck className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-500">No suppliers found</p>
            <p className="text-xs text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((supplier) => (
              <Card key={supplier.id} className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                {/* Top accent bar */}
                <div className={`h-1 w-full ${
                  supplier.riskLevel === "CRITICAL" ? "bg-gradient-to-r from-red-500 to-rose-500" :
                  supplier.riskLevel === "WARNING" ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                  "bg-gradient-to-r from-emerald-500 to-green-500"
                }`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                        <Badge variant={riskBadgeVariant(supplier.riskLevel)}>{supplier.riskLevel}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">{supplier.supplierId}</p>
                    </div>
                    <ReliabilityRing score={supplier.reliabilityScore} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{supplier.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{supplier.leadTimeDays}d lead time</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Package2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{supplier._count.supply} POs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${supplier._count.risks > 0 ? "text-red-500" : "text-gray-400"}`} />
                      <span className={supplier._count.risks > 0 ? "font-medium text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}>
                        {supplier._count.risks} risk{supplier._count.risks !== 1 ? "s" : ""}
                      </span>
                    </div>
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
