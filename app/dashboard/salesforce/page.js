'use client';

import { useSearchParams } from 'next/navigation';

export default function Salesforce() {
    const searchParams = useSearchParams();
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    const instance_url = searchParams.get('instance_url');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
            <h1 className="text-3xl font-bold mb-4">Salesforce OAuth Test</h1>

            {!access_token ? (
                <button
                    onClick={() => window.location.href = '/api/salesforce/authorize'}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Connect to Salesforce
                </button>
            ) : (
                <div className="p-4 bg-white shadow-md rounded">
                    <h2 className="text-xl font-bold mb-2">Salesforce Credentials</h2>
                    <p><strong>Access Token:</strong> {access_token}</p>
                    <p><strong>Refresh Token:</strong> {refresh_token}</p>
                    <p><strong>Instance URL:</strong> {instance_url}</p>
                </div>
            )}
        </div>
    );
}
