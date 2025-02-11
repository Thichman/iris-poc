// /api/database/google/set-google-keys.js
import { createClient } from '@/utils/supabase/server';

export async function POST(req) {
    try {
        const { accessToken, refreshToken, scope, expiry, tokenType } = await req.json();
        const supabase = await createClient();

        // Retrieve the current user's ID from Supabase Auth.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not authenticated' }), { status: 401 });
        }

        const { data, error } = await supabase
            .from('google_credentials')
            .upsert({
                user_id: user.id,
                access_token: accessToken,
                refresh_token: refreshToken,
                scope,
                expiry,
                token_type: tokenType,
            }, { onConflict: 'user_id' });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'Google tokens saved successfully', data }), { status: 200 });
    } catch (error) {
        console.error('Error in set-google-keys API route:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
