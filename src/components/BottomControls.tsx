"use client";

import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomControlsProps {
    isListening: boolean;
    onToggle: () => void;
    volume: number;
}

export function BottomControls({ isListening, onToggle, volume }: BottomControlsProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-10 pt-6 px-6 flex flex-col items-center gap-6 z-40 max-w-md mx-auto w-full transition-all">
            { /* Visualizer */}
            <div className="h-8 flex items-center justify-center gap-1.5 w-full max-w-[120px]">
                {[1, 2, 3, 4, 5].map((i) => (
                    <VisualizerBar key={i} index={i} volume={volume} isListening={isListening} />
                ))}
            </div>

            { /* Record Button */}
            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onToggle}
                className={cn(
                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white text-3xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 active:shadow-md",
                    isListening ? "bg-red-500 shadow-red-200" : "bg-gray-950 shadow-gray-200"
                )}
                aria-label={isListening ? "Stop recording" : "Start recording"}
            >
                {isListening ? (
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <Square size={26} fill="currentColor" className="rounded-sm" strokeWidth={0} />
                    </motion.div>
                ) : (
                    <Mic size={30} strokeWidth={2} />
                )}
            </motion.button>
        </div>
    )
}

function VisualizerBar({ index, volume, isListening }: { index: number, volume: number, isListening: boolean }) {
    const multiplier = [0.6, 0.8, 1.0, 0.8, 0.6][index - 1];

    // Scale volume (0-100) to height (4-40)
    // Add some organic randomness to each bar update if volume is constant-ish, 
    // but standard spring handles it well if volume is noisy.

    // Logic: volume is noisy (simulated or real).
    const targetHeight = isListening ? Math.max(4, (volume * 0.4) * multiplier) : 4;

    return (
        <motion.div
            className={cn("w-1.5 bg-gray-950 rounded-full", !isListening && "bg-gray-300")}
            animate={{
                height: targetHeight,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
    )
}
