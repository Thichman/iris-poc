import { mainModel } from './main-agent';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { mainToolsNode } from './tools/salesforce-tools';
import { salesforceDescribeTool } from './tools/salesforce/queries/describe-salesforce-table';

async function callMainAgent(state) {
    const { messages } = state;
    const response = await mainModel.invoke(messages);
    return { messages: response };
}

// New function to call the Salesforce Describe Tool
async function callSalesforceDescribe(state) {
    const { messages } = state;
    // Assume the last message contains the object name to describe.
    const lastMessage = messages[messages.length - 1];
    // Here, we assume the last message is in the format: "describe: Opportunity" 
    // or similar. You can adjust the parsing logic as needed.
    const objectName = lastMessage.content.split(':')[1]?.trim() || '';
    if (!objectName) {
        return { messages: [...messages, { role: 'assistant', content: 'No object specified to describe.' }] };
    }
    const response = await salesforceDescribeTool.invoke({ objectName });
    return { messages: [...messages, response] };
}

// Decision logic: decide what to do based on the last message.
function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1] || {};

    // Check for a Salesforce describe trigger (if the message contains keywords like "describe", "schema", or "structure")
    if (
        lastMessage.content &&
        (
            lastMessage.content.toLowerCase().includes("describe") ||
            lastMessage.content.toLowerCase().includes("schema") ||
            lastMessage.content.toLowerCase().includes("structure")
        )
    ) {
        console.log("🔍 'Describe' trigger detected, routing to salesforce_describe...");
        return 'describe_salesforce';
    }

    // Check for tool calls in the message
    if (
        lastMessage.tool_calls &&
        Array.isArray(lastMessage.tool_calls) &&
        lastMessage.tool_calls.length > 0
    ) {
        console.log("🟡 Tool calls detected, routing to tools...");
        return 'tools';
    }

    // Check for typical failure phrases
    if (
        lastMessage.content.includes("Salesforce API Error") ||
        lastMessage.content.includes("Failed to execute query") ||
        lastMessage.content.includes("Error executing agent") ||
        lastMessage.content.includes("Unexpected error") ||
        lastMessage.content.includes("Unable to process request")
    ) {
        console.error("❌ Detected failure message, routing to handle_failure:", lastMessage.content);
        return 'handle_failure';
    }

    return '__end__';
}

async function handleFailure(state) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] || {};

    console.error("❌ Tool execution failed:", lastMessage.content);

    let failureType = "unknown";
    if (lastMessage.content.includes("Salesforce API Error")) failureType = "salesforce_error";
    if (lastMessage.content.includes("query")) failureType = "query_failure";
    if (lastMessage.content.includes("permission")) failureType = "permission_issue";
    if (lastMessage.content.includes("missing required fields")) failureType = "missing_data";

    let retryMessage = { role: "assistant", content: "I encountered an issue executing that request. Trying an alternative approach..." };

    if (failureType === "query_failure") {
        retryMessage.content = "I encountered an issue retrieving data. Let me try a broader search.";
    } else if (failureType === "missing_data") {
        retryMessage.content = "I need additional details to complete your request. Can you provide missing fields?";
    } else if (failureType === "salesforce_error") {
        retryMessage.content = "There was a Salesforce API issue. Retrying...";
    } else if (failureType === "permission_issue") {
        retryMessage.content = "It looks like I might not have the right permissions. Checking an alternative method.";
    }

    messages.push(retryMessage);
    return { messages };
}

export const mainWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('main_agent', callMainAgent)
    .addNode('tools', mainToolsNode)
    .addNode('describe_salesforce', callSalesforceDescribe)
    .addNode('handle_failure', handleFailure)
    .addEdge('__start__', 'main_agent')
    .addConditionalEdges('main_agent', shouldContinue)
    .addEdge('describe_salesforce', 'main_agent')
    .addEdge('tools', 'main_agent')
    .addEdge('handle_failure', 'main_agent')
    .compile();
