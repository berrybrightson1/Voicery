"use client";

import { useNotes } from "@/context/NoteContext";
import { NoteCard } from "./NoteCard";
import { Copy, Mic } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export function NoteFeed() {
    const { notes } = useNotes();

    const handleCopyAll = () => {
        const allText = notes.map(n => n.text).join("\n\n");
        navigator.clipboard.writeText(allText);
        toast.success("Stack copied to clipboard");
    };

    return (
        <div className="flex-1 w-full max-w-md mx-auto px-4 pb-48 pt-28 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="popLayout">
                {notes.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-[50vh] text-center p-8"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-gray-50">
                            <Mic className="text-gray-300" size={24} />
                        </div>
                        <p className="text-gray-400 font-medium text-lg">Tap the mic to capture a thought.</p>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {notes.map((note) => (
                            <NoteCard key={note.id} note={note} />
                        ))}

                        {notes.length > 1 && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleCopyAll}
                                className="flex items-center justify-center gap-2 w-full py-4 text-gray-400 hover:text-gray-900 transition-colors font-medium text-sm mt-4 border border-dashed border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100"
                            >
                                <Copy size={16} />
                                <span>Copy All Stack</span>
                            </motion.button>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
