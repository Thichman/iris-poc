import { ToolNode } from '@langchain/langgraph/prebuilt';
import { describeSalesforceStructure } from './salesforce/get-salesforce-layout';

export const mainToolsNode = new ToolNode([
    describeSalesforceStructure
]);

export const toolsArray = [
    describeSalesforceStructure
];
