'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';

export default function VoiceInteraction({ isVoiceEnabled, sendMessage, messages, setMessages }) {
    const recognitionRef = useRef(null);
    const isRecognitionActiveRef = useRef(false);
    const [interactionState, setInteractionState] = useState("idle"); // "idle", "listening", "thinking", "talking"

    // Initialize speech recognition on mount.
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Speech recognition not supported in this browser.");
            return;
        }

        // @ts-ignore
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            isRecognitionActiveRef.current = true;
        };

        recognition.onresult = async (event) => {
            const lastResult = event.results[event.results.length - 1][0].transcript;
            isRecognitionActiveRef.current = false;
            recognition.stop();
            // Transition to thinking state while waiting for AI response.
            setInteractionState("thinking");
            await handleAIResponse(lastResult);
        };

        recognition.onerror = (event) => {
            console.error("🚨 Speech Recognition Error:", event.error);
            if (event.error === 'no-speech') {
                console.log("No speech detected.");
            }
            isRecognitionActiveRef.current = false;
            setInteractionState("idle");
        };

        recognition.onend = () => {
            isRecognitionActiveRef.current = false;
            // Do not auto-restart; wait for user click.
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                isRecognitionActiveRef.current = false;
            }
        };
    }, []);

    // Stop recognition if voice chat is disabled.
    useEffect(() => {
        if (!isVoiceEnabled && recognitionRef.current) {
            recognitionRef.current.stop();
            isRecognitionActiveRef.current = false;
            setInteractionState("idle");
        }
    }, [isVoiceEnabled]);

    // Start listening when the user clicks on the component.
    const startListening = () => {
        if (isVoiceEnabled && recognitionRef.current && !isRecognitionActiveRef.current) {
            isRecognitionActiveRef.current = true;
            setInteractionState("listening");
            recognitionRef.current.start();
        }
    };

    const handleAIResponse = async (input) => {
        try {
            // Let sendMessage handle appending the user message if needed.
            const response = await sendMessage(input);
            if (!response || !response.reply) {
                console.error("❌ Invalid AI Response:", response);
                setInteractionState("idle");
                return;
            }
            // Transition to talking state and speak the AI reply.
            setInteractionState("talking");
            speak(response.reply);
        } catch (error) {
            console.error("❌ Error handling AI response:", error);
            setInteractionState("idle");
        }
    };

    const speak = async (text) => {
        try {
            const response = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await response.json();
            const conversationalText = data.reply || text;

            const voices = window.speechSynthesis.getVoices();
            const utterance = new SpeechSynthesisUtterance(conversationalText);
            utterance.voice = voices[0];
            utterance.onend = () => {
                setInteractionState("idle");
            };
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Error in speak function:", error);
            const voices = window.speechSynthesis.getVoices();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voices[0];
            utterance.onend = () => {
                setInteractionState("idle");
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    // Define animation variants for the different interaction states.
    const waveVariants = {
        idle: { scale: 1, opacity: 0.5 },
        listening: { scale: 1.2, opacity: 1 },
        thinking: { scale: 1.3, opacity: 0.8, transition: { yoyo: Infinity, duration: 1.5 } },
        talking: { scale: 1.4, opacity: 1, transition: { yoyo: Infinity, duration: 0.7 } }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full pt-32">
            <motion.div
                className="relative flex items-center justify-center w-80 h-80 rounded-full shadow-2xl border-8 border-blue-500 bg-transparent cursor-pointer"
                animate={interactionState}
                variants={waveVariants}
                onClick={startListening}
            >
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
                <motion.div
                    className="absolute w-48 h-48 border-4 border-blue-200 rounded-full"
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 0.4, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                    className="absolute w-48 h-48 border-4 border-blue-200 rounded-full"
                    animate={{ scale: [0.8, 1, 0.8], opacity: [0.7, 0.4, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                    className="absolute w-48 h-48 border-4 border-blue-200 rounded-full"
                    animate={{ scale: [0.7, .9, 0.7], opacity: [0.7, 0.4, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
            </motion.div>
        </div>
    );
}
