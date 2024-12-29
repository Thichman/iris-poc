import { ToolNode } from '@langchain/langgraph/prebuilt';
import { calculatorTool } from './tools/calculator-tool';
import { weatherTool } from './tools/weather-tool';
import { validateTool } from '../utils/validate-tools';
import { pdfExporterTool } from './tools/pdf-exporter';
validateTool(calculatorTool);
validateTool(weatherTool);

export const mainToolsNode = new ToolNode([calculatorTool, weatherTool, pdfExporterTool]);
