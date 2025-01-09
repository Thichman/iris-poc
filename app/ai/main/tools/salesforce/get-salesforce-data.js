import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceQuerySobjectTool = tool(
    async (input) => {
        const { endpoint, queryParams } = input;

        try {
            // Create a Salesforce client
            const client = await createSalesforceClient();

            // Make the API call
            const response = await client.get(endpoint, {
                params: queryParams, // Add query parameters dynamically
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Error querying Salesforce:', error);
            return {
                success: false,
                error: error.response?.data || 'Unknown error',
            };
        }
    },
    {
        name: 'salesforce_query',
        description:
            'Query Salesforce REST API dynamically to retrieve data. This tool uses the user’s existing Salesforce keys.',
        schema: z.object({
            endpoint: z
                .string()
                .describe(
                    'Salesforce REST API endpoint to query. Example: /services/data/vXX.X/sobjects/Account'
                ),
            queryParams: z
                .record(z.string())
                .optional()
                .describe('Optional query parameters for the request.'),
        }),
    }
);
