import React from 'react';
import { OrchestratedSearch } from '../OrchestratedSearch';
import { Sparkles, BarChart3, ShieldAlert, Ban, HelpCircle } from 'lucide-react';

export default function HybridPage() {
  const bullets = (
    <ul className="space-y-2 mt-2">
      <li className="flex items-center gap-2 text-sm text-nbim-midnight/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Our most comprehensive and detailed search.
      </li>
      <li className="flex items-center gap-2 text-sm text-nbim-midnight/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Checks documents and data at the same time.
      </li>
      <li className="flex items-center gap-2 text-sm text-nbim-midnight/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Combines background info with the latest numbers into one answer.
      </li>
    </ul>
  );

  return (
    <OrchestratedSearch 
      initialMode="HYBRID_OPTIMIZER"
      title="Hybrid Optimizer"
      description={bullets}
      exampleQueries={[
        {
          label: "Database Lookup",
          query: "What is the total holding value of Microsoft and what is our ownership percentage?",
          icon: BarChart3,
          color: 'amber'
        },
        {
          label: "Document Search",
          query: "What are the fund's specific expectations regarding human capital and labor rights?",
          icon: ShieldAlert,
          color: 'sea'
        },
        {
          label: "Dual Retrieval",
          query: "Who is the CEO of NBIM and what did the fund return in 2023?",
          icon: Sparkles,
          color: 'blue'
        },
        {
          label: "Out of Bounds",
          query: "Can you provide me with personal financial advice on which tech stocks to buy?",
          icon: Ban,
          color: 'red'
        },
        {
          label: "Irrelevant Topic",
          query: "What is the recipe for traditional Norwegian kompe and how long do you boil it?",
          icon: HelpCircle,
          color: 'green'
        }
      ]}
    />
  );
}
