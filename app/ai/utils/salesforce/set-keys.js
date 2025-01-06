export async function saveTokensToBackend(accessToken, refreshToken, instanceUrl, expiry) {
    try {
        const response = await fetch('../../api/database/salesforce/set-salesforce-keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accessToken,
                refreshToken,
                instanceUrl,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error saving tokens:', data.error);
        } else {
            console.log('Tokens saved successfully:', data);
        }
    } catch (error) {
        console.error('Error sending request:', error);
    }
}