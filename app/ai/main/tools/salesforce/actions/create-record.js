import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceCreateTool = tool(
    async (input) => {
        const { objectName, data } = input;

        try {
            // Create a Salesforce client
            const client = await createSalesforceClient();

            // Execute the create action
            const response = await client.post(`/services/data/v57.0/sobjects/${objectName}`, data);

            // Return success response
            return {
                message: `Record successfully created in the ${objectName} object.`,
                id: response.data.id,
            };
        } catch (error) {
            // Handle errors gracefully
            if (error.response) {
                const { status, data } = error.response;
                console.error(`Salesforce API Error: ${status} - ${data[0].message}`);
                return `Salesforce API Error: ${data[0].message}`;
            } else {
                console.error('Error creating Salesforce record:', error.message);
                return 'Failed to create record. Please verify the object name, data, and permissions.';
            }
        }
    },
    {
        name: 'salesforce_create',
        description: `
            Create a new record in a specific Salesforce object. Provide the object name and the necessary field data 
            to create the record. Ensure the user has the appropriate permissions for the action.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe('The name of the Salesforce object where the record should be created. Example: "Contact".'),
            data: z
                .record(z.string())
                .describe(
                    'A key-value pair object where the keys are field names in the Salesforce object, and the values are the data to insert. Example: { "FirstName": "John", "LastName": "Doe" }.'
                ),
        }),
    }
);
