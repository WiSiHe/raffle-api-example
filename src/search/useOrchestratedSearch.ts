import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orchestrateQuery, OrchestrationResult, SearchStrategy, SearchMode, ORCHESTRATOR_SYSTEM_PROMPT, simulateDatabaseTask } from '../api/orchestrator';
import { fetchSearchResults, streamRaffleSummary, fetchTopQuestions } from '../api/api';
import { streamOpenAICompletion } from '../api/openai';
import { SearchResult, SummaryResponse } from '../types';

export type OrchestrationStep = 'idle' | 'orchestrating' | 'executing' | 'completed' | 'error';

export interface DatabaseResult {
  sql: string;
  data: Record<string, unknown>[];
  sourceUrl?: string;
  tableId?: string;
}

export interface Timings {
  orchestrator?: number;
  raffle?: number;
  database?: number;
  ai?: number;
}

const COST_MODEL = {
  ORCHESTRATOR: 0.0002, // 20 micro-cents per routing decision
  RAFFLE: 0.10,         // Enterprise scaled price approximation based on 9.7 DKK / convo tier
  DATABASE: 0.0001,     // 10 micro-cents for SQL simulation
  AI_SYNTHESIS: 0.0005, // 50 micro-cents for summary generation
  AI_MERGE: 0.0008,     // 80 micro-cents for complex hybrid merging
};

async function fetchDatabaseResults(query: string): Promise<DatabaseResult> {
  // Use OpenAI to simulate the database response for institutional stability
  const result = await simulateDatabaseTask(query);
  
  // Add synthetic institutional latency (1.2s - 2.5s)
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1300));
  
  return result;
}

