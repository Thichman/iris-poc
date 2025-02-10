import { mainModel } from './main-agent';
import { salesforceAgentModel } from '../salesforce/salesforce-agent';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';

// Calls the main agent with the current messages.
async function callMainAgent(state) {
    const { messages } = state;
    console.log("Calling main agent with messages:", messages);
    try {
        const response = await mainModel.invoke(messages);
        console.log("Main agent response:", response);
        return { messages: response };
    } catch (error) {
        console.error("Error invoking main agent:", error);
        // Return an error message with a supported role.
        return {
            messages: [
                ...messages,
                { role: 'assistant', content: 'Error executing main agent.' }
            ],
        };
    }
}

// Delegates Salesforce tasks to the dedicated Salesforce agent.
async function callSalesforceAgent(state) {
    const { messages } = state;
    try {
        const response = await salesforceAgentModel.invoke(messages);
        return { messages: response };
    } catch (error) {
        console.error("Error invoking Salesforce agent:", error);
        // Return an error message without a tool_calls field.
        return {
            messages: [
                ...messages,
                { role: 'assistant', content: 'Error executing Salesforce agent.' }
            ],
        };
    }
}

// Updated decision logic to detect Salesforce-related tasks.
// This checks if the last message includes the word "salesforce"
// or if any tool call identifiers mention "salesforce".
function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1] || {};

    // Check for Salesforce-specific keywords in content.
    if (
        lastMessage.content &&
        lastMessage.content.toLowerCase().includes("salesforce")
    ) {
        console.log("Salesforce keyword detected in message content.");
        return 'salesforce_agent';
    }

    // Also check if any tool_calls include "salesforce".
    if (lastMessage.tool_calls && Array.isArray(lastMessage.tool_calls)) {
        const hasSalesforceToolCall = lastMessage.tool_calls.some(call =>
            call.toLowerCase().includes("salesforce")
        );
        if (hasSalesforceToolCall) {
            console.log("Salesforce tool call detected.");
            return 'salesforce_agent';
        }
    }

    // Check for typical failure phrases.
    if (
        lastMessage.content.includes("Salesforce API Error") ||
        lastMessage.content.includes("Failed to execute query") ||
        lastMessage.content.includes("Error executing agent") ||
        lastMessage.content.includes("Unexpected error") ||
        lastMessage.content.includes("Unable to process request")
    ) {
        console.error("Failure detected, routing to handle_failure:", lastMessage.content);
        return 'handle_failure';
    }

    return '__end__';
}

// Handles failures by analyzing the error and appending a clarifying message.
async function handleFailure(state) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] || {};

    let failureType = "unknown";
    if (lastMessage.content.includes("Salesforce API Error")) failureType = "salesforce_error";
    else if (lastMessage.content.includes("query")) failureType = "query_failure";
    else if (lastMessage.content.includes("permission")) failureType = "permission_issue";
    else if (lastMessage.content.includes("missing required fields")) failureType = "missing_data";

    let retryMessage = { role: "assistant", content: "I encountered an issue executing that request. Trying an alternative approach..." };

    if (failureType === "query_failure") {
        retryMessage.content = "I encountered an issue retrieving data. Let me try a broader search.";
    } else if (failureType === "missing_data") {
        retryMessage.content = "I need additional details to complete your request. Can you provide the missing fields?";
    } else if (failureType === "salesforce_error") {
        retryMessage.content = "There was a Salesforce API issue. Retrying with an alternative method...";
    } else if (failureType === "permission_issue") {
        retryMessage.content = "It looks like I might not have the right permissions. Checking an alternative approach.";
    }

    messages.push(retryMessage);
    return { messages };
}

export const mainWorkflow = new StateGraph(MessagesAnnotation)
    .addNode('main_agent', callMainAgent)
    .addNode('salesforce_agent', callSalesforceAgent)
    .addNode('handle_failure', handleFailure)
    .addEdge('__start__', 'main_agent')
    .addConditionalEdges('main_agent', shouldContinue)
    .addEdge('salesforce_agent', 'main_agent')
    .addEdge('handle_failure', 'main_agent')
    .compile();
