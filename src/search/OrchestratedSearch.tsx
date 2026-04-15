import React from 'react';
import { Brain, Search as SearchIcon, Sparkles, Loader2, CheckCircle2, ChevronRight, Database, ShieldAlert, MessageSquare, Terminal, Clock, Zap, ExternalLink, FileText, Info, Code } from 'lucide-react';
import { SearchForm } from './SearchForm';
import { SummarySection } from './SummarySection';
import { ResultsSection } from './ResultsSection';
import { useOrchestratedSearch } from './useOrchestratedSearch';
import { cn } from '../lib/utils';

function formatText(text: string) {
  if (!text) return { __html: '' };
  
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-nbim-midnight">$1</strong>')
    .replace(/\[(\d+)\]/g, '<sup class="text-emerald-500 font-bold ml-0.5">[$1]</sup>');
    
  const lines = formatted.split('\n');
  let inList = false;
  let html = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html += '<ul class="my-4 space-y-3 ml-5">';
        inList = true;
      }
      html += `<li class="list-disc marker:text-emerald-400 pl-1">${trimmed.slice(2)}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (trimmed) {
        html += `<p class="mb-4">${trimmed}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';
  
  return { __html: html };
}

function ScanningLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-nbim-sea/40 to-transparent w-full animate-scan" />
    </div>
  );
}

function RaffleSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-3/4 bg-nbim-midnight/10 rounded" />
          <div className="h-3 w-1/2 bg-nbim-midnight/5 rounded" />
          <div className="space-y-1">
            <div className="h-2 w-full bg-nbim-midnight/5 rounded" />
            <div className="h-2 w-5/6 bg-nbim-midnight/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DatabaseSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden animate-pulse">
      <div className="h-10 bg-nbim-midnight/5 border-b" />
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-3 w-1/4 bg-nbim-midnight/5 rounded" />
            <div className="h-3 w-1/4 bg-nbim-midnight/5 rounded" />
            <div className="h-3 w-1/4 bg-nbim-midnight/5 rounded" />
            <div className="h-3 w-1/4 bg-nbim-midnight/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SynthesisSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-3 w-full bg-nbim-sea/10 rounded" />
      <div className="h-3 w-5/6 bg-nbim-sea/10 rounded" />
      <div className="h-3 w-4/6 bg-nbim-sea/10 rounded" />
    </div>
  );
}

