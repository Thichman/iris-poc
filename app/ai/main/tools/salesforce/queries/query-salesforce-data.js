import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceQueryTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { query } = input;

            let records = [];
            let nextUrl = `/services/data/v57.0/query?q=${encodeURIComponent(query)}`;

            while (nextUrl) {
                const response = await client.get(nextUrl);
                records = records.concat(response.data.records);
                nextUrl = response.data.nextRecordsUrl || null;
            }

            return {
                message: 'Salesforce query executed successfully.',
                records: records
            }
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
        name: 'salesforce_query',
        description: `
        Execute a custom SOQL (Salesforce Object Query Language) query on Salesforce to fetch data. 
        This tool allows querying specific Salesforce objects and fields using SOQL syntax.
        Example query: "SELECT Id, Name FROM Account WHERE Industry = 'Technology'".
        Note:
        - Ensure you provide a valid SOQL query string.
        - The response will include the matching records.
        - For large result sets, the tool will automatically handle pagination using the nextRecordsUrl.
    `,
        schema: z.object({
            query: z
                .string()
                .describe(
                    `
                The SOQL query string to fetch data from Salesforce. 
                Example: "SELECT Id, Name FROM Account WHERE Industry = 'Technology'".
                Ensure the query follows Salesforce SOQL syntax and references valid objects and fields.
                `
                ),
        }),
    }
);
