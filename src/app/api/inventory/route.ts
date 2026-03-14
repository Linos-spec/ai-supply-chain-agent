import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const inventory = await prisma.inventory.findMany({
    include: {
      material: true,
      location: true,
    },
    orderBy: { material: { materialId: "asc" } },
  });

  return NextResponse.json(inventory);
}
