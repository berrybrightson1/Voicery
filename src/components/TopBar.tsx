import Link from "next/link";
import { Trash2, Info } from "lucide-react";
import { useNotes } from "@/context/NoteContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TopBar() {
    const { notes, clearAllNotes, replaceNotes } = useNotes();

    const handleClear = () => {
        if (notes.length === 0) return;
        const oldNotes = [...notes];
        clearAllNotes();
        toast.success("All notes cleared", {
            action: {
                label: "Undo",
                onClick: () => replaceNotes(oldNotes),
            },
        });
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-20 z-50 flex items-center justify-between px-6 max-w-md mx-auto w-full transition-all bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
            <div className="font-bold text-3xl tracking-tighter text-gray-900 font-sans leading-none">Voicery</div>

            <div className="flex items-center gap-1">
                <Link
                    href="/about"
                    className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 active:scale-95"
                    aria-label="About"
                >
                    <Info size={22} strokeWidth={1.5} />
                </Link>

                <button
                    onClick={handleClear}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 active:scale-95"
                    aria-label="Clear all notes"
                >
                    <Trash2 size={22} strokeWidth={1.5} />
                </button>
            </div>
        </header>
    );
}
