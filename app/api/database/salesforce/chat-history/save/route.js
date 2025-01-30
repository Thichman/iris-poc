import { createClient } from '@/utils/supabase/server';

export async function GET(req) {
    const supabase = await createClient();
    const userId = req.headers.get('user-id');

    try {
        // Try to fetch the chat history from storage
        const { data, error } = await supabase.storage
            .from('chat-history')
            .download(`${userId}/chat-history.json`);

        if (error || !data) {
            console.log('No chat history found. Creating new chat history.');

            // If no chat exists, create a new one
            const newChatObject = {
                userId,
                messages: [],
                createdAt: new Date().toISOString(),
            };

            // Save to storage
            const { error: storageError } = await supabase.storage
                .from('chat-history')
                .upload(`${userId}/chat-history.json`, JSON.stringify(newChatObject), {
                    contentType: 'application/json',
                });

            if (storageError) {
                throw new Error('Failed to create new chat history.');
            }

            return new Response(JSON.stringify(newChatObject), { status: 200 });
        }

        // Parse and return existing chat history
        const chatObject = await data.text().then(JSON.parse);
        return new Response(JSON.stringify(chatObject), { status: 200 });

    } catch (error) {
        console.error('Error retrieving chat history:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500 }
        );
    }
}
