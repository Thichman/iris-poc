import { ToolNode } from '@langchain/langgraph/prebuilt';
import { calculatorTool } from './tools/calculator-tool';
import { weatherTool } from './tools/weather-tool';
import { pdfExporterTool } from './tools/pdf-exporter';

export const mainToolsNode = new ToolNode([calculatorTool, weatherTool, pdfExporterTool]);
