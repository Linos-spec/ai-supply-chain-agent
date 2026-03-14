"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, riskTypeLabel } from "@/lib/utils";

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
    case "CRITICAL":
      return "critical" as const;
    case "WARNING":
      return "warning" as const;
    default:
      return "success" as const;
  }
}

export function RecentRisksTable({ risks }: { risks: RiskRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Risks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Material</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Location</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Severity</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Recommendation</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3">
                    <Link href={`/risks/${risk.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      {risk.materialDescription}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{risk.locationName}</td>
                  <td className="py-3">{riskTypeLabel(risk.riskType)}</td>
                  <td className="py-3">
                    <Badge variant={severityBadgeVariant(risk.severity)}>{risk.severity}</Badge>
                  </td>
                  <td className="max-w-xs truncate py-3 text-gray-600 dark:text-gray-400">
                    {risk.recommendation}
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-500">{formatDate(risk.detectedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
