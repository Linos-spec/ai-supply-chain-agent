"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, riskTypeLabel } from "@/lib/utils";
import { ArrowRight, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface RiskRow {
  id: string;
  riskType: string;
  severity: string;
  materialDescription: string;
  locationName: string;
  recommendation: string;
  detectedAt: string;
}

function severityBadgeVariant(severity: string) {
  switch (severity) {
    case "CRITICAL": return "critical" as const;
    case "WARNING": return "warning" as const;
    default: return "success" as const;
  }
}

function severityDot(severity: string) {
  switch (severity) {
    case "CRITICAL": return "bg-red-500";
    case "WARNING": return "bg-amber-500";
    default: return "bg-blue-500";
  }
}

function riskTypeIcon(type: string) {
  switch (type) {
    case "STOCKOUT": return "text-red-500 bg-red-50 dark:bg-red-950/50";
    case "EXCESS": return "text-amber-500 bg-amber-50 dark:bg-amber-950/50";
    case "SUPPLIER": return "text-blue-500 bg-blue-50 dark:bg-blue-950/50";
    default: return "text-gray-500 bg-gray-50 dark:bg-gray-950/50";
  }
}

export function RecentRisksTable({ risks }: { risks: RiskRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">Recent Risks</CardTitle>
          </div>
          <Link href="/risks" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500">No recent risks detected</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Material</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Location</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Severity</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Recommendation</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Detected</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk, index) => {
                  const isExpanded = expandedId === risk.id;
                  const isLong = risk.recommendation.length > 60;
                  return (
                    <tr
                      key={risk.id}
                      className={`group cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${
                        index !== risks.length - 1 ? "border-b border-gray-100 dark:border-gray-800/50" : ""
                      }`}
                      onClick={() => isLong && setExpandedId(isExpanded ? null : risk.id)}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/risks/${risk.id}`} className="font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400" onClick={(e) => e.stopPropagation()}>
                          {risk.materialDescription}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{risk.locationName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${riskTypeIcon(risk.riskType)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${severityDot(risk.severity)}`} />
                          {riskTypeLabel(risk.riskType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={severityBadgeVariant(risk.severity)}>{risk.severity}</Badge>
                      </td>
                      <td className="max-w-[250px] px-4 py-3 text-gray-500 dark:text-gray-400">
                        <div className="flex items-start gap-1">
                          <span className={isExpanded ? "" : "line-clamp-1"}>{risk.recommendation}</span>
                          {isLong && (
                            <button className="ml-1 mt-0.5 shrink-0 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : risk.id); }}>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                        <Link href={`/risks/${risk.id}`} className="hover:text-blue-600 dark:hover:text-blue-400" onClick={(e) => e.stopPropagation()}>
                          {formatDate(risk.detectedAt)} →
                        </Link>
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
  );
}
