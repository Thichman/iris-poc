import { tool } from '@langchain/core/tools';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';
import { z } from 'zod';

export const describeSalesforceStructure = tool(
    async (input) => {
        const { includeDetails } = input;
        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Fetching Salesforce object structure (Attempt ${attempts + 1})`);

                // Get the list of objects
                const response = await client.get('/services/data/v54.0/sobjects');
                if (!response || !response.data || !response.data.sobjects) {
                    throw new Error('Unexpected empty response from Salesforce API.');
                }

                const sobjects = response.data.sobjects;
                const detailedObjects = [];

                // Limit to 5 objects for performance
                for (const obj of sobjects.slice(0, 5)) {
                    let details = null;

                    if (includeDetails) {
                        console.log(`Fetching details for object: ${obj.name}`);
                        details = await client.get(`/services/data/v54.0/sobjects/${obj.name}/describe`)
                            .then(res => res.data);
                    }

                    detailedObjects.push({
                        name: obj.name,
                        label: obj.label,
                        fields: includeDetails
                            ? details.fields.map(field => ({
                                name: field.name,
                                label: field.label,
                                type: field.type,
                            }))
                            : [],
                    });
                }

                return {
                    message: 'Salesforce structure retrieved successfully.',
                    data: detailedObjects,
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
                    if (statusCode === 404) {
                        return { error: 'Requested data not found. Ensure the API endpoint is correct.' };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error retrieving Salesforce structure: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to retrieve Salesforce structure. Possible reasons:
                - API access permissions are insufficient.
                - A Salesforce API issue occurred.
                - The request format is incorrect.

                Please verify API credentials and try again.
            `,
        };
    },
    {
        name: 'describe_salesforce_structure',
        description: `
        Retrieve and describe the structure of the Salesforce account, including objects and their fields.
        This tool provides insights into the available Salesforce objects, their labels, and field details.
        
        Example Usage:
        - Explore the data model of your Salesforce instance.
        - Retrieve objects like "Account", "Contact", or "Opportunity" and view their fields such as "Name", "Email", or "Industry".

        Notes:
        - By default, it retrieves details for the first 5 objects for performance reasons.
        - Use this tool to understand the schema and plan queries or integrations accordingly.
        - Set "includeDetails" to true if field-level metadata is needed.
    `,
        schema: z.object({
            includeDetails: z
                .boolean()
                .optional()
                .default(false)
                .describe(`
                A flag indicating whether to include detailed field descriptions for each object.
                When set to true, detailed fields with names, labels, and types will be provided.
                Default: false.
            `),
        }),
    }
);
