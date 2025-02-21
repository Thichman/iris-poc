import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const describeSalesforceStructure = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const response = await client.get('/services/data/v57.0/sobjects');
            const sobjects = response.data.sobjects;

            // Limit to first 5 objects for performance.
            const detailedObjects = await Promise.all(
                sobjects.slice(0, 5).map(async (obj) => {
                    try {
                        const detailsResponse = await client.get(`/services/data/v57.0/sobjects/${obj.name}/describe`);
                        return {
                            name: obj.name,
                            label: obj.label,
                            fields: detailsResponse.data.fields.map(field => ({
                                name: field.name,
                                label: field.label,
                                type: field.type,
                            })),
                        };
                    } catch (err) {
                        return { name: obj.name, label: obj.label, fields: [] };
                    }
                })
            );

            return {
                message: 'Salesforce structure retrieved successfully.',
                data: detailedObjects,
            };
        } catch (error) {
            console.error('Error retrieving Salesforce structure:', error.message);
            return { error: `Failed to retrieve structure: ${error.message}` };
        }
    },
    {
        name: 'describe_salesforce_structure',
        description: `
        Retrieves a summary of the Salesforce instance’s structure, including a list of objects and their fields.
        
        **Example Usage:**
        - "Show me the Salesforce schema."
        - "What objects and fields do I have in Salesforce?"
        
        **Output:**
        - A message along with details for a subset of objects and their fields.
    `,
        schema: z.object({}).describe("No input required."),
    }
);
