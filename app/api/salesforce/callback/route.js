import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { code } = await req.json();

        if (!code) {
            console.error('Authorization code missing');
            return NextResponse.json(
                { error: 'Authorization code is required.' },
            );
        }

        const cookieStore = await cookies();
        const codeVerifier = cookieStore.get('pkce_verifier')?.value;

        if (!codeVerifier) {
            console.error('PKCE code verifier missing');
            return NextResponse.json(
                { error: 'Missing PKCE code verifier.' },
                { status: 400 }
            );
        }

        const tokenResponse = await axios.post(
            process.env.SALESFORCE_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.SALESFORCE_CLIENT_ID,
                client_secret: process.env.SALESFORCE_CLIENT_SECRET,
                redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token, refresh_token, instance_url } = tokenResponse.data;

        return NextResponse.json({
            access_token,
            refresh_token,
            instance_url,
        });
    } catch (error) {
        console.error('Error exchanging code for tokens:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to exchange code for tokens.' },
            { status: 500 }
        );
    }
}
