import Link from "next/link";
import { Trash2, Info } from "lucide-react";
import { useNotes } from "@/context/NoteContext";

export function TopBar() {
    const { trash } = useNotes();

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

                <Link
                    href="/trash"
                    className="relative flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 active:scale-95"
                    aria-label="Recently deleted"
                >
                    <Trash2 size={22} strokeWidth={1.5} />
                    {trash.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {trash.length > 9 ? "9+" : trash.length}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}

