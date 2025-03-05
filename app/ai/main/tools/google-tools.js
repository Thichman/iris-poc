import { ToolNode } from '@langchain/langgraph/prebuilt';

// actions
import { googleCalendarTool } from './google/actions/google-calendar';
import { googleDriveFileTool } from './google/actions/google-drive';

export const googleToolsNode = new ToolNode([
    googleCalendarTool,
    googleDriveFileTool,
]);

export const googleToolsArray = [
    googleCalendarTool,
    googleDriveFileTool,
];
