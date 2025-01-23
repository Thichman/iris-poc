import { createClient } from '@/utils/supabase/server';
import { createSalesforceClient } from '@/app/ai/utils/salesforce/get-axios-instance';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: { user: { id: userId } } } = await supabase.auth.getUser();

        if (!userId) {
            return new Response(
                JSON.stringify({ valid: false, message: 'User not authenticated' }),
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
            );
        }

        try {
            const salesforceClient = await createSalesforceClient(data);

            // Use a lightweight API call to validate the token
            const response = await salesforceClient.get('/services/data/v57.0/sobjects');

            if (response.status === 200) {
                return new Response(
                    JSON.stringify({ valid: true, message: 'Salesforce keys are valid' }),
                    { status: 200 }
                );
            }
        } catch (tokenError) {
            console.error('Salesforce token validation error:', tokenError.message);

            // If the token is invalid, return an appropriate response
            return new Response(
                JSON.stringify({ valid: false, message: 'Salesforce keys are invalid or expired' }),
                { status: 401 }
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
