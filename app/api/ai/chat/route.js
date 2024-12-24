import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';

// In-memory session memory (resets when server restarts)
const sessionMemory = {};

// Define the calculator tool using the `tool` utility
const calculatorTool = tool(
    async (input) => {
        try {
            const result = eval(input.expression); // Avoid eval in production
            return `The result is ${result}`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: 'calculator',
        description: 'Performs simple math operations.',
        schema: z.object({
            expression: z.string().describe('A mathematical expression to evaluate'),
        }),
    }
);

// Initialize the ToolNode
const toolNode = new ToolNode([calculatorTool]);

// Create the model and bind tools
const model = new ChatOpenAI({
    model: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
}).bindTools([calculatorTool]);

// Define the function to call the model
async function callModel(state) {
    const { messages } = state;
    const response = await model.invoke(messages);
    return { messages: response };
}

// Define the decision logic
function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'tools'; // Route to tools if a tool call is detected
    }
    return '__end__'; // Stop if no tool call is needed
}

// Define the workflow using StateGraph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent')
    .compile();

export async function POST(req) {
    try {
        const { query, sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required.' });
        }

        // Initialize session memory if not already set
        if (!sessionMemory[sessionId]) {
            sessionMemory[sessionId] = [];
        }

        // Append user query to memory
        sessionMemory[sessionId].push(new HumanMessage(query));

        // Run the compiled app with session memory
        const response = await workflow.invoke({
            messages: sessionMemory[sessionId],
        });

        // Append the response to memory
        sessionMemory[sessionId].push(
            response.messages[response.messages.length - 1]
        );

        // Extract the final response
        const reply =
            response.messages[response.messages.length - 1].content;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error running LangGraph agent:', error);
        return NextResponse.json({ error: 'Error processing request.' });
    }
}
