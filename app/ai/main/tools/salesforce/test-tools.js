import { ToolNode } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Tool for fetching Salesforce metadata
export const fetchSalesforceMetadataTool = tool(
    async (input) => {
        const { objectName } = input;

        // Use Salesforce API here with the user's tokens
        return `Fetching metadata for Salesforce object: ${objectName}`;
    },
    {
        name: 'fetch_metadata',
        description: 'Fetches metadata for a specified Salesforce object.',
        schema: z.object({
            objectName: z.string().describe('The name of the Salesforce object to fetch metadata for.'),
        }),
    }
);

// Tool for querying Salesforce data
export const querySalesforceDataTool = tool(
    async (input) => {
        const { query } = input;

        // Use Salesforce API here to execute a SOQL query
        return `Executing Salesforce SOQL query: ${query}`;
    },
    {
        name: 'query_salesforce_data',
        description: 'Executes a Salesforce SOQL query.',
        schema: z.object({
            query: z.string().describe('The SOQL query to execute.'),
        }),
    }
);

// Export Salesforce tools node
export const salesforceToolsNode = new ToolNode([
    fetchSalesforceMetadataTool,
    querySalesforceDataTool,
]);
