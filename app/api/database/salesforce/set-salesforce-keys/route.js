import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'

export async function POST(req) {
    try {
        const body = await req.json(); // Parse the incoming JSON body
        const { accessToken, refreshToken, instanceUrl } = body;

        if (!accessToken || !refreshToken || !instanceUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data: { user: { id: userId } } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('salesforce_credentials')
            .upsert(
                {
                    user_id: userId,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    instance_url: instanceUrl,
                },
                {
                    onConflict: 'user_id',
                }
            );

        if (error) {
            console.error('Error saving Salesforce tokens:', error);
            return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Salesforce tokens saved successfully', data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
