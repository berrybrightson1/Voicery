"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200 selection:text-gray-900">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-gray-200/50 flex flex-col">
                {/* Header */}
                <header className="h-20 flex items-center px-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                    <Link
                        href="/"
                        className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 active:scale-95"
                        aria-label="Back to notes"
                    >
                        <ArrowLeft size={24} strokeWidth={2} />
                    </Link>
                    <h1 className="ml-2 font-bold text-2xl tracking-tight">About Voicery</h1>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-20">

                    {/* How it Works */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">How it Works</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <ul className="space-y-3 text-gray-700">
                                <li>• Tap the mic to record</li>
                                <li>• Notes stay for <strong>1 hour</strong>, then vanish</li>
                                <li>• Tap text to edit, use Refine for AI prompts</li>
                            </ul>
                        </div>
                    </section>

                    {/* Common Uses */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Common Uses</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <UseItem title="Walking & Talking" desc="Capture streams of consciousness while on a walk." />
                            <UseItem title="Rubber Ducking" desc="Speak to untangle complex thoughts or coding problems." />
                            <UseItem title="AI Drafting" desc="Ramble your thoughts, then use 'Refine' (Sparkles) to prep them for ChatGPT." />
                        </div>
                    </section>

                    {/* Patch Notes */}
                    <section className="space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Patch Notes</h2>

                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <h3 className="font-bold text-lg text-gray-900">v1.0.0</h3>
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Current</span>
                            </div>
                            <p className="text-sm text-gray-500 pb-2">Released Jan 20, 2026</p>

                            <ul className="space-y-3">
                                <PatchItem text="High Contrast UI for better visibility" />
                                <PatchItem text="Simplified Control Bar" />
                                <PatchItem text="Responsive Audio Visualizer" />
                                <PatchItem text="Smart 'Copy All' functionality" />
                                <PatchItem text="iOS Safari Optimization" />
                            </ul>
                        </div>
                    </section>

                    {/* Footer */}
                    <section className="pt-10 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">Designed & Built by Gaillard.</p>
                    </section>

                </div>
            </div>
        </main>
    );
}

function PatchItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3 text-gray-700">
            <CheckCircle2 size={16} className="mt-1 text-gray-400 shrink-0" />
            <span className="leading-normal">{text}</span>
        </li>
    );
}

function UseItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}
