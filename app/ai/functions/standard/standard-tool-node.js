import { ToolNode } from '@langchain/langgraph/prebuilt';
import { calculatorTool } from './calculator-test';
import { weatherTool } from './weather';

export const standardToolNode = new ToolNode([calculatorTool, weatherTool]);
