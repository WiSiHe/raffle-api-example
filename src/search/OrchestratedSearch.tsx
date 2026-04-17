import React, { useState } from 'react';
import { Brain, Search as SearchIcon, Loader2, CheckCircle2, ChevronRight, ShieldAlert, Terminal, Clock, ExternalLink, Info } from 'lucide-react';
import { SearchForm } from './SearchForm';
import { ResultsSection } from './ResultsSection';
import { useOrchestratedSearch } from './useOrchestratedSearch';
import { cn } from '../lib/utils';

function formatText(text: string) {
  if (!text) return { __html: '' };
  
  const formatted = text
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

import { DataFlowDiagram } from '../components/DataFlowDiagram';
import { SearchMode } from '../api/orchestrator';

export type ExampleQuery = {
  label: string;
  query: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'amber' | 'emerald' | 'sea' | 'blue' | 'red' | 'green';
};

type OrchestratedSearchProps = {
  initialMode: SearchMode;
  title: string;
  description: React.ReactNode;
  showModeSwitcher?: boolean;
  exampleQueries?: ExampleQuery[];
};

export function OrchestratedSearch({ 
  initialMode = 'SMART_ROUTING', 
  title = 'Institutional search', 
  description = 'Comparing orchestration strategies across sitemaps, data warehouses, and generative synthesis.',
  showModeSwitcher = false,
  exampleQueries = []
}: OrchestratedSearchProps) {
  const {
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
    loadingStatus,
    handleSearch,
    clearQuery,
    runSuggestion,
  } = useOrchestratedSearch(initialMode);

  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const isIdle = step === 'idle';
  const isOrchestrating = step === 'orchestrating';
  const isExecuting = step === 'executing';
  const isCompleted = step === 'completed';
  const isError = step === 'error';

  const hasSuggestions = orchestration?.suggestions && 
                         orchestration.suggestions.length > 0;

  const renderExecutionLog = () => {
    if (isIdle) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <section className="rounded-xl border bg-nbim-midnight text-white shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex flex-col gap-2 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] uppercase tracking-wider font-bold flex items-center gap-2">
                <Terminal className="w-3 h-3 text-nbim-sea shrink-0" />
                Execution Log
              </h2>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-right shrink-0">
                 {isCompleted ? (
                   <span className="text-emerald-400">COMPLETED</span>
                 ) : (
                   <span className="text-nbim-sea animate-pulse">{loadingStatus || 'RUNNING'}</span>
                 )}
              </div>
            </div>
            
            {duration !== null && (
              <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-widest font-medium">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                Execution time: <span className="text-white/80 shrink-0">{duration}s</span>
              </div>
            )}
          </div>
          <div className="p-5 space-y-5">
            <div className={cn("space-y-4", !isOrchestrating && !orchestration && "opacity-30")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isOrchestrating ? <Loader2 className="w-3 h-3 animate-spin text-nbim-sea" /> : orchestration ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                  </div>
                  <p className="text-sm font-semibold">Search Intent</p>
                </div>
                {timings.orchestrator && <span className="text-[10px] font-mono text-white/30">{timings.orchestrator}s</span>}
              </div>
              
              {orchestration && (
                <div className="ml-7 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[10px] font-bold text-nbim-sea uppercase tracking-widest mb-1">
                    Strategy: {orchestration.strategy}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed italic">
                    "{orchestration.reasoning}"
                  </p>
                </div>
              )}
            </div>

            <div className={cn("space-y-3", !isExecuting && !isCompleted && "opacity-30")}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  {isExecuting ? <Loader2 className="w-3 h-3 animate-spin text-nbim-sea" /> : isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                </div>
                <p className="text-sm font-semibold">Workflow Execution</p>
              </div>

              <div className="ml-7 space-y-2">
                {(mode === 'HYBRID_OPTIMIZER' || orchestration?.strategy === 'RAFFLE' || orchestration?.strategy === 'DUAL') && (
                  <div className="flex justify-between items-center text-xs text-white/50">
                    <span>• Raffle Index</span>
                    <span className="font-mono">{timings.raffle ? `${timings.raffle}s` : '...'}</span>
                  </div>
                )}
                {(mode === 'HYBRID_OPTIMIZER' || orchestration?.strategy === 'DATABASE' || orchestration?.strategy === 'DUAL') && (
                  <div className="flex justify-between items-center text-xs text-white/50">
                    <span>• Snowflake Data</span>
                    <span className="font-mono">{timings.database ? `${timings.database}s` : '...'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };



  return (
    <div className="px-4 py-8 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 space-y-12">
      <header className="mb-0 text-center relative max-w-4xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-nbim-sea flex items-center justify-center gap-2">
          <Brain className="w-3 h-3" />
          Intelligence Hub Orchestrator
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-nbim-midnight sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 p-4 rounded-xl bg-nbim-sea/5 border border-nbim-sea/10 shadow-inner group">
          <div className="flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-nbim-sea mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-nbim-midnight uppercase tracking-wide">About this search method</p>
              <div className="text-sm text-nbim-midnight/70 leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full mx-auto">
        <div className="flex-1 space-y-8 min-w-0 w-full transition-all duration-500 max-w-4xl mx-auto">
          <SearchForm
            query={query}
            onQueryChange={(val) => setQuery(val)}
            onSubmitSearch={() => handleSearch()}
            onClear={clearQuery}
            mode={mode}
            onModeChange={(m) => setMode(m as SearchMode)}
            showModeSwitcher={showModeSwitcher}
          />
          


          <div className="space-y-6">
            {/* Suggestions Tooltip-like Area */}
            {hasSuggestions && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <SearchIcon className="w-4 h-4 text-nbim-sea" />
                  <span className="text-xs font-semibold text-nbim-midnight uppercase tracking-wider">
                    {orchestration?.strategy === 'STOP' ? 'Other suggested topics' : 'Suggested next queries'}
                  </span>
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
            {(isOrchestrating || isExecuting || isCompleted) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">


                {/* 2. Database Content (Snowflake) */}
                {(orchestration?.strategy === 'DATABASE' || orchestration?.strategy === 'DUAL') && (
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
                                  <td className="px-6 py-4 text-sm font-semibold text-nbim-midnight">{row.company_name as string}</td>
                                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground font-mono">{row.holding_value as string}</td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground text-center">{row.fiscal_year as number}</td>
                                  <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-nbim-sea/5 text-nbim-sea font-mono text-xs font-bold ring-1 ring-inset ring-nbim-sea/10">
                                      {row.fund_percentage as string}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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

                {/* 1. AI Executive Synthesis */}
                {(openAIResult || raffleSummary?.summary || isExecuting) && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 mb-2 opacity-50">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-nbim-midnight">
                        {orchestration?.strategy === 'DATABASE' ? 'Data Interpretation' : 'AI Synthesis'}
                      </span>
                    </div>
                    
                    <div className="max-w-4xl">
                      {(raffleSummary?.summary || openAIResult) ? (
                        <div className="space-y-4">
                          <div className={cn("prose prose-sm max-w-none text-nbim-midnight relative transition-all duration-500", !isSummaryExpanded && "max-h-32 overflow-hidden")}>
                            <div 
                              className="text-lg leading-[1.8] font-serif tracking-tight"
                              dangerouslySetInnerHTML={formatText((raffleSummary?.summary || openAIResult) + (isExecuting && !openAIResult && !raffleSummary?.summary ? ' ✦' : ''))}
                            />
                            {!isSummaryExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-nbim-page to-transparent pointer-events-none" />
                            )}
                          </div>
                          
                          <button 
                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            className="text-[10px] uppercase tracking-widest font-bold text-nbim-sea hover:text-nbim-midnight transition-colors block pt-2"
                          >
                            {isSummaryExpanded ? "Show Less" : "Read More"}
                          </button>
                        </div>
                      ) : isExecuting ? (
                        <div className="py-2">
                          <div className="flex items-center gap-2.5 mb-6 text-nbim-midnight/40 animate-pulse uppercase tracking-[0.2em] text-[9px] font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Analytical engine is formulating {orchestration?.strategy === 'DATABASE' ? 'precision' : 'institutional'} response...
                          </div>
                          <SynthesisSkeleton />
                        </div>
                      ) : null}
                    </div>
                  </section>
                )}

                {orchestration?.strategy === 'STOP' && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-1">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-nbim-midnight tracking-tight">Out of scope</h2>
                        <p className="text-sm text-nbim-midnight/60 leading-relaxed max-w-xl">
                          I can only assist with NBIM-specific institutional queries. Please rephrase your request to focus on the fund's management, investments, or policies.
                        </p>
                      </div>
                    </div>

                    {orchestration.suggestions && orchestration.suggestions.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 opacity-50">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-nbim-midnight">
                            Better Alternatives
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {orchestration.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => { setQuery(s); handleSearch(s); }}
                              className="group flex items-center justify-between p-3 rounded-lg border border-nbim-border-subdued hover:border-nbim-sea hover:bg-nbim-sea/[0.02] transition-all text-left"
                            >
                              <span className="text-xs font-medium text-nbim-midnight/80 group-hover:text-nbim-sea transition-colors line-clamp-1">
                                {s}
                              </span>
                              <ChevronRight className="w-3 h-3 text-nbim-midnight/20 group-hover:text-nbim-sea group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Global Raffle Results Layer */}
                {(isOrchestrating || raffleResults.length > 0) && (
                  <section className="pt-8 mt-8 border-t border-nbim-border-subdued/50 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 rounded-md bg-nbim-sea/10 text-nbim-sea text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <SearchIcon className="w-3 h-3" />
                          Raffle Engine
                        </div>
                        <h3 className="text-lg font-semibold text-nbim-midnight flex items-center gap-2 tracking-tight">
                          Source documents & citations
                        </h3>
                      </div>
                      {timings.raffle && (
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                              Mapped in {timings.raffle}s
                           </span>
                        </div>
                      )}
                    </div>
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

            {isError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-in shake-in">
                <Brain className="w-5 h-5 shrink-0" />
                Orchestration error. Verify API configuration.
              </div>
            )}
          </div>

          {isIdle && exampleQueries.length > 0 && (
            <div className="mt-8 text-center max-w-2xl mx-auto px-4 py-8 rounded-xl border border-dashed border-nbim-border-default bg-white/30 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-nbim-midnight flex items-center justify-center mx-auto shadow-md">
                  <Brain className="w-5 h-5 text-nbim-sea" />
                </div>
                <div className="space-y-1">
                  <p className="text-nbim-midnight font-medium text-lg tracking-tight">Quick Start Queries</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Select a tailored example below to explore the capabilities of this search configuration.
                  </p>
                </div>
              </div>

              <div className={cn("grid grid-cols-1 gap-4 text-left", exampleQueries.length > 1 ? "md:grid-cols-2" : "", exampleQueries.length > 2 ? "lg:grid-cols-3" : "")}>
                {exampleQueries.map((item, idx) => {
                  const Icon = item.icon;
                  const colorClasses = {
                    amber: "bg-amber-50 group-hover:bg-amber-100 text-amber-500",
                    emerald: "bg-emerald-50 group-hover:bg-emerald-100 text-emerald-500",
                    sea: "bg-nbim-sea/5 group-hover:bg-nbim-sea/10 text-nbim-sea",
                    blue: "bg-blue-50 group-hover:bg-blue-100 text-blue-500",
                    red: "bg-red-50 group-hover:bg-red-100 text-red-500",
                    green: "bg-green-50 group-hover:bg-green-100 text-green-500",
                  }[item.color];
                  
                  const borderHover = {
                    amber: "hover:border-amber-400",
                    emerald: "hover:border-emerald-400",
                    sea: "hover:border-nbim-sea",
                    blue: "hover:border-blue-400",
                    red: "hover:border-red-400",
                    green: "hover:border-green-400",
                  }[item.color];

                  return (
                    <button 
                      key={idx}
                      onClick={() => { setQuery(item.query); handleSearch(item.query); }}
                      className={cn("p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between group", borderHover)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", colorClasses)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <div className="font-medium text-nbim-midnight text-xs line-clamp-1">{item.label}</div>
                          <div className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Example Query</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className='drop-shadow-xl rounded fixed top-8 bottom-4 w-96 right-4'>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Execution Tracking</h3>
              <div className="text-xs font-mono bg-white p-2 rounded-full text-slate-400">{duration ? `${duration}s` : '--'}</div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {renderExecutionLog()}
            </div>
          </div>
      </aside>

      {/* FAB for Mobile Log Access */}
      {!isIdle && (
        <button
          onClick={() => {}}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-nbim-midnight text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <Terminal className="w-4 h-4" />
          Logs
        </button>
      )}
      
      <div className="pt-4">
        <DataFlowDiagram mode={initialMode} activePath={step === 'completed' ? orchestration?.strategy : null} />
      </div>
    </div>
  );
}
