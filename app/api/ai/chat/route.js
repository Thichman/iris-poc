import { NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { mainWorkflow } from '@/app/ai/main/main-workflow';

const sessionMemory = {};

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

        const response = await mainWorkflow.invoke({
            messages: sessionMemory[sessionId],
        });

        sessionMemory[sessionId].push(response.messages[response.messages.length - 1]);

        const reply = response.messages[response.messages.length - 1].content;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error running LangGraph agent:', error);
        return NextResponse.json({ reply: 'There has been an issue on our end please try again with another request. Sometimes our model has trouble with multi step tasks. If this is the case then break them down into sub tasks and try again!' });
    }
}
