"use client";

import { useState, useEffect } from "react";
import { X, Mic, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "voicery-onboarded";

export function Onboarding() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already been onboarded
        const hasOnboarded = localStorage.getItem(STORAGE_KEY);
        if (!hasOnboarded) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>

                        {/* Content */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome to Voicery
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Capture fleeting thoughts with your voice
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Mic className="size-4 text-blue-600" />
                                </div>
                                <p className="text-gray-700 text-sm pt-1">
                                    Tap the mic to record a thought
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Clock className="size-4 text-amber-600" />
                                </div>
                                <p className="text-gray-700 text-sm pt-1">
                                    Notes auto-delete after 1 hour
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                    <Sparkles className="size-4 text-purple-600" />
                                </div>
                                <p className="text-gray-700 text-sm pt-1">
                                    Refine notes for AI with one tap
                                </p>
                            </li>
                        </ul>

                        <button
                            onClick={handleDismiss}
                            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-colors"
                        >
                            Got it
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
