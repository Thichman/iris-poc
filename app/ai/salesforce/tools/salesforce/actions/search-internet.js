import { tool } from '@langchain/core/tools';
import axios from 'axios';
import { z } from 'zod';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

export const webSearchTool = tool(
    async (input) => {
        const { query, numResults } = input;

        // Validate API credentials
        if (!GOOGLE_API_KEY || !GOOGLE_CX) {
            console.error("❌ Missing Google API credentials.");
            return { error: "Missing Google API Key or CX ID. Please configure environment variables properly." };
        }

        try {
            console.log(`🔎 Searching Google for: "${query}"`);

            // Make API call to Google Custom Search
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: GOOGLE_API_KEY,
                    cx: GOOGLE_CX,
                    q: query,
                    num: numResults || 5, // Default to 5 results
                },
            });

            // Extract search results
            const searchResults = response.data.items?.map((item) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
            }));

            return {
                message: `🔍 Search results for "${query}":`,
                results: searchResults || [],
            };
        } catch (error) {
            console.error("❌ Web Search Error:", error.response?.data || error.message);
            return { error: "Failed to retrieve search results. Please try again later." };
        }
    },
    {
        name: 'web_search',
        description: `
            Perform a web search using Google Custom Search API and return top results.

            Example Usage:
            - "Search the web for the latest news on AI advancements."
            - "Find information about OpenAI's latest GPT model."

            Notes:
            - Requires Google Custom Search API Key and CX ID.
            - Defaults to returning 5 results if numResults is not specified.
        `,
        schema: z.object({
            query: z.string().describe('The search query to look up information online.'),
            numResults: z.number().optional().describe('The number of search results to return (default: 5).'),
        }),
    }
);
