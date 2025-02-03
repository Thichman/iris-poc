import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceQueryTool = tool(
    async (input) => {
        const { query } = input;

        // Validate input
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return { error: 'Invalid input: "query" must be a non-empty string following SOQL syntax.' };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;
        let records = [];
        let nextUrl = `/services/data/v57.0/query?q=${encodeURIComponent(query)}`;

        while (attempts < maxRetries) {
            try {
                console.log(`Executing Salesforce query: "${query}" (Attempt ${attempts + 1})`);

                while (nextUrl) {
                    const response = await client.get(nextUrl);

                    if (!response || !response.data || !response.data.records) {
                        throw new Error('Unexpected empty response from Salesforce API.');
                    }

                    records = records.concat(response.data.records);
                    nextUrl = response.data.nextRecordsUrl || null;
                }

                return {
                    message: 'Salesforce query executed successfully.',
                    totalRecords: records.length,
                    records: records,
                };
            } catch (error) {
                attempts++;

                if (error.response) {
                    const statusCode = error.response.status;
                    const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';

                    console.error(`Salesforce API Error (${statusCode}): ${apiError}`);

                    // Handle specific errors
                    if (statusCode === 401 || statusCode === 403) {
                        return { error: 'Unauthorized access: Check your API credentials or permissions.' };
                    }
                    if (statusCode === 400) {
                        return { error: `Invalid SOQL syntax: ${apiError}. Ensure the query follows SOQL format.` };
                    }
                    if (statusCode === 404) {
                        return { error: 'Query returned no results. Check object and field names for accuracy.' };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error executing Salesforce query: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to execute the SOQL query: "${query}". Possible reasons:
                - The query syntax is incorrect.
                - You lack sufficient permissions to access the requested data.
                - The query returned no matching records.
                - A Salesforce API issue occurred.

                Please verify your query and try again.
            `,
        };
    },
    {
        name: 'salesforce_query',
        description: `
        Execute a custom SOQL (Salesforce Object Query Language) query on Salesforce to fetch data. 
        This tool allows querying specific Salesforce objects and fields using SOQL syntax.

        Example Query:
        - "SELECT Id, Name FROM Account WHERE Industry = 'Technology'"

        Notes:
        - Ensure you provide a valid SOQL query string.
        - The response will include all matching records.
        - Large result sets will be paginated automatically using the nextRecordsUrl.
        - If an error occurs, the tool will retry up to 3 times.
    `,
        schema: z.object({
            query: z
                .string()
                .describe(`
                The SOQL query string to fetch data from Salesforce. 
                Example: "SELECT Id, Name FROM Account WHERE Industry = 'Technology'".
                Ensure the query follows Salesforce SOQL syntax and references valid objects and fields.
                `),
        }),
    }
);
