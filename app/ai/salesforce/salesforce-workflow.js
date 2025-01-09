import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { salesforceAgentModel } from './salesforce-agent';
import { salesforceToolsNode } from '../main/tools/salesforce/test-tools';

//TODO: make this work within the main agent and flow

// Function to call the Salesforce agent
async function callSalesforceAgent(state) {
    const { messages } = state;
    console.log(messages)
    const response = await salesforceAgentModel.invoke(messages);
    return { messages: response };
}

// Decision logic for Salesforce workflow
function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'tools'; // Route to tools if tool calls are pending
    }
    return '__end__'; // Stop when no further action is needed
}

export const salesforceWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('salesforce_agent', callSalesforceAgent)
    .addNode('tools', salesforceToolsNode)
    .addEdge('__start__', 'salesforce_agent')
    .addConditionalEdges('salesforce_agent', shouldContinue)
    .addEdge('tools', '__end__') // End after tools execution
    .compile();

