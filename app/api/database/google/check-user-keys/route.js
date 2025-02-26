import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ status: 'not_authenticated' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('google_credentials')
            .select('access_token')
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            return NextResponse.json({ status: 'no_keys' });
        }

        const { access_token } = data;

        // Make a test request to Google API to check if the token is valid
        const validationResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + access_token, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (validationResponse.ok) {
            return NextResponse.json({ status: 'valid' });
        } else {
            return NextResponse.json({ status: 'invalid' });
        }
    } catch (error) {
        console.error('Error validating Google tokens:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
