import { createClient } from '@/utils/supabase/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: { user: { id: userId } } } = await supabase.auth.getUser();

        if (!userId) {
            return new Response(
                JSON.stringify({ valid: false, message: 'User not authenticated' }),
                { status: 401 }
            );
        }

        const { data, error } = await supabase
            .from('salesforce_credentials')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data || !data.access_token) {
            return new Response(
                JSON.stringify({ valid: false, message: 'No valid Salesforce keys found' }),
                { status: 404 }
            );
        }
        return new Response(
            JSON.stringify({ valid: true, message: 'Salesforce keys are valid' }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking Salesforce keys:', error);
        return new Response(
            JSON.stringify({ valid: false, message: 'Internal server error' }),
            { status: 500 }
        );
    }
}