export function useOrchestratedSearch(initialMode: SearchMode = 'SMART_ROUTING') {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [step, setStep] = useState<OrchestrationStep>('idle');
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);
  const [openAIResult, setOpenAIResult] = useState<string>('');
  const [dbResult, setDbResult] = useState<DatabaseResult | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [timings, setTimings] = useState<Timings>({});
  const [totalCost, setTotalCost] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<string>('Ready');
  
  const startTimeRef = useRef<number>(0);
  const instantRaffleRef = useRef<Promise<SearchResult[]> | null>(null);

  // Raffle results
  const [raffleSummary, setRaffleSummary] = useState<SummaryResponse | null>(null);
  const [raffleResults, setRaffleResults] = useState<SearchResult[]>([]);

  const orchestrateMutation = useMutation({
    mutationFn: (variables: { query: string; mode: SearchMode }) => orchestrateQuery(variables.query),
    onSuccess: async (data) => {
      const orchTime = performance.now();
      setTimings(prev => ({ ...prev, orchestrator: Math.round((orchTime - startTimeRef.current) / 100) / 10 }));
      
      // Add orchestrator cost
      setTotalCost(prev => prev + COST_MODEL.ORCHESTRATOR);

      let enrichedSuggestions = data.suggestions || [];
      if (data.strategy === 'STOP') {
        try {
          const topQuestions = await fetchTopQuestions();
          enrichedSuggestions = topQuestions.slice(0, 5).map(q => q.question);
        } catch (e) {
          console.warn('[Raffle] Failed to fetch top questions:', e);
        }
      }

      setOrchestration({ ...data, suggestions: enrichedSuggestions });
      
      if (data.strategy === 'STOP') {
        finishWorkflow();
        return;
      }
      setStep('executing');
      setLoadingStatus('Correlating intelligent strategies...');

      if (mode === 'HYBRID_OPTIMIZER') {
        executeHybridStrategy(data.strategy, query);
      } else {
        executeStandardStrategy(data.strategy, query);
      }
    },
    onError: () => {
      setStep('error');
    },
  });

  const finishWorkflow = () => {
    const endTime = performance.now();
    setDuration(Math.round((endTime - startTimeRef.current) / 100) / 10);
    setLoadingStatus('Completed');
    setStep('completed');
  };

  const getRaffleTasks = (searchQuery: string, execStart: number) => {
    setTotalCost(prev => prev + COST_MODEL.RAFFLE);

    let resultsPromise = instantRaffleRef.current;
    if (!resultsPromise) {
      resultsPromise = fetchSearchResults(searchQuery).then(results => {
        setRaffleResults(results);
        return results;
      });
    }

    const summaryPromise = streamRaffleSummary(searchQuery, (chunk) => {
      setLoadingStatus('Synthesizing API knowledge...');
      setRaffleSummary((prev) => {
        if (!prev) return { status: "success", summary: chunk, references: [] };
        return { ...prev, summary: prev.summary + chunk };
      });
    }).then(finalSummary => {
      const time = Math.round((performance.now() - execStart) / 100) / 10;
      setTimings(prev => ({ ...prev, raffle: time }));
      setRaffleSummary(finalSummary);
      return finalSummary;
    });

    return [resultsPromise, summaryPromise];
  };

  const getDatabaseTasks = (searchQuery: string, execStart: number) => {
    setTotalCost(prev => prev + COST_MODEL.DATABASE);
    
    const dbPromise = fetchDatabaseResults(searchQuery).then(result => {
      const time = Math.round((performance.now() - execStart) / 100) / 10;
      setTimings(prev => ({ ...prev, database: time }));
      setDbResult(result);
      return result;
    }).catch(err => {
      console.error('[Snowflake] Query failed:', err);
      // Fallback or error handling
      setStep('error');
      throw err;
    });

    return [dbPromise];
  };

  const executeStandardStrategy = async (strategy: SearchStrategy, searchQuery: string) => {
    if (strategy === 'DUAL') {
      return executeHybridStrategy('DUAL', searchQuery);
    }

    const tasks: Promise<unknown>[] = [];
    const execStart = performance.now();

    if (strategy === 'RAFFLE') {
      tasks.push(...getRaffleTasks(searchQuery, execStart));
    }

    if (strategy === 'DATABASE') {
      const [dbPromise] = getDatabaseTasks(searchQuery, execStart);
      tasks.push(dbPromise.then(async (dbResults) => {
        setTotalCost(prev => prev + COST_MODEL.AI_SYNTHESIS);
        const aiStart = performance.now();
        await streamOpenAICompletion([
          { role: 'system', content: 'Summarize this structured data concisely (under 80 words).' },
          { role: 'user', content: JSON.stringify(dbResults.data.slice(0, 10)) },
        ], (chunk) => {
          setLoadingStatus('Interpreting structured queries...');
          setOpenAIResult(prev => prev + chunk);
        });
        setTimings(prev => ({ ...prev, ai: Math.round((performance.now() - aiStart) / 100) / 10 }));
      }));
    }

    await Promise.all(tasks);
    finishWorkflow();
  };

  const executeHybridStrategy = async (_strategy: SearchStrategy, searchQuery: string) => {
    // Hybrid Optimizer Mode ALWAYS performs both document and database searches
    // unless the orchestrator definitively flagged it as STOP.
    
    // Fire both parallel regardless of the strategy's internal choice (RAFFLE/DATABASE)
    // as the user wants full coverage in Hybrid mode.

    const execStart = performance.now();
    
    // Fire both parallel
    const raffleTasks = getRaffleTasks(searchQuery, execStart);
    const [dbPromise] = getDatabaseTasks(searchQuery, execStart);

    await Promise.all([
      Promise.all(raffleTasks),
      dbPromise
    ]);

    finishWorkflow();
  };

  const handleSearch = (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) return;

    startTimeRef.current = performance.now();
    setStep('orchestrating');
    setLoadingStatus('Initializing query routing...');
    setOrchestration(null);
    setOpenAIResult('');
    setDbResult(null);
    setRaffleSummary(null);
    setRaffleResults([]);
    setDuration(null);
    setTimings({});
    setTotalCost(0);
    
    instantRaffleRef.current = fetchSearchResults(trimmed).then(results => {
      setRaffleResults(results);
      setLoadingStatus('Instant matches fetched...');
      return results;
    });

    orchestrateMutation.mutate({ query: trimmed, mode });
  };

  const clearQuery = () => {
    setQuery('');
    setStep('idle');
    setOrchestration(null);
    setDuration(null);
    setTimings({});
    setTotalCost(0);
  };

  const runSuggestion = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  return {
    query,
    setQuery,
    mode,
    setMode,
    step,
    orchestration,
    openAIResult,
    dbResult,
    raffleSummary,
    raffleResults,
    duration,
    timings,
    totalCost,
    loadingStatus,
    handleSearch,
    clearQuery,
    runSuggestion,
    orchestratorPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
  };
}



