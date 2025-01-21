import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export const salesforceCustomApexTool = tool(
    async (input) => {
        const { action, apexDescription, apexCode, className, classCode } = input;

        try {
            const client = await createSalesforceClient();

            if (action === 'executeAnonymous') {
                // Execute anonymous Apex code
                const response = await client.post('/services/data/v57.0/tooling/executeAnonymous', {
                    apexCode,
                });

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
                    return `Error compiling Apex code: ${compileProblem} at line ${line}, column ${column}`;
                }

                if (!success) {
                    return `Apex runtime error: ${exceptionMessage}\nStack Trace: ${exceptionStackTrace}`;
                }

                return `Apex executed successfully.`;
            } else if (action === 'getApexClasses') {
                // Retrieve all available Apex classes
                const response = await client.get('/services/data/v57.0/tooling/query', {
                    params: {
                        q: `SELECT Name, Status FROM ApexClass`,
                    },
                });

                const classes = response.data.records.map((record) => ({
                    name: record.Name,
                    status: record.Status,
                }));

                return {
                    message: 'Available Apex classes retrieved successfully.',
                    classes,
                };
            } else if (action === 'createApexClass') {
                // Create a new Apex class
                const response = await client.post('/services/data/v57.0/tooling/sobjects/ApexClass', {
                    Name: className,
                    Body: classCode,
                });

                if (response.status === 201) {
                    return `Apex class "${className}" created successfully.`;
                } else {
                    return `Unexpected response while creating Apex class "${className}".`;
                }
            } else {
                return `Invalid action. Use "executeAnonymous", "getApexClasses", or "createApexClass".`;
            }
        } catch (error) {
            console.error('Error handling custom Apex:', error.message);
            return `Failed to process custom Apex request. Please check your input or permissions.`;
        }
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
