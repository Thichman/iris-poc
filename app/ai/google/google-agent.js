import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { googleCreateDocTool } from './tools/create-google-doc';
import { googleToolsNode } from './google-tools';

const googleModel = new ChatOpenAI({
    model: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
}).bindTools([googleCreateDocTool]);

async function callGoogleAgent(state) {
    const { messages } = state;

    // Invoke the model
    const response = await googleModel.invoke(messages);
    return { messages: response };
}

function shouldContinueGoogle({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'google_tools';
    }
    return '__end__';
}

export const googleWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('google_agent', callGoogleAgent)
    .addNode('google_tools', googleToolsNode)
    .addEdge('__start__', 'google_agent')
    .addConditionalEdges('google_agent', shouldContinueGoogle)
    .addEdge('google_tools', 'google_agent')
    .compile();