export function OrchestratedSearch() {
  const {
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
    handleSearch,
    clearQuery,
    runSuggestion,
    orchestratorPrompt,
  } = useOrchestratedSearch();

  const [showPrompt, setShowPrompt] = React.useState(false);

  const isIdle = step === 'idle';
  const isOrchestrating = step === 'orchestrating';
  const isExecuting = step === 'executing';
  const isCompleted = step === 'completed';
  const isError = step === 'error';

  const hasSuggestions = orchestration?.suggestions && orchestration.suggestions.length > 0;

  return (
    <div className="px-4 py-8 mx-auto w-full max-w-5xl sm:px-6 lg:px-8 space-y-12">
      <header className="mb-0 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-nbim-sea flex items-center justify-center gap-2">
          <Brain className="w-3 h-3" />
          Precision Orchestration v4
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-nbim-midnight sm:text-4xl">
          Intelligence hub
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Snowflake Warehouse • Raffle Context • AI Reasoning
        </p>
      </header>

      <section className="space-y-6">
        <SearchForm
          query={query}
          onQueryChange={(val) => setQuery(val)}
          onSubmitSearch={() => handleSearch()}
          onClear={clearQuery}
        />

        {/* Orchestration Status Log */}
        {!isIdle && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <section className="rounded-xl border bg-nbim-midnight text-white shadow-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-sm font-medium flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-nbim-sea" />
                  Execution log
                </h2>
                <div className="flex items-center gap-4">
                  {duration !== null && (
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-widest font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      Total: {duration}s
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {(isOrchestrating || isExecuting) && (
                      <ScanningLoader className="w-16" />
                    )}
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-nbim-sea animate-slow-pulse">
                      {step}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Step 1: Orchestration */}
                <div className={cn("flex gap-4 items-start transition-all duration-500", !isOrchestrating && !orchestration && "opacity-20 translate-x-1")}>
                  <div className="mt-1">
                    {isOrchestrating ? (
                      <div className="w-4 h-4 rounded-full border border-nbim-sea/30 flex items-center justify-center animate-slow-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-nbim-sea" />
                      </div>
                    ) : orchestration ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">Analyzing search intent</p>
                      {timings.orchestrator && (
                        <span className="text-[10px] font-mono text-white/30">{timings.orchestrator}s</span>
                      )}
                    </div>
                    {orchestration && (
                      <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-nbim-sea uppercase tracking-wider">
                          {orchestration.strategy === 'RAFFLE' && <SearchIcon className="w-3 h-3" />}
                          {orchestration.strategy === 'DATABASE' && <Database className="w-3 h-3" />}
                          {orchestration.strategy === 'DUAL' && <Zap className="w-3 h-3 text-amber-400" />}
                          {orchestration.strategy === 'STOP' && <ShieldAlert className="w-3 h-3 text-destructive" />}
                          Strategy: {orchestration.strategy}
                        </div>
                        <p className="mt-1 text-xs text-white/70 leading-relaxed italic">
                          "{orchestration.reasoning}"
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <button 
                            onClick={() => setShowPrompt(!showPrompt)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-nbim-sea transition-colors"
                          >
                            <Code className="w-3 h-3" />
                            {showPrompt ? 'Hide orchestrator prompt' : 'Inspect system prompt'}
                          </button>
                          
                          {showPrompt && (
                            <div className="mt-3 p-4 rounded bg-black/40 border border-white/5 font-mono text-[10px] text-emerald-300/80 overflow-x-auto animate-in fade-in zoom-in-95 duration-300">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5 text-white/30">
                                <Info className="w-3 h-3" />
                                SYSTEM_PROMPT_v4.2.0
                              </div>
                              <pre className="whitespace-pre-wrap leading-normal">
                                {orchestratorPrompt}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Execution Breakdown */}
                {(orchestration?.strategy !== 'STOP') && (
                  <div className={cn("flex gap-4 items-start transition-opacity", !isExecuting && !isCompleted && "opacity-20")}>
                    <div className="mt-1">
                      {isExecuting ? (
                        <div className="w-4 h-4 rounded-full border border-nbim-sea/30 flex items-center justify-center animate-slow-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-nbim-sea" />
                        </div>
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium">Executing chosen workflow</p>
                      
                      {(orchestration?.strategy === 'RAFFLE' || orchestration?.strategy === 'DUAL') && (
                        <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 animate-in slide-in-from-left-1">
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-nbim-sea" />
                            Raffle: Website Knowledge
                          </div>
                          {timings.raffle && <span className="text-[10px] font-mono text-white/30">{timings.raffle}s</span>}
                          {!timings.raffle && isExecuting && <Loader2 className="w-2.5 h-2.5 animate-spin text-white/20" />}
                        </div>
                      )}

                      {orchestration?.strategy === 'DATABASE' && (
                        <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 animate-in slide-in-from-left-1">
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Snowflake: Structured Data
                          </div>
                          {timings.database && <span className="text-[10px] font-mono text-white/30">{timings.database}s</span>}
                          {!timings.database && isExecuting && <Loader2 className="w-2.5 h-2.5 animate-spin text-white/20" />}
                        </div>
                      )}

                      {(orchestration?.strategy === 'DATABASE' || orchestration?.strategy === 'DUAL') && (
                        <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 animate-in slide-in-from-left-1">
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            AI: Reasoning Engine
                          </div>
                          {timings.ai && <span className="text-[10px] font-mono text-white/30">{timings.ai}s</span>}
                          {!timings.ai && isExecuting && <Loader2 className="w-2.5 h-2.5 animate-spin text-white/20" />}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Suggestions Tooltip-like Area */}
            {hasSuggestions && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <MessageSquare className="w-4 h-4 text-nbim-sea" />
                  <span className="text-xs font-semibold text-nbim-midnight uppercase tracking-wider">Follow-up suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {orchestration.suggestions?.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => runSuggestion(s)}
                      className="px-3 py-1.5 rounded-full border border-nbim-border-default bg-white text-xs hover:border-nbim-sea hover:bg-nbim-sea/5 transition-all flex items-center gap-1 group shadow-sm font-medium"
                    >
                      {s}
                      <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result Area */}
            {(isExecuting || isCompleted) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
                {/* 1. Website Knowledge (Raffle - Only for RAFFLE or DUAL) */}
                {(orchestration?.strategy === 'RAFFLE' || orchestration?.strategy === 'DUAL') && (
                  <div className="space-y-8">
                    <section className="rounded-xl border shadow-sm border-nbim-border-subdued bg-card text-card-foreground overflow-hidden">
                      <div className="flex gap-3 justify-between items-center px-5 py-4 border-b border-nbim-border-subdued bg-white sm:px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded-md bg-nbim-sea/10 border border-nbim-sea/20 text-nbim-sea text-[10px] font-bold uppercase tracking-widest">
                              RAFFLE
                            </div>
                            <h2 className="text-lg font-semibold text-nbim-midnight flex items-center gap-2">
                              Website Knowledge
                            </h2>
                          </div>
                        </div>
                        {timings.raffle && (
                          <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                            Latency: {timings.raffle}s
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-5 sm:px-6">
                        {raffleSummary ? (
                           <SummarySection
                            isLoadingSummary={false}
                            isSummaryError={false}
                            summaryError={null}
                            hasSubmittedSearch={true}
                            summary={raffleSummary}
                          />
                        ) : isExecuting ? (
                          <div className="py-2">
                            <div className="h-4 w-1/3 bg-nbim-sea/10 rounded animate-pulse mb-6" />
                            <SynthesisSkeleton />
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {(orchestration?.strategy === 'RAFFLE' || orchestration?.strategy === 'DUAL') && (
                      <section className="pt-2 space-y-4">
                        <h3 className="text-lg font-semibold text-nbim-midnight px-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {orchestration?.strategy === 'DUAL' ? 'Supporting sitemap results' : 'Source mapping'}
                        </h3>
                        {isExecuting && raffleResults.length === 0 ? (
                          <div className="space-y-3 pt-2">
                            <RaffleSkeleton />
                            <RaffleSkeleton />
                            <RaffleSkeleton />
                          </div>
                        ) : (
                          <ResultsSection
                            isSearchError={false}
                            searchError={null}
                            hasSubmittedSearch={true}
                            isLoadingResults={false}
                            results={raffleResults}
                          />
                        )}
                      </section>
                    )}
                  </div>
                )}

                {/* 2. AI Analyst Synthesis (DUAL or DATABASE) */}
                {(orchestration?.strategy === 'DUAL' || orchestration?.strategy === 'DATABASE') && (
                  <section className="relative rounded-xl border border-nbim-border-subdued shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors" />
                    
                    <div className="flex justify-between items-center pl-6 pr-5 py-4 border-b border-nbim-border-subdued bg-gradient-to-r from-emerald-500/5 to-transparent sm:pr-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 rounded-[4px] bg-nbim-midnight shadow-sm text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            {orchestration?.strategy === 'DATABASE' ? 'Data Interpretation' : 'AI Reasoning'}
                          </div>
                          <h2 className="text-md font-medium text-nbim-midnight tracking-tight">
                            {orchestration?.strategy === 'DATABASE' ? 'Senior Analyst Synthesis' : 'Sitemap Synthesis'}
                          </h2>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pl-6 pr-5 py-6 sm:pr-8 sm:py-8 bg-gradient-to-b from-white to-nbim-sea/[0.02]">
                      {openAIResult ? (
                        <div className="prose prose-sm max-w-none text-nbim-midnight/80">
                          <div 
                            className="text-lg leading-[1.8] font-serif tracking-tight lg:text-xl"
                            dangerouslySetInnerHTML={formatText(openAIResult + (isExecuting ? ' ✦' : ''))}
                          />
                        </div>
                      ) : isExecuting ? (
                        <div className="py-2">
                          <div className="flex items-center gap-2.5 mb-6 text-nbim-midnight/40 animate-pulse uppercase tracking-[0.2em] text-[9px] font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Senior Analyst is drafting synthesis...
                          </div>
                          <SynthesisSkeleton />
                        </div>
                      ) : null}
                      
                      <div className="mt-8 pt-4 border-t border-nbim-border-subdued/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                          <span className="text-[10px] text-nbim-midnight/40 font-semibold uppercase tracking-widest">
                            Verified institutional context applied
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-nbim-midnight/30 uppercase tracking-widest bg-nbim-midnight/5 px-2 py-0.5 rounded">
                          Engine: OpenAI
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {/* 3. Database Content (Snowflake) */}
                {orchestration?.strategy === 'DATABASE' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {dbResult ? (
                      <section className="rounded-xl border shadow-sm border-nbim-border-subdued bg-white overflow-hidden">
                        <div className="flex gap-3 justify-between items-center px-5 py-4 border-b border-nbim-border-subdued bg-nbim-midnight text-white">
                          <div className="flex items-center gap-4">
                            <div className="px-2 py-0.5 rounded-md bg-amber-400 text-nbim-midnight text-[10px] font-bold uppercase tracking-widest">
                              SNOWFLAKE
                            </div>
                            <h2 className="text-md font-medium flex items-center gap-2">
                              Structured Investment Data
                            </h2>
                          </div>
                          <div className="flex items-center gap-3">
                            <a 
                              href={dbResult.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-semibold text-nbim-sea hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider"
                            >
                              Source Documentation
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        
                        <div className="bg-nbim-midnight/5 px-5 py-3 border-b border-nbim-border-subdued flex justify-between items-center">
                          <div className="flex items-center gap-2 font-mono text-[10px] text-nbim-midnight/50">
                            <Terminal className="w-3 h-3" />
                            <span className="opacity-70">QUERY:</span>
                            <span className="font-bold text-nbim-midnight/80">{dbResult.tableId}</span>
                          </div>
                          <div className="text-[9px] font-mono text-nbim-midnight/40 uppercase tracking-widest">
                            Latency: {timings.database}s
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-nbim-border-subdued bg-nbim-midnight/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portfolio Company</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Holding Value</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Fiscal Year</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Ownership %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-nbim-border-subdued">
                              {dbResult.data.map((row, i) => (
                                <tr key={i} className="hover:bg-nbim-sea/[0.02] transition-colors">
                                  <td className="px-6 py-4 text-sm font-semibold text-nbim-midnight">{row.company_name}</td>
                                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground font-mono">{row.holding_value}</td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground text-center">{row.fiscal_year}</td>
                                  <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-nbim-sea/5 text-nbim-sea font-mono text-xs font-bold ring-1 ring-inset ring-nbim-sea/10">
                                      {row.fund_percentage}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="px-6 py-4 bg-nbim-midnight/[0.02] border-t border-nbim-border-subdued flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-2 text-muted-foreground/60">
                            <Database className="w-3 h-3" />
                            DATA SOURCE: SNOWFLAKE PRODUCTION CLUSTER (AWS-EU-WEST)
                          </div>
                          <div className="font-mono text-muted-foreground/40 uppercase tracking-widest">
                            Ref: 7B2DJ
                          </div>
                        </div>
                      </section>
                    ) : isExecuting ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <div className="w-4 h-4 rounded-full border border-nbim-sea animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-widest text-nbim-sea">Connecting to Snowflake...</span>
                        </div>
                        <DatabaseSkeleton />
                      </div>
                    ) : null}
                  </div>
                )}

                {orchestration?.strategy === 'STOP' && (
                  <section className="rounded-xl border shadow-md border-nbim-sea/20 bg-white overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="flex gap-3 items-center px-6 py-5 border-b border-nbim-sea/10 bg-nbim-sea/5 text-nbim-midnight">
                      <div className="w-10 h-10 rounded-full bg-nbim-sea/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-nbim-sea" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold tracking-tight">Institutional scope information</h2>
                        <p className="text-[10px] text-nbim-sea font-bold uppercase tracking-widest">General query handled</p>
                      </div>
                    </div>
                    <div className="p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto">
                      <div className="space-y-4">
                        <p className="text-nbim-midnight font-medium text-lg leading-relaxed">
                          I am specialized in NBIM's institutional operations.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Your request falls outside my current knowledge domain of fund governance, investment strategies, and corporate reports. 
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {isError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-in shake-in">
                <Brain className="w-5 h-5 shrink-0" />
                Orchestration error. Check logs for details.
              </div>
            )}
          </div>
        )}

        {isIdle && (
          <div className="mt-4 text-center max-w-3xl mx-auto px-6 py-16 rounded-2xl border border-dashed border-nbim-border-default bg-white/50 space-y-10 animate-in fade-in zoom-in-95 duration-1000">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-nbim-midnight flex items-center justify-center mx-auto shadow-xl rotate-3">
                <Brain className="w-7 h-7 text-nbim-sea" />
              </div>
              <div className="space-y-2">
                <p className="text-nbim-midnight font-semibold text-xl tracking-tight">NBIM Intelligence Hub</p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Powered by precision orchestration: routing your request to the optimal data engine in real-time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {/* 1. Structured Data */}
              <button 
                onClick={() => { setQuery("How much did we invest in Nvidia in 2024?"); handleSearch("How much did we invest in Nvidia in 2024?"); }}
                className="p-5 rounded-2xl border bg-white shadow-sm hover:border-amber-400 hover:shadow-md transition-all text-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <Database className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-nbim-midnight">Portfolio Data</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Snowflake Access</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </button>

              {/* 2. Hybrid Synthesis */}
              <button 
                onClick={() => { setQuery("What is NBIM's expectation on human capital, and do we invest in Microsoft?"); handleSearch("What is NBIM's expectation on human capital, and do we invest in Microsoft?"); }}
                className="p-5 rounded-2xl border bg-white shadow-sm hover:border-emerald-400 hover:shadow-md transition-all text-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-nbim-midnight text-[11px]">Hybrid Synthesis</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Website + AI</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </button>

              {/* 3. Raffle Only */}
              <button 
                onClick={() => { setQuery("What is the fund's approach to responsible management?"); handleSearch("What is the fund's approach to responsible management?"); }}
                className="p-5 rounded-2xl border bg-white shadow-sm hover:border-nbim-sea hover:shadow-md transition-all text-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nbim-sea/5 flex items-center justify-center group-hover:bg-nbim-sea/10 transition-colors">
                    <SearchIcon className="w-5 h-5 text-nbim-sea" />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-nbim-midnight">Sitemap Search</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Raffle Index</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </button>

              {/* 4. Out of Scope */}
              <button 
                onClick={() => { setQuery("Tell me a funny joke about cats"); handleSearch("Tell me a funny joke about cats"); }}
                className="p-5 rounded-2xl border bg-white shadow-sm hover:border-destructive/40 hover:shadow-md transition-all text-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-destructive/5 flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-nbim-midnight">Out of Scope</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Safety Filter</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </button>

              {/* 5. Unclear / Suggestions */}
              <button 
                onClick={() => { setQuery("Tell me about the fund"); handleSearch("Tell me about the fund"); }}
                className="p-5 rounded-2xl border bg-white shadow-sm hover:border-nbim-sea/40 hover:shadow-md transition-all text-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                    <MessageSquare className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold text-nbim-midnight">Exploratory</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Suggest Options</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        )}
      </section>
    </div>
  );
}



