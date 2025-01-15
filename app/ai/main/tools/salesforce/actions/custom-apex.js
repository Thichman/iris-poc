import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceCustomApexTool = tool(
    async (input) => {
        const { apexDescription, apexCode } = input;

        try {
            const client = await createSalesforceClient();

            // Execute the anonymous Apex code via Salesforce REST API
            const response = await client.post('/services/data/v57.0/tooling/executeAnonymous', {
                apexCode,
            });

            const { compiled, success, line, column, compileProblem, exceptionMessage, exceptionStackTrace } = response.data;

            if (!compiled) {
                return `Error compiling Apex code: ${compileProblem} at line ${line}, column ${column}`;
            }

            if (!success) {
                return `Apex runtime error: ${exceptionMessage}\nStack Trace: ${exceptionStackTrace}`;
            }

            return `Apex executed successfully.`;
        } catch (error) {
            console.error('Error executing custom Apex:', error.message);
            return `Failed to execute custom Apex. Please check your input or permissions.`;
        }
    },
    {
        name: 'salesforce_custom_apex',
        description: `
            Execute custom Apex code on Salesforce. 
            Provide a description of what the code should do and the actual Apex code to execute.
            Note: Use Salesforce's 'Execute Anonymous' for running the code securely.
        `,
        schema: z.object({
            apexDescription: z
                .string()
                .describe('A detailed description of what the Apex code should do. Example: "Update the Stage field on an Opportunity based on certain criteria."'),
            apexCode: z
                .string()
                .describe('The Apex code to execute. This must be a valid Apex anonymous block.'),
        }),
    }
);
