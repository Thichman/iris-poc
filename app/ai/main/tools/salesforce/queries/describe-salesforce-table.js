import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceDescribeTool = tool(
    async (input) => {
        const { objectName } = input;

        const trimmedObjectName = objectName.trim();
        if (!trimmedObjectName) {
            return { error: 'Invalid input: "objectName" is required and must be a non-empty string.' };
        }

        // Validate input
        if (!objectName || typeof objectName !== 'string') {
            return {
                error: 'Invalid input: "objectName" is required and must be a string.',
            };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Attempting to describe Salesforce object: ${objectName} (Attempt ${attempts + 1})`);

                // Fetch object metadata
                const response = await client.get(`/services/data/v57.0/sobjects/${objectName}/describe`);

                if (!response || !response.data) {
                    throw new Error('Empty response received from Salesforce API.');
                }

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
                attempts++;

                if (error.response) {
                    const statusCode = error.response.status;
                    const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';

                    console.error(`Salesforce API Error (${statusCode}): ${apiError}`);

                    // Specific handling for common Salesforce errors
                    if (statusCode === 401 || statusCode === 403) {
                        return {
                            error: `Unauthorized access: Your API token may have expired, or you lack permissions to describe the object "${objectName}".`,
                        };
                    }
                    if (statusCode === 404) {
                        return {
                            error: `Object "${objectName}" not found. Ensure the name is correct and case-sensitive.`,
                        };
                    }

                    if (attempts >= maxRetries) {
                        return {
                            error: `Salesforce API Error: ${apiError}. Tried ${maxRetries} times and failed.`,
                        };
                    }
                } else {
                    console.error(`Unexpected error describing Salesforce object: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to retrieve fields for the object "${objectName}". Possible reasons:
                - The object name is incorrect (case-sensitive).
                - You lack sufficient permissions to access the object's metadata.
                - A Salesforce API issue occurred.

                Please verify the object name and your permissions, and try again.
            `,
        };
    },
    {
        name: 'salesforce_describe',
        description: `
            Retrieve metadata about a Salesforce object's structure, including field names, labels, data types, 
            whether fields are required, and their length (if applicable).

            Example Queries:
            - "Describe the Contact object to get field details like FirstName, LastName, and Email."
            - "What fields are available on the Opportunity object?"

            Notes:
            - The "objectName" must be the exact API name of the Salesforce object (case-sensitive).
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
