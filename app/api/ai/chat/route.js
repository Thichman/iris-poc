import { LangGraph } from '@langchain/langgraph';
import { NextResponse } from 'next/server';

// Initialize LangGraph
const langGraph = new LangGraph();

// Define the tools for the agent
const tools = [
    {
        name: 'calculator',
        description: 'Performs simple math operations.',
        execute: async (input) => {
            try {
                const result = eval(input); // Basic calculator logic
                return `The result is ${result}`;
            } catch {
                return 'Error: Invalid math expression.';
            }
        },
    },
];

// Add the agent to LangGraph
langGraph.addAgent({
    id: 'math_agent',
    tools,
    model: {
        type: 'chat',
        provider: 'openai',
        options: {
            apiKey: process.env.OPENAI_API_KEY,
            modelName: 'gpt-4',
        },
    },
    prompt: {
        system:
            'You are an intelligent assistant. Use tools only when required to answer user queries.',
    },
});

export async function POST(req) {
    try {
        const { query } = await req.json();

        // Run the agent
        const response = await langGraph.runAgent('math_agent', query);

        return NextResponse.json({ reply: response });
    } catch (error) {
        console.error('Error running LangGraph agent:', error);
        return NextResponse.json({ error: 'Error processing request.' });
    }
}
