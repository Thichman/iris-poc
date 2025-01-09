'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const sessionId = useState(uuidv4())[0];

    useEffect(() => {
        const checkSalesforceKeys = async () => {
            try {
                const response = await fetch('/api/salesforce/check-keys');
                const data = await response.json();

                if (!response.ok || !data.valid) {
                    console.log('Salesforce keys are missing or invalid. Redirecting...');
                    router.push('/dashboard/salesforce');
                }
            } catch (error) {
                console.error('Error checking Salesforce keys:', error);
                router.push('/dashboard/salesforce');
            }
        };

        checkSalesforceKeys();
    }, [router]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        setLoading(true);

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);

        try {
            setInput('');
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input, sessionId }),
            });

            const data = await res.json();

            const agentMessage = { role: 'agent', content: data.reply };
            setMessages((prev) => [...prev, agentMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'error', content: 'Error: Could not fetch response.' },
            ]);
        } finally {
            setInput('');
            setLoading(false);
        }
    };

    return (
        <div className="bg-black text-white mt-24 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Chat with IRIS</h1>
            <div className="bg-white text-black rounded-lg shadow-md p-4 w-full max-w-lg h-96 overflow-y-scroll mb-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <strong>{msg.role === 'user' ? 'You' : 'IRIS'}:</strong>{' '}
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 w-full max-w-lg">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 rounded-md border border-gray-300 text-black"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className={`p-2 rounded-md ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                        } text-white`}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}
