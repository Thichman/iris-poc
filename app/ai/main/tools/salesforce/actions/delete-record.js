import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceDeleteTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { objectName, recordId } = input;

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
            throw new Error(
                `Failed to delete record with ID "${input.recordId}" from the "${input.objectName}" object. Please verify the object name, record ID, and permissions.`
            );
        }
    },
    {
        name: 'salesforce_delete',
        description: 'Delete a specific record from a Salesforce object using its record ID.',
        schema: z.object({
            objectName: z
                .string()
                .describe('The API name of the Salesforce object from which the record should be deleted. Example: Account, Contact, etc.'),
            recordId: z
                .string()
                .describe('The ID of the record to be deleted from the specified object. Example: 001xx000003DGbEAAW'),
        }),
    }
);
