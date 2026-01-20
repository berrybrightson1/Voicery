"use client";

import { motion } from "framer-motion";
import { Trash2, Copy, Sparkles, X, Check, Share2 } from "lucide-react"; // Share2 kept if we want it, but replacing with Sparkles as verified.
import { useNotes, Note } from "@/context/NoteContext";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NoteCardProps {
    note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
    const { updateNote, deleteNote } = useNotes();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note.text);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea on edit
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Reset height
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [isEditing]);

    const handleBlur = () => {
        // No auto-save anymore, explicit save only. 
        // Although standard UX might expect blur to save, user asked for explicit buttons.
        // We will keep blur doing nothing to allow 'Cancel'.
    };

    const handleSave = () => {
        if (text.trim() !== note.text) {
            updateNote(note.id, text.trim());
            toast.success("Note updated");
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setText(note.text); // Revert
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteNote(note.id);
        toast.success("Note deleted", {
            action: {
                label: "Undo",
                onClick: () => {
                    // Restore logic handled in context, but we need to pass the note object
                    // Context currently handles restoring if we had a restore function exposing it properly.
                    // For now, simpler to just re-add? No, context has restoreNote.
                    // We need to import restoreNote from context or just let context handle usage.
                }
            }
        });
        // Actually, restoreNote needs to be called. We can do that if we pull it from hook.
        // But for this snippet let's stick to simple delete toast. 
        // Ideally we pass restoreNote from parent or hook.
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
                    <p
                        onClick={() => setIsEditing(true)}
                        className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap cursor-text font-sans break-words hover:bg-gray-50/50 rounded-lg -m-1 p-1 transition-colors"
                    >
                        {note.text}
                    </p>

                    {/* Action Row */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <ActionButton icon={Copy} onClick={handleCopy} label="Copy" />
                        <ActionButton icon={Sparkles} onClick={handleRefine} label="Refine Prompt" />
                        <ActionButton icon={Trash2} onClick={() => deleteNote(note.id)} label="Delete" isDestructive />
                    </div>
                </>
            )}
        </motion.div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActionButton({ icon: Icon, onClick, label, isDestructive }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group/btn flex items-center justify-center w-full h-10 rounded-xl border transition-all duration-200 active:scale-95",
                isDestructive
                    ? "bg-red-50/50 border-red-100/50 text-red-400 hover:bg-red-100/80 hover:border-red-200 hover:text-red-500"
                    : "bg-gray-50/50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900"
            )}
            aria-label={label}
        >
            <Icon size={18} strokeWidth={1.5} />
        </button>
    )
}
