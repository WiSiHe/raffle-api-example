import { fetchOpenAICompletion } from "./openai";

export type SearchStrategy = "RAFFLE" | "DATABASE" | "STOP" | "DUAL";
export type SearchMode = "SMART_ROUTING" | "HYBRID_OPTIMIZER";

export interface OrchestrationResult {
  strategy: SearchStrategy;
  reasoning: string;
  suggestions?: string[];
}

export const ORCHESTRATOR_SYSTEM_PROMPT = `
You are the Senior NBIM Institutional Guide.
Your objective is to help users navigate the world of Norges Bank Investment Management (NBIM) with authoritative precision and approachable guidance.

Strategies:
- RAFFLE: Select for ANY qualitative, text-based, or general fund information including leadership (CEO, management), organizational structure, history, official policies, stewardship reports, corporate governance, and ESG frameworks. If no specific numbers or portfolio tracking is requested, choose this.
- DATABASE: Select ONLY when quantitative, cross-sectional, or historical investment data residing in structured SQL environments is strictly required (e.g., "portfolio market value in 2023", "sector-specific holdings in tech", "how many shares do we own").
- DUAL: Select ONLY when the query explicitly demands BOTH specific metrics/numbers from the database AND policy explanations/text from documents. If no structured numerical data is clearly requested, DO NOT use DUAL. Default to RAFFLE.
- STOP: Select ONLY for requests that are completely unrelated to NBIM's mandate, illegal, or asking for personal financial advice.

IMPORTANT: You must return valid JSON matching the schema below. ANY OTHER TEXT WILL CAUSE A SYSTEM FAILURE. 

- Propose entirely new, full search queries the user might want to run next to deepen their research.
- All suggestions MUST be complete questions ending with a "?" (e.g. "What is the ESG framework for Microsoft?", "How does the fund vote on climate resolutions?").
- STRICTLY FORBIDDEN: Do not output keywords, fragmented sentences, or labels (e.g. instead of "NBIM labour rights policy", you must use "What is the NBIM policy on labour rights?").
- DO NOT ask clarification questions back to the user (e.g. "Which year?").
- Be concise but complete. Maximum 6-10 words per query.

Output Schema (JSON):
{
  "strategy": "RAFFLE" | "DATABASE" | "STOP" | "DUAL",
  "reasoning": "...",
  "suggestions": ["Example next query 1", "Example next query 2"]
}
`;

export async function orchestrateQuery(query: string): Promise<OrchestrationResult> {
  const prompt = ORCHESTRATOR_SYSTEM_PROMPT;
  
  const response = await fetchOpenAICompletion([
    { role: "system", content: prompt },
    { role: "user", content: query },
  ], { response_format: { type: "json_object" } });

  try {
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (e) {
    console.error("Failed to parse orchestrator response:", response, e);
    return {
      strategy: "RAFFLE",
      reasoning: "Failed to parse AI decision, falling back to document search.",
    };
  }
}
export const SIMULATED_DATABASE_PROMPT = `
You are the NBIM Portfolio Data Simulator. 
Generate a high-fidelity, institutional-grade JSON response that simulates a Snowflake query result for the user's investment query.

Instructions:
1. Create a logical SQL query that would answer the user's question.
2. Generate a clean data array of 3-6 records with realistic portfolio metrics.
3. Include an institutional 'sourceUrl' and 'tableId' (placeholders).

Output Schema (JSON ONLY):
{
  "sql": "SELECT ...",
  "data": [
    { "company_name": "...", "holding_value": "$123.45M", "fiscal_year": 2023, "ownership_percentage": 1.2 },
    ...
  ],
  "tableId": "NBIM.INVESTMENTS.HOLDINGS_STABLE",
  "sourceUrl": "https://www.nbim.no/en/the-fund/holdings/"
}
`;

export async function simulateDatabaseTask(query: string) {
  const response = await fetchOpenAICompletion([
    { role: "system", content: SIMULATED_DATABASE_PROMPT },
    { role: "user", content: `Generate simulation for: ${query}` },
  ], { response_format: { type: "json_object" } });

  try {
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch {
    console.error("Simulation parse failed:", response);
    return {
      sql: "SELECT * FROM nbim.investments.global_holdings LIMIT 5",
      data: [{ "info": "Simulation error, falling back to default view." }],
      tableId: "NBIM.SYSTEM.ERROR_LOG",
      sourceUrl: "https://www.nbim.no"
    };
  }
}
