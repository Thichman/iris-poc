import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { calculatorTool } from './tools/calculator-tool';
import { weatherTool } from './tools/weather-tool';
import { ChatOpenAI } from '@langchain/openai';
import { mainToolsNode } from './main-tools';
// Define and export the main model
export const mainModel = new ChatOpenAI({
    model: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY, // Ensure this is set in your .env.local file
}).bindTools([calculatorTool, weatherTool]); // Bind tools directly

async function callMainAgent(state) {
    const { messages } = state;

    // Invoke the model
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

// Export the main workflow
export const mainWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('main_agent', callMainAgent)
    .addNode('tools', mainToolsNode) // This remains as it handles tool execution
    .addEdge('__start__', 'main_agent')
    .addConditionalEdges('main_agent', shouldContinue)
    .addEdge('tools', 'main_agent')
    .compile();
