'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Salesforce() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tokens, setTokens] = useState(null);

    // Check for authorization code in the query params
    useEffect(() => {
        const code = searchParams.get('code');

        if (code && !tokens) {
            setLoading(true);

            // Send the code to the backend to exchange for tokens
            async function fetchTokens() {
                try {
                    const response = await fetch('/api/salesforce/callback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch tokens from Salesforce.');
                    }

                    const data = await response.json();
                    setTokens(data);
                } catch (err) {
                    console.error('Error fetching tokens:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }

            fetchTokens();
        }
    }, [searchParams, tokens]);

    // Render UI
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
            <h1 className="text-3xl font-bold mb-4">Salesforce OAuth Test</h1>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : !tokens ? (
                <button
                    onClick={() => {
                        setLoading(true);
                        window.location.href = '/api/salesforce/authorize';
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Connect to Salesforce
                </button>
            ) : (
                <div className="p-4 bg-white shadow-md rounded">
                    <h2 className="text-xl font-bold mb-2">Salesforce Credentials</h2>
                    <p><strong>Access Token:</strong> {tokens.access_token}</p>
                    <p><strong>Refresh Token:</strong> {tokens.refresh_token}</p>
                    <p><strong>Instance URL:</strong> {tokens.instance_url}</p>
                </div>
            )}
        </div>
    );
}
