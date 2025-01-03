import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const googleCreateDocTool = tool(
    async (input) => {
        const { title, content } = input;
        return `Google Doc titled "${title}" created with content: "${content}"`;
    },
    {
        name: 'create_google_doc',
        description: 'Creates a Google Doc with a given title and content.',
        schema: z.object({
            title: z.string().describe('The title of the Google Doc'),
            content: z.string().describe('The content of the Google Doc'),
        }),
    }
);