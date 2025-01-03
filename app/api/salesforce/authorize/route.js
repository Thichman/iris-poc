// app/api/salesforce/authorize/route.js
import { NextResponse } from 'next/server';
import pkceChallenge from 'pkce-challenge';

export async function GET(req) {
    const challenge = pkceChallenge(); // Generate PKCE challenge

    const authUrl = `${process.env.NEXT_PUBLIC_SALESFORCE_AUTH_URL}?response_type=code&client_id=${process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_SALESFORCE_REDIRECT_URI)}&scope=api refresh_token&code_challenge=${challenge.code_challenge}&code_challenge_method=S256`;

    // Store the code verifier securely (e.g., in a server-side session or encrypted cookie)
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('pkce_verifier', challenge.code_verifier, { httpOnly: true, secure: true });

    return response;
}
