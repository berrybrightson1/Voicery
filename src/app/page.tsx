"use client";

import { TopBar } from "@/components/TopBar";
import { NoteFeed } from "@/components/NoteFeed";
import { BottomControls } from "@/components/BottomControls";
import { Onboarding } from "@/components/Onboarding";
import { useMobileSpeech } from "@/hooks/useMobileSpeech";
import { useNotes } from "@/context/NoteContext";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { isListening, transcript, start, stop, volume } = useMobileSpeech();
  const { addNote } = useNotes();
  const prevListening = useRef(isListening);

  useEffect(() => {
    // Detect transition from listening -> not listening
    if (prevListening.current && !isListening) {
      if (transcript.trim()) {
        addNote(transcript.trim());
        toast.success("Thought captured");
      }
    }
    prevListening.current = isListening;
  }, [isListening, transcript, addNote]);

  const handleToggle = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  return (
    <main className="flex h-screen flex-col bg-gray-50 overflow-hidden relative">
      <Onboarding />
      <TopBar />
      <NoteFeed />

      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-64 left-0 right-0 max-w-md mx-auto px-6 z-50 pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-200/50 text-center">
              <p className="text-xl font-medium text-gray-900 leading-relaxed font-sans">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomControls isListening={isListening} onToggle={handleToggle} volume={volume} />
    </main>
  );
}
