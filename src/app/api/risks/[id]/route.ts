import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const risk = await prisma.risk.findUnique({
    where: { id },
    include: {
      material: true,
      location: true,
      supplier: true,
    },
  });

  if (!risk) {
    return NextResponse.json({ error: "Risk not found" }, { status: 404 });
  }

  // Get supply and demand data for timeline chart
  let supplyDemandTimeline: Array<{ date: string; demand: number; supply: number; inventory: number }> = [];

  if (risk.materialId && risk.locationId) {
    const now = new Date();
    const horizon = new Date(now.getTime() + 30 * 86400000);

    const [demands, supplies, inventory] = await Promise.all([
      prisma.demand.findMany({
        where: {
          materialId: risk.materialId,
          locationId: risk.locationId,
          demandDate: { gte: now, lte: horizon },
        },
        orderBy: { demandDate: "asc" },
      }),
      prisma.supply.findMany({
        where: {
          materialId: risk.materialId,
          locationId: risk.locationId,
          deliveryDate: { gte: now, lte: horizon },
        },
        orderBy: { deliveryDate: "asc" },
      }),
      prisma.inventory.findFirst({
        where: {
          materialId: risk.materialId,
          locationId: risk.locationId,
        },
      }),
    ]);

    // Build daily timeline
    const startQty = inventory?.onHandQty || 0;
    let runningQty = startQty;

    for (let d = 0; d < 30; d++) {
      const date = new Date(now.getTime() + d * 86400000);
      const dateStr = date.toISOString().split("T")[0];

      const dayDemand = demands
        .filter((dm) => dm.demandDate.toISOString().split("T")[0] === dateStr)
        .reduce((sum, dm) => sum + dm.demandQty, 0);

      const daySupply = supplies
        .filter((s) => s.deliveryDate.toISOString().split("T")[0] === dateStr)
        .reduce((sum, s) => sum + s.supplyQty, 0);

      runningQty = runningQty - dayDemand + daySupply;

      supplyDemandTimeline.push({
        date: dateStr,
        demand: dayDemand,
        supply: daySupply,
        inventory: Math.max(0, runningQty),
      });
    }
  }

  return NextResponse.json({
    risk,
    supplyDemandTimeline,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) {
    updateData.status = body.status;
    if (body.status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    }
  }
  if (body.aiExplanation) updateData.aiExplanation = body.aiExplanation;

  const risk = await prisma.risk.update({
    where: { id },
    data: updateData,
    include: {
      material: true,
      location: true,
      supplier: true,
    },
  });

  return NextResponse.json(risk);
}
