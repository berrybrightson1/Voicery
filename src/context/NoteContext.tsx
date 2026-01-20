"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export type Note = {
    id: string;
    text: string;
    createdAt: Date;
};

interface NoteContextType {
    notes: Note[];
    addNote: (text: string) => void;
    updateNote: (id: string, text: string) => void;
    deleteNote: (id: string) => void;
    clearAllNotes: () => void;
    restoreNote: (note: Note) => void;
    replaceNotes: (notes: Note[]) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export function NoteProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);

    // Auto-delete notes older than 1 hour
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setNotes((prev) =>
                prev.filter((note) => now - note.createdAt.getTime() < ONE_HOUR_MS)
            );
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const addNote = useCallback((text: string) => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            text,
            createdAt: new Date(),
        };
        // Add to top of list
        setNotes((prev) => [newNote, ...prev]);
    }, []);

    const updateNote = useCallback((id: string, text: string) => {
        setNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, text } : note))
        );
    }, []);

    const deleteNote = useCallback((id: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== id));
    }, []);

    const clearAllNotes = useCallback(() => {
        setNotes([]);
    }, []);

    const restoreNote = useCallback((note: Note) => {
        setNotes((prev) => {
            // Try to insert back at correct date position/index if possible, or just top
            // For simplicity and "undo" behavior, usually putting it back where it was or top is fine.
            // Let's put it back based on createdAt sort if we care, or just top.
            // User didn't specify sort order, but implied stack? "NoteFeed ... list of notes".
            // Usually newest first.
            const newNotes = [note, ...prev];
            return newNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        });
    }, []);

    const replaceNotes = useCallback((newNotes: Note[]) => {
        setNotes(newNotes);
    }, []);

    return (
        <NoteContext.Provider
            value={{ notes, addNote, updateNote, deleteNote, clearAllNotes, restoreNote, replaceNotes }}
        >
            {children}
        </NoteContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NoteContext);
    if (context === undefined) {
        throw new Error("useNotes must be used within a NoteProvider");
    }
    return context;
}
