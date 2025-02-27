// /app/api/convert-message/route.js
import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export async function POST(req) {
    try {
        const { message } = await req.json();
        if (!message) {
            return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
        }

        // Create a ChatOpenAI instance with desired settings
        const chat = new ChatOpenAI({
            model: 'gpt-4',
            temperature: 0.7,
            openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
        });

        // Construct a prompt instructing ChatGPT to shorten and make the message conversational
        const prompt = `Please summarize the following message into a concise, conversational, and friendly version that is direct and to the point. Do not include any URLs or links in your answer. Only focus on the key information. 

        Message:
        "${message}"`;

        // Invoke the ChatGPT model with the prompt
        const response = await chat.invoke([{ role: 'user', content: prompt }]);

        const reply = response.content;

        console.log('Response:', reply);
        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error converting message:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
