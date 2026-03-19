'use server';
import { env } from '@/env';
import { tavily } from '@tavily/core';
import { tool } from 'ai';
import { z } from 'zod';

const webSearchTool = tool({
  name: 'web_search',
  description: 'Search the web for recent information',
  inputSchema: z.object({
    query: z.string().describe('The query to search for'),
  }),
  execute: async ({ query }: { query: string }) => {
    const tvly = tavily({ apiKey: env.TAVILY_API_KEY });
    const result = await tvly.search(query);
    return JSON.stringify(
      result.results?.map((r) => ({ content: r.content, url: r.url })) ?? [{ content: 'No results found' }],
    );
  },
});

export async function createWebSearchTools() {
  return {
    tools: { webSearchTool },
    prompts: {
      tools: WEB_SEARCH_TOOL_PROMPT,
    },
  };
}

const WEB_SEARCH_TOOL_PROMPT = `## Web Search Capability

You have access to real-time web search to get current information beyond your training data cutoff.

### When to Use Web Search:
- **Recent Events**: News, current events, recent developments
- **Time-Sensitive Info**: Stock prices, weather, sports scores, trending topics
- **Verification**: Fact-checking claims or getting latest updates
- **New Discoveries**: Scientific research, product releases, announcements
- **Live Data**: Current statistics, real-time information

### How to Use:
1. **Search Query**: Use specific, targeted queries for best results
2. **Multiple Searches**: If initial search doesn't yield sufficient info, search with different terms
3. **Synthesize**: Combine information from multiple sources when helpful
4. **Cite Sources**: Reference URLs when providing web-sourced information

### Search Best Practices:
- **Be Specific**: "iPhone 15 release date 2023" vs "iPhone info"
- **Use Quotes**: For exact phrases: "climate change report 2023"
- **Add Context**: Include timeframes, locations, or specific aspects
- **Iterate**: Refine searches based on initial results

### Examples:
- "What are the latest developments in AI regulation?"
- "Current stock price of NVIDIA today"
- "Recent D&D 5th edition updates 2023"
- "Latest news about space exploration missions"

**Important**: Web search provides supplemental information. Always cross-reference critical facts and indicate when information comes from web sources versus your training data.` as const;
