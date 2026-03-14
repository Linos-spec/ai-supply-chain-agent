import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const riskType = searchParams.get("riskType");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (riskType) where.riskType = riskType;
  if (severity) where.severity = severity;
  if (status) where.status = status;
  else where.status = { in: ["OPEN", "ACKNOWLEDGED"] };

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { material: { description: { contains: search, mode: "insensitive" } } },
      { material: { materialId: { contains: search, mode: "insensitive" } } },
    ];
  }

  const risks = await prisma.risk.findMany({
    where,
    include: {
      material: true,
      location: true,
      supplier: true,
    },
    orderBy: [
      { severity: "asc" },
      { detectedAt: "desc" },
    ],
  });

  return NextResponse.json(risks);
}
