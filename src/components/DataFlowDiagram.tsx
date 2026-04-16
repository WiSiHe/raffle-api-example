import React from 'react';
import { cn } from '../lib/utils';
import { Database, FileText, Brain, ArrowDown, CheckCircle2, Search } from 'lucide-react';

type FlowMode = 'STANDARD' | 'SMART_ROUTING' | 'HYBRID_OPTIMIZER';

interface DataFlowDiagramProps {
  mode: FlowMode;
  activePath?: 'RAFFLE' | 'DATABASE' | 'DUAL' | 'STOP' | null;
  className?: string;
}

interface StepProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color?: 'blue' | 'amber' | 'sea' | 'emerald' | 'midnight';
  active?: boolean;
}

const Step = ({ icon: Icon, label, description, color = 'blue', active = true }: StepProps) => {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    sea: "border-nbim-sea/20 bg-nbim-sea/5 text-nbim-sea",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    midnight: "border-nbim-midnight bg-nbim-midnight text-white",
  }[color];

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-xl border w-[220px] mx-auto transition-all relative z-10 shadow-sm",
      colors,
      !active && "opacity-40 grayscale"
    )}>
      <div className={cn("p-2 rounded-lg bg-white/50 shadow-sm", color === 'midnight' && "bg-white/10")}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className="text-[9px] font-medium opacity-70 leading-tight whitespace-normal">{description}</p>
      </div>
    </div>
  );
};

interface DecisionProps {
  label: string;
  description: string;
}

const Decision = ({ label, description }: DecisionProps) => (
  <div className="relative flex flex-col items-center justify-center py-6 px-8 z-10 my-2 mx-auto w-[220px]">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-24 h-24 rotate-45 border-2 border-nbim-border-default bg-white shadow-sm" />
    </div>
    <div className="relative text-center z-10 pt-2">
      <Brain className="w-5 h-5 text-nbim-midnight mx-auto mb-1" />
      <p className="text-[10px] font-black uppercase tracking-wider text-nbim-midnight leading-none">{label}</p>
      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{description}</p>
    </div>
  </div>
);

const LineNode = ({ children, hideArrow = false }: { children?: React.ReactNode, hideArrow?: boolean }) => (
  <div className="flex flex-col items-center w-full relative z-0">
    <div className="w-px h-8 bg-nbim-border-default z-0 flex items-center justify-center relative">
       {children}
    </div>
    {!hideArrow && <ArrowDown className="w-3 h-3 text-nbim-border-default -mt-2.5 z-10 relative bg-white" />}
  </div>
);

const Fork = ({ width = 268 }: { width?: number }) => (
  <div className="flex flex-col items-center w-full relative z-0" style={{ height: 32 }}>
     <div className="w-px h-4 bg-nbim-border-default" />
     <div className="h-px bg-nbim-border-default relative" style={{ width }}>
        {/* Left Arrow */}
        <div className="absolute left-0 top-0 flex flex-col items-center -ml-px">
          <div className="w-px h-4 bg-nbim-border-default relative">
            <ArrowDown className="w-3 h-3 text-nbim-border-default absolute -bottom-2 -left-1.5 bg-white z-10" />
          </div>
        </div>
        {/* Right Arrow */}
        <div className="absolute right-0 top-0 flex flex-col items-center -mr-px">
          <div className="w-px h-4 bg-nbim-border-default relative">
            <ArrowDown className="w-3 h-3 text-nbim-border-default absolute -bottom-2 -left-1.5 bg-white z-10" />
          </div>
        </div>
     </div>
  </div>
);

const Join = ({ width = 268 }: { width?: number }) => (
  <div className="flex flex-col items-center w-full relative z-0 -mt-1" style={{ height: 32 }}>
     <div className="relative h-px bg-nbim-border-default mt-4" style={{ width }}>
        <div className="absolute left-0 bottom-0 w-px h-4 bg-nbim-border-default" />
        <div className="absolute right-0 bottom-0 w-px h-4 bg-nbim-border-default" />
     </div>
     <div className="w-px h-4 bg-nbim-border-default relative">
        <ArrowDown className="w-3 h-3 text-nbim-border-default absolute -bottom-2 -left-1.5 bg-white z-10" />
     </div>
  </div>
);

export const DataFlowDiagram = ({ mode, activePath, className }: DataFlowDiagramProps) => {
  return (
    <div className={cn("w-full py-12 px-6 rounded-3xl bg-card border border-nbim-border-subdued shadow-sm", className)}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-10 text-center space-y-1">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-nbim-midnight">Architecture Flow</h3>
          <p className="text-[10px] text-nbim-sea font-bold uppercase tracking-widest">
            {mode === 'STANDARD' && "Document Index Search"}
            {mode === 'SMART_ROUTING' && "Decision Tree Routing"}
            {mode === 'HYBRID_OPTIMIZER' && "Parallel Data Synthesis"}
          </p>
        </div>

        {/* Standard Flow */}
        {mode === 'STANDARD' && (
          <div className="flex flex-col items-center w-full">
            <Step icon={Search} label="User Query" description="Ask about the fund" color="midnight" />
            <LineNode />
            <Step icon={FileText} label="Document Search" description="Retrieve policies & context" color="sea" />
            <LineNode />
            <Step icon={CheckCircle2} label="Final Answer" description="LLM Summary Generation" color="emerald" />
          </div>
        )}

        {/* Orchestrator Flow */}
        {mode === 'SMART_ROUTING' && (
          <div className="flex flex-col items-center w-full">
            <Step icon={Search} label="User Query" description="Ask about the fund" color="midnight" />
            <LineNode />
            <Decision label="AI Routing" description="Data vs Docs" />
            <Fork />
            <div className="flex justify-center gap-[48px] w-full mt-2">
               <div className="w-[220px]">
                 <Step icon={FileText} label="Policy Database" description="Unstructured Search" color="sea" active={!activePath || activePath === 'RAFFLE' || activePath === 'DUAL'} />
               </div>
               <div className="w-[220px]">
                 <Step icon={Database} label="Portfolio Data" description="Structured SQL Search" color="amber" active={!activePath || activePath === 'DATABASE' || activePath === 'DUAL'} />
               </div>
            </div>
            <Join />
            <div className="mt-2">
               <Step icon={CheckCircle2} label="Final Answer" description="Direct Response" color="emerald" />
            </div>
          </div>
        )}



        {/* Hybrid Flow */}
        {mode === 'HYBRID_OPTIMIZER' && (
          <div className="flex flex-col items-center w-full">
            <Step icon={Search} label="User Query" description="Ask about the fund" color="midnight" />
            <LineNode />
            <Fork />
            <div className="flex justify-center gap-[48px] w-full mt-2">
               <div className="w-[220px] flex flex-col gap-2">
                 <span className="text-[8px] font-bold uppercase tracking-widest text-nbim-sea text-center bg-nbim-sea/10 py-1 rounded-full animate-pulse border border-nbim-sea/20">Running Parallel</span>
                 <Step icon={FileText} label="Deep Context Search" description="Retrieve all related docs" color="sea" />
               </div>
               <div className="w-[220px] flex flex-col gap-2">
                 <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600 text-center bg-amber-500/10 py-1 rounded-full animate-pulse border border-amber-500/20">Running Parallel</span>
                 <Step icon={Database} label="Full Fact Audit" description="Retrieve all related facts" color="amber" />
               </div>
            </div>
            <Join />
            <div className="mt-2 text-center w-full flex flex-col items-center">
               <Step icon={CheckCircle2} label="Parallel Results" description="Combined View" color="midnight" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
