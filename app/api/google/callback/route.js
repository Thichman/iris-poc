// /api/google/callback.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

async function saveGoogleTokensToBackend({ userId, access_token, refresh_token = null, scope, expiry, token_type }) {
    console.log('Saving Google tokens to backend...', userId, access_token, refresh_token, scope, expiry, token_type);
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('google_credentials')
        .upsert({
            user_id: userId,
            access_token,
            refresh_token,
            scope,
            expiry,
            token_type,
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('Error saving Google tokens:', error);
        throw error;
    }
    return data;
}

export async function POST(req) {
    try {
        const { code } = await req.json();
        if (!code) {
            console.error('Authorization code missing');
            return NextResponse.json({ error: 'Authorization code is required.' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const codeVerifier = cookieStore.get('google_pkce_verifier')?.value;
        if (!codeVerifier) {
            console.error('PKCE code verifier missing');
            return NextResponse.json({ error: 'Missing PKCE code verifier.' }, { status: 400 });
        }

        // Exchange the authorization code for tokens.
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, refresh_token, scope, expires_in, token_type } = tokenResponse.data;
        // Calculate the token expiry timestamp.
        const expiry = new Date(Date.now() + expires_in * 1000).toISOString();

        // Retrieve the current user's ID from Supabase Auth.
        const supabase = await createClient();
        const { data: { user: { id: userId } } } = await supabase.auth.getUser();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Save the tokens to the database.
        await saveGoogleTokensToBackend({ userId, access_token, refresh_token, scope, expiry, token_type });

        return NextResponse.json({ access_token, refresh_token, scope, token_type });
    } catch (error) {
        console.error('Error exchanging code for Google tokens:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to exchange code for tokens.' }, { status: 500 });
    }
}
