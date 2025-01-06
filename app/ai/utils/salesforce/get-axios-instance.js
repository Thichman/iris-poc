import axios from 'axios';
import { createClient } from '@/utils/supabase/server'; // Supabase client for fetching user keys

/**
 * Retrieves Salesforce credentials for the current user.
 * @returns {Promise<Object>} - User's Salesforce credentials.
 */
async function getSalesforceKeys() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('salesforce_credentials')
        .select('access_token, refresh_token, instance_url, expiry')
        .eq('user_id', user.id)
        .single();

    if (error) throw new Error('Failed to fetch Salesforce credentials');

    return data;
}

/**
 * Creates an Axios instance preconfigured for Salesforce API requests.
 * @returns {Promise<AxiosInstance>} - Configured Axios instance.
 */
export async function createSalesforceClient() {
    const { access_token, refresh_token, instance_url } = await getSalesforceKeys();

    const client = axios.create({
        baseURL: instance_url,
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
    });

    // Interceptor to handle token refresh on 401 Unauthorized
    client.interceptors.response.use(
        response => response, // Return response if successful
        async error => {
            if (error.response?.status === 401) {
                // Attempt to refresh the token
                const newTokens = await refreshSalesforceToken(refresh_token);

                // Update Axios headers with new token
                client.defaults.headers.Authorization = `Bearer ${newTokens.access_token}`;

                // Retry the original request with new token
                error.config.headers.Authorization = `Bearer ${newTokens.access_token}`;
                return axios.request(error.config);
            }

            return Promise.reject(error);
        }
    );

    return client;
}

/**
 * Refreshes the Salesforce access token using the refresh token.
 * @param {string} refreshToken - User's refresh token.
 * @returns {Promise<Object>} - New access token and related data.
 */
async function refreshSalesforceToken(refreshToken) {
    const response = await axios.post(process.env.NEXT_PUBLIC_SALESFORCE_TOKEN_URL, {
        grant_type: 'refresh_token',
        client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET,
        refresh_token: refreshToken,
    });

    if (!response.data.access_token) {
        throw new Error('Failed to refresh Salesforce access token');
    }

    // Update tokens in the database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
        .from('salesforce_credentials')
        .update({
            access_token: response.data.access_token,
            expiry: new Date(Date.now() + response.data.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);

    return response.data;
}
