import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      supply: {
        include: {
          material: { select: { materialId: true, description: true, productFamily: true } },
          location: { select: { locationId: true, name: true, region: true } },
        },
        orderBy: { deliveryDate: "desc" },
      },
      risks: {
        where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
        include: {
          material: { select: { materialId: true, description: true } },
          location: { select: { name: true } },
        },
        orderBy: { detectedAt: "desc" },
      },
    },
  });

  if (!supplier) {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  }

  // Unique materials supplied
  const materialMap = new Map<string, { materialId: string; description: string; productFamily: string }>();
  for (const s of supplier.supply) {
    if (!materialMap.has(s.materialId)) {
      materialMap.set(s.materialId, s.material);
    }
  }
  const materials = Array.from(materialMap.values());

  // PO status summary
  const poSummary = {
    total: supplier.supply.length,
    planned: supplier.supply.filter((s) => s.status === "PLANNED").length,
    inTransit: supplier.supply.filter((s) => s.status === "IN_TRANSIT").length,
    delivered: supplier.supply.filter((s) => s.status === "DELIVERED").length,
    delayed: supplier.supply.filter((s) => s.status === "DELAYED").length,
    cancelled: supplier.supply.filter((s) => s.status === "CANCELLED").length,
  };

  // Total supply volume
  const totalVolume = supplier.supply.reduce((sum, s) => sum + s.supplyQty, 0);

  return NextResponse.json({
    supplier: {
      id: supplier.id,
      supplierId: supplier.supplierId,
      name: supplier.name,
      reliabilityScore: supplier.reliabilityScore,
      country: supplier.country,
      leadTimeDays: supplier.leadTimeDays,
      riskLevel: supplier.riskLevel,
      createdAt: supplier.createdAt,
    },
    purchaseOrders: supplier.supply.map((s) => ({
      id: s.id,
      supplyId: s.supplyId,
      materialId: s.materialId,
      materialDescription: s.material.description,
      locationName: s.location.name,
      region: s.location.region,
      supplyQty: s.supplyQty,
      deliveryDate: s.deliveryDate,
      status: s.status,
    })),
    risks: supplier.risks.map((r) => ({
      id: r.id,
      riskType: r.riskType,
      severity: r.severity,
      status: r.status,
      description: r.description,
      recommendation: r.recommendation,
      materialDescription: r.material?.description || "N/A",
      locationName: r.location?.name || "N/A",
      detectedAt: r.detectedAt,
    })),
    materials,
    poSummary,
    totalVolume,
  });
}
