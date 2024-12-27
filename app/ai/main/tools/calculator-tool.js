import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const calculatorTool = tool(
    async ({ expression }) => {
        try {
            const result = eval(expression); // Avoid eval in production
            return `The result is ${result}`;
        } catch (error) {
            return `Error evaluating the expression: ${error.message}`;
        }
    },
    {
        name: 'calculate',
        description: 'Performs basic arithmetic calculations.',
        schema: z.object({
            expression: z.string().describe('A mathematical expression to evaluate.'),
        }),
    }
);
