import { ToolNode } from '@langchain/langgraph/prebuilt';
import { calculatorTool } from './calculator-tool';
import { weatherTool } from './weather-tool';
import { pdfExporterTool } from './pdf-exporter';
import { fetchSalesforceMetadataTool, querySalesforceDataTool } from './salesforce/test-tools';

export const mainToolsNode = new ToolNode([calculatorTool, weatherTool, pdfExporterTool, fetchSalesforceMetadataTool, querySalesforceDataTool]);

export const toolsArray = [calculatorTool, weatherTool, pdfExporterTool, fetchSalesforceMetadataTool, querySalesforceDataTool];
