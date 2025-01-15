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
        description: `
        Retrieve and describe the structure of the Salesforce account, including objects and their fields.
        This tool provides insights into the available Salesforce objects, their labels, and field details.
        
        Example Usage:
        - This tool can help explore the data model of your Salesforce instance.
        - Retrieve objects like "Account", "Contact", or "Opportunity" and view their fields such as "Name", "Email", or "Industry".

        Notes:
        - By default, it retrieves details for the first 5 objects for performance reasons.
        - Use this tool to understand the schema and plan queries or integrations accordingly.
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
