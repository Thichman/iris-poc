import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const calculatorTool = tool(
    async (input) => {
        try {
            const result = eval(input.expression);
            return `The result is ${result}`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: 'calculator',
        description: 'Performs simple math operations.',
        schema: z.object({
            expression: z.string().describe('A mathematical expression to evaluate'),
        }),
    }
);