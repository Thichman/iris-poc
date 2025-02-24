// googleClient.js
import axios from 'axios';
import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';
/**
 * Retrieves Google credentials for the current user.
 * @returns {Promise<Object>} - User's Google credentials.
 */
async function getGoogleKeys() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('google_credentials')
        .select('access_token, refresh_token, scope, expiry, token_type')
        .eq('user_id', user.id)
        .single();

    if (error || !data || !data.access_token) {
        throw new Error('Failed to fetch Google credentials');
    }
    return data;
}

/**
 * Creates an Axios instance preconfigured for Google API requests.
 * @returns {Promise<AxiosInstance>} - Configured Axios instance.
 */
export async function createGoogleClient() {
    // Retrieve tokens from the database
    const tokens = await getGoogleKeys();

    // Initialize the OAuth2 client with environment variables
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Set the retrieved tokens as credentials on the OAuth2 client
    oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
    });

    // Return the authenticated client
    return oauth2Client;
}

/**
 * Refreshes the Google access token using the refresh token.
 * @param {string} refreshToken - User's refresh token.
 * @returns {Promise<Object>} - New token data.
 */
export async function refreshGoogleToken(refreshToken) {
    const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data.access_token) {
        throw new Error('Failed to refresh Google access token');
    }

    // Update tokens in the database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
        .from('google_credentials')
        .update({
            access_token: response.data.access_token,
            expiry: new Date(Date.now() + response.data.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);

    return response.data;
}

export default {
    getGoogleKeys,
    createGoogleClient,
    refreshGoogleToken,
};
