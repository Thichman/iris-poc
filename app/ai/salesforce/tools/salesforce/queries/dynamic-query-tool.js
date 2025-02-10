import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const dynamicSalesforceQueryTool = tool(
    async (input) => {
        const { query, params } = input;

        // Validate query input
        if (!query || typeof query !== 'string') {
            return { error: 'Invalid input: "query" is required and must be a string.' };
        }

        const client = await createSalesforceClient();
        let queryString = query;

        // Construct the query string with parameters
        if (params) {
            const paramConditions = Object.entries(params)
                .map(([key, value]) => `${key} = '${value}'`)
                .join(' AND ');
            queryString += ` WHERE ${paramConditions}`;
        }

        let records = [];
        let nextUrl = `/services/data/v57.0/query?q=${encodeURIComponent(queryString)}`;

        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Attempting Salesforce query: ${queryString} (Attempt ${attempts + 1})`);

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
                    records,
                };
            } catch (error) {
                attempts++;

                if (error.response) {
                    const statusCode = error.response.status;
                    const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';

                    console.error(`Salesforce API Error (${statusCode}): ${apiError}`);

                    // Handle common errors
                    if (statusCode === 401 || statusCode === 403) {
                        return { error: 'Unauthorized access: Check your API credentials or permissions.' };
                    }
                    if (statusCode === 400) {
                        return { error: `Invalid query syntax: ${apiError}. Please review your SOQL query.` };
                    }
                    if (statusCode === 404) {
                        return { error: 'Requested data not found. Ensure the object and fields exist in Salesforce.' };
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
                Unable to execute the query: "${queryString}". Possible reasons:
                - The query syntax is incorrect.
                - You lack sufficient permissions to access the requested data.
                - A Salesforce API issue occurred.

                Please verify your query and permissions, and try again.
            `,
        };
    },
    {
        name: 'dynamic_salesforce_query',
        description: `
            Execute a dynamic Salesforce SOQL query with optional filtering parameters.
            Supports multi-page results and retry logic for improved reliability.

            Example Queries:
            - "Fetch all Account names and IDs where Industry is 'Technology'."
            - "Find all Contacts with a LastName starting with 'Smith'."

            Notes:
            - Ensure the query string follows SOQL syntax.
            - Parameters should be passed as a key-value object for filtering.
        `,
        schema: z.object({
            query: z.string().describe('The base SOQL query string. Example: "SELECT Id, Name FROM Account".'),
            params: z.record(z.string()).optional(),
        }),
    }
);
