import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: {
        select: {
          supply: true,
          risks: { where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } } },
        },
      },
    },
    orderBy: { reliabilityScore: "asc" },
  });

  return NextResponse.json(suppliers);
}
