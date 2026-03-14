import { NextRequest, NextResponse } from "next/server";
import { generateRiskExplanation } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { riskId } = body;

  const risk = await prisma.risk.findUnique({
    where: { id: riskId },
    include: {
      material: true,
      location: true,
      supplier: true,
    },
  });

  if (!risk) {
    return NextResponse.json({ error: "Risk not found" }, { status: 404 });
  }

  // Get additional context
  let onHandQty: number | undefined;
  let demandQty: number | undefined;
  let supplyQty: number | undefined;
  let safetyStock: number | undefined;

  if (risk.materialId && risk.locationId) {
    const inv = await prisma.inventory.findFirst({
      where: { materialId: risk.materialId, locationId: risk.locationId },
    });
    if (inv) {
      onHandQty = inv.onHandQty;
      safetyStock = inv.safetyStock;
    }

    const now = new Date();
    const horizon = new Date(now.getTime() + 30 * 86400000);

    const [demandAgg, supplyAgg] = await Promise.all([
      prisma.demand.aggregate({
        where: { materialId: risk.materialId, locationId: risk.locationId, demandDate: { gte: now, lte: horizon } },
        _sum: { demandQty: true },
      }),
      prisma.supply.aggregate({
        where: { materialId: risk.materialId, locationId: risk.locationId, deliveryDate: { gte: now, lte: horizon }, status: { in: ["PLANNED", "IN_TRANSIT"] } },
        _sum: { supplyQty: true },
      }),
    ]);

    demandQty = demandAgg._sum.demandQty || undefined;
    supplyQty = supplyAgg._sum.supplyQty || undefined;
  }

  try {
    const explanation = await generateRiskExplanation({
      riskType: risk.riskType,
      severity: risk.severity,
      description: risk.description,
      recommendation: risk.recommendation,
      materialDescription: risk.material?.description,
      locationName: risk.location?.name,
      supplierName: risk.supplier?.name,
      onHandQty,
      demandQty,
      supplyQty,
      safetyStock,
    });

    // Save explanation to the risk
    await prisma.risk.update({
      where: { id: riskId },
      data: { aiExplanation: explanation },
    });

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI explanation. Check your ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }
}
