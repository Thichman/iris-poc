import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceCustomApexTool = tool(
    async (input) => {
        const { action, apexDescription, apexCode, className, classCode } = input;

        // Validate input
        if (!action || !['executeAnonymous', 'getApexClasses', 'createApexClass'].includes(action)) {
            return { error: 'Invalid action. Use "executeAnonymous", "getApexClasses", or "createApexClass".' };
        }

        const client = await createSalesforceClient();
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                console.log(`Executing Apex action: "${action}" (Attempt ${attempts + 1})`);

                if (action === 'executeAnonymous') {
                    if (!apexCode || typeof apexCode !== 'string' || apexCode.trim() === '') {
                        return { error: 'Invalid input: "apexCode" must be a non-empty string for executeAnonymous.' };
                    }

                    // Execute anonymous Apex code
                    const response = await client.post('/services/data/v57.0/tooling/executeAnonymous', { apexCode });

                    const {
                        compiled,
                        success,
                        line,
                        column,
                        compileProblem,
                        exceptionMessage,
                        exceptionStackTrace,
                    } = response.data;

                    if (!compiled) {
                        return {
                            error: `Error compiling Apex code: ${compileProblem} at line ${line}, column ${column}`,
                        };
                    }

                    if (!success) {
                        return {
                            error: `Apex runtime error: ${exceptionMessage}`,
                            stackTrace: exceptionStackTrace,
                        };
                    }

                    return { message: 'Apex executed successfully.' };
                }

                if (action === 'getApexClasses') {
                    // Retrieve all available Apex classes
                    const response = await client.get('/services/data/v57.0/tooling/query', {
                        params: { q: 'SELECT Name, Status FROM ApexClass' },
                    });

                    const classes = response.data.records.map((record) => ({
                        name: record.Name,
                        status: record.Status,
                    }));

                    return {
                        message: 'Available Apex classes retrieved successfully.',
                        classes,
                    };
                }

                if (action === 'createApexClass') {
                    if (!className || !classCode || typeof className !== 'string' || typeof classCode !== 'string') {
                        return { error: 'Invalid input: "className" and "classCode" must be non-empty strings for createApexClass.' };
                    }

                    // Create a new Apex class
                    const response = await client.post('/services/data/v57.0/tooling/sobjects/ApexClass', {
                        Name: className,
                        Body: classCode,
                    });

                    if (response.status === 201) {
                        return { message: `Apex class "${className}" created successfully.`, classId: response.data.id };
                    } else {
                        return { error: `Unexpected response while creating Apex class "${className}".` };
                    }
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
                    if (statusCode === 400) {
                        return { error: `Invalid Apex code or query: ${apiError}. Ensure correct Apex syntax.` };
                    }
                    if (statusCode === 404) {
                        return { error: 'Requested Apex resource not found in Salesforce.' };
                    }

                    if (attempts >= maxRetries) {
                        return { error: `Salesforce API Error: ${apiError}. Failed after ${maxRetries} attempts.` };
                    }
                } else {
                    console.error(`Unexpected error handling Apex request: ${error.message}`);
                }

                if (attempts < maxRetries) {
                    console.log(`Retrying... (Attempt ${attempts + 1})`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
                }
            }
        }

        return {
            error: `
                Failed to execute Apex action: "${action}". Possible reasons:
                - Invalid Apex syntax or missing required fields.
                - Insufficient permissions for executing Apex operations.
                - A Salesforce API issue occurred.

                Please verify your input, permissions, and try again.
            `,
        };
    },
    {
        name: 'salesforce_custom_apex',
        description: `
            Perform advanced Apex operations on Salesforce, including executing anonymous Apex code, retrieving available Apex classes, or creating new Apex classes.

            Actions:
            - "executeAnonymous": Execute a block of anonymous Apex code.
            - "getApexClasses": Retrieve all available Apex classes in the Salesforce org.
            - "createApexClass": Create a new reusable Apex class.

            Example Usage:
            - Execute an anonymous Apex block to update records dynamically.
            - Query available Apex classes to understand reusable logic in the org.
            - Create a new Apex class to encapsulate business logic for future use.

            Notes:
            - Ensure the Apex code or class definitions follow Salesforce syntax.
            - Permissions are required for the Tooling API.
        `,
        schema: z.object({
            action: z
                .enum(['executeAnonymous', 'getApexClasses', 'createApexClass'])
                .describe('The action to perform. Choose between "executeAnonymous", "getApexClasses", or "createApexClass".'),
            apexDescription: z
                .string()
                .optional()
                .describe(
                    'A detailed description of what the Apex code should do. Example: "Update the Stage field on an Opportunity based on certain criteria."'
                ),
            apexCode: z
                .string()
                .optional()
                .describe(
                    'The Apex code to execute when using the "executeAnonymous" action. Must be a valid Apex anonymous block.'
                ),
            className: z
                .string()
                .optional()
                .describe(
                    'The name of the new Apex class when using the "createApexClass" action. Example: "CustomOpportunityHandler".'
                ),
            classCode: z
                .string()
                .optional()
                .describe(
                    'The body of the new Apex class when using the "createApexClass" action. Must be valid Apex code.'
                ),
        }),
    }
);
