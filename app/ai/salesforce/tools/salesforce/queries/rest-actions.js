import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceRestApiTool = tool(
    async (input) => {
        const { method, endpoint, data } = input;
        const allowedMethods = ['GET', 'POST', 'PATCH', 'DELETE'];

        // Validate input method and endpoint.
        if (!method || typeof method !== 'string' || !allowedMethods.includes(method.toUpperCase())) {
            return { error: `Invalid method: must be one of ${allowedMethods.join(', ')}` };
        }
        if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
            return { error: 'Invalid endpoint: must be a string starting with "/"' };
        }

        try {
            const client = await createSalesforceClient();
            console.log(`Making ${method.toUpperCase()} call to ${endpoint}`);
            let response;

            switch (method.toUpperCase()) {
                case 'GET':
                    response = await client.get(endpoint);
                    break;
                case 'POST':
                    response = await client.post(endpoint, data);
                    break;
                case 'PATCH':
                    response = await client.patch(endpoint, data);
                    break;
                case 'DELETE':
                    response = await client.delete(endpoint);
                    break;
                default:
                    return { error: 'Unsupported HTTP method' };
            }

            return { message: 'Request successful', data: response.data };
        } catch (error) {
            if (error.response) {
                const statusCode = error.response.status;
                const apiError =
                    error.response.data[0]?.message || error.response.data.message || 'Unknown API error';
                console.error(`Salesforce API Error (${statusCode}): ${apiError}`);
                return { error: `Salesforce API Error: ${apiError}` };
            } else {
                console.error(`Unexpected error: ${error.message}`);
                return { error: error.message };
            }
        }
    },
    {
        name: 'salesforce_rest_api',
        description: `
      A generic tool for interacting with the Salesforce REST API, designed to provide flexible and direct access 
      to Salesforce data and operations through a unified interface.
      
      Supported Methods:
      - GET: Retrieve data from a specified endpoint, such as fetching metadata or record details.
      - POST: Create a new record or execute actions that require data submission.
      - PATCH: Update existing records by sending partial modifications.
      - DELETE: Remove records or data entries from Salesforce.
      
      Notes:
      - The tool requires the endpoint to start with a "/" to ensure the correct API route is used.
      - A valid Salesforce client is automatically created via your configured environment.
      - Any errors returned by the Salesforce API are captured and relayed back in the response for debugging.
    `,
        schema: z.object({
            method: z
                .string()
                .describe('HTTP method to use for the request: GET, POST, PATCH, or DELETE.'),
            endpoint: z
                .string()
                .describe('The Salesforce REST API endpoint, starting with a "/".'),
            data: z
                .any()
                .optional()
                .describe('Optional payload for POST or PATCH requests.'),
        }),
    }
);
