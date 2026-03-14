import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.alert.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.supply.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.location.deleteMany();
  await prisma.material.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const hash = await bcrypt.hash("password123", 10);
  await prisma.user.createMany({
    data: [
      { name: "Admin User", email: "admin@supplychain.ai", passwordHash: hash, role: "ADMIN" },
      { name: "Sarah Chen", email: "planner@supplychain.ai", passwordHash: hash, role: "PLANNER" },
      { name: "Mike Johnson", email: "viewer@supplychain.ai", passwordHash: hash, role: "VIEWER" },
    ],
  });
  console.log("  Users created");

  // Locations
  await prisma.location.createMany({
    data: [
      { locationId: "PLT-ATL", name: "Atlanta Plant", warehouseType: "Manufacturing", region: "North America", country: "USA" },
      { locationId: "WH-CHI", name: "Chicago DC", warehouseType: "Distribution", region: "North America", country: "USA" },
      { locationId: "WH-DAL", name: "Dallas Warehouse", warehouseType: "Distribution", region: "North America", country: "USA" },
      { locationId: "PLT-FRA", name: "Frankfurt Plant", warehouseType: "Manufacturing", region: "Europe", country: "Germany" },
      { locationId: "WH-LON", name: "London DC", warehouseType: "Distribution", region: "Europe", country: "UK" },
      { locationId: "PLT-SHA", name: "Shanghai Plant", warehouseType: "Manufacturing", region: "Asia Pacific", country: "China" },
      { locationId: "WH-TOK", name: "Tokyo DC", warehouseType: "Distribution", region: "Asia Pacific", country: "Japan" },
      { locationId: "WH-SYD", name: "Sydney Warehouse", warehouseType: "Distribution", region: "Asia Pacific", country: "Australia" },
    ],
  });
  console.log("  Locations created");

  // Suppliers
  await prisma.supplier.createMany({
    data: [
      { supplierId: "SUP-001", name: "TechParts Global", reliabilityScore: 0.95, country: "Germany", leadTimeDays: 14, riskLevel: "LOW" },
      { supplierId: "SUP-002", name: "Pacific Components", reliabilityScore: 0.88, country: "Japan", leadTimeDays: 21, riskLevel: "LOW" },
      { supplierId: "SUP-003", name: "Dragon Materials Ltd", reliabilityScore: 0.62, country: "China", leadTimeDays: 28, riskLevel: "WARNING" },
      { supplierId: "SUP-004", name: "Atlas Raw Materials", reliabilityScore: 0.45, country: "Russia", leadTimeDays: 35, riskLevel: "CRITICAL" },
      { supplierId: "SUP-005", name: "Midwest Steel Corp", reliabilityScore: 0.92, country: "USA", leadTimeDays: 7, riskLevel: "LOW" },
      { supplierId: "SUP-006", name: "EuroChemicals AG", reliabilityScore: 0.78, country: "Switzerland", leadTimeDays: 18, riskLevel: "WARNING" },
    ],
  });
  console.log("  Suppliers created");

  // Materials (50)
  const materials = [
    { materialId: "MAT-1001", description: "Hydraulic Pump Assembly", productFamily: "Hydraulics" },
    { materialId: "MAT-1002", description: "Pressure Relief Valve", productFamily: "Hydraulics" },
    { materialId: "MAT-1003", description: "Hydraulic Cylinder Rod", productFamily: "Hydraulics" },
    { materialId: "MAT-1004", description: "Hydraulic Hose 1/2 inch", productFamily: "Hydraulics" },
    { materialId: "MAT-1005", description: "Seal Kit - Hydraulic", productFamily: "Hydraulics" },
    { materialId: "MAT-1006", description: "Hydraulic Filter Element", productFamily: "Hydraulics" },
    { materialId: "MAT-1007", description: "Flow Control Valve", productFamily: "Hydraulics" },
    { materialId: "MAT-1008", description: "Hydraulic Manifold Block", productFamily: "Hydraulics" },
    { materialId: "MAT-1009", description: "Pump Drive Coupling", productFamily: "Hydraulics" },
    { materialId: "MAT-1010", description: "Accumulator Bladder", productFamily: "Hydraulics" },
    { materialId: "MAT-2001", description: "AC Servo Motor 5kW", productFamily: "Electronics" },
    { materialId: "MAT-2002", description: "PLC Controller Module", productFamily: "Electronics" },
    { materialId: "MAT-2003", description: "Proximity Sensor", productFamily: "Electronics" },
    { materialId: "MAT-2004", description: "Variable Frequency Drive", productFamily: "Electronics" },
    { materialId: "MAT-2005", description: "HMI Touch Panel 10 inch", productFamily: "Electronics" },
    { materialId: "MAT-2006", description: "Encoder Rotary Absolute", productFamily: "Electronics" },
    { materialId: "MAT-2007", description: "Power Supply 24V DC", productFamily: "Electronics" },
    { materialId: "MAT-2008", description: "Industrial Ethernet Switch", productFamily: "Electronics" },
    { materialId: "MAT-2009", description: "Circuit Breaker 30A", productFamily: "Electronics" },
    { materialId: "MAT-2010", description: "Cable Assembly - Motor", productFamily: "Electronics" },
    { materialId: "MAT-3001", description: "Steel Plate A36 - 1/4 in", productFamily: "Raw Materials" },
    { materialId: "MAT-3002", description: "Aluminum Bar 6061-T6", productFamily: "Raw Materials" },
    { materialId: "MAT-3003", description: "Stainless Steel Tube 304", productFamily: "Raw Materials" },
    { materialId: "MAT-3004", description: "Copper Sheet 0.5mm", productFamily: "Raw Materials" },
    { materialId: "MAT-3005", description: "Titanium Rod Grade 5", productFamily: "Raw Materials" },
    { materialId: "MAT-3006", description: "Carbon Fiber Sheet", productFamily: "Raw Materials" },
    { materialId: "MAT-3007", description: "HDPE Resin Pellets", productFamily: "Raw Materials" },
    { materialId: "MAT-3008", description: "Nylon 6/6 Block", productFamily: "Raw Materials" },
    { materialId: "MAT-3009", description: "Brass Round Bar C360", productFamily: "Raw Materials" },
    { materialId: "MAT-3010", description: "Rubber Sheet Neoprene", productFamily: "Raw Materials" },
    { materialId: "MAT-4001", description: "Ball Bearing 6205-2RS", productFamily: "Mechanical" },
    { materialId: "MAT-4002", description: "Timing Belt HTD 5M", productFamily: "Mechanical" },
    { materialId: "MAT-4003", description: "Linear Guide Rail 20mm", productFamily: "Mechanical" },
    { materialId: "MAT-4004", description: "Ball Screw Assembly", productFamily: "Mechanical" },
    { materialId: "MAT-4005", description: "Precision Gear Spur M2", productFamily: "Mechanical" },
    { materialId: "MAT-4006", description: "Shaft Coupling Flexible", productFamily: "Mechanical" },
    { materialId: "MAT-4007", description: "Spring Compression 50mm", productFamily: "Mechanical" },
    { materialId: "MAT-4008", description: "O-Ring Kit Metric", productFamily: "Mechanical" },
    { materialId: "MAT-4009", description: "Thrust Bearing 51105", productFamily: "Mechanical" },
    { materialId: "MAT-4010", description: "Chain Roller ANSI 40", productFamily: "Mechanical" },
    { materialId: "MAT-5001", description: "Lubricant Synthetic ISO 68", productFamily: "Consumables" },
    { materialId: "MAT-5002", description: "Welding Wire ER70S-6", productFamily: "Consumables" },
    { materialId: "MAT-5003", description: "Cutting Tool Insert CNMG", productFamily: "Consumables" },
    { materialId: "MAT-5004", description: "Abrasive Disc 125mm", productFamily: "Consumables" },
    { materialId: "MAT-5005", description: "Thread Sealant PTFE", productFamily: "Consumables" },
    { materialId: "MAT-5006", description: "Industrial Adhesive Epoxy", productFamily: "Consumables" },
    { materialId: "MAT-5007", description: "Safety Gloves XL", productFamily: "Consumables" },
    { materialId: "MAT-5008", description: "Cleaning Solvent IPA", productFamily: "Consumables" },
    { materialId: "MAT-5009", description: "Paint Primer Zinc", productFamily: "Consumables" },
    { materialId: "MAT-5010", description: "Packaging Foam Insert", productFamily: "Consumables" },
  ];
  await prisma.material.createMany({ data: materials });
  console.log("  Materials created (50)");

  // Inventory - Create entries for key materials at key locations
  const inventoryData = [
    // Stockout risk items (low stock)
    { materialId: "MAT-1001", locationId: "PLT-ATL", onHandQty: 5, availableQty: 5, safetyStock: 50, reorderPoint: 75, maxStock: 200 },
    { materialId: "MAT-2001", locationId: "PLT-ATL", onHandQty: 2, availableQty: 2, safetyStock: 20, reorderPoint: 30, maxStock: 100 },
    { materialId: "MAT-3001", locationId: "PLT-ATL", onHandQty: 100, availableQty: 100, safetyStock: 500, reorderPoint: 750, maxStock: 2000 },
    { materialId: "MAT-1002", locationId: "WH-CHI", onHandQty: 8, availableQty: 8, safetyStock: 30, reorderPoint: 50, maxStock: 150 },
    { materialId: "MAT-2003", locationId: "PLT-FRA", onHandQty: 3, availableQty: 3, safetyStock: 25, reorderPoint: 40, maxStock: 120 },
    { materialId: "MAT-4001", locationId: "PLT-SHA", onHandQty: 10, availableQty: 10, safetyStock: 100, reorderPoint: 150, maxStock: 500 },
    // Excess inventory items (high stock)
    { materialId: "MAT-5001", locationId: "WH-CHI", onHandQty: 5000, availableQty: 5000, safetyStock: 100, reorderPoint: 200, maxStock: 1000 },
    { materialId: "MAT-5002", locationId: "WH-DAL", onHandQty: 3000, availableQty: 3000, safetyStock: 50, reorderPoint: 100, maxStock: 500 },
    { materialId: "MAT-3007", locationId: "PLT-ATL", onHandQty: 8000, availableQty: 8000, safetyStock: 200, reorderPoint: 400, maxStock: 2000 },
    { materialId: "MAT-4008", locationId: "WH-LON", onHandQty: 2000, availableQty: 2000, safetyStock: 50, reorderPoint: 100, maxStock: 300 },
    // Healthy stock items
    { materialId: "MAT-1003", locationId: "PLT-ATL", onHandQty: 150, availableQty: 150, safetyStock: 50, reorderPoint: 80, maxStock: 300 },
    { materialId: "MAT-2002", locationId: "PLT-FRA", onHandQty: 45, availableQty: 45, safetyStock: 15, reorderPoint: 25, maxStock: 80 },
    { materialId: "MAT-3002", locationId: "PLT-SHA", onHandQty: 800, availableQty: 800, safetyStock: 200, reorderPoint: 350, maxStock: 1200 },
    { materialId: "MAT-4003", locationId: "WH-TOK", onHandQty: 60, availableQty: 60, safetyStock: 20, reorderPoint: 35, maxStock: 100 },
    { materialId: "MAT-5003", locationId: "WH-SYD", onHandQty: 200, availableQty: 200, safetyStock: 50, reorderPoint: 80, maxStock: 300 },
    { materialId: "MAT-1004", locationId: "WH-CHI", onHandQty: 120, availableQty: 120, safetyStock: 40, reorderPoint: 60, maxStock: 200 },
    { materialId: "MAT-2004", locationId: "PLT-ATL", onHandQty: 35, availableQty: 35, safetyStock: 10, reorderPoint: 20, maxStock: 60 },
    { materialId: "MAT-3003", locationId: "WH-LON", onHandQty: 500, availableQty: 500, safetyStock: 150, reorderPoint: 250, maxStock: 800 },
    { materialId: "MAT-4002", locationId: "PLT-FRA", onHandQty: 90, availableQty: 90, safetyStock: 30, reorderPoint: 50, maxStock: 150 },
    { materialId: "MAT-5004", locationId: "WH-DAL", onHandQty: 300, availableQty: 300, safetyStock: 80, reorderPoint: 120, maxStock: 500 },
  ];
  await prisma.inventory.createMany({ data: inventoryData });
  console.log("  Inventory created (20 records)");

  // Demand records (next 30 days)
  const now = new Date();
  const demandRecords = [];
  const demandMaterials = [
    { materialId: "MAT-1001", locationId: "PLT-ATL", dailyAvg: 8 },
    { materialId: "MAT-2001", locationId: "PLT-ATL", dailyAvg: 3 },
    { materialId: "MAT-3001", locationId: "PLT-ATL", dailyAvg: 40 },
    { materialId: "MAT-1002", locationId: "WH-CHI", dailyAvg: 5 },
    { materialId: "MAT-2003", locationId: "PLT-FRA", dailyAvg: 4 },
    { materialId: "MAT-4001", locationId: "PLT-SHA", dailyAvg: 12 },
    { materialId: "MAT-5001", locationId: "WH-CHI", dailyAvg: 15 },
    { materialId: "MAT-5002", locationId: "WH-DAL", dailyAvg: 8 },
    { materialId: "MAT-3007", locationId: "PLT-ATL", dailyAvg: 20 },
    { materialId: "MAT-4008", locationId: "WH-LON", dailyAvg: 5 },
    { materialId: "MAT-1003", locationId: "PLT-ATL", dailyAvg: 4 },
    { materialId: "MAT-2002", locationId: "PLT-FRA", dailyAvg: 1 },
    { materialId: "MAT-3002", locationId: "PLT-SHA", dailyAvg: 25 },
    { materialId: "MAT-4003", locationId: "WH-TOK", dailyAvg: 2 },
    { materialId: "MAT-5003", locationId: "WH-SYD", dailyAvg: 5 },
  ];

  for (const dm of demandMaterials) {
    for (let d = 1; d <= 30; d++) {
      const variation = 0.7 + Math.random() * 0.6; // 70%-130% variation
      demandRecords.push({
        materialId: dm.materialId,
        locationId: dm.locationId,
        demandQty: Math.round(dm.dailyAvg * variation),
        demandDate: new Date(now.getTime() + d * 86400000),
        demandType: "FORECAST",
      });
    }
  }
  await prisma.demand.createMany({ data: demandRecords });
  console.log(`  Demand records created (${demandRecords.length})`);

  // Supply records (POs)
  const supplyRecords = [
    { supplyId: "PO-10001", materialId: "MAT-1001", supplierId: "SUP-001", locationId: "PLT-ATL", supplyQty: 100, deliveryDate: new Date(now.getTime() + 10 * 86400000), status: "IN_TRANSIT" as const },
    { supplyId: "PO-10002", materialId: "MAT-2001", supplierId: "SUP-002", locationId: "PLT-ATL", supplyQty: 30, deliveryDate: new Date(now.getTime() + 5 * 86400000), status: "DELAYED" as const },
    { supplyId: "PO-10003", materialId: "MAT-3001", supplierId: "SUP-005", locationId: "PLT-ATL", supplyQty: 500, deliveryDate: new Date(now.getTime() + 3 * 86400000), status: "IN_TRANSIT" as const },
    { supplyId: "PO-10004", materialId: "MAT-1002", supplierId: "SUP-001", locationId: "WH-CHI", supplyQty: 50, deliveryDate: new Date(now.getTime() + 15 * 86400000), status: "PLANNED" as const },
    { supplyId: "PO-10005", materialId: "MAT-2003", supplierId: "SUP-002", locationId: "PLT-FRA", supplyQty: 40, deliveryDate: new Date(now.getTime() + 20 * 86400000), status: "PLANNED" as const },
    { supplyId: "PO-10006", materialId: "MAT-4001", supplierId: "SUP-003", locationId: "PLT-SHA", supplyQty: 200, deliveryDate: new Date(now.getTime() + 7 * 86400000), status: "DELAYED" as const },
    { supplyId: "PO-10007", materialId: "MAT-1003", supplierId: "SUP-001", locationId: "PLT-ATL", supplyQty: 80, deliveryDate: new Date(now.getTime() + 12 * 86400000), status: "IN_TRANSIT" as const },
    { supplyId: "PO-10008", materialId: "MAT-3002", supplierId: "SUP-005", locationId: "PLT-SHA", supplyQty: 400, deliveryDate: new Date(now.getTime() + 8 * 86400000), status: "IN_TRANSIT" as const },
    { supplyId: "PO-10009", materialId: "MAT-4003", supplierId: "SUP-002", locationId: "WH-TOK", supplyQty: 25, deliveryDate: new Date(now.getTime() + 18 * 86400000), status: "PLANNED" as const },
    { supplyId: "PO-10010", materialId: "MAT-3001", supplierId: "SUP-004", locationId: "PLT-ATL", supplyQty: 300, deliveryDate: new Date(now.getTime() + 25 * 86400000), status: "DELAYED" as const },
  ];
  await prisma.supply.createMany({ data: supplyRecords });
  console.log("  Supply/PO records created (10)");

  // Pre-computed Risks
  const risks = [
    {
      materialId: "MAT-1001", locationId: "PLT-ATL", riskType: "STOCKOUT" as const, severity: "CRITICAL" as const,
      confidence: 0.92, status: "OPEN" as const,
      description: "Projected stockout for Hydraulic Pump Assembly at Atlanta Plant. Current on-hand: 5 units, projected demand: 240 units over 30 days, inbound supply: 100 units. Deficit: 135 units.",
      recommendation: "Expedite 135 units of MAT-1001 or transfer from alternate location. Contact TechParts Global for emergency shipment.",
      projectedImpact: "135 units short within 30 days, potential production line stoppage",
    },
    {
      materialId: "MAT-2001", locationId: "PLT-ATL", riskType: "STOCKOUT" as const, severity: "CRITICAL" as const,
      confidence: 0.95, status: "OPEN" as const,
      description: "Critical stockout for AC Servo Motor 5kW at Atlanta Plant. Only 2 units on hand, PO-10002 is DELAYED. Daily demand ~3 units.",
      recommendation: "Immediately contact Pacific Components for PO-10002 status. Source from alternate supplier if delivery cannot be expedited within 48 hours.",
      projectedImpact: "Production halt within 1 day without expedite action",
    },
    {
      materialId: "MAT-3001", locationId: "PLT-ATL", riskType: "STOCKOUT" as const, severity: "WARNING" as const,
      confidence: 0.78, status: "OPEN" as const,
      description: "Steel Plate A36 at Atlanta Plant below safety stock. On-hand: 100 units, safety stock: 500, with 800 units inbound but high demand rate.",
      recommendation: "Monitor PO-10003 delivery closely. Place additional order for 400 units to maintain buffer stock.",
      projectedImpact: "Below safety stock by 400 units",
    },
    {
      materialId: "MAT-1002", locationId: "WH-CHI", riskType: "STOCKOUT" as const, severity: "WARNING" as const,
      confidence: 0.82, status: "OPEN" as const,
      description: "Pressure Relief Valve at Chicago DC approaching stockout. 8 units on hand, 150 units demand expected, resupply not due for 15 days.",
      recommendation: "Expedite PO-10004 from TechParts Global. Consider inter-warehouse transfer from Atlanta.",
      projectedImpact: "92 units short before resupply arrives",
    },
    {
      materialId: "MAT-2003", locationId: "PLT-FRA", riskType: "STOCKOUT" as const, severity: "WARNING" as const,
      confidence: 0.75, status: "ACKNOWLEDGED" as const,
      description: "Proximity Sensor at Frankfurt Plant. 3 units remaining, resupply planned in 20 days. May impact sensor calibration schedule.",
      recommendation: "Place expedite request with Pacific Components or source locally in EU market.",
      projectedImpact: "Sensor installation backlog within 1 week",
    },
    {
      materialId: "MAT-4001", locationId: "PLT-SHA", riskType: "STOCKOUT" as const, severity: "CRITICAL" as const,
      confidence: 0.88, status: "OPEN" as const,
      description: "Ball Bearing 6205-2RS at Shanghai Plant critically low. 10 units on hand, demand: 360 units. PO-10006 from Dragon Materials is DELAYED.",
      recommendation: "Escalate with Dragon Materials Ltd. Engage alternate supplier Midwest Steel Corp for emergency supply.",
      projectedImpact: "350 units short, bearing assembly line at risk",
    },
    {
      materialId: "MAT-5001", locationId: "WH-CHI", riskType: "EXCESS" as const, severity: "WARNING" as const,
      confidence: 0.85, status: "OPEN" as const,
      description: "Excess inventory for Lubricant Synthetic ISO 68 at Chicago DC. 5000 units on hand providing 333 days of coverage (threshold: 90 days).",
      recommendation: "Transfer 3,650 units to locations with higher demand. Reduce next purchase order quantity.",
      projectedImpact: "3,650 excess units, ~$182,500 carrying cost",
    },
    {
      materialId: "MAT-5002", locationId: "WH-DAL", riskType: "EXCESS" as const, severity: "WARNING" as const,
      confidence: 0.82, status: "OPEN" as const,
      description: "Welding Wire ER70S-6 at Dallas Warehouse. 3000 units on hand, 375 days of coverage.",
      recommendation: "Redistribute 2,280 units to other facilities. Review demand forecast accuracy.",
      projectedImpact: "2,280 excess units",
    },
    {
      materialId: "MAT-3007", locationId: "PLT-ATL", riskType: "EXCESS" as const, severity: "CRITICAL" as const,
      confidence: 0.9, status: "OPEN" as const,
      description: "HDPE Resin Pellets at Atlanta Plant severely overstocked. 8000 units on hand = 400 days coverage. Max stock: 2000.",
      recommendation: "Immediately stop new orders. Transfer 6,200 units to other plants. Consider selling excess on spot market.",
      projectedImpact: "6,200 excess units, ~$310,000 in tied-up capital",
    },
    {
      supplierId: "SUP-004", materialId: "MAT-3001", locationId: "PLT-ATL", riskType: "SUPPLIER" as const, severity: "CRITICAL" as const,
      confidence: 0.93, status: "OPEN" as const,
      description: "Supplier Atlas Raw Materials (Russia) has reliability score of 45%. PO-10010 is delayed. Geopolitical risk elevated.",
      recommendation: "Qualify alternate supplier for materials sourced from Atlas Raw Materials. Implement dual-sourcing strategy immediately.",
      projectedImpact: "1 material at risk of supply disruption from geopolitically exposed supplier",
    },
    {
      supplierId: "SUP-003", materialId: "MAT-4001", locationId: "PLT-SHA", riskType: "SUPPLIER" as const, severity: "WARNING" as const,
      confidence: 0.88, status: "OPEN" as const,
      description: "Dragon Materials Ltd (China) reliability declining at 62%. PO-10006 delayed. 28-day lead time compounds risk.",
      recommendation: "Engage backup supplier for Ball Bearings. Schedule supplier performance review with Dragon Materials.",
      projectedImpact: "2 active POs at risk of further delays",
    },
    {
      supplierId: "SUP-006", materialId: "MAT-2002", locationId: "PLT-FRA", riskType: "SUPPLIER" as const, severity: "LOW" as const,
      confidence: 0.7, status: "OPEN" as const,
      description: "EuroChemicals AG (Switzerland) reliability at 78%, approaching warning threshold. Monitor closely.",
      recommendation: "Schedule quarterly business review with EuroChemicals. Maintain safety stock buffer for affected materials.",
      projectedImpact: "Potential future supply disruption if reliability continues declining",
    },
  ];
  await prisma.risk.createMany({ data: risks });
  console.log("  Risk records created (12)");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
