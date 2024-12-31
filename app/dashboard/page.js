'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Generate a unique session ID for the user
    const sessionId = useState(uuidv4())[0];

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
            <h1 className="text-2xl font-bold mb-4">Chat with LangGraph Agent</h1>
            <div className="bg-white text-black rounded-lg shadow-md p-4 w-full max-w-lg h-96 overflow-y-scroll mb-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong>{' '}
                        {msg.content}
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
