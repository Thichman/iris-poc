import { ToolNode } from '@langchain/langgraph/prebuilt';
import { describeSalesforceStructure } from './salesforce/get-salesforce-layout';
import { salesforceQueryTool } from './salesforce/query-salesforce-data';
import { salesforceQuerySobjectTool } from './salesforce/get-salesforce-data';
import { salesforceDescribeTool } from './salesforce/describe-salesforce-table';

export const mainToolsNode = new ToolNode([
    describeSalesforceStructure,
    salesforceQueryTool,
    salesforceQuerySobjectTool,
    salesforceDescribeTool,
]);

export const toolsArray = [
    describeSalesforceStructure,
    salesforceQueryTool,
    salesforceQuerySobjectTool,
    salesforceDescribeTool,
];
