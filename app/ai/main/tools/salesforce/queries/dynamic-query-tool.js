import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const dynamicSalesforceQueryTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { query, params } = input;

            // Construct the query string
            let queryString = query;

            // Add parameters to the query if provided
            if (params) {
                const paramConditions = Object.entries(params)
                    .map(([key, value]) => `${key} = '${value}'`)
                    .join(' AND ');

                queryString += ` WHERE ${paramConditions}`;
            }

            let records = [];
            let nextUrl = `/services/data/v57.0/query?q=${encodeURIComponent(queryString)}`;

            while (nextUrl) {
                const response = await client.get(nextUrl);
                records = records.concat(response.data.records);
                nextUrl = response.data.nextRecordsUrl || null;
            }

            return {
                message: 'Salesforce query executed successfully.',
                records,
            };
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                console.error(`Salesforce API Error: ${status} - ${data[0].message}`);
                return (`Salesforce API Error: ${data[0].message}`);
            } else {
                console.error('Error executing Salesforce query:', error.message);
                return ('Failed to execute query. Please verify the query syntax and permissions.');
            }
        }
    },
    {
        name: 'dynamic_salesforce_query',
        description: `
            Dynamically generate and execute a Salesforce SOQL query. 
            This tool supports flexible queries with optional parameters for filtering.
            
            Example Usage:
            - "Fetch all Account names and IDs where Industry is 'Technology'."
            - "Find all Contacts with a LastName starting with 'Smith'."
            
            Notes:
            - Ensure the query string follows SOQL syntax.
            - Parameters should be passed as a key-value object for filtering.
        `,
        schema: z.object({
            query: z
                .string()
                .describe('The base SOQL query string to execute. Example: "SELECT Id, Name FROM Account".'),
            params: z
                .record(z.string())
                .optional()
                .describe(
                    'Optional parameters for the query. Example: { Industry: "Technology", LastName: "Smith" }'
                ),
        }),
    }
);
