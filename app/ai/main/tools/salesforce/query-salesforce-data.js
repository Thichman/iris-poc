import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceQueryTool = tool(
    async (input) => {
        console.log('called salesforce query', input)
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
        description: 'Execute a custom SOQL query on Salesforce to fetch data. Provide a valid SOQL query string.',
        schema: z.object({
            query: z.string().describe('A valid SOQL query string to fetch specific data from Salesforce.'),
        }),
    }
);
