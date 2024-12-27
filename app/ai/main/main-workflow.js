import { mainModel } from './main-agent'; // Import the defined main model
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { mainToolsNode } from './main-tools';

async function callMainAgent(state) {
    const { messages } = state;

    const response = await mainModel.invoke(messages);
    return { messages: response };
}

function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'tools'; // Route to tools if tool calls are detected
    }
    return '__end__'; // Stop if no tool call is needed
}

export const mainWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('main_agent', callMainAgent)
    .addNode('tools', mainToolsNode)
    .addEdge('__start__', 'main_agent')
    .addConditionalEdges('main_agent', shouldContinue)
    .addEdge('tools', 'main_agent')
    .compile();
