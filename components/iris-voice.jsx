'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VoiceInteraction({ isVoiceEnabled, sendMessage, sessionId, setMessages }) {
    const [status, setStatus] = useState('idle'); // Possible states: 'idle', 'listening', 'thinking', 'talking'
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (!isVoiceEnabled) return;
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Speech recognition not supported in this browser.");
            return;
        }

        const recognitionInstance = new window.webkitSpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onstart = () => setStatus('listening');
        recognitionInstance.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1][0].transcript;
            setTranscript(lastResult);
            setStatus('thinking');
            recognitionInstance.stop(); // Stop listening while AI is processing
            handleAIResponse(lastResult);
        };

        recognitionInstance.onerror = () => setStatus('idle');
        recognitionInstance.onend = () => {
            if (status !== 'thinking' && status !== 'talking') {
                setStatus('idle'); // Return to idle only if not processing
            }
        };

        setRecognition(recognitionInstance);
        return () => recognitionInstance.stop();
    }, [isVoiceEnabled]);

    // Handle AI Response
    const handleAIResponse = async (input) => {
        try {
            const userMessage = { role: 'user', content: input };
            setMessages((prev) => [...prev, userMessage]);

            const response = await sendMessage(input); // Send input to AI
            const aiReply = response.reply;

            setMessages((prev) => [...prev, { role: 'agent', content: aiReply }]);
            setStatus('talking');

            speak(aiReply);
        } catch (error) {
            console.error("Error handling AI response:", error);
            setStatus('idle');
        }
    };

    // 🗣️ Text-to-Speech
    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setStatus('idle');
            if (recognition) recognition.start(); // Restart listening after talking
        };
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (isVoiceEnabled && status === 'idle' && recognition) {
            recognition.start();
        }
    }, [status, isVoiceEnabled, recognition]);

    // 🎨 Animations for Different Phases
    const waveVariants = {
        idle: { scale: 1, opacity: 0.3 },
        listening: { scale: 1.2, opacity: 1 },
        thinking: { scale: 1.3, opacity: 0.8, transition: { yoyo: Infinity, duration: 1.5 } },
        talking: { scale: 1.4, opacity: 1, transition: { yoyo: Infinity, duration: 0.7 } }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full pt-40">
            {/* Outer Animated Waves */}
            <motion.div
                className="relative flex items-center justify-center w-80 h-80 rounded-full shadow-2xl border-8 border-blue-500 bg-transparent"
                animate={status}
                variants={waveVariants}
            >
                {/* Internal Animated Waves (Moving Inside the Hollow Circle) */}
                <motion.div
                    className="absolute w-64 h-64 border-4 border-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-56 h-56 border-4 border-blue-300 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                    className="absolute w-48 h-48 border-4 border-blue-200 rounded-full"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.4, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
            </motion.div>

            {/* Display "Thinking..." when in processing mode */}
            {status === 'thinking' && (
                <p className="mt-6 text-white text-lg font-medium animate-pulse">Thinking...</p>
            )}
        </div>
    );
}
