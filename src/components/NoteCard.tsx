"use client";

import { useState, useRef, useEffect } from "react";
import { Note, useNotes } from "@/context/NoteContext";
import { Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NoteCard({ note }: { note: Note }) {
    const { updateNote, deleteNote, restoreNote } = useNotes();

    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note.text);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
            textareaRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (text.trim() !== note.text) {
            if (text.trim() === "") {
                updateNote(note.id, text);
            } else {
                updateNote(note.id, text);
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(note.text);
        toast.success("Copied to clipboard");
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ text: note.text });
            } catch (e) {
                // ignore abort
            }
        } else {
            handleCopy();
            toast("Copied to clipboard (Share not supported)");
        }
    };

    const handleDelete = () => {
        deleteNote(note.id);
        toast.success("Note deleted", {
            action: {
                label: "Undo",
                onClick: () => restoreNote(note),
            },
            duration: 4000,
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
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onBlur={handleBlur}
                    className="w-full resize-none text-lg text-gray-900 leading-relaxed outline-none bg-transparent p-0 placeholder-gray-400 font-sans min-h-[1.5em]"
                    aria-label="Edit note content"
                />
            ) : (
                <p
                    onClick={() => setIsEditing(true)}
                    className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap cursor-text font-sans break-words"
                >
                    {note.text}
                </p>
            )}

            {/* Action Row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
                <ActionButton icon={Copy} onClick={handleCopy} label="Copy" />
                <ActionButton icon={Share2} onClick={handleShare} label="Share" />
                <ActionButton icon={X} onClick={handleDelete} label="Delete" isDestructive />
            </div>
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
