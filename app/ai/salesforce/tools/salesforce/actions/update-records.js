import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceUpdateTool = tool(
    async (input) => {
        const { objectName, recordId, data } = input;

        // Validate input
        if (!objectName || typeof objectName !== 'string' || objectName.trim() === '') {
            return { error: 'Invalid input: "objectName" must be a non-empty string matching a Salesforce object.' };
        }
        if (!recordId || typeof recordId !== 'string' || recordId.trim() === '') {
            return {
                error: `
                    To update a record in the "${objectName}" object, the Record ID is required.
                    Use a query tool to find the record ID based on other criteria (e.g., Name, Email, or custom fields).
                    
                    Example:
                    - Query for the ID of a Contact with the name "John Doe".
                    - Once the ID is retrieved, use this update tool to modify the record fields.
                    
                    Please query the Record ID for "${objectName}" first before attempting this action.
                `,
            };
        }
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            return { error: 'Invalid input: "data" must be a non-empty object containing field-value pairs to update.' };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Updating record in Salesforce object: "${objectName}" with ID: "${recordId}" (Attempt ${attempts + 1})`);

                // Execute the update action
                await client.patch(`/services/data/v57.0/sobjects/${objectName}/${recordId}`, data);

                return {
                    message: `Record with ID "${recordId}" successfully updated in the "${objectName}" object.`,
                };
            } catch (error) {
                attempts++;

                if (error.response) {
                    const statusCode = error.response.status;
                    const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';

                    console.error(`Salesforce API Error (${statusCode}): ${apiError}`);

                    // Handle specific errors
                    if (statusCode === 401 || statusCode === 403) {
                        return { error: 'Unauthorized access: Check your API credentials or permissions.' };
                    }
                    if (statusCode === 404) {
                        return { error: `Record with ID "${recordId}" not found in the "${objectName}" object.` };
                    }
                    if (statusCode === 400) {
                        return { error: `Invalid update request: ${apiError}. Ensure correct field names and values.` };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error updating Salesforce record: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to update the record with ID "${recordId}" in the "${objectName}" object. Possible reasons:
                - The object name is incorrect (case-sensitive).
                - The record ID is invalid or does not exist.
                - The provided field names do not match Salesforce schema.
                - Your API credentials lack the necessary permissions.
                - A Salesforce API issue occurred.

                Please verify the object name, record ID, and field data, then try again.
            `,
        };
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
            - The tool retries automatically if there are transient errors.
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
