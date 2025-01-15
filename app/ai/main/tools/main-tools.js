import { ToolNode } from '@langchain/langgraph/prebuilt';

// Query Tools
import { describeSalesforceStructure } from './salesforce/queries/get-salesforce-layout';
import { salesforceQueryTool } from './salesforce/queries/query-salesforce-data';
import { salesforceDescribeTool } from './salesforce/queries/describe-salesforce-table';
import { salesforceObjectLookupTool } from './salesforce/queries/object-lookup';
import { salesforceObjectLinkTool } from './salesforce/queries/salesforce-link-finder';
import { dynamicSalesforceQueryTool } from './salesforce/queries/dynamic-query-tool';

// Action Tools
import { salesforceUpdateTool } from './salesforce/actions/update-records';
import { salesforceDeleteTool } from './salesforce/actions/delete-record';
import { salesforceCustomApexTool } from './salesforce/actions/custom-apex';
import { salesforceCreateTool } from './salesforce/actions/create-record';

export const mainToolsNode = new ToolNode([
    describeSalesforceStructure,
    salesforceQueryTool,
    salesforceDescribeTool,
    salesforceObjectLookupTool,
    salesforceObjectLinkTool,
    dynamicSalesforceQueryTool,
    salesforceUpdateTool,
    salesforceDeleteTool,
    salesforceCreateTool,
    salesforceCustomApexTool,
]);

export const toolsArray = [
    salesforceQueryTool,
    salesforceDescribeTool,
    salesforceObjectLookupTool,
    describeSalesforceStructure,
    salesforceObjectLinkTool,
    dynamicSalesforceQueryTool,
    salesforceUpdateTool,
    salesforceDeleteTool,
    salesforceCreateTool,
    salesforceCustomApexTool,
];
