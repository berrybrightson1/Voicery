"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export type Note = {
    id: string;
    text: string;
    createdAt: Date;
};

// Stored format uses ISO string for createdAt
type StoredNote = {
    id: string;
    text: string;
    createdAt: string;
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
const STORAGE_KEY = "voicery-notes";

// Helper: filter out expired notes
function filterExpired(notes: Note[]): Note[] {
    const now = Date.now();
    return notes.filter((note) => now - note.createdAt.getTime() < ONE_HOUR_MS);
}

// Helper: load notes from localStorage
function loadNotes(): Note[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const stored: StoredNote[] = JSON.parse(raw);
        const notes = stored.map((n) => ({
            ...n,
            createdAt: new Date(n.createdAt),
        }));
        return filterExpired(notes);
    } catch {
        return [];
    }
}

// Helper: save notes to localStorage
function saveNotes(notes: Note[]) {
    if (typeof window === "undefined") return;
    const stored: StoredNote[] = notes.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function NoteProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load notes from localStorage on mount
    useEffect(() => {
        const loaded = loadNotes();
        setNotes(loaded);
        setIsLoaded(true);
    }, []);

    // Save notes to localStorage whenever they change (after initial load)
    useEffect(() => {
        if (isLoaded) {
            saveNotes(notes);
        }
    }, [notes, isLoaded]);

    // Auto-delete notes older than 1 hour
    useEffect(() => {
        const interval = setInterval(() => {
            setNotes((prev) => filterExpired(prev));
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const addNote = useCallback((text: string) => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            text,
            createdAt: new Date(),
        };
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

