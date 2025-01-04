import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate PKCE code verifier and challenge
 */
function generatePkceChallenge() {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
    return { codeVerifier, codeChallenge };
}

export async function GET(req) {
    // Generate PKCE challenge manually
    const { codeVerifier, codeChallenge } = generatePkceChallenge();

    console.log('Generated PKCE Code Verifier:', codeVerifier);
    console.log('Generated PKCE Code Challenge:', codeChallenge);

    if (!codeVerifier || !codeChallenge) {
        console.error('PKCE generation failed');
        return NextResponse.json({ error: 'PKCE generation failed' }, { status: 500 });
    }

    // Build the Salesforce authorization URL
    const authUrl = `${process.env.NEXT_PUBLIC_SALESFORCE_AUTH_URL}?response_type=code&client_id=${process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_SALESFORCE_REDIRECT_URI)}&scope=api refresh_token&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    // Store the PKCE verifier in an HttpOnly cookie
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('pkce_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure secure in production
        sameSite: 'lax', // Allow cookie on cross-site requests with redirects
        path: '/', // Make the cookie accessible throughout the app
    });

    return response;
}
