import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const version = result[0]?.version || "PostgreSQL";
    // Extract short version like "PostgreSQL 15.2"
    const match = version.match(/PostgreSQL\s+\d+(\.\d+)?/);
    return NextResponse.json({ ok: true, db: `Connected — ${match ? match[0] : "PostgreSQL"}` });
  } catch (error) {
    return NextResponse.json(
      { ok: false, db: `Connection failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
