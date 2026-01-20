"use client";

import { TopBar } from "@/components/TopBar";
import { NoteFeed } from "@/components/NoteFeed";
import { BottomControls } from "@/components/BottomControls";
import { Onboarding } from "@/components/Onboarding";
import { useMobileSpeech } from "@/hooks/useMobileSpeech";
import { useNotes } from "@/context/NoteContext";
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

import { AnimatePresence, motion } from "framer-motion";

// Convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function Home() {
  const { isListening, transcript, start, stop, volume, audioBlob } = useMobileSpeech();
  const { addNote } = useNotes();
  const prevListening = useRef(isListening);
  const pendingAudioRef = useRef<Blob | null>(null);

  // Store audio blob when it becomes available
  useEffect(() => {
    if (audioBlob) {
      pendingAudioRef.current = audioBlob;
    }
  }, [audioBlob]);

  const saveNote = useCallback(async (text: string) => {
    let audioData: string | undefined;

    if (pendingAudioRef.current) {
      try {
        audioData = await blobToBase64(pendingAudioRef.current);
      } catch (error) {
        console.error("Failed to convert audio:", error);
      }
      pendingAudioRef.current = null;
    }

    addNote(text, audioData);
    toast.success(audioData ? "Voice note captured" : "Thought captured");
  }, [addNote]);

  useEffect(() => {
    // Detect transition from listening -> not listening
    if (prevListening.current && !isListening) {
      if (transcript.trim()) {
        saveNote(transcript.trim());
      }
    }
    prevListening.current = isListening;
  }, [isListening, transcript, saveNote]);

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

