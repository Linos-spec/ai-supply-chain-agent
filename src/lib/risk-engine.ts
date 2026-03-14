import { prisma } from "@/lib/prisma";

const PLANNING_HORIZON_DAYS = 30;
const EXCESS_COVERAGE_THRESHOLD = 90; // days
const SUPPLIER_RELIABILITY_THRESHOLD = 0.7;

interface DetectedRisk {
  materialId: string;
  locationId: string;
  supplierId?: string;
  riskType: "STOCKOUT" | "EXCESS" | "SUPPLIER";
  severity: "CRITICAL" | "WARNING" | "LOW";
  confidence: number;
  description: string;
  recommendation: string;
  projectedImpact: string;
}

export async function detectStockoutRisks(): Promise<DetectedRisk[]> {
  const risks: DetectedRisk[] = [];
  const now = new Date();
  const horizon = new Date(now.getTime() + PLANNING_HORIZON_DAYS * 86400000);

  const inventories = await prisma.inventory.findMany({
    include: { material: true, location: true },
  });

  for (const inv of inventories) {
    const totalDemand = await prisma.demand.aggregate({
      where: {
        materialId: inv.materialId,
        locationId: inv.locationId,
        demandDate: { gte: now, lte: horizon },
      },
      _sum: { demandQty: true },
    });

    const totalSupply = await prisma.supply.aggregate({
      where: {
        materialId: inv.materialId,
        locationId: inv.locationId,
        deliveryDate: { gte: now, lte: horizon },
        status: { in: ["PLANNED", "IN_TRANSIT"] },
      },
      _sum: { supplyQty: true },
    });

    const demand = totalDemand._sum.demandQty || 0;
    const supply = totalSupply._sum.supplyQty || 0;
    const projected = inv.onHandQty + supply - demand;

    if (projected < 0) {
      const severity = projected < -inv.safetyStock ? "CRITICAL" : "WARNING";
      const confidence = Math.min(0.95, 0.7 + Math.abs(projected) / (demand || 1) * 0.25);
      risks.push({
        materialId: inv.materialId,
        locationId: inv.locationId,
        riskType: "STOCKOUT",
        severity,
        confidence: Math.round(confidence * 100) / 100,
        description: `Projected stockout for ${inv.material.description} at ${inv.location.name}. Current on-hand: ${inv.onHandQty}, projected demand: ${demand}, inbound supply: ${supply}. Deficit: ${Math.abs(projected)} units.`,
        recommendation: `Expedite ${Math.abs(projected)} units of ${inv.material.materialId} or transfer from alternate location.`,
        projectedImpact: `${Math.abs(projected)} units short within ${PLANNING_HORIZON_DAYS} days`,
      });
    } else if (projected < inv.safetyStock) {
      risks.push({
        materialId: inv.materialId,
        locationId: inv.locationId,
        riskType: "STOCKOUT",
        severity: "WARNING",
        confidence: 0.75,
        description: `${inv.material.description} at ${inv.location.name} projected to fall below safety stock. Current: ${inv.onHandQty}, safety stock: ${inv.safetyStock}.`,
        recommendation: `Place replenishment order for ${inv.safetyStock - projected + inv.reorderPoint} units.`,
        projectedImpact: `Below safety stock by ${(inv.safetyStock - projected).toFixed(0)} units`,
      });
    }
  }

  return risks;
}

export async function detectExcessRisks(): Promise<DetectedRisk[]> {
  const risks: DetectedRisk[] = [];
  const now = new Date();
  const horizon = new Date(now.getTime() + PLANNING_HORIZON_DAYS * 86400000);

  const inventories = await prisma.inventory.findMany({
    include: { material: true, location: true },
  });

  for (const inv of inventories) {
    const totalDemand = await prisma.demand.aggregate({
      where: {
        materialId: inv.materialId,
        locationId: inv.locationId,
        demandDate: { gte: now, lte: horizon },
      },
      _sum: { demandQty: true },
    });

    const demand = totalDemand._sum.demandQty || 0;
    const avgDailyDemand = demand / PLANNING_HORIZON_DAYS;

    if (avgDailyDemand > 0) {
      const daysOfCoverage = inv.onHandQty / avgDailyDemand;

      if (daysOfCoverage > EXCESS_COVERAGE_THRESHOLD) {
        const excessQty = inv.onHandQty - avgDailyDemand * EXCESS_COVERAGE_THRESHOLD;
        const severity = daysOfCoverage > 180 ? "CRITICAL" : "WARNING";
        risks.push({
          materialId: inv.materialId,
          locationId: inv.locationId,
          riskType: "EXCESS",
          severity,
          confidence: 0.85,
          description: `Excess inventory for ${inv.material.description} at ${inv.location.name}. On-hand: ${inv.onHandQty} units provides ${Math.round(daysOfCoverage)} days of coverage (threshold: ${EXCESS_COVERAGE_THRESHOLD} days).`,
          recommendation: `Consider transferring ${Math.round(excessQty)} units to locations with higher demand or reducing future purchase orders.`,
          projectedImpact: `${Math.round(excessQty)} excess units, ~$${(excessQty * 50).toLocaleString()} carrying cost`,
        });
      }
    } else if (inv.onHandQty > 0) {
      risks.push({
        materialId: inv.materialId,
        locationId: inv.locationId,
        riskType: "EXCESS",
        severity: "WARNING",
        confidence: 0.7,
        description: `No demand forecast for ${inv.material.description} at ${inv.location.name}, but ${inv.onHandQty} units on hand.`,
        recommendation: `Review demand plan for ${inv.material.materialId}. Consider disposition or transfer if material is obsolete.`,
        projectedImpact: `${inv.onHandQty} units with zero projected demand`,
      });
    }
  }

  return risks;
}

