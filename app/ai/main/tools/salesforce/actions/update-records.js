import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceUpdateTool = tool(
    async (input) => {
        const { objectName, recordId, data } = input;

        try {
            // Create a Salesforce client
            const client = await createSalesforceClient();

            // Execute the update action
            await client.patch(`/services/data/v57.0/sobjects/${objectName}/${recordId}`, data);

            // Return success response
            return {
                message: `Record with ID "${recordId}" successfully updated in the ${objectName} object.`,
            };
        } catch (error) {
            // Handle errors gracefully
            if (error.response) {
                const { status, data } = error.response;
                console.error(`Salesforce API Error: ${status} - ${data[0].message}`);
                return `Salesforce API Error: ${data[0].message}`;
            } else {
                console.error('Error updating Salesforce record:', error.message);
                return 'Failed to update record. Please verify the object name, record ID, data, and permissions.';
            }
        }
    },
    {
        name: 'salesforce_update',
        description: `
            Update an existing record in a specific Salesforce object. Provide the object name, the record ID of the 
            record to update, and the necessary field data to modify. Ensure the user has the appropriate permissions for the action.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe('The name of the Salesforce object containing the record to update. Example: "Contact".'),
            recordId: z
                .string()
                .describe('The unique Salesforce record ID of the record to update. Example: "0031t00000abc123".'),
            data: z
                .record(z.string())
                .describe(
                    'A key-value pair object where the keys are field names in the Salesforce object, and the values are the updated data. Example: { "FirstName": "John", "LastName": "Doe" }.'
                ),
        }),
    }
);
