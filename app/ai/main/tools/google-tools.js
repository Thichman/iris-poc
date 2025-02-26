import { ToolNode } from '@langchain/langgraph/prebuilt';

// actions
import { googleCalendarTool } from './google/actions/google-calendar';

export const googleToolsNode = new ToolNode([
    googleCalendarTool,
]);

export const googleToolsArray = [
    googleCalendarTool,
];
