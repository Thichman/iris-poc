// saveGoogleTokensToBackend.js
export async function saveGoogleTokensToBackend(accessToken, refreshToken, scope, expiry, tokenType) {
    try {
        const response = await fetch('/api/database/google/set-google-keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accessToken,
                refreshToken,
                scope,
                expiry,
                tokenType,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error saving Google tokens:', data.error);
        } else {
            console.log('Google tokens saved successfully:', data);
        }
    } catch (error) {
        console.error('Error sending request to save Google tokens:', error);
    }
}
