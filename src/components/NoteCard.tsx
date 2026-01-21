"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Copy, Sparkles, X, Check, Play, Pause } from "lucide-react";
import { useNotes, Note } from "@/context/NoteContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { TagPicker, TagBadge } from "./TagPicker";

const HINT_STEP_KEY = "voicery-hint-step"; // 0 = show edit, 1 = show refine, 2 = done

interface NoteCardProps {
    note: Note;
    isFirstNote?: boolean;
}

export function NoteCard({ note, isFirstNote = false }: NoteCardProps) {
    const { updateNote, updateNoteTag, deleteNote, restoreNote } = useNotes();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note.text);
    const [hintStep, setHintStep] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load hint step from localStorage
    useEffect(() => {
        if (isFirstNote) {
            const stored = localStorage.getItem(HINT_STEP_KEY);
            const step = stored ? parseInt(stored, 10) : 0;
            if (step < 2) {
                // Show hint after a short delay
                const timer = setTimeout(() => setHintStep(step), 800);
                return () => clearTimeout(timer);
            }
        }
    }, [isFirstNote]);

    const advanceHint = () => {
        const nextStep = (hintStep ?? 0) + 1;
        localStorage.setItem(HINT_STEP_KEY, String(nextStep));
        if (nextStep < 2) {
            setHintStep(nextStep);
        } else {
            setHintStep(null);
        }
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
        // If refine hint is showing, dismiss it
        if (hintStep === 1) {
            advanceHint();
        }
    };

    const handleStartEdit = () => {
        // If edit hint is showing, advance to refine hint
        if (hintStep === 0) {
            advanceHint();
        }
        setIsEditing(true);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="group relative bg-white rounded-2xl border border-gray-200 p-5 shadow-sm transition-all hover:shadow-md overflow-visible"
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
                    {/* Edit Hint - positioned above text */}
                    <AnimatePresence>
                        {hintStep === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="mb-3"
                            >
                                <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg inline-flex items-center gap-2">
                                    <span>👆 Tap the text to edit it</span>
                                    <button
                                        onClick={advanceHint}
                                        className="text-gray-400 hover:text-white ml-1"
                                        title="Got it"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tag Badge */}
                    {note.tag && (
                        <div className="mb-2">
                            <TagBadge tag={note.tag} />
                        </div>
                    )}

                    <p
                        onClick={handleStartEdit}
                        className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap cursor-text font-sans break-words hover:bg-gray-50/50 rounded-lg -m-1 p-1 transition-colors"
                    >
                        {note.text}
                    </p>

                    {/* Action Rows */}
                    <div className="mt-4 space-y-2">
                        {/* Row 1: Main actions */}
                        <div className="flex items-center gap-2">
                            {/* Play - Only if has audio */}
                            {note.audioData && (
                                <button
                                    onClick={() => {
                                        if (isPlaying && audioRef.current) {
                                            audioRef.current.pause();
                                            setIsPlaying(false);
                                        } else {
                                            if (!audioRef.current) {
                                                audioRef.current = new Audio(note.audioData);
                                                audioRef.current.onended = () => setIsPlaying(false);
                                            }
                                            audioRef.current.play();
                                            setIsPlaying(true);
                                        }
                                    }}
                                    className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all active:scale-95 ${isPlaying
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        }`}
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                    <span>{isPlaying ? "Pause" : "Play"}</span>
                                </button>
                            )}

                            {/* Copy */}
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95"
                                aria-label="Copy"
                            >
                                <Copy size={16} />
                            </button>

                            {/* Refine */}
                            <div className="relative flex-1">
                                <button
                                    onClick={handleRefine}
                                    className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all active:scale-95 w-full text-sm font-medium"
                                    aria-label="Refine for AI"
                                >
                                    <Sparkles size={14} />
                                    <span>Refine</span>
                                </button>

                                {/* Refine Hint */}
                                <AnimatePresence>
                                    {hintStep === 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute -bottom-12 left-0 right-0 z-10"
                                        >
                                            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                                                <span>✨ Tap Refine to copy as AI prompt</span>
                                                <button
                                                    onClick={advanceHint}
                                                    className="text-gray-400 hover:text-white ml-auto"
                                                    title="Got it"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Row 2: Tag + Delete */}
                        <div className="flex items-center justify-between">
                            {/* Tag Picker */}
                            <TagPicker
                                currentTag={note.tag}
                                onSelect={(tag) => updateNoteTag(note.id, tag)}
                            />

                            {/* Delete */}
                            {confirmDelete ? (
                                <button
                                    onClick={() => {
                                        const deletedNote = { ...note };
                                        deleteNote(note.id);
                                        toast.success("Note deleted", {
                                            action: {
                                                label: "Undo",
                                                onClick: () => restoreNote(deletedNote)
                                            }
                                        });
                                    }}
                                    className="flex items-center gap-1 h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-all active:scale-95"
                                    aria-label="Confirm delete"
                                >
                                    <Trash2 size={12} />
                                    <span>Delete?</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-400 transition-all active:scale-95"
                                    aria-label="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}


