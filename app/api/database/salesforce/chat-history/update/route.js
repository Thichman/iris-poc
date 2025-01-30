import { createClient } from '@/utils/supabase/server';

export async function PUT(req) {
    const supabase = await createClient();
    const { userId, newMessage } = await req.json();

    try {
        // Fetch the existing chat history
        const { data, error } = await supabase.storage
            .from('chat-history')
            .download(`${userId}/chat-history.json`);

        if (error || !data) {
            throw new Error('Chat history not found. Please initialize a new chat first.');
        }

        const chatObject = await data.text().then(JSON.parse);

        // Append new message
        chatObject.messages.push(newMessage);

        // Save the updated chat object back to storage
        const { error: updateError } = await supabase.storage
            .from('chat-history')
            .update(`${userId}/chat-history.json`, JSON.stringify(chatObject), {
                contentType: 'application/json',
            });

        if (updateError) {
            throw new Error('Failed to update chat history.');
        }

        return new Response(JSON.stringify({ success: true, chatObject }), { status: 200 });

    } catch (error) {
        console.error('Error updating chat history:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500 }
        );
    }
}
