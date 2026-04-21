export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function formatSummaryText(text: string) {
  if (!text) return { __html: '' };
  
  // 1. Handle bolding and bracketed citations
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-nbim-midnight">$1</strong>')
    .replace(/\[(\d+)\]/g, '<sup class="text-nbim-sea font-bold ml-0.5" title="Source $1">[$1]</sup>');
    
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
