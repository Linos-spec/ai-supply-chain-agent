import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalRisks,
    criticalStockouts,
    excessItems,
    supplierAlerts,
    recentRisks,
    stockoutByLocation,
    excessByLocation,
    riskDistribution,
  ] = await Promise.all([
    prisma.risk.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } } }),
    prisma.risk.count({
      where: { riskType: "STOCKOUT", severity: "CRITICAL", status: "OPEN" },
    }),
    prisma.risk.count({
      where: { riskType: "EXCESS", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    }),
    prisma.risk.count({
      where: { riskType: "SUPPLIER", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    }),
    prisma.risk.findMany({
      where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      include: {
        material: true,
        location: true,
      },
      orderBy: { detectedAt: "desc" },
      take: 10,
    }),
    prisma.risk.groupBy({
      by: ["locationId"],
      where: { riskType: "STOCKOUT", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      _count: true,
    }),
    prisma.risk.groupBy({
      by: ["locationId"],
      where: { riskType: "EXCESS", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      _count: true,
    }),
    prisma.risk.groupBy({
      by: ["riskType"],
      where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      _count: true,
    }),
  ]);

  // Resolve location names for chart data
  const locationIds = [
    ...new Set([
      ...stockoutByLocation.map((r) => r.locationId),
      ...excessByLocation.map((r) => r.locationId),
    ]),
  ].filter(Boolean) as string[];

  const locations = await prisma.location.findMany({
    where: { locationId: { in: locationIds } },
  });
  const locationMap = Object.fromEntries(
    locations.map((l) => [l.locationId, l.name])
  );

  return NextResponse.json({
    kpis: {
      totalRisks,
      criticalStockouts,
      excessItems,
      supplierAlerts,
    },
    recentRisks: recentRisks.map((r) => ({
      id: r.id,
      riskType: r.riskType,
      severity: r.severity,
      materialDescription: r.material?.description || "N/A",
      locationName: r.location?.name || "N/A",
      recommendation: r.recommendation,
      detectedAt: r.detectedAt.toISOString(),
    })),
    stockoutByLocation: stockoutByLocation.map((r) => ({
      location: locationMap[r.locationId || ""] || r.locationId || "Unknown",
      count: r._count,
    })),
    excessByLocation: excessByLocation.map((r) => ({
      location: locationMap[r.locationId || ""] || r.locationId || "Unknown",
      count: r._count,
    })),
    riskDistribution: riskDistribution.map((r) => ({
      name:
        r.riskType === "STOCKOUT"
          ? "Stockout"
          : r.riskType === "EXCESS"
          ? "Excess"
          : "Supplier",
      value: r._count,
    })),
  });
}
