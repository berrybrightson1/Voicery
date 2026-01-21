"use client";

import { NoteTag } from "@/context/NoteContext";
import { Tag, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TAGS: { id: NoteTag; label: string; color: string; bg: string }[] = [
    { id: "idea", label: "Idea", color: "text-yellow-600", bg: "bg-yellow-100" },
    { id: "task", label: "Task", color: "text-blue-600", bg: "bg-blue-100" },
    { id: "personal", label: "Personal", color: "text-pink-600", bg: "bg-pink-100" },
    { id: "work", label: "Work", color: "text-green-600", bg: "bg-green-100" },
];

interface TagPickerProps {
    currentTag?: NoteTag;
    onSelect: (tag: NoteTag | null) => void;
}

export function TagPicker({ currentTag, onSelect }: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedTag = TAGS.find((t) => t.id === currentTag);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedTag
                    ? `${selectedTag.bg} ${selectedTag.color} border-transparent`
                    : "bg-white text-gray-400 border-gray-100/50 hover:bg-gray-50 hover:text-gray-600 shadow-sm"
                    }`}
            >
                <Tag size={14} />
                <span>{selectedTag ? selectedTag.label : "Tag"}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute top-8 left-0 z-20 bg-white rounded-xl border border-gray-200 shadow-lg p-2 min-w-[120px]"
                    >
                        {TAGS.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => {
                                    onSelect(tag.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentTag === tag.id
                                    ? `${tag.bg} ${tag.color}`
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${tag.bg}`} />
                                {tag.label}
                            </button>
                        ))}

                        {currentTag && (
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 mt-1 border-t border-gray-100 pt-2 whitespace-nowrap"
                            >
                                <X size={12} />
                                Remove tag
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function TagBadge({ tag }: { tag: NoteTag }) {
    const tagInfo = TAGS.find((t) => t.id === tag);
    if (!tagInfo) return null;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tagInfo.bg} ${tagInfo.color}`}>
            {tagInfo.label}
        </span>
    );
}
