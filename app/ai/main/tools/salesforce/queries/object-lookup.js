import { tool } from '@langchain/core/tools';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';
import { z } from 'zod';

export const salesforceObjectLookupTool = tool(
    async ({ query }) => {
        const salesforceClient = await createSalesforceClient();
        try {
            const response = await salesforceClient.get('/sobjects');
            const objects = response.data.sobjects.map(obj => obj.name.toLowerCase());

            const matchedObjects = objects.filter(obj => obj.includes(query.toLowerCase()));

            if (matchedObjects) {
                return matchedObjects.length > 0
                    ? `Matched objects: ${matchedObjects.join(', ')}`
                    : `No object found matching "${query}".`;
            } else {
                return `No object found matching "${query}". Please try again with a different query.`;
            }

            // Theis returns just the top result
            // const matchedObject = objects.find(obj => obj.includes(query.toLowerCase()));

            // if (matchedObject) {
            //     return `Matched object: ${matchedObject}`;
            // } else {
            //     return `No object found matching "${query}". Please try again with a different query.`;
            // }
        } catch (error) {
            console.error('Error looking up Salesforce objects:', error);
            return `Error: Unable to perform object lookup.`;
        }
    },
    {
        name: 'salesforce_object_lookup',
        description: `
        Dynamically search for Salesforce objects based on a user-provided query. 
        This tool allows you to find object names within your Salesforce instance that match a specific query.
        Example usage:
        - Query: "account"
        - Response: "Matched objects: account, accountteam, accountcontactrole"
        Notes:
        - Partial matches are supported, e.g., querying "opport" may return "opportunity" and "opportunityteam".
        - Use this tool to discover available objects for further queries or operations.
        - Results are case-insensitive.
    `,
        schema: z.object({
            query: z
                .string()
                .describe(
                    `
                A case-insensitive search term to look up Salesforce object names. 
                Example: "account" or "opportunity".
                The tool will return a list of matching objects or notify you if no matches are found.
                `
                ),
        }),
    }
);
