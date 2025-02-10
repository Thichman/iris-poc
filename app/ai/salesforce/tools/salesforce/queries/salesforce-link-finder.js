import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceObjectLinkTool = tool(
    async (input) => {
        const { objectName } = input;

        // Validate input
        if (!objectName || typeof objectName !== 'string' || objectName.trim() === '') {
            return { error: 'Invalid input: "objectName" must be a non-empty string matching a Salesforce object.' };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Fetching Salesforce object link for: "${objectName}" (Attempt ${attempts + 1})`);

                // Fetch available Salesforce objects
                const response = await client.get('/services/data/v57.0/sobjects');
                if (!response || !response.data || !response.data.sobjects) {
                    throw new Error('Unexpected empty response from Salesforce API.');
                }

                const objects = response.data.sobjects;

                // Find the requested object in the list
                const matchedObject = objects.find(obj => obj.name.toLowerCase() === objectName.toLowerCase());

                if (matchedObject) {
                    // Extract the Salesforce instance URL
                    const instanceUrl = client.defaults.baseURL.replace('/services/data/v57.0', '');
                    const objectLink = `${instanceUrl}/lightning/o/${matchedObject.name}/list`;

                    return {
                        message: `Object "${objectName}" found successfully.`,
                        link: objectLink,
                    };
                } else {
                    return {
                        error: `No object found matching "${objectName}". Please ensure the name is correct.`,
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
                        return { error: `Object "${objectName}" not found in Salesforce.` };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error retrieving object link: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to find a Salesforce object link for "${objectName}". Possible reasons:
                - The object name is incorrect (case-sensitive).
                - Your API credentials lack the necessary permissions.
                - A Salesforce API issue occurred.

                Please verify the object name and your permissions, then try again.
            `,
        };
    },
    {
        name: 'salesforce_object_link',
        description: `
            Find a Salesforce object by its name and generate a direct link to that object in the user's Salesforce instance.
            This tool is helpful for quickly navigating to specific objects in Salesforce.

            Example Usage:
            - If the user searches for "Contact", the tool will return a link to the Contact object in their Salesforce.
            - The link will open the Salesforce Lightning view for the specified object.

            Notes:
            - Ensure the object name matches the exact API name in Salesforce.
            - The user must have sufficient permissions to access the specified object.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe(`
                    The API name of the Salesforce object to find. Examples include "Account", "Contact", or "Opportunity".
                    This field is case-sensitive and must exactly match the object name in Salesforce.
                `),
        }),
    }
);
