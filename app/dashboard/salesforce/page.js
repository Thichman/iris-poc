'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveTokensToBackend } from '../queries/salesforce/set-keys';

export default function Salesforce() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validated, setValidated] = useState(false);

    // Validate existing Salesforce keys on component mount
    useEffect(() => {
        async function validateKeys() {
            setLoading(true);
            try {
                const response = await fetch('/api/database/salesforce/check-user-keys');
                if (response.ok) {
                    const data = await response.json();
                    console.log(data.status)
                    if (data.status === 'valid') {
                        setSuccess(true);
                        setValidated(true);
                    } else {
                        setValidated(false);
                    }
                } else {
                    setValidated(false);
                }
            } catch (err) {
                console.error('Error validating keys:', err);
                setValidated(false);
            } finally {
                setLoading(false);
            }
        }

        validateKeys();
    }, []);

    // Handle authorization code in query params
    useEffect(() => {
        const code = searchParams.get('code');

        if (code && !success) {
            setLoading(true);

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

                    console.log('Received tokens:', data);

                    // Save the tokens to the backend
                    await saveTokensToBackend(
                        data.access_token,
                        data.refresh_token,
                        data.instance_url
                    );

                    setSuccess(true); // Set success state
                } catch (err) {
                    console.error('Error fetching tokens:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }

            fetchTokens();
        }
    }, [searchParams, success]);

    // Render UI
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
            <h1 className="text-3xl font-bold mb-4">Salesforce OAuth Test</h1>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : success ? (
                <div className="p-4 bg-white shadow-md rounded">
                    <h2 className="text-xl font-bold mb-2 text-green-600">
                        Successfully connected to Salesforce!
                    </h2>
                    <p>Your Salesforce account is now linked. You can start performing actions.</p>
                </div>
            ) : validated ? (
                <div className="p-4 bg-white shadow-md rounded">
                    <h2 className="text-xl font-bold mb-2 text-green-600">
                        You are already authenticated with Salesforce!
                    </h2>
                    <p>Your existing Salesforce credentials are valid.</p>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setLoading(true);
                        window.location.href = '/api/salesforce/authorize';
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Connect to Salesforce
                </button>
            )}
        </div>
    );
}
