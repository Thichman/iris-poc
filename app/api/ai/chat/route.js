import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { standardToolNode } from '@/app/ai/functions/standard/standard-tool-node';
import { calculatorTool } from '@/app/ai/functions/standard/calculator-test';
import { weatherTool } from '@/app/ai/functions/standard/weather';

const sessionMemory = {};

const model = new ChatOpenAI({
    model: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
}).bindTools([calculatorTool, weatherTool]);

// const model = new ChatOpenAI({
//     model: 'gpt-4',
//     temperature: 0,
//     openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
// });

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

const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', standardToolNode)
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

        if (!sessionMemory[sessionId]) {
            sessionMemory[sessionId] = [];
        }

        sessionMemory[sessionId].push(new HumanMessage(query));

        const response = await workflow.invoke({
            messages: sessionMemory[sessionId],
        });

        sessionMemory[sessionId].push(
            response.messages[response.messages.length - 1]
        );

        const reply =
            response.messages[response.messages.length - 1].content;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error running LangGraph agent:', error);
        return NextResponse.json({ error: 'Error processing request.' });
    }
}
