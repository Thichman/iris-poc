import { useState, useEffect, useRef } from 'react';

const ChatInterface = ({ context, prompt }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [awaitReturn, setAwaitReturn] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (context) {
            setMessages([{ text: context, position: 'left', type: 'text' }]);
        }
    }, [context]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (prompt) {
            setInput(prompt);
        }
    }, [prompt]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [input]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        setAwaitReturn(true);
        const newMessage = {
            text: input,
            position: 'right',
            type: 'text',
        };
        setInput('');
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);

        try {
            const response = await fetch('../app/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            const data = await response.json();

            const replyMessage = {
                text: data.reply,
                position: 'left',
                type: 'text',
            };

            setMessages((prevMessages) => [...prevMessages, replyMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setAwaitReturn(false);
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    // Exclude the first message for display
    const displayedMessages = messages.slice(1);

    return (
        <div className="flex flex-col h-full p-4 w-full">
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                {displayedMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`my-2 p-2 rounded-lg max-w-full break-words ${msg.position === 'right' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 self-start text-black'
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="flex-1 p-2 border rounded-l-lg text-black resize-none overflow-hidden mr-16"
                    placeholder="Type your message..."
                    rows="1"
                    style={{ minHeight: '2.5rem' }}
                />
                {!awaitReturn && (
                    <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded-r-lg h-12 w-16 rounded-lg absolute bottom-3 right-2">
                        Send
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;