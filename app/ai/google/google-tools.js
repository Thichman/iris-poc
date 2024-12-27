import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const createGoogleDocTool = tool(
    async ({ title, content }) => {
        return `Google Doc titled "${title}" created successfully!`;
    },
    {
        name: 'create_google_doc',
        description: 'Creates a Google Doc with the given title and content.',
        schema: z.object({
            title: z.string().describe('The title of the Google Doc.'),
            content: z.string().describe('The content of the Google Doc.'),
        }),
    }
);
