import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateRiskExplanation(riskContext: {
  riskType: string;
  severity: string;
  description: string;
  recommendation: string;
  materialDescription?: string;
  locationName?: string;
  supplierName?: string;
  onHandQty?: number;
  demandQty?: number;
  supplyQty?: number;
  safetyStock?: number;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a supply chain intelligence analyst. Provide a clear, concise business explanation for the following supply chain risk. Use plain business language that a supply planner can understand and act on.

Risk Type: ${riskContext.riskType}
Severity: ${riskContext.severity}
Description: ${riskContext.description}
Current Recommendation: ${riskContext.recommendation}
${riskContext.materialDescription ? `Material: ${riskContext.materialDescription}` : ""}
${riskContext.locationName ? `Location: ${riskContext.locationName}` : ""}
${riskContext.supplierName ? `Supplier: ${riskContext.supplierName}` : ""}
${riskContext.onHandQty !== undefined ? `On-Hand Qty: ${riskContext.onHandQty}` : ""}
${riskContext.demandQty !== undefined ? `Projected Demand: ${riskContext.demandQty}` : ""}
${riskContext.supplyQty !== undefined ? `Inbound Supply: ${riskContext.supplyQty}` : ""}
${riskContext.safetyStock !== undefined ? `Safety Stock: ${riskContext.safetyStock}` : ""}

Provide:
1. Root Cause: What is causing this risk (2-3 sentences)
2. Business Impact: What happens if no action is taken (1-2 sentences)
3. Recommended Actions: Prioritized list of 2-3 specific actions the planner should take
4. Timeline: How urgently this needs attention`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.text || "Unable to generate explanation.";
}

export async function generateActionRecommendation(context: {
  risks: Array<{
    riskType: string;
    severity: string;
    description: string;
    materialId: string;
  }>;
}): Promise<string> {
  const riskSummary = context.risks
    .map(
      (r, i) =>
        `${i + 1}. [${r.severity}] ${r.riskType}: ${r.description} (Material: ${r.materialId})`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are a supply chain optimization advisor. Given the following active supply chain risks, provide a prioritized action plan.

Active Risks:
${riskSummary}

Provide a consolidated action plan that:
1. Groups related actions together
2. Prioritizes by severity and business impact
3. Identifies quick wins vs longer-term fixes
4. Estimates effort level for each action (Low/Medium/High)

Format as a numbered action plan with clear owners (Planner, Buyer, Warehouse) and timelines.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.text || "Unable to generate recommendations.";
}
