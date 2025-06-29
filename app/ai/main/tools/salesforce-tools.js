import { ToolNode } from '@langchain/langgraph/prebuilt';

// Query Tools
import { describeSalesforceStructure } from './salesforce/queries/get-salesforce-layout';
import { salesforceQueryTool } from './salesforce/queries/query-salesforce-data';
import { salesforceDescribeTool } from './salesforce/queries/describe-salesforce-table';
import { salesforceObjectLookupTool } from './salesforce/queries/object-lookup';
import { salesforceObjectLinkTool } from './salesforce/queries/salesforce-link-finder';
import { dynamicSalesforceQueryTool } from './salesforce/queries/dynamic-query-tool';
import { salesforceCompositeTool } from './salesforce/queries/composite-tool';

// Action Tools
import { salesforceUpdateTool } from './salesforce/actions/update-records';
import { salesforceDeleteTool } from './salesforce/actions/delete-record';
import { salesforceCustomApexTool } from './salesforce/actions/custom-apex';
import { salesforceCreateTool } from './salesforce/actions/create-record';
import { salesforceMetadataTool } from './salesforce/actions/salesforce-metadata-tool';
import { webSearchTool } from './salesforce/actions/search-internet';
import { salesforceRestApiTool } from './salesforce/queries/rest-actions';
import { salesforceBulkTool } from './salesforce/queries/salesforce-bulk';
import { salesforceCreateReportTool } from './salesforce/actions/create-report';

// Google Tools
import { googleCalendarTool } from './google/actions/google-calendar';
import { googleDriveFileTool } from './google/actions/google-drive';

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
    salesforceMetadataTool,
    webSearchTool,
    salesforceCompositeTool,
    salesforceRestApiTool,
    salesforceBulkTool,
    salesforceCreateReportTool,
    googleCalendarTool,
    googleDriveFileTool,
]);

export const salesforceToolsArray = [
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
    salesforceMetadataTool,
    webSearchTool,
    salesforceCompositeTool,
    salesforceRestApiTool,
    salesforceBulkTool,
    salesforceCreateReportTool,
];
