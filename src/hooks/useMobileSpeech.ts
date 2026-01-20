"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IWindow extends Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
}

export function useMobileSpeech() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [volume, setVolume] = useState<number>(0);
    const [isSupported, setIsSupported] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        setIsSupported(!!(webkitSpeechRecognition || SpeechRecognition));
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startVisualizer = useCallback(() => {
        if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current);

        // Simulate volume fluctuations (0-100)
        visualizerIntervalRef.current = setInterval(() => {
            setVolume(Math.random() * 60 + 20); // Random interactions between 20-80
        }, 100);
    }, []);

    const stopVisualizer = useCallback(() => {
        if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current);
        setVolume(0);
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window === "undefined") return;

        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

        if (SpeechRecognitionConstructor) {
            const recognition = new SpeechRecognitionConstructor();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                if (event.error === "no-speech") {
                    console.debug("Speech recognition: no speech detected");
                    toast.error("No speech detected. Please try again.");
                    return;
                }
                if (event.error === "network") {
                    console.debug("Speech recognition: network error");
                    toast.error("Network error. Check your connection or try a different browser.");
                    return;
                }
                console.error("Speech recognition error", event.error);
                toast.error(`Speech recognition error: ${event.error}`);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                let fullTranscript = "";
                for (let i = 0; i < event.results.length; ++i) {
                    fullTranscript += event.results[i][0].transcript;
                }
                setTranscript(fullTranscript);
            };

            recognitionRef.current = recognition;
        }
    }, [stopVisualizer]);

    // Permissive Start
    // Permissive Start
    const start = useCallback(() => {
        // 1. Check Security (HTTPS is required for Web Speech API)
        if (typeof window !== "undefined" && !window.isSecureContext) {
            toast.error("Security Restriction", {
                description: "Voice input requires HTTPS. It will not work on local IP addresses."
            });
            return;
        }

        if (!recognitionRef.current) {
            toast.error("Voice input not supported", {
                description: isIOS ? "Try using Safari on iPhone" : "Try using Chrome or Edge"
            });
            return;
        }

        try {
            setTranscript("");
            recognitionRef.current.start();
            // isListening sets in onstart
            startVisualizer();
        } catch (error) {
            console.error("Speech start error:", error);

            // Handle iOS specifically if it throws synchronously
            if (isIOS) {
                toast.error("Voice input failed", {
                    description: "Please tap the mic again or try Safari."
                })
            }
        }
    }, [isIOS, startVisualizer]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }
        stopVisualizer(); // Ensure visualizer stops immediately
    }, [stopVisualizer]);

    return {
        isListening,
        transcript,
        start, // Renamed from startListening
        stop,  // Renamed from stopListening
        volume,
        isSupported,
        isIOS
    };
}
