import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceDeleteTool = tool(
    async (input) => {
        const { objectName, recordId } = input;

        // Validate input
        if (!objectName || typeof objectName !== 'string' || objectName.trim() === '') {
            return { error: 'Invalid input: "objectName" must be a non-empty string matching a Salesforce object.' };
        }
        if (!recordId || typeof recordId !== 'string' || recordId.trim() === '') {
            return {
                error: `
                    To delete a record from the "${objectName}" object, the Record ID is required. 
                    Use a query tool to find the record based on other criteria (e.g., Name, Email, or custom fields).
                    
                    Example:
                    - Query for the ID of a Contact with the name "John Doe".
                    - Once the ID is retrieved, use this delete tool to remove the record.
                    
                    Please query the Record ID for "${objectName}" first before attempting this action.
                `,
            };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Attempting to delete record in Salesforce object: "${objectName}" with ID: "${recordId}" (Attempt ${attempts + 1})`);

                // Perform the DELETE request
                const response = await client.delete(`/services/data/v57.0/sobjects/${objectName}/${recordId}`);

                // Check for successful deletion
                if (response.status === 204) {
                    return {
                        message: `Record with ID "${recordId}" has been successfully deleted from the "${objectName}" object.`,
                    };
                } else {
                    return {
                        error: `Unexpected response from Salesforce while deleting record with ID "${recordId}" from the "${objectName}" object.`,
                    };
                }
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
                        return { error: `Invalid request: ${apiError}. Ensure the object name and record ID are correct.` };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error deleting Salesforce record: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Unable to delete the record with ID "${recordId}" from the "${objectName}" object. Possible reasons:
                - The object name is incorrect (case-sensitive).
                - The record ID is invalid or does not exist.
                - Your API credentials lack the necessary permissions.
                - A Salesforce API issue occurred.

                Please verify the object name, record ID, and permissions, then try again.
            `,
        };
    },
    {
        name: 'salesforce_delete',
        description: `
            Delete a specific record from a Salesforce object using its record ID.
            If the record ID is not provided, the agent should first query for it using other tools.

            Example:
            - Delete a Contact with the name "John Doe" by first querying for their record ID.
            - Ensure that the object name and any query parameters are accurate.
            - The tool will attempt the deletion and provide success confirmation or error details.

            Notes:
            - Ensure the object name is correct and case-sensitive.
            - If the record ID is unknown, query for it before deletion.
            - The tool retries automatically if there are transient errors.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe('The API name of the Salesforce object from which the record should be deleted. Example: "Account", "Contact", etc.'),
            recordId: z
                .string()
                .optional()
                .describe('The ID of the record to be deleted from the specified object. If not provided, query for the record ID first.'),
        }),
    }
);
