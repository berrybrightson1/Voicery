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
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        setIsSupported(!!(webkitSpeechRecognition || SpeechRecognition));
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const startVisualizer = useCallback(() => {
        if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current);
        visualizerIntervalRef.current = setInterval(() => {
            setVolume(Math.random() * 60 + 20);
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
                    toast.error("No speech detected. Please try again.");
                    return;
                }
                if (event.error === "network") {
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

    const startAudioRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                setAudioBlob(blob);
                // Stop all tracks
                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
        } catch (error) {
            console.error("Audio recording error:", error);
            // Don't show error - audio recording is optional, speech still works
        }
    }, []);

    const stopAudioRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const start = useCallback(async () => {
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
            setAudioBlob(null);

            // Start audio recording first
            await startAudioRecording();

            // Then start speech recognition
            recognitionRef.current.start();
            startVisualizer();
        } catch (error) {
            console.error("Speech start error:", error);
            if (isIOS) {
                toast.error("Voice input failed", {
                    description: "Please tap the mic again or try Safari."
                });
            }
        }
    }, [isIOS, startVisualizer, startAudioRecording]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }
        stopAudioRecording();
        stopVisualizer();
    }, [stopVisualizer, stopAudioRecording]);

    return {
        isListening,
        transcript,
        start,
        stop,
        volume,
        isSupported,
        isIOS,
        audioBlob,
    };
}

