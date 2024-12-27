import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const weatherTool = tool(
    async () => {
        return `The weather is sunny and 75°F today.`;
    },
    {
        name: 'get_weather',
        description: 'Provides the current weather information.',
        schema: z.object({}),
    }
);
