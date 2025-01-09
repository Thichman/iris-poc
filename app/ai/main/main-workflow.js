import { mainModel } from './main-agent';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { mainToolsNode } from './tools/main-tools';

async function callMainAgent(state) {
    const { messages } = state;

    const response = await mainModel.invoke(messages);
    return { messages: response };
}

function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'tool') {
        return 'main_agent';
    }

    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'tools';
    }

    return '__end__';
}


export const mainWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('main_agent', callMainAgent)
    .addNode('tools', mainToolsNode)
    .addEdge('__start__', 'main_agent')
    .addConditionalEdges('main_agent', shouldContinue)
    .addEdge('tools', 'main_agent')
    .compile();
