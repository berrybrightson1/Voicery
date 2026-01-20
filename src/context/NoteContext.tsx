"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export type Note = {
    id: string;
    text: string;
    createdAt: Date;
};

export type TrashedNote = Note & {
    deletedAt: Date;
};

// Stored format uses ISO string for dates
type StoredNote = {
    id: string;
    text: string;
    createdAt: string;
};

type StoredTrashedNote = StoredNote & {
    deletedAt: string;
};

interface NoteContextType {
    notes: Note[];
    trash: TrashedNote[];
    addNote: (text: string) => void;
    updateNote: (id: string, text: string) => void;
    deleteNote: (id: string) => void;
    clearAllNotes: () => void;
    restoreNote: (note: Note) => void;
    replaceNotes: (notes: Note[]) => void;
    restoreFromTrash: (id: string) => void;
    permanentDelete: (id: string) => void;
    clearTrash: () => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const ONE_HOUR_MS = 60 * 60 * 1000;
const STORAGE_KEY = "voicery-notes";
const TRASH_KEY = "voicery-trash";

function filterExpired(notes: Note[]): Note[] {
    const now = Date.now();
    return notes.filter((note) => now - note.createdAt.getTime() < ONE_HOUR_MS);
}

function filterExpiredTrash(trash: TrashedNote[]): TrashedNote[] {
    const now = Date.now();
    return trash.filter((note) => now - note.deletedAt.getTime() < ONE_HOUR_MS);
}

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

function loadTrash(): TrashedNote[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(TRASH_KEY);
        if (!raw) return [];
        const stored: StoredTrashedNote[] = JSON.parse(raw);
        const trash = stored.map((n) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            deletedAt: new Date(n.deletedAt),
        }));
        return filterExpiredTrash(trash);
    } catch {
        return [];
    }
}

function saveNotes(notes: Note[]) {
    if (typeof window === "undefined") return;
    const stored: StoredNote[] = notes.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function saveTrash(trash: TrashedNote[]) {
    if (typeof window === "undefined") return;
    const stored: StoredTrashedNote[] = trash.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        deletedAt: n.deletedAt.toISOString(),
    }));
    localStorage.setItem(TRASH_KEY, JSON.stringify(stored));
}

export function NoteProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [trash, setTrash] = useState<TrashedNote[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setNotes(loadNotes());
        setTrash(loadTrash());
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            saveNotes(notes);
        }
    }, [notes, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            saveTrash(trash);
        }
    }, [trash, isLoaded]);

    // Auto-cleanup every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setNotes((prev) => filterExpired(prev));
            setTrash((prev) => filterExpiredTrash(prev));
        }, 60000);
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
        setNotes((prev) => {
            const noteToDelete = prev.find((n) => n.id === id);
            if (noteToDelete) {
                setTrash((t) => [{ ...noteToDelete, deletedAt: new Date() }, ...t]);
            }
            return prev.filter((note) => note.id !== id);
        });
    }, []);

    const clearAllNotes = useCallback(() => {
        setNotes((prev) => {
            const now = new Date();
            const trashedNotes = prev.map((n) => ({ ...n, deletedAt: now }));
            setTrash((t) => [...trashedNotes, ...t]);
            return [];
        });
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

    const restoreFromTrash = useCallback((id: string) => {
        setTrash((prev) => {
            const noteToRestore = prev.find((n) => n.id === id);
            if (noteToRestore) {
                const { deletedAt, ...note } = noteToRestore;
                setNotes((n) => [note, ...n].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            }
            return prev.filter((n) => n.id !== id);
        });
    }, []);

    const permanentDelete = useCallback((id: string) => {
        setTrash((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearTrash = useCallback(() => {
        setTrash([]);
    }, []);

    return (
        <NoteContext.Provider
            value={{
                notes,
                trash,
                addNote,
                updateNote,
                deleteNote,
                clearAllNotes,
                restoreNote,
                replaceNotes,
                restoreFromTrash,
                permanentDelete,
                clearTrash,
            }}
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


