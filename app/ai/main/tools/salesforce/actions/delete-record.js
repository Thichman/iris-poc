import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceDeleteTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { objectName, recordId } = input;

            // If recordId is not provided, instruct the agent to query for it
            if (!recordId) {
                return `
                    To delete a record from the "${objectName}" object, the Record ID is required. 
                    Use a query tool to find the record based on other criteria (e.g., Name, Email, or custom fields).
                    
                    Example:
                    - Query for the ID of a Contact with the name "John Doe".
                    - Once the ID is retrieved, use the delete tool to remove the record.
                    
                    Please query the Record ID for "${objectName}" first before attempting this action.
                `;
            }

            // Perform the DELETE request
            const response = await client.delete(`/services/data/v57.0/sobjects/${objectName}/${recordId}`);

            // Check for success
            if (response.status === 204) {
                return `Record with ID "${recordId}" has been successfully deleted from the "${objectName}" object.`;
            } else {
                return `Unexpected response from Salesforce while deleting record with ID "${recordId}" from the "${objectName}" object.`;
            }
        } catch (error) {
            console.error('Error deleting Salesforce record:', error.message);
            return `Failed to delete record with ID "${recordId}" from the "${objectName}" object. 
                    Please verify the object name, record ID, and ensure sufficient permissions are available.`;
        }
    },
    {
        name: 'salesforce_delete',
        description: `
            Delete a specific record from a Salesforce object using its record ID.
            If the record ID is not provided, the agent should first query for it using other tools.
            
            Example:
            - Delete a Contact with the name "John Doe" by first querying for their record ID.
            - Ensure that the object name and any query parameters are accurate.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe('The API name of the Salesforce object from which the record should be deleted. Example: Account, Contact, etc.'),
            recordId: z
                .string()
                .optional()
                .describe('The ID of the record to be deleted from the specified object. If not provided, query for the record ID first.'),
        }),
    }
);
