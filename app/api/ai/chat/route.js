import { NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { mainWorkflow } from '@/app/ai/main/main-workflow';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 60;

export async function POST(req) {
    try {
        const { query } = await req.json();

        const supabase = await createClient();
        const { data: { user: { id: userId } } } = await supabase.auth.getUser();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required.' });
        }

        const { data, error: fetchError } = await supabase.storage
            .from('chat-history-storage')
            .download(`${userId}/chat-history.json`);

        let chatHistory = [];

        if (data) {
            chatHistory = await data.text().then(JSON.parse);
        } else {
            console.log('No chat history found, starting a new one.');
        }

        chatHistory.push(new HumanMessage(query));

        let response;
        try {
            response = await mainWorkflow.invoke({ messages: chatHistory });
        } catch (workflowError) {
            console.error("LangGraph Error:", workflowError);
            return NextResponse.json({
                reply: "An internal error occurred while processing your request. Please try again."
            });
        }

        chatHistory.push(response.messages[response.messages.length - 1]);

        if (fetchError) {
            const { data: fetchData, error: createError } = await supabase.storage
                .from('chat-history-storage')
                .upload(`${userId}/chat-history.json`, JSON.stringify(chatHistory))
        }
        const { data: updatedChatHistory, error } = await supabase.storage
            .from('chat-history-storage')
            .update(`${userId}/chat-history.json`, JSON.stringify(chatHistory), {
                contentType: 'application/json',
            });

        return NextResponse.json({ reply: response.messages[response.messages.length - 1].content });

    } catch (error) {
        console.error('Error running LangGraph agent:', error);
        return NextResponse.json({
            reply: 'There has been an issue on our end. Please try again with another request. If the model struggles with multi-step tasks, break them down into smaller tasks and try again!',
        });
    }
}
