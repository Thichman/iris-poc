export const maxDuration = 60;
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.ARCTECH_OPENAI_KEY,
});

export async function POST(req) {
    try {
        const { messages } = await req.json();

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that answers questions about the data that is provided to it.' },
                ...messages.map(msg => ({
                    role: msg.position === 'left' ? 'assistant' : 'user',
                    content: msg.text,
                })),
            ],
            max_tokens: 300,
            temperature: 0.7,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.6,
        });

        const reply = response.choices[0].message.content.trim();

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error in OpenAI API request:', error);
        return NextResponse.json({ error: 'Error generating response' });
    }
}