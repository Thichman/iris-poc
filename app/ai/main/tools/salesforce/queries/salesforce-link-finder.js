import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceObjectLinkTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { objectName } = input;

            // Fetch available objects from Salesforce
            const response = await client.get('/services/data/v57.0/sobjects');
            const objects = response.data.sobjects;

            // Find the object in the list of objects
            const matchedObject = objects.find(obj => obj.name.toLowerCase() === objectName.toLowerCase());

            if (matchedObject) {
                // Construct the link to the Salesforce object
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
            console.error('Error finding Salesforce object link:', error.message);
            return {
                error: `Failed to retrieve the object link. Please check the object name and permissions.`,
            };
        }
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
