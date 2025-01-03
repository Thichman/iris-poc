// app/api/salesforce/callback/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const cookies = req.cookies;
    const codeVerifier = cookies.get('pkce_verifier');

    if (!codeVerifier) {
        return NextResponse.json({ error: 'Missing PKCE code verifier' }, { status: 400 });
    }

    try {
        const tokenResponse = await axios.post(
            process.env.NEXT_PUBLIC_SALESFORCE_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
                client_secret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET,
                redirect_uri: process.env.NEXT_PUBLIC_SALESFORCE_REDIRECT_URI,
                code_verifier: codeVerifier, // Include the PKCE verifier
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token, refresh_token, instance_url } = tokenResponse.data;

        // Redirect to dashboard with tokens in query params for testing purposes
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SALESFORCE_REDIRECT_URI}?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}&instance_url=${encodeURIComponent(instance_url)}`
        );
    } catch (error) {
        console.error('Error exchanging code for token:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to authenticate with Salesforce' }, { status: 500 });
    }
}
