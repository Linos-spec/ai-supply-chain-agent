"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, riskTypeLabel } from "@/lib/utils";
import { Search, Filter, CheckCircle, Eye } from "lucide-react";

interface Risk {
  id: string;
  riskType: string;
  severity: string;
  confidence: number;
  description: string;
  recommendation: string;
  status: string;
  detectedAt: string;
  material: { materialId: string; description: string } | null;
  location: { name: string; locationId: string } | null;
  supplier: { name: string } | null;
}

function severityBadgeVariant(severity: string) {
  switch (severity) {
    case "CRITICAL": return "critical" as const;
    case "WARNING": return "warning" as const;
    default: return "success" as const;
  }
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "OPEN": return "critical" as const;
    case "ACKNOWLEDGED": return "warning" as const;
    case "RESOLVED": return "success" as const;
    default: return "outline" as const;
  }
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskTypeFilter, setRiskTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRisks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (riskTypeFilter !== "all") params.set("riskType", riskTypeFilter);
    if (severityFilter !== "all") params.set("severity", severityFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/risks?${params}`);
    const data = await res.json();
    setRisks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRisks();
  }, [riskTypeFilter, severityFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRisks();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/risks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRisks();
  };

  return (
    <div>
      <Header title="Exception Worklist" />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">Search</Button>
          </form>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={riskTypeFilter} onValueChange={setRiskTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Risk Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="STOCKOUT">Stockout</SelectItem>
                <SelectItem value="EXCESS">Excess</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Open & Ack</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : risks.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No risks found matching your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Material</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Severity</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Confidence</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Recommendation</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {risks.map((risk) => (
                      <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <Link href={`/risks/${risk.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                            {risk.material?.description || "N/A"}
                          </Link>
                          <p className="text-xs text-gray-400">{risk.material?.materialId}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{risk.location?.name || "N/A"}</td>
                        <td className="px-4 py-3">{riskTypeLabel(risk.riskType)}</td>
                        <td className="px-4 py-3"><Badge variant={severityBadgeVariant(risk.severity)}>{risk.severity}</Badge></td>
                        <td className="px-4 py-3 text-gray-600">{(risk.confidence * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3"><Badge variant={statusBadgeVariant(risk.status)}>{risk.status}</Badge></td>
                        <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-gray-400">{risk.recommendation}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/risks/${risk.id}`}>
                              <Button variant="ghost" size="icon" title="View Details"><Eye className="h-4 w-4" /></Button>
                            </Link>
                            {risk.status === "OPEN" && (
                              <Button variant="ghost" size="icon" title="Acknowledge" onClick={() => updateStatus(risk.id, "ACKNOWLEDGED")}>
                                <CheckCircle className="h-4 w-4 text-amber-500" />
                              </Button>
                            )}
                            {risk.status === "ACKNOWLEDGED" && (
                              <Button variant="ghost" size="icon" title="Resolve" onClick={() => updateStatus(risk.id, "RESOLVED")}>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                          </div>
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
