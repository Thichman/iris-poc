import { ToolNode } from '@langchain/langgraph/prebuilt';
import { googleCreateDocTool } from './tools/create-google-doc';

export const googleToolsNode = new ToolNode([googleCreateDocTool]);
