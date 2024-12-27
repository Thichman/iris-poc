import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { googleToolNode } from './google-tools';

async function callGoogleAgent(state) {
    const { messages } = state;
    const response = await googleModel.invoke(messages);
    return { messages: response };
}

export const googleAgentWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('google_agent', callGoogleAgent)
    .addNode('google_tools', googleToolNode)
    .addEdge('__start__', 'google_agent')
    .addEdge('google_tools', 'google_agent')
    .compile();
