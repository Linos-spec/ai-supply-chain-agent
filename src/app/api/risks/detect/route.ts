import { NextResponse } from "next/server";
import { runFullRiskDetection } from "@/lib/risk-engine";

export async function POST() {
  const results = await runFullRiskDetection();
  return NextResponse.json(results);
}
