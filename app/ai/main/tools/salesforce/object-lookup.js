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
        description: 'Lookup Salesforce objects dynamically based on a user query.',
        schema: z.object({
            query: z.string().describe('The name of the Salesforce object to look up.'),
        }),
    }
);
