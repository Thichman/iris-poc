import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceMetadataTool = tool(
    async (input) => {
        const { action, metadataType, metadataName, customObjectDetails } = input;

        // Validate input
        if (!action || !['retrieveMetadata', 'createCustomObject'].includes(action)) {
            return { error: 'Invalid action. Use "retrieveMetadata" or "createCustomObject".' };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Performing metadata action: "${action}" (Attempt ${attempts + 1})`);

                if (action === 'retrieveMetadata') {
                    if (!metadataType || !metadataName) {
                        return { error: 'Both "metadataType" and "metadataName" are required for metadata retrieval.' };
                    }

                    // Query metadata
                    const response = await client.get(`/services/data/v57.0/tooling/query`, {
                        params: { q: `SELECT DeveloperName, NamespacePrefix, CreatedDate FROM ${metadataType} WHERE DeveloperName = '${metadataName}'` },
                    });

                    if (!response || !response.data || !response.data.records || response.data.records.length === 0) {
                        return { error: `No metadata found for "${metadataName}" in metadata type "${metadataType}".` };
                    }

                    return {
                        message: `Metadata retrieved successfully for "${metadataName}".`,
                        metadata: response.data.records,
                    };
                }

                if (action === 'createCustomObject') {
                    if (!customObjectDetails || typeof customObjectDetails !== 'object' || !customObjectDetails.fullName) {
                        return { error: 'Invalid input: "customObjectDetails" must be a valid object containing "fullName" and other required fields.' };
                    }

                    // Create a new custom object using the Metadata API
                    const response = await client.post('/services/data/v57.0/tooling/sobjects/CustomObject', customObjectDetails);

                    if (response.status === 201) {
                        return {
                            message: `Custom object "${customObjectDetails.fullName}" created successfully.`,
                            objectId: response.data.id,
                        };
                    } else {
                        return { error: `Unexpected response while creating custom object "${customObjectDetails.fullName}".` };
                    }
                }

            } catch (error) {
                attempts++;

                if (error.response) {
                    const statusCode = error.response.status;
                    const apiError = error.response.data[0]?.message || error.response.data.message || 'Unknown API error';

                    console.error(`Salesforce Metadata API Error (${statusCode}): ${apiError}`);

                    if (statusCode === 401 || statusCode === 403) {
                        return { error: 'Unauthorized access: Check your API credentials or permissions.' };
                    }
                    if (statusCode === 400) {
                        return { error: `Invalid metadata request: ${apiError}. Ensure correct metadata type and values.` };
                    }
                    if (statusCode === 404) {
                        return { error: `Metadata "${metadataName}" not found in type "${metadataType}".` };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce Metadata API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error handling Salesforce metadata: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `Unable to complete metadata action "${action}". Verify API permissions and try again.`,
        };
    },
    {
        name: 'salesforce_metadata',
        description: `
            Retrieve or create Salesforce metadata, such as objects, fields, layouts, or other metadata components.

            Actions:
            - "retrieveMetadata": Retrieve metadata details for an object, field, or layout.
            - "createCustomObject": Create a new custom object in Salesforce.

            Example Usage:
            - Fetch metadata for a specific CustomObject.
            - Create a new Custom Object with defined fields and configurations.

            Notes:
            - "metadataType" must be a valid Salesforce metadata type (e.g., "CustomObject", "CustomField").
            - "metadataName" must be the exact API name of the metadata component.
            - To create an object, "customObjectDetails" must include fields like "fullName", "label", "pluralLabel", and "deploymentStatus".
        `,
        schema: z.object({
            action: z
                .enum(['retrieveMetadata', 'createCustomObject'])
                .describe('The metadata action to perform. "retrieveMetadata" or "createCustomObject".'),
            metadataType: z
                .string()
                .optional()
                .describe('The metadata type to query. Example: "CustomObject", "CustomField". Required for "retrieveMetadata".'),
            metadataName: z
                .string()
                .optional()
                .describe('The metadata name to retrieve. Example: "CustomObject__c". Required for "retrieveMetadata".'),
            customObjectDetails: z
                .object({
                    fullName: z.string(),
                    label: z.string(),
                    pluralLabel: z.string(),
                    deploymentStatus: z.enum(['Deployed', 'InDevelopment']),
                    sharingModel: z.enum(['ReadWrite', 'ReadOnly', 'ControlledByParent']),
                })
                .optional()
                .describe('Custom object details for "createCustomObject" action. Must include "fullName", "label", and other required fields.'),
        }),
    }
);
