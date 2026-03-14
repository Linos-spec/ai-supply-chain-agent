import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;

  if (!file || !type) {
    return NextResponse.json({ success: false, message: "File and type are required" }, { status: 400 });
  }

  try {
    const text = await file.text();
    let records: Record<string, unknown>[] = [];

    if (file.name.endsWith(".json")) {
      records = JSON.parse(text);
    } else if (file.name.endsWith(".csv")) {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      records = parsed.data as Record<string, unknown>[];
    } else {
      return NextResponse.json({ success: false, message: "Unsupported file format. Use CSV or JSON." }, { status: 400 });
    }

    let count = 0;
    const errors: string[] = [];

    switch (type) {
      case "materials":
        for (const r of records) {
          try {
            await prisma.material.upsert({
              where: { materialId: String(r.materialId || r.material_id) },
              update: { description: String(r.description || ""), productFamily: String(r.productFamily || r.product_family || "") },
              create: { materialId: String(r.materialId || r.material_id), description: String(r.description || ""), productFamily: String(r.productFamily || r.product_family || "") },
            });
            count++;
          } catch (e) {
            errors.push(`Row ${count + 1}: ${(e as Error).message}`);
          }
        }
        break;

      case "suppliers":
        for (const r of records) {
          try {
            await prisma.supplier.upsert({
              where: { supplierId: String(r.supplierId || r.supplier_id) },
              update: {
                name: String(r.name || ""),
                country: String(r.country || ""),
                reliabilityScore: Number(r.reliabilityScore || r.reliability_score || 0.95),
                leadTimeDays: Number(r.leadTimeDays || r.lead_time_days || 14),
              },
              create: {
                supplierId: String(r.supplierId || r.supplier_id),
                name: String(r.name || ""),
                country: String(r.country || ""),
                reliabilityScore: Number(r.reliabilityScore || r.reliability_score || 0.95),
                leadTimeDays: Number(r.leadTimeDays || r.lead_time_days || 14),
              },
            });
            count++;
          } catch (e) {
            errors.push(`Row ${count + 1}: ${(e as Error).message}`);
          }
        }
        break;

      case "inventory":
        for (const r of records) {
          try {
            await prisma.inventory.upsert({
              where: {
                materialId_locationId: {
                  materialId: String(r.materialId || r.material_id),
                  locationId: String(r.locationId || r.location_id),
                },
              },
              update: {
                onHandQty: Number(r.onHandQty || r.on_hand_qty || 0),
                availableQty: Number(r.availableQty || r.available_qty || 0),
                safetyStock: Number(r.safetyStock || r.safety_stock || 0),
                reorderPoint: Number(r.reorderPoint || r.reorder_point || 0),
              },
              create: {
                materialId: String(r.materialId || r.material_id),
                locationId: String(r.locationId || r.location_id),
                onHandQty: Number(r.onHandQty || r.on_hand_qty || 0),
                availableQty: Number(r.availableQty || r.available_qty || 0),
                safetyStock: Number(r.safetyStock || r.safety_stock || 0),
                reorderPoint: Number(r.reorderPoint || r.reorder_point || 0),
              },
            });
            count++;
          } catch (e) {
            errors.push(`Row ${count + 1}: ${(e as Error).message}`);
          }
        }
        break;

      case "demand":
        for (const r of records) {
          try {
            await prisma.demand.create({
              data: {
                materialId: String(r.materialId || r.material_id),
                locationId: String(r.locationId || r.location_id),
                demandQty: Number(r.demandQty || r.demand_qty || 0),
                demandDate: new Date(String(r.demandDate || r.demand_date)),
              },
            });
            count++;
          } catch (e) {
            errors.push(`Row ${count + 1}: ${(e as Error).message}`);
          }
        }
        break;

      case "supply":
        for (const r of records) {
          try {
            await prisma.supply.upsert({
              where: { supplyId: String(r.supplyId || r.supply_id) },
              update: {
                materialId: String(r.materialId || r.material_id),
                supplierId: String(r.supplierId || r.supplier_id),
                locationId: String(r.locationId || r.location_id),
                supplyQty: Number(r.supplyQty || r.supply_qty || 0),
                deliveryDate: new Date(String(r.deliveryDate || r.delivery_date)),
              },
              create: {
                supplyId: String(r.supplyId || r.supply_id),
                materialId: String(r.materialId || r.material_id),
                supplierId: String(r.supplierId || r.supplier_id),
                locationId: String(r.locationId || r.location_id),
                supplyQty: Number(r.supplyQty || r.supply_qty || 0),
                deliveryDate: new Date(String(r.deliveryDate || r.delivery_date)),
              },
            });
            count++;
          } catch (e) {
            errors.push(`Row ${count + 1}: ${(e as Error).message}`);
          }
        }
        break;

      default:
        return NextResponse.json({ success: false, message: `Unknown data type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? `Successfully imported ${count} ${type} records.` : `Imported ${count} records with ${errors.length} errors.`,
      count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: `Import failed: ${(error as Error).message}` }, { status: 500 });
  }
}
