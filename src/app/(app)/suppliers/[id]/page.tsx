"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package2,
  AlertTriangle,
  CheckCircle2,
  Truck,
  XCircle,
  Timer,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PurchaseOrder {
  id: string;
  supplyId: string;
  materialId: string;
  materialDescription: string;
  locationName: string;
  region: string;
  supplyQty: number;
  deliveryDate: string;
  status: string;
}

interface RiskItem {
  id: string;
  riskType: string;
  severity: string;
  status: string;
  description: string;
  recommendation: string;
  materialDescription: string;
  locationName: string;
  detectedAt: string;
}

interface MaterialItem {
  materialId: string;
  description: string;
  productFamily: string;
}

interface SupplierDetail {
  supplier: {
    id: string;
    supplierId: string;
    name: string;
    reliabilityScore: number;
    country: string;
    leadTimeDays: number;
    riskLevel: string;
    createdAt: string;
  };
  purchaseOrders: PurchaseOrder[];
  risks: RiskItem[];
  materials: MaterialItem[];
  poSummary: {
    total: number;
    planned: number;
    inTransit: number;
    delivered: number;
    delayed: number;
    cancelled: number;
  };
  totalVolume: number;
}

function riskBadgeVariant(level: string) {
  switch (level) {
    case "CRITICAL": return "critical" as const;
    case "WARNING": return "warning" as const;
    default: return "success" as const;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "DELIVERED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400";
    case "IN_TRANSIT": return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400";
    case "PLANNED": return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    case "DELAYED": return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400";
    case "CANCELLED": return "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default: return "bg-gray-100 text-gray-600";
  }
}

function statusLabel(status: string) {
  return status.replace("_", " ");
}

const PO_BAR_COLORS: Record<string, string> = {
  delivered: "#10b981",
  inTransit: "#3b82f6",
  planned: "#9ca3af",
  delayed: "#ef4444",
  cancelled: "#d1d5db",
};

function ReliabilityGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;
  const color = score >= 0.9 ? "#10b981" : score >= 0.7 ? "#f59e0b" : "#ef4444";
  const bgColor = score >= 0.9 ? "#d1fae5" : score >= 0.7 ? "#fef3c7" : "#fee2e2";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke={bgColor} strokeWidth="6" className="dark:opacity-30" />
        <circle
          cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
        <p className="text-[10px] text-gray-400">Reliability</p>
      </div>
    </div>
  );
}

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/suppliers/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [params.id]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const { supplier, purchaseOrders, risks, materials, poSummary, totalVolume } = data;

  const poChartData = [
    { name: "Delivered", value: poSummary.delivered, key: "delivered" },
    { name: "In Transit", value: poSummary.inTransit, key: "inTransit" },
    { name: "Planned", value: poSummary.planned, key: "planned" },
    { name: "Delayed", value: poSummary.delayed, key: "delayed" },
    { name: "Cancelled", value: poSummary.cancelled, key: "cancelled" },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <Header title="Supplier Detail" />
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Suppliers
        </Button>

        {/* Supplier Header Card */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 w-full ${
            supplier.riskLevel === "CRITICAL" ? "bg-gradient-to-r from-red-500 to-rose-500" :
            supplier.riskLevel === "WARNING" ? "bg-gradient-to-r from-amber-500 to-orange-500" :
            "bg-gradient-to-r from-emerald-500 to-green-500"
          }`} />
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{supplier.name}</h2>
                  <Badge variant={riskBadgeVariant(supplier.riskLevel)}>{supplier.riskLevel}</Badge>
                </div>
                <p className="text-sm text-gray-400">{supplier.supplierId}</p>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{supplier.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{supplier.leadTimeDays} days lead time</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Package2 className="h-4 w-4 text-gray-400" />
                    <span>{materials.length} material{materials.length !== 1 ? "s" : ""} supplied</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <span>{totalVolume.toLocaleString()} total units</span>
                  </div>
                </div>
              </div>
              <ReliabilityGauge score={supplier.reliabilityScore} />
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Total POs", value: poSummary.total, icon: Package2, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/50" },
            { label: "Delivered", value: poSummary.delivered, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/50" },
            { label: "In Transit", value: poSummary.inTransit, icon: Truck, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/50" },
            { label: "Delayed", value: poSummary.delayed, icon: Timer, color: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50" },
            { label: "Active Risks", value: risks.length, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/50" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* PO Status Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">PO Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {poChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={poChartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} width={70} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Count" maxBarSize={24}>
                      {poChartData.map((entry) => (
                        <Cell key={entry.key} fill={PO_BAR_COLORS[entry.key] || "#9ca3af"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No purchase orders</p>
              )}
            </CardContent>
          </Card>

          {/* Materials Supplied */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Materials Supplied ({materials.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No materials linked</p>
              ) : (
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <div key={mat.materialId} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/30">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{mat.description}</p>
                        <p className="text-xs text-gray-400">{mat.materialId}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{mat.productFamily}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Risks */}
        {risks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base">Active Risks ({risks.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Material</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Location</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Severity</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Description</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Detected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((risk, idx) => (
                      <tr key={risk.id} className={`group transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${idx !== risks.length - 1 ? "border-b border-gray-100 dark:border-gray-800/50" : ""}`}>
                        <td className="px-4 py-3">
                          <Link href={`/risks/${risk.id}`} className="font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {risk.materialDescription}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{risk.locationName}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {risk.riskType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={riskBadgeVariant(risk.severity)}>{risk.severity}</Badge>
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-gray-500">{risk.description}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">{formatDate(risk.detectedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Orders Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">Purchase Orders ({purchaseOrders.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package2 className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm text-gray-500">No purchase orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">PO #</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Material</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Location</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Delivery Date</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po, idx) => (
                      <tr key={po.id} className={`transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/30 ${idx !== purchaseOrders.length - 1 ? "border-b border-gray-100 dark:border-gray-800/50" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 dark:text-gray-300">{po.supplyId}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{po.materialDescription}</p>
                          <p className="text-xs text-gray-400">{po.materialId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700 dark:text-gray-300">{po.locationName}</p>
                          <p className="text-xs text-gray-400">{po.region}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">{po.supplyQty.toLocaleString()}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(po.deliveryDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(po.status)}`}>
                            {statusLabel(po.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
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
