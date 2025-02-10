import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceCreateTool = tool(
    async (input) => {
        const { objectName, data } = input;

        // Ensure correct object name for Sales Console
        const salesforceObjectMap = {
            "Opportunities": "Opportunity",
            "Leads": "Lead",
            "Contacts": "Contact"
        };
        const apiObjectName = salesforceObjectMap[objectName] || objectName;

        // Validate required fields for Sales Console Opportunities
        if (apiObjectName === "Opportunity" && (!data.StageName || !data.CloseDate)) {
            return { error: "Missing required fields: StageName and CloseDate are mandatory for Opportunities." };
        }

        // Validate API user permissions before proceeding
        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Creating Salesforce record: "${apiObjectName}" with data:`, data);

                // Execute API call
                const response = await client.post(`/services/data/v57.0/sobjects/${apiObjectName}`, data);

                return {
                    message: `Record successfully created in ${apiObjectName}.`,
                    id: response.data.id,
                };
            } catch (error) {
                attempts++;

                if (error.response) {
                    const statusCode = error.response.status;
                    const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';

                    console.error(`❌ Salesforce API Error (${statusCode}): ${apiError}`);

                    if (statusCode === 400) {
                        return { error: `Invalid data or missing required fields: ${apiError}.` };
                    }
                    if (statusCode === 403) {
                        return { error: "Permission denied: The API user may not have access to create this record." };
                    }
                    if (statusCode === 404) {
                        return { error: `Salesforce object "${apiObjectName}" not found. Ensure the object exists.` };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError} after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error: ${error.message}`);
                }

                await new Promise(res => setTimeout(res, 2000)); // Retry delay
            }
        }

        return { error: `Failed to create record in "${apiObjectName}". Please check API permissions and required fields.` };
    },
    {
        name: 'salesforce_create',
        description: `
            Create a new record in a specific Salesforce object. Supports Sales Console adjustments.
            
            Example Usage:
            - Create a new Opportunity with required fields: Name, StageName, CloseDate.
            - Ensure correct object name mapping for Sales Console.
            - Automatically retries if Salesforce API rate limits occur.

            Notes:
            - If an Opportunity is being created, StageName and CloseDate are required.
            - If permissions are missing, the tool will return a clear error.
        `,
        schema: z.object({
            objectName: z
                .string()
                .describe('The Salesforce object where the record should be created. Example: "Opportunity".'),
            data: z
                .record(z.string())
                .describe(
                    'A key-value pair object where the keys are field names in the Salesforce object, and the values are the data to insert. Example: { "Name": "Sales 1", "StageName": "Prospecting", "CloseDate": "2024-12-31" }.'
                ),
        }),
    }
);
