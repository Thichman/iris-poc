'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveTokensToBackend } from '../../ai/utils/salesforce/set-keys';
import { saveGoogleTokensToBackend } from '../../ai/utils/google/save-google-tokens';

export default function Authenticate() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sfSuccess, setSfSuccess] = useState(false);
    const [googleSuccess, setGoogleSuccess] = useState(false);
    const [validated, setValidated] = useState(false);

    // Validate existing Salesforce keys on component mount
    useEffect(() => {
        async function validateSfKeys() {
            setLoading(true);
            try {
                const response = await fetch('/api/database/salesforce/check-user-keys');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'valid') {
                        setSfSuccess(true);
                        setValidated(true);
                    } else {
                        setValidated(false);
                    }
                } else {
                    setValidated(false);
                }
            } catch (err) {
                console.error('Error validating Salesforce keys:', err);
                setValidated(false);
            } finally {
                setLoading(false);
            }
        }
        async function validateGoogleKeys() {
            setGoogleLoading(true);
            try {
                const response = await fetch('/api/database/google/check-user-keys');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'valid') {
                        setGoogleSuccess(true);
                    } else {
                        setGoogleSuccess(false);
                    }
                } else {
                    setGoogleSuccess(false);
                }
            } catch (err) {
                console.error('Error validating Google keys:', err);
                setGoogleSuccess(false);
            } finally {
                setGoogleLoading(false);
            }
        }

        validateGoogleKeys();
        validateSfKeys();
    }, []);

    // Handle authorization code in query params
    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // Use state to determine provider

        if (!code || !state) return; // Ensure both code and state exist

        if (state === 'google' && !googleSuccess) {
            // Google OAuth flow
            setGoogleLoading(true);

            async function fetchGoogleTokens() {
                try {
                    const response = await fetch('/api/google/callback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch tokens from Google.');
                    }

                    const data = await response.json();

                    // Save the Google tokens to the backend
                    await saveGoogleTokensToBackend(
                        data.access_token,
                        data.refresh_token,
                        data.scope,
                        data.expiry,
                        data.token_type
                    );

                    setGoogleSuccess(true);
                } catch (err) {
                    console.error('Error fetching Google tokens:', err);
                    setError(err.message);
                } finally {
                    setGoogleLoading(false);
                }
            }

            fetchGoogleTokens();
        } else if (state === 'salesforce' && !sfSuccess) {
            // Salesforce OAuth flow
            setLoading(true);

            async function fetchSfTokens() {
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

                    // Save the Salesforce tokens to the backend
                    await saveTokensToBackend(
                        data.access_token,
                        data.refresh_token,
                        data.instance_url
                    );

                    setSfSuccess(true);
                } catch (err) {
                    console.error('Error fetching Salesforce tokens:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }

            fetchSfTokens();
        }
    }, [searchParams, sfSuccess, googleSuccess]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Account Integrations</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Salesforce Connector</h2>
                    {loading ? (
                        <p className="text-gray-600">Connecting...</p>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : sfSuccess ? (
                        <div className="text-green-600 font-semibold">
                            ✅ Successfully connected to Salesforce!
                        </div>
                    ) : validated ? (
                        <div className="text-green-600 font-semibold">
                            ✅ Already authenticated with Salesforce!
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setLoading(true);
                                window.location.href = '/api/salesforce/authorize';
                            }}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                        >
                            Connect to Salesforce
                        </button>
                    )}
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Connector</h2>
                    {googleLoading ? (
                        <p className="text-gray-600">Connecting...</p>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : googleSuccess ? (
                        <div className="text-green-600 font-semibold">
                            ✅ Successfully connected to Google!
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setGoogleLoading(true);
                                window.location.href = '/api/google/authorize';
                            }}
                            className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
                        >
                            Connect to Google
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
