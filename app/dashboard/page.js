'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const textareaRef = useRef(null);
    const messageContainerRef = useRef(null);
    const [checkingKeys, setCheckingKeys] = useState(true);
    const sessionId = useState(uuidv4())[0];

    useEffect(() => {
        const checkSalesforceKeys = async () => {
            try {
                const response = await fetch('/api/salesforce/check-keys');
                const data = await response.json();
                if (!response.ok || !data.valid) {
                    router.push('/dashboard/authenticate');
                }
                setCheckingKeys(false);
            } catch (error) {
                router.push('/dashboard/authenticate');
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [input]);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTo({
                top: messageContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    return (
        <div className="bg-black text-white mt-24 flex flex-col items-center justify-center">
            {checkingKeys ? (
                <div>
                    <h1 className="text-2xl font-bold mb-4 justify-center items-center">Checking Your Salesforce Connection</h1>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-4">Chat with IRIS</h1>
                    <div
                        ref={messageContainerRef}
                        className="bg-white text-black rounded-lg shadow-md p-4 w-full max-w-3xl h-96 overflow-y-auto mb-4"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-black'
                                        }`}
                                >
                                    <strong className="block">{msg.role === 'user' ? 'You' : 'IRIS'}:</strong>
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    className="text-blue-500 hover:underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {props.children}
                                                </a>
                                            ),
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 w-full max-w-3xl items-start">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onInput={adjustTextareaHeight}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="flex-1 p-2 rounded-md border border-gray-300 text-black resize-none overflow-hidden"
                            rows={1}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className={`p-2 rounded-md h-10 flex items-center justify-center ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                } text-white`}
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </>
            )}
        </div >
    );
}