export async function detectSupplierRisks(): Promise<DetectedRisk[]> {
  const risks: DetectedRisk[] = [];

  const suppliers = await prisma.supplier.findMany({
    include: {
      supply: {
        include: { material: true, location: true },
      },
    },
  });

  for (const supplier of suppliers) {
    if (supplier.reliabilityScore < SUPPLIER_RELIABILITY_THRESHOLD) {
      const severity = supplier.reliabilityScore < 0.5 ? "CRITICAL" : "WARNING";
      const affectedMaterials = [...new Set(supplier.supply.map((s) => s.materialId))];

      risks.push({
        materialId: affectedMaterials[0] || "",
        locationId: supplier.supply[0]?.locationId || "",
        supplierId: supplier.supplierId,
        riskType: "SUPPLIER",
        severity,
        confidence: 0.9,
        description: `Supplier ${supplier.name} (${supplier.country}) has reliability score of ${(supplier.reliabilityScore * 100).toFixed(0)}%. Affects ${affectedMaterials.length} materials.`,
        recommendation: `Evaluate alternate suppliers for materials sourced from ${supplier.name}. Consider dual-sourcing strategy.`,
        projectedImpact: `${affectedMaterials.length} materials at risk of supply disruption`,
      });
    }

    // Check for delayed shipments
    const delayedSupplies = supplier.supply.filter(
      (s) => s.status === "DELAYED"
    );
    if (delayedSupplies.length > 0) {
      for (const ds of delayedSupplies) {
        risks.push({
          materialId: ds.materialId,
          locationId: ds.locationId,
          supplierId: supplier.supplierId,
          riskType: "SUPPLIER",
          severity: "WARNING",
          confidence: 0.95,
          description: `Shipment ${ds.supplyId} from ${supplier.name} is delayed. ${ds.supplyQty} units of ${ds.material.description} expected at ${ds.location.name}.`,
          recommendation: `Contact ${supplier.name} for updated delivery date. Consider expediting from alternate source.`,
          projectedImpact: `${ds.supplyQty} units delayed`,
        });
      }
    }
  }

  return risks;
}

export async function runFullRiskDetection() {
  const [stockoutRisks, excessRisks, supplierRisks] = await Promise.all([
    detectStockoutRisks(),
    detectExcessRisks(),
    detectSupplierRisks(),
  ]);

  const allRisks = [...stockoutRisks, ...excessRisks, ...supplierRisks];

  // Upsert risks
  const created = [];
  for (const risk of allRisks) {
    const existing = await prisma.risk.findFirst({
      where: {
        materialId: risk.materialId || undefined,
        locationId: risk.locationId || undefined,
        supplierId: risk.supplierId || undefined,
        riskType: risk.riskType,
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    });

    if (!existing) {
      const newRisk = await prisma.risk.create({
        data: {
          materialId: risk.materialId || undefined,
          locationId: risk.locationId || undefined,
          supplierId: risk.supplierId || undefined,
          riskType: risk.riskType,
          severity: risk.severity,
          confidence: risk.confidence,
          description: risk.description,
          recommendation: risk.recommendation,
          projectedImpact: risk.projectedImpact,
        },
      });
      created.push(newRisk);
    }
  }

  return {
    detected: allRisks.length,
    newRisks: created.length,
    stockout: stockoutRisks.length,
    excess: excessRisks.length,
    supplier: supplierRisks.length,
  };
}
