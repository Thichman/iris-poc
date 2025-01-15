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
        description: `
            Retrieve detailed information about the fields of a specified Salesforce object.
            This tool is ideal for understanding the structure of a Salesforce object, including the names, labels, and types of its fields.

            Example Usage:
            - If you want to query the fields of the "Contact" object, this tool will provide details about its fields such as "FirstName", "LastName", and "Email".
            - Use this tool to verify the structure of an object before querying it.

            Notes:
            - The "objectName" should match the exact API name of the Salesforce object (e.g., "Account", "Contact", "Opportunity").
            - Ensure that the authenticated user has sufficient permissions to access the object's metadata.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe(`
                    The API name of the Salesforce object to describe.
                    Examples include "Account", "Contact", or "Opportunity".
                    This field is case-sensitive and must exactly match the Salesforce object name.
                `),
        }),
    }
);
