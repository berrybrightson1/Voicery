"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Copy, Sparkles, X, Check } from "lucide-react";
import { useNotes, Note } from "@/context/NoteContext";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EDIT_HINT_KEY = "voicery-edit-hint-shown";

interface NoteCardProps {
    note: Note;
    isFirstNote?: boolean;
}

export function NoteCard({ note, isFirstNote = false }: NoteCardProps) {
    const { updateNote, deleteNote } = useNotes();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note.text);
    const [showEditHint, setShowEditHint] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Show edit hint on first note (once ever)
    useEffect(() => {
        if (isFirstNote && !localStorage.getItem(EDIT_HINT_KEY)) {
            const timer = setTimeout(() => {
                setShowEditHint(true);
            }, 1500); // Show after 1.5s
            return () => clearTimeout(timer);
        }
    }, [isFirstNote]);

    const dismissEditHint = () => {
        localStorage.setItem(EDIT_HINT_KEY, "true");
        setShowEditHint(false);
    };

    // Focus textarea on edit
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [isEditing]);

    const handleSave = () => {
        if (text.trim() !== note.text) {
            updateNote(note.id, text.trim());
            toast.success("Note updated");
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setText(note.text);
        setIsEditing(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(note.text);
        toast.success("Copied to clipboard");
    };

    const handleRefine = () => {
        const prompt = `Refine the following text to be clear, professional, and structured:\n\n${note.text}`;
        navigator.clipboard.writeText(prompt);
        toast.success("Prompt copied", {
            description: "Paste into ChatGPT/Claude to refine."
        });
    };

    const handleStartEdit = () => {
        dismissEditHint();
        setIsEditing(true);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="group relative bg-white rounded-2xl border border-gray-200 p-5 shadow-sm transition-all hover:shadow-md"
        >
            {isEditing ? (
                <div className="space-y-4">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        className="w-full resize-none text-lg text-gray-900 leading-relaxed outline-none bg-transparent p-0 placeholder-gray-400 font-sans min-h-[1.5em]"
                        aria-label="Edit note content"
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                        >
                            <Check size={16} />
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Edit Hint Popup */}
                    <AnimatePresence>
                        {showEditHint && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 z-10"
                            >
                                <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2">
                                    <span>Tap text to edit</span>
                                    <button
                                        onClick={dismissEditHint}
                                        className="text-gray-400 hover:text-white"
                                        title="Dismiss"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p
                        onClick={handleStartEdit}
                        className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap cursor-text font-sans break-words hover:bg-gray-50/50 rounded-lg -m-1 p-1 transition-colors"
                    >
                        {note.text}
                    </p>

                    {/* Action Row */}
                    <div className="flex items-center gap-2 mt-4">
                        {/* Copy - Icon only */}
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center h-10 px-4 rounded-xl border bg-gray-50/50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900 transition-all active:scale-95"
                            aria-label="Copy"
                        >
                            <Copy size={18} strokeWidth={1.5} />
                        </button>

                        {/* Refine - Label + Icon */}
                        <button
                            onClick={handleRefine}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border bg-purple-50/50 border-purple-100 text-purple-600 hover:bg-purple-100 hover:border-purple-200 hover:text-purple-700 transition-all active:scale-95 flex-1"
                            aria-label="Refine for AI"
                        >
                            <Sparkles size={16} strokeWidth={1.5} />
                            <span className="text-sm font-medium">Refine</span>
                        </button>

                        {/* Delete - Smaller icon */}
                        <button
                            onClick={() => deleteNote(note.id)}
                            className="flex items-center justify-center h-10 w-10 rounded-xl border bg-red-50/30 border-red-100/50 text-red-300 hover:bg-red-100/80 hover:border-red-200 hover:text-red-500 transition-all active:scale-95"
                            aria-label="Delete"
                        >
                            <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                    </div>
                </>
            )}
        </motion.div>
    );
}

