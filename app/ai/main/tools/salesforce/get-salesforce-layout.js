import { tool } from '@langchain/core/tools';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';
import { z } from 'zod';

export const describeSalesforceStructure = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();

            const { sobjects } = await client.get('/services/data/v54.0/sobjects').then(res => res.data);

            const detailedObjects = [];
            for (const obj of sobjects.slice(0, 5)) {
                const details = await client.get(`/services/data/v54.0/sobjects/${obj.name}/describe`).then(res => res.data);
                detailedObjects.push({
                    name: obj.name,
                    label: obj.label,
                    fields: details.fields.map(field => ({
                        name: field.name,
                        label: field.label,
                        type: field.type,
                    })),
                });
            }

            return {
                message: 'Salesforce structure retrieved successfully.',
                data: detailedObjects,
            };
        } catch (error) {
            console.error('Error describing Salesforce structure:', error);
            return { error: 'Failed to retrieve Salesforce structure.' };
        }
    },
    {
        name: 'describe_salesforce_structure',
        description: 'Retrieves and describes the structure of the Salesforce account, including objects and their fields.',
        schema: z.object({
            includeDetails: z.boolean().optional().default(false).describe('Whether to include detailed object descriptions.'),
        }),
    }
);
