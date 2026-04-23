import type { Reference, SearchResult, SummaryResponse } from '../types';

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function formatSummaryText(text: string, references?: Reference[]) {
  if (!text) return { __html: '' };

  // Create a mapping from the original source index to its 1-based display position
  const indexMap = references && references.length > 0 
    ? new Map(references.map((ref, idx) => [ref.index, idx + 1]))
    : null;
  
  // 1. Handle bolding and bracketed citations
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-nbim-midnight">$1</strong>')
    .replace(/\[(\d+)\]/g, (_, num) => {
      const originalIndex = parseInt(num, 10);
      const displayIndex = indexMap?.get(originalIndex) ?? originalIndex;
      return `<sup class="text-nbim-sea font-bold ml-0.5" title="Source ${displayIndex}">[${displayIndex}]</sup>`;
    });
    
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
      // Clean the line of the marker
      const content = trimmed.replace(/^[-*]\s+/, '');
      html += `<li class="list-disc marker:text-nbim-sea pl-1">${content}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (trimmed) {
        html += `<p class="mb-4 text-balance">${trimmed}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';
  
  return { __html: html };
}

/**
 * Extracts and resolves all cited references from a summary text, 
 * falling back to search results if the API references are incomplete.
 */
export function resolveCitedReferences(
  summary: SummaryResponse | undefined, 
  results: SearchResult[] | undefined
): Reference[] {
  if (!summary?.summary) return [];
  
  // Find all [num] patterns
  const matches = Array.from(summary.summary.matchAll(/\[(\d+)\]/g));
  const uniqueIndices = Array.from(new Set(matches.map(m => parseInt(m[1], 10))));
  
  return uniqueIndices.map(num => {
    // 1. Try to find in the API's provided references
    const fromRef = summary.references?.find(r => r.index === num);
    if (fromRef) return fromRef;
    
    // 2. Fallback to search results
    const fromResult = results?.[num - 1];
    if (fromResult) {
      return {
        index: num,
        title: fromResult.title,
        url: fromResult.url,
        content: fromResult.content.replace(/<[^>]*>/g, '').slice(0, 200)
      } as Reference;
    }
    
    return null;
  }).filter(Boolean) as Reference[];
}

/**
 * Extracts a specific value from the Raffle metadata array.
 */
export function getMetadataValue(result: SearchResult, name: string): string | undefined {
  return result.metadata?.find(m => m.name === name || m.property === name)?.content;
}
