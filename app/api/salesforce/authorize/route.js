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

    const authUrl = `${process.env.SALESFORCE_AUTH_URL}?response_type=code&client_id=${process.env.SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.SALESFORCE_REDIRECT_URI)}&scope=api refresh_token&state=salesforce&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    const response = NextResponse.redirect(authUrl);
    console.log(response);
    response.cookies.set('pkce_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    return response;
}
