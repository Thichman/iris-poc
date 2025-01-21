import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceUpdateTool = tool(
    async (input) => {
        const { objectName, recordId, data } = input;

        try {
            // Check if recordId is provided
            if (!recordId) {
                return `
                    To update a record in the "${objectName}" object, the Record ID is required.
                    Use a query tool to find the record ID based on other criteria (e.g., Name, Email, or custom fields).
                    
                    Example:
                    - Query for the ID of a Contact with the name "John Doe".
                    - Once the ID is retrieved, use the update tool to modify the record fields.
                    
                    Please query the Record ID for "${objectName}" first before attempting this action.
                `;
            }

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
            Update an existing record in a specific Salesforce object. If the Record ID is missing, the agent 
            should first query for it using other tools. Once the ID is obtained, this tool updates the record fields.

            Example Usage:
            - Update the "FirstName" and "LastName" fields of a Contact with the name "John Doe" by first querying for their record ID.
            - Ensure the object name and data fields match the Salesforce schema.

            Notes:
            - The objectName must be the exact API name of the Salesforce object (e.g., "Account", "Contact").
            - The recordId must be retrieved before invoking this tool.
            - Ensure the data object contains valid field names and values.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe('The name of the Salesforce object containing the record to update. Example: "Contact".'),
            recordId: z
                .string()
                .optional()
                .describe(`
                    The unique Salesforce record ID of the record to update. If not provided, the agent should query for it.
                    Example: "0031t00000abc123".
                `),
            data: z
                .record(z.string())
                .describe(
                    'A key-value pair object where the keys are field names in the Salesforce object, and the values are the updated data. Example: { "FirstName": "John", "LastName": "Doe" }.'
                ),
        }),
    }
);
