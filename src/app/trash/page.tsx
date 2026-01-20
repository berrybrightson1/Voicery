"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useNotes } from "@/context/NoteContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TrashPage() {
    const { trash, restoreFromTrash, permanentDelete, clearTrash } = useNotes();

    return (
        <main className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200 selection:text-gray-900">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-gray-200/50 flex flex-col">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 active:scale-95"
                            aria-label="Back to notes"
                        >
                            <ArrowLeft size={24} strokeWidth={2} />
                        </Link>
                        <h1 className="font-bold text-xl tracking-tight">Recently Deleted</h1>
                    </div>

                    {trash.length > 0 && (
                        <button
                            onClick={clearTrash}
                            className="text-sm text-red-500 font-medium hover:text-red-600"
                        >
                            Empty Trash
                        </button>
                    )}
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-20">
                    <AnimatePresence mode="popLayout">
                        {trash.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-[50vh] text-center p-8"
                            >
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-gray-50">
                                    <Trash2 className="text-gray-300" size={24} />
                                </div>
                                <p className="text-gray-400 font-medium text-lg">No deleted notes</p>
                                <p className="text-gray-300 text-sm mt-2">Deleted notes appear here for 1 hour</p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs text-gray-400 mb-2">
                                    Notes are permanently deleted after 1 hour
                                </p>
                                {trash.map((note) => (
                                    <motion.div
                                        key={note.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-gray-50 rounded-xl border border-gray-100 p-4"
                                    >
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                                            {note.text}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => restoreFromTrash(note.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <RotateCcw size={14} />
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => permanentDelete(note.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
