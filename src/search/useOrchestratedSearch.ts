import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orchestrateQuery, OrchestrationResult, SearchStrategy, ORCHESTRATOR_SYSTEM_PROMPT } from '../api/orchestrator';
import { fetchSearchResults, fetchSuggestions, streamRaffleSummary } from '../api/api';
import { streamOpenAICompletion } from '../api/openai';

export type OrchestrationStep = 'idle' | 'orchestrating' | 'executing' | 'completed' | 'error';

export interface DatabaseResult {
  sql: string;
  data: any[];
  sourceUrl?: string;
  tableId?: string;
}

export interface Timings {
  orchestrator?: number;
  raffle?: number;
  database?: number;
  ai?: number;
}

export function useOrchestratedSearch() {
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<OrchestrationStep>('idle');
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);
  const [openAIResult, setOpenAIResult] = useState<string>('');
  const [dbResult, setDbResult] = useState<DatabaseResult | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [timings, setTimings] = useState<Timings>({});
  const [totalCost, setTotalCost] = useState<number>(0);
  
  const startTimeRef = useRef<number>(0);

  // Raffle results
  const [raffleSummary, setRaffleSummary] = useState<any>(null);
  const [raffleResults, setRaffleResults] = useState<any[]>([]);

  const orchestrateMutation = useMutation({
    mutationFn: orchestrateQuery,
    onSuccess: async (data) => {
      const orchTime = performance.now();
      setTimings(prev => ({ ...prev, orchestrator: Math.round((orchTime - startTimeRef.current) / 100) / 10 }));
      
      // Fetch Raffle suggestions concurrently to enrich the orchestrator's results
      let enrichedSuggestions = data.suggestions || [];
      if (data.strategy !== 'STOP') {
        try {
          const raffleSugg = await fetchSuggestions(query);
          // Merge and deduplicate (limit to 6 total)
          const allSuggestions = Array.from(new Set([...enrichedSuggestions, ...raffleSugg.map(s => s.suggestion)]));
          enrichedSuggestions = allSuggestions.slice(0, 6);
        } catch (e) {
          console.warn('[Raffle] Failed to fetch enriched suggestions:', e);
        }
      }

      setOrchestration({ ...data, suggestions: enrichedSuggestions });
      
      // Calculate initial strategy cost
      let cost = 0;
      if (data.strategy === 'RAFFLE') cost = 0.05;
      else if (data.strategy === 'DATABASE') cost = 0.01;
      else if (data.strategy === 'DUAL') cost = 0.07; // Raffle + AI
      setTotalCost(cost);

      if (data.strategy === 'STOP') {
        finishWorkflow();
        return;
      }
      setStep('executing');
      executeStrategy(data.strategy, query);
    },
    onError: () => {
      setStep('error');
    },
  });

  const finishWorkflow = () => {
    const endTime = performance.now();
    setDuration(Math.round((endTime - startTimeRef.current) / 100) / 10); // rounded to 1 decimal
    setStep('completed');
  };

  const executeStrategy = async (strategy: SearchStrategy, searchQuery: string) => {
    try {
      const tasks: Promise<any>[] = [];
      const execStart = performance.now();

      if (strategy === 'RAFFLE' || strategy === 'DUAL') {
        // Fetch results and stream summary in parallel
        const resultsPromise = fetchSearchResults(searchQuery).then(results => {
          setRaffleResults(results);
          return results;
        });

        const summaryPromise = streamRaffleSummary(searchQuery, (chunk) => {
          setRaffleSummary((prev: any) => {
            if (!prev) {
              return {
                status: "success",
                summary: chunk,
                references: [],
              };
            }
            return {
              ...prev,
              summary: prev.summary + chunk,
            };
          });
        }).then(finalSummary => {
          const time = Math.round((performance.now() - execStart) / 100) / 10;
          setTimings(prev => ({ ...prev, raffle: time }));
          setRaffleSummary(finalSummary);
          return finalSummary;
        });

        tasks.push(Promise.all([resultsPromise, summaryPromise]));
      }

      if (strategy === 'DUAL') {
        const aiStart = performance.now();
        tasks.push(
          streamOpenAICompletion(
            [
              {
                role: 'system',
                content: `You are a Senior NBIM Institutional Analyst. Provide a high-density executive summary based on the user request, focusing exclusively on key structured findings from fund documentation. 
                
                TONAL GUIDELINES:
                - Tone: Precise, authoritative, and extremely concise. 
                - Format: Use bullet points for structured data or key highlights. 
                - Constraint: Do not exceed 100 words. Avoid preamble and generalized context.
                
                STRICT CONSTRAINTS:
                - Cite evidence using [1], [2], [3] for core claims.
                - Prioritize specific policy mandates (e.g., "GPFG Management Mandate") and quantitative data.
                - Focus on "Structured Highlights": extracting the most important takeaways from the search results.`,
              },
              { role: 'user', content: searchQuery },
            ],
            (chunk) => setOpenAIResult(prev => prev + chunk)
          ).then(() => {
            const time = Math.round((performance.now() - aiStart) / 100) / 10;
            setTimings(prev => ({ ...prev, ai: time }));
          })
        );
      } else if (strategy === 'DATABASE') {

        const dbStart = performance.now();
        // Mock Snowflake execution
        const dbPromise = new Promise<{ data: any[] }>(resolve => setTimeout(() => {
          // Robust extracted company for the mock
          const knownCompanies = ['Apple', 'Microsoft', 'Nvidia', 'Meta', 'Alphabet', 'Amazon', 'Tesla'];
          const extractedCompany = knownCompanies.find(c => searchQuery.toLowerCase().includes(c.toLowerCase())) || 'Nvidia';

          const result = {
            sql: `SELECT company_name, holding_value, fiscal_year, fund_percentage 
FROM investments 
WHERE company_name ILIKE '%${extractedCompany}%';`,
            data: [
              { company_name: `${extractedCompany} Inc.`, holding_value: "$23.4B", fiscal_year: 2024, fund_percentage: "0.85%" },
              { company_name: `${extractedCompany} Global`, holding_value: "$19.1B", fiscal_year: 2024, fund_percentage: "0.72%" }
            ],
            sourceUrl: "https://www.nbim.no/en/the-fund/investments/#/",
            tableId: `SNOWFLAKE_P_INVESTMENTS_2024`
          };
          const time = Math.round((performance.now() - dbStart) / 100) / 10;
          setTimings(prev => ({ ...prev, database: time }));
          setDbResult(result);
          resolve(result);
        }, 1500));

        tasks.push(dbPromise.then(async (dbResults) => {
          const aiStart = performance.now();
          // Truncate data for the summarizer to prevent response truncation if the table is huge
          const summarizedData = dbResults.data.slice(0, 10);

          // Generate an AI summary for the database results
          await streamOpenAICompletion(
            [
              {
                role: 'system',
                content: `You are a Senior NBIM Institutional Analyst. Provide a concise executive summary of the following structured investment data.
                Focus on the core holdings, their market value, and fund ownership percentages. 
                Be authoritative and data-driven. Keep it under 80 words.`,
              },
              { 
                role: 'user', 
                content: `Please summarize this data for the query "${searchQuery}": ${JSON.stringify(summarizedData)}` 
              },
            ],
            (chunk) => setOpenAIResult(prev => prev + chunk)
          );
          const time = Math.round((performance.now() - aiStart) / 100) / 10;
          setTimings(prev => ({ ...prev, ai: time }));
        }));
      }

      await Promise.all(tasks);
      finishWorkflow();
    } catch (e) {
      console.error('Execution failed:', e);
      setStep('error');
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    startTimeRef.current = performance.now();
    setStep('orchestrating');
    setOrchestration(null);
    setOpenAIResult('');
    setDbResult(null);
    setRaffleSummary(null);
    setRaffleResults([]);
    setDuration(null);
    setTimings({});
    
    orchestrateMutation.mutate(trimmed);
  };

  const clearQuery = () => {
    setQuery('');
    setStep('idle');
    setOrchestration(null);
    setDuration(null);
    setTimings({});
  };

  const runSuggestion = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  return {
    query,
    setQuery,
    step,
    orchestration,
    openAIResult,
    dbResult,
    raffleSummary,
    raffleResults,
    duration,
    timings,
    totalCost,
    handleSearch,
    clearQuery,
    runSuggestion,
    orchestratorPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
  };
}



