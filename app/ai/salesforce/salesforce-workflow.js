import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { salesforceAgentModel } from './salesforce-agent';
import { salesforceToolsNode } from './tools/test-tools';

// Function to call the Salesforce agent
async function callSalesforceAgent(state) {
    const { messages } = state;

    const response = await salesforceAgentModel.invoke(messages);
    return { messages: response };
}

// Decision logic for Salesforce workflow
function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'tools';
    }
    return '__end__';
}

// Define and export the Salesforce workflow
export const salesforceWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('salesforce_agent', callSalesforceAgent)
    .addNode('tools', salesforceToolsNode)
    .addEdge('__start__', 'salesforce_agent')
    .addConditionalEdges('salesforce_agent', shouldContinue)
    .addEdge('tools', 'salesforce_agent')
    .compile();
