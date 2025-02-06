import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceCompositeTool = tool(
    async (input) => {
        const { compositeRequests, allOrNone } = input;

        // Validate that we have at least one sub-request
        if (!Array.isArray(compositeRequests) || compositeRequests.length === 0) {
            return { error: 'Invalid input: "compositeRequests" must be a non-empty array.' };
        }

        try {
            const client = await createSalesforceClient();
            console.log(`Executing composite request with ${compositeRequests.length} sub-requests...`);

            // Build the composite API payload
            const payload = {
                allOrNone: allOrNone || false,
                compositeRequest: compositeRequests.map((req, index) => ({
                    method: req.method.toUpperCase(),
                    url: req.url.startsWith('/') ? req.url : `/${req.url}`,
                    referenceId: req.referenceId || `ref${index + 1}`,
                    body: req.body || undefined,
                })),
            };

            const response = await client.post('/services/data/v57.0/composite', payload);
            return { message: 'Composite request executed successfully', data: response.data };
        } catch (error) {
            if (error.response) {
                const statusCode = error.response.status;
                const apiError =
                    error.response.data[0]?.message || error.response.data.message || 'Unknown API error';
                console.error(`Salesforce Composite API Error (${statusCode}): ${apiError}`);
                return { error: `Salesforce Composite API Error: ${apiError}` };
            } else {
                console.error(`Unexpected error: ${error.message}`);
                return { error: error.message };
            }
        }
    },
    {
        name: 'salesforce_composite',
        description: `
      A tool for executing multiple Salesforce API requests in a single call using the Composite API.
      
      Supported Features:
      - Bundle multiple sub-requests into one API call to reduce network overhead.
      - Use the "allOrNone" flag to enforce transactional consistency across sub-requests.
      - Each sub-request must specify an HTTP method, a relative URL (starting with "/"), and can include a unique referenceId and an optional body.
      
      Notes:
      - Ensure each sub-request's URL is relative to the Salesforce API root and starts with a "/".
      - The "allOrNone" flag determines whether the entire composite request should roll back if any sub-request fails.
    `,
        schema: z.object({
            compositeRequests: z.array(
                z.object({
                    method: z.string().describe('HTTP method for the sub-request (GET, POST, PATCH, DELETE).'),
                    url: z.string().describe('Relative Salesforce API endpoint for the sub-request, starting with "/"'),
                    referenceId: z.string().optional().describe('Optional unique identifier for this sub-request.'),
                    body: z.any().optional().describe('Optional body for POST or PATCH requests.'),
                })
            ).describe('An array of sub-requests to be executed as part of the composite call.'),
            allOrNone: z.boolean().optional().describe('If true, the entire composite request fails if any sub-request fails. Default is false.'),
        }),
    }
);
