import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceQueryTool = tool(
    async (input) => {
        try {
            // Validate the query structure
            const client = await createSalesforceClient(); // Create Salesforce client
            const { query } = input; // The SOQL query to execute

            // Execute the query using Salesforce REST API
            const response = await client.get(`/services/data/v57.0/query`, {
                params: { q: query }, // Pass the query as a parameter
            });

            // Return the query results
            return response.data.records; // Returning only the records part of the response
        } catch (error) {
            console.error('Error executing Salesforce query:', error.message);
            throw new Error('Failed to execute query. Please verify the query syntax and permissions.');
        }
    },
    {
        name: 'salesforce_query',
        description:
            'Execute a custom SOQL query on Salesforce to fetch data. Provide a valid SOQL query string.',
        schema: z.object({
            query: z
                .string()
                .describe('A valid SOQL query string to fetch specific data from Salesforce.'),
        }),
    }
);
