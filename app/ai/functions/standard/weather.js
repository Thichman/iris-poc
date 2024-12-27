import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const weatherTool = tool(
    async (input) => {
        return `The weather is 95 degrees and sunny today.`;
    },
    {
        name: 'get_tampa_weather',
        description: 'Returns the current weather for Tampa, Florida.',
        schema: z.object({}), // No input required
    }
);
