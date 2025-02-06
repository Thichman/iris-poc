import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceBulkTool = tool(
    async (input) => {
        const { operation, objectName, data } = input;
        const allowedOperations = ['insert', 'update', 'upsert', 'delete', 'hardDelete'];

        // Validate input parameters
        if (!operation || typeof operation !== 'string' || !allowedOperations.includes(operation)) {
            return { error: `Invalid operation: must be one of ${allowedOperations.join(', ')}.` };
        }
        if (!objectName || typeof objectName !== 'string' || objectName.trim() === '') {
            return { error: 'Invalid input: "objectName" must be a non-empty string.' };
        }
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { error: 'Invalid input: "data" must be a non-empty array of records.' };
        }

        try {
            const client = await createSalesforceClient();
            console.log(`Creating Bulk API job for object "${objectName}" with operation "${operation}"`);

            // Step 1: Create a Bulk API job
            const jobPayload = {
                object: objectName,
                operation: operation,
                contentType: 'JSON',
            };
            const createJobResponse = await client.post('/services/data/v57.0/jobs/ingest', jobPayload);
            const jobId = createJobResponse.data.id;
            console.log(`Bulk API job created with ID: ${jobId}`);

            // Step 2: Upload records to the job
            await client.put(
                `/services/data/v57.0/jobs/ingest/${jobId}/rows`,
                data,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log(`Data uploaded for job ${jobId}`);

            // Step 3: Close the job to start processing
            const closePayload = { state: 'UploadComplete' };
            const closeResponse = await client.patch(`/services/data/v57.0/jobs/ingest/${jobId}`, closePayload);
            console.log(`Job ${jobId} closed`);

            return {
                message: `Bulk job ${jobId} created and data uploaded successfully.`,
                jobId,
                jobInfo: closeResponse.data,
            };
        } catch (error) {
            if (error.response) {
                const statusCode = error.response.status;
                const apiError =
                    error.response.data[0]?.message || error.response.data.message || 'Unknown API error';
                console.error(`Salesforce Bulk API Error (${statusCode}): ${apiError}`);
                return { error: `Salesforce Bulk API Error: ${apiError}` };
            } else {
                console.error(`Unexpected error: ${error.message}`);
                return { error: error.message };
            }
        }
    },
    {
        name: 'salesforce_bulk',
        description: `
      A tool for performing bulk operations on Salesforce data using Bulk API 2.0.
      
      Supported Operations:
      - insert: Create new records.
      - update: Update existing records.
      - upsert: Update or insert records based on an external ID.
      - delete: Delete records.
      - hardDelete: Permanently delete records.
      
      Workflow:
      1. Create a Bulk API job for the specified object and operation.
      2. Upload a JSON array of records to the job.
      3. Close the job to begin asynchronous processing.
      
      Notes:
      - The data payload must be a non-empty array of JSON objects.
      - Ensure the fields in the data match the Salesforce object schema.
      - Since the Bulk API processes jobs asynchronously, you may use other tools to monitor the job status.
    `,
        schema: z.object({
            operation: z
                .string()
                .describe('The bulk operation to perform: insert, update, upsert, delete, or hardDelete.'),
            objectName: z
                .string()
                .describe('The Salesforce object API name (e.g., "Account", "Contact").'),
            data: z
                .array(z.record(z.any()))
                .describe('An array of records to process in bulk.'),
        }),
    }
);
