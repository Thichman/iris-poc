import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceDescribeTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { objectName } = input;

            // Fetch object fields
            const response = await client.get(`/services/data/v57.0/sobjects/${objectName}/describe`);
            const fields = response.data.fields.map(field => ({
                name: field.name,
                label: field.label,
                type: field.type,
            }));

            return fields;
        } catch (error) {
            console.error('Error retrieving object description:', error.message);
            throw new Error(`Unable to retrieve fields for the object "${input.objectName}". Please check the object name or permissions.`);
        }
    },
    {
        name: 'salesforce_describe',
        description: 'Retrieve the fields of a specified Salesforce object.',
        schema: z.object({
            objectName: z.string().describe('The name of the Salesforce object to describe.'),
        }),
    }
);
