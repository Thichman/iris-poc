// /api/google/authorize.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generatePkceChallenge() {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
    return { codeVerifier, codeChallenge };
}

export async function GET() {
    const { codeVerifier, codeChallenge } = generatePkceChallenge();

    if (!codeVerifier || !codeChallenge) {
        console.error('PKCE generation failed');
        return NextResponse.json({ error: 'PKCE generation failed' }, { status: 500 });
    }

    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/drive'
    ];

    // Construct the Google OAuth 2.0 authorization URL.
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `response_type=code&` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `access_type=offline&` +
        `state=google&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('google_pkce_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    return response;
}
