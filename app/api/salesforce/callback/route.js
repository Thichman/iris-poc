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
                { status: 400 }
            );
        }

        // Retrieve the PKCE verifier from cookies
        const cookieStore = await cookies();
        const codeVerifier = cookieStore.get('pkce_verifier')?.value;

        // Log the retrieved PKCE code verifier
        console.log('Retrieved PKCE Code Verifier:', codeVerifier);

        if (!codeVerifier) {
            console.error('PKCE code verifier missing');
            return NextResponse.json(
                { error: 'Missing PKCE code verifier.' },
                { status: 400 }
            );
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await axios.post(
            process.env.NEXT_PUBLIC_SALESFORCE_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
                client_secret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET,
                redirect_uri: process.env.NEXT_PUBLIC_SALESFORCE_REDIRECT_URI,
                code_verifier: codeVerifier, // Include the PKCE code verifier
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token, refresh_token, instance_url } = tokenResponse.data;

        // Log the token response for debugging
        console.log('Token Response:', { access_token, refresh_token, instance_url });

        // Return tokens to the client
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
