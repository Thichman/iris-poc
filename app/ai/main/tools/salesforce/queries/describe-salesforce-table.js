import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceDescribeTool = tool(
    async (input) => {
        try {
            const client = await createSalesforceClient();
            const { objectName } = input;

            // Validate input
            if (!objectName || typeof objectName !== 'string') {
                throw new Error('Invalid input: objectName is required and must be a string.');
            }

            // Fetch object metadata
            const response = await client.get(`/services/data/v57.0/sobjects/${objectName}/describe`);
            const fields = response.data.fields.map(field => ({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.nillable === false, // Fields that are not nillable are required
                length: field.length || null, // Include field length if applicable
            }));

            return {
                message: `The structure of the "${objectName}" object was successfully retrieved.`,
                objectName: response.data.name,
                fields,
            };
        } catch (error) {
            console.error('Error describing Salesforce object:', error.message);

            if (error.response && error.response.data) {
                const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';
                return {
                    error: `Salesforce API Error: ${apiError}`,
                };
            }

            return {
                error: `
                    Unable to retrieve fields for the object "${input.objectName}". Possible reasons:
                    - The object name is incorrect (case-sensitive).
                    - You lack sufficient permissions to access the object's metadata.
                    - A Salesforce API issue occurred.

                    Please verify the object name and your permissions, and try again.
                `,
            };
        }
    },
    {
        name: 'salesforce_describe',
        description: `
            Retrieve metadata about a Salesforce object's structure, including field names, labels, data types, 
            whether fields are required, and their length (if applicable).

            Ideal for inspecting the structure of objects such as "Contact", "Account", or custom objects before 
            performing operations like queries or record updates.

            Example Scenarios:
            - "Describe the Contact object to get field details like FirstName, LastName, and Email."
            - "What fields are available on the Opportunity object?"

            Notes:
            - The "objectName" must be the exact API name of the Salesforce object (e.g., "Account", "Contact", "Opportunity").
            - This tool does not retrieve actual records but rather describes the object's structure.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe(`
                    The exact API name of the Salesforce object to describe (case-sensitive).
                    Examples: "Account", "Contact", "Opportunity", or custom objects like "CustomObject__c".
                `),
        }),
    }
);
