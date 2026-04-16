const fs = require('fs');
const path = '/Users/henrik.sissener/Dev/nbim/raffle-api-example/src/search/OrchestratedSearch.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables
content = content.replace(
  'const [showPrompt, setShowPrompt] = React.useState(false);',
  `const [showPrompt, setShowPrompt] = React.useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = React.useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = React.useState(false);`
);

// 2. Adjust Grid layout
content = content.replace(
  '<div className="flex flex-col lg:flex-row gap-8 items-start relative">',
  '<div className="flex flex-col gap-8 items-start relative w-full max-w-4xl mx-auto">'
);

// 3. Remove inline execution log for mobile
content = content.replace(
  `          <div className="lg:hidden space-y-6">
            {renderExecutionLog()}
            {renderStatsBox()}
          </div>`,
  ''
);

// 4. Transform desktop execution log into overlay drawer
content = content.replace(
  `        <div className="hidden lg:flex flex-col w-full lg:w-[400px] xl:w-[440px] shrink-0 sticky top-8 space-y-6">
           {renderExecutionLog()}
           {renderStatsBox()}
        </div>`,
  `      </div>
      
      {/* FAB to Open Logs */}
      {!isIdle && (
        <button
          onClick={() => setIsLogDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-nbim-midnight text-white px-5 py-3 rounded-full shadow-2xl hover:bg-nbim-sea hover:-translate-y-1 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <Terminal className="w-4 h-4" />
          Execution Logs
        </button>
      )}

      {/* Fixed Execution Drawer */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-nbim-midnight/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#f8fafc] h-full shadow-2xl border-l animate-in slide-in-from-right duration-300 flex flex-col relative z-50">
            <div className="p-5 border-b bg-white flex justify-between items-center shrink-0">
              <h2 className="font-semibold text-nbim-midnight flex items-center gap-2 uppercase tracking-widest text-xs font-bold">
                <Terminal className="w-4 h-4 text-nbim-sea" /> System Logs
              </h2>
              <button onClick={() => setIsLogDrawerOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {renderExecutionLog()}
              {renderStatsBox()}
            </div>
          </div>
        </div>
      )}`
);

// 5. Extract Raffle Results Section so it can be appended later, removing it from its current spot
const resultsRegex = /\{\(isOrchestrating \|\| orchestration\?\.strategy === 'RAFFLE' \|\| orchestration\?\.strategy === 'DUAL'\) && \(\s*<section className="pt-2 space-y-4">[\s\S]*?<\/section>\s*\)\}/;
let resultsSection = content.match(resultsRegex);
if (resultsSection) {
  // modify it to just rely on raffleResults or executing
  let newResults = resultsSection[0]
     .replace(`{(isOrchestrating || orchestration?.strategy === 'RAFFLE' || orchestration?.strategy === 'DUAL') && (`, `{(isOrchestrating || raffleResults.length > 0) && (`);
  
  content = content.replace(resultsSection[0], ''); // Remove from original spot
  
  // Also remove the SummarySection block
  const summaryRegex = /\{\/\* 1\. Website Knowledge \(Raffle\) \*\/\}\s*\{\(isOrchestrating \|\| orchestration\?\.strategy === 'RAFFLE' \|\| orchestration\?\.strategy === 'DUAL'\) && \(\s*<div className="space-y-8">\s*<section className="rounded-xl border shadow-sm border-nbim-border-subdued bg-card text-card-foreground overflow-hidden">[\s\S]*?<\/section>\s*<\/div>\s*\)\}/;
  content = content.replace(summaryRegex, '');

  
  // 6. Update AI Final Synthesis to be top, unified Synthesis
  content = content.replace(
    `{/* 3. AI Final Synthesis */}`,
    `{/* 1. AI Executive Synthesis */}`
  );
  content = content.replace(
    /\{\(openAIResult \|\| isExecuting\) && \(orchestration\?\.strategy === 'RAFFLE' \|\| orchestration\?\.strategy === 'DUAL' \|\| orchestration\?\.strategy === 'DATABASE'\) && \(/,
    `{(openAIResult || raffleSummary?.summary || isExecuting) && (`
  );
  
  // Replace the openAIResult display logic with unified text & expander
  const oldTextLogic = `{openAIResult ? (
                        <div className="prose prose-sm max-w-none text-nbim-midnight/80">
                          <div 
                            className="text-lg leading-[1.8] font-serif tracking-tight lg:text-xl"
                            dangerouslySetInnerHTML={formatText(openAIResult + (isExecuting ? ' ✦' : ''))}
                          />
                        </div>
                      ) : isExecuting ? (`;
                      
  const newTextLogic = `{(openAIResult || raffleSummary?.summary) ? (
                        <div className="space-y-4">
                          <div className={cn("prose prose-sm max-w-none text-nbim-midnight/80 relative transition-all duration-500", !isSummaryExpanded && "max-h-32 overflow-hidden")}>
                            <div 
                              className="text-lg leading-[1.8] font-serif tracking-tight"
                              dangerouslySetInnerHTML={formatText((openAIResult || raffleSummary?.summary) + (isExecuting && !openAIResult ? ' ✦' : ''))}
                            />
                            {!isSummaryExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                            )}
                          </div>
                          <button 
                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            className="text-[10px] uppercase tracking-widest font-bold text-nbim-sea hover:text-nbim-midnight transition-colors mx-auto block py-2"
                          >
                            {isSummaryExpanded ? "Read Less" : "Read More"}
                          </button>
                        </div>
                      ) : isExecuting ? (`;
                      
  content = content.replace(oldTextLogic, newTextLogic);

  // 7. Append ResultsSection immediately after the out-of-scope STOP section
  const stopRegex = /\{orchestration\?\.strategy === 'STOP' && \([\s\S]*?<\/section>\s*\)\}/;
  content = content.replace(stopRegex, match => {
    return match + '\n\n                {/* Global Result Source Links */}\n                ' + newResults;
  });
}

// 8. One Final fix: Ensure "SummarySection" import is removed if it causes unused errors, but it's safe to leave since this is a quick fix
fs.writeFileSync(path, content, 'utf8');
