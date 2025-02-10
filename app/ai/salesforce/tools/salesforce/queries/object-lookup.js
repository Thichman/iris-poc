import { tool } from '@langchain/core/tools';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';
import { z } from 'zod';

export const salesforceObjectLookupTool = tool(
    async ({ query }) => {
        // Validate input
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return { error: 'Invalid input: "query" must be a non-empty string.' };
        }

        const salesforceClient = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Looking up Salesforce objects matching: "${query}" (Attempt ${attempts + 1})`);

                // Fetch all available Salesforce objects
                const response = await salesforceClient.get('/services/data/v54.0/sobjects');
                if (!response || !response.data || !response.data.sobjects) {
                    throw new Error('Unexpected empty response from Salesforce API.');
                }

                // Convert object names to lowercase for case-insensitive matching
                const objects = response.data.sobjects.map(obj => obj.name.toLowerCase());

                // Perform search for partial matches
                const matchedObjects = objects.filter(obj => obj.includes(query.toLowerCase()));

                if (matchedObjects.length > 0) {
                    return {
                        message: `Matched objects: ${matchedObjects.join(', ')}`,
                        objects: matchedObjects,
                    };
                } else {
                    return {
                        message: `No objects found matching "${query}". Try a different keyword.`,
                        objects: [],
                    };
                }
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
                    if (statusCode === 404) {
                        return { error: 'Salesforce API endpoint not found. Ensure the correct API version is used.' };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error looking up Salesforce objects: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to perform object lookup for query: "${query}". Possible reasons:
                - API access permissions are insufficient.
                - A Salesforce API issue occurred.
                - The query is too specific or does not match any object.

                Please verify API credentials and try again.
            `,
        };
    },
    {
        name: 'salesforce_object_lookup',
        description: `
        Dynamically search for Salesforce objects based on a user-provided query.
        This tool allows you to find object names within your Salesforce instance that match a specific query.

        Example Usage:
        - Query: "account"
        - Response: "Matched objects: Account, AccountTeam, AccountContactRole"

        Notes:
        - Partial matches are supported, e.g., querying "opport" may return "Opportunity" and "OpportunityTeam".
        - Use this tool to discover available objects for further queries or operations.
        - Results are case-insensitive.
        - If no match is found, the tool will suggest refining the query.
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
