import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user: { id: userId } } } = await supabase.auth.getUser();

        // Retrieve the user's Salesforce tokens
        const { data, error } = await supabase
            .from('salesforce_credentials')
            .select('access_token, instance_url')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // No tokens found for the user
            return NextResponse.json({ status: 'no_keys' });
        }

        const { access_token, instance_url } = data;

        // Check if the token is valid by making a simple request to Salesforce
        const validationResponse = await fetch(`${instance_url}/services/data/v52.0/sobjects`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (validationResponse.ok) {
            // Tokens are valid
            return NextResponse.json({ status: 'valid' });
        } else {
            // Tokens are invalid
            return NextResponse.json({ status: 'invalid' });
        }
    } catch (error) {
        console.error('Error validating Salesforce tokens:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
