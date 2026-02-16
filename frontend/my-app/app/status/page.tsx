"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Ticket {
    id: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    subject: string;
    category: string;
    original_message: string;
    resolution_notes?: string;
}

function StatusContent() {
    const searchParams = useSearchParams();
    const initialTicketId = searchParams.get("ticket") || "";

    const [ticketId, setTicketId] = useState(initialTicketId);
    const [isLoading, setIsLoading] = useState(false);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [error, setError] = useState("");

    const handleLookup = useCallback(async (id: string) => {
        const searchId = typeof id === 'string' ? id : ticketId;
        if (!searchId.trim()) return;

        setIsLoading(true);
        setError("");
        setTicket(null);

        try {
            // Sanitize ID: remove # if present
            const cleanId = searchId.trim().replace(/^#/, '');

            const response = await fetch(`http://localhost:8000/support/ticket/${cleanId}`);
            if (!response.ok) {
                throw new Error("Ticket not found. Please check the ID and try again.");
            }
            const data = await response.json();
            setTicket(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        if (initialTicketId) {
            handleLookup(initialTicketId);
        }
    }, [initialTicketId, handleLookup]);

    return (
        <div className="w-full flex flex-col items-center py-12 md:py-20 px-6">
            <div className="text-center mb-16 space-y-6 max-w-4xl flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight animate-fade-in drop-shadow-xl text-center">
                    Track Your <span className="text-gradient">Request</span>
                </h1>
                <p className="text-slate-400 text-xl md:text-2xl animate-fade-in delay-100 leading-relaxed text-center max-w-2xl">
                    Enter your ticket ID below to see real-time updates from our AI and support team.
                </p>
            </div>

            <div className="max-w-3xl w-full flex flex-col items-center space-y-10">
                {/* Lookup Form */}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleLookup(ticketId); }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex gap-3 animate-fade-in-up delay-200 w-full shadow-2xl max-w-xl"
                >
                    <input
                        type="text"
                        required
                        className="flex-1 bg-transparent border-none px-6 py-4 focus:outline-none text-white font-mono text-lg placeholder:text-slate-600"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                        placeholder="TICKET-ID-1234..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-glow px-10 py-4 rounded-xl disabled:opacity-50 text-base font-bold tracking-wide"
                    >
                        {isLoading ? "Searching..." : "Track"}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="bg-rose-500/10 backdrop-blur-md p-6 border border-rose-500/20 rounded-2xl text-rose-400 text-center animate-fade-in w-full max-w-xl">
                        <p className="text-base font-medium">{error}</p>
                    </div>
                )}

                {/* Ticket Result (Receipt Style) */}
                {ticket && (
                    <div className="relative animate-fade-in-up w-full">
                        {/* The Receipt Body */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl w-full">
                            {/* Header section of receipt */}
                            <div className="bg-indigo-500/10 p-10 border-b border-indigo-500/20 relative">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-2">
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-400">Official Receipt</div>
                                        <h2 className="text-3xl font-black tracking-tight text-white">Support Ticket</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Status</div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${ticket.status === 'open' ? 'bg-amber-500/20 text-amber-400' :
                                            ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-indigo-500/20 text-indigo-400'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</div>
                                        <div className="font-mono text-base font-bold text-indigo-300">#{ticket.id}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</div>
                                        <div className="flex items-center gap-2 font-bold text-base text-white">
                                            <span className={`w-2.5 h-2.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-rose-500' :
                                                ticket.priority === 'high' ? 'bg-orange-500' :
                                                    'bg-emerald-500'
                                                }`} />
                                            <span className="capitalize">{ticket.priority}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</div>
                                        <div className="text-base font-bold text-white">{new Date(ticket.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Section */}
                            <div className="p-10 space-y-10">
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Subject Matter</div>
                                    <div className="text-2xl font-bold leading-tight text-white">{ticket.subject}</div>
                                    <div className="inline-block px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wide">{ticket.category}</div>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-xs font-black uppercase tracking-widest text-indigo-400">Communication Log</div>
                                    <div className="space-y-8">
                                        {/* Original Message */}
                                        <div className="relative pl-8 border-l-2 border-white/10">
                                            <div className="absolute top-2 -left-[9px] w-4 h-4 rounded-full bg-slate-800 border-2 border-white/20" />
                                            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Customer Message</div>
                                            <div className="bg-white/5 rounded-2xl p-6 text-base leading-relaxed text-slate-300 italic border border-white/5 relative">
                                                <div className="absolute -top-3 -left-2 text-4xl opacity-10 font-serif">&quot;</div>
                                                {ticket.original_message || "No message content available."}
                                                <div className="absolute -bottom-6 -right-2 text-4xl opacity-10 font-serif">&quot;</div>
                                            </div>
                                        </div>

                                        {/* AI Resolution */}
                                        {ticket.resolution_notes && (
                                            <div className="relative pl-8 border-l-2 border-indigo-500/30">
                                                <div className="absolute top-2 -left-[9px] w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500" />
                                                <div className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">AI Agent Resolution</div>
                                                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 text-base leading-relaxed text-slate-200">
                                                    {ticket.resolution_notes}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer decorative jagged edge simulate */}
                            <div className="h-6 w-full bg-white/5" style={{
                                clipPath: 'polygon(0% 0%, 2% 100%, 4% 0%, 6% 100%, 8% 0%, 10% 100%, 12% 0%, 14% 100%, 16% 0%, 18% 100%, 20% 0%, 22% 100%, 24% 0%, 26% 100%, 28% 0%, 30% 100%, 32% 0%, 34% 100%, 36% 0%, 38% 100%, 40% 0%, 42% 100%, 44% 0%, 46% 100%, 48% 0%, 50% 100%, 52% 0%, 54% 100%, 56% 0%, 58% 100%, 60% 0%, 62% 100%, 64% 0%, 66% 100%, 68% 0%, 70% 100%, 72% 0%, 74% 100%, 76% 0%, 78% 100%, 80% 0%, 82% 100%, 84% 0%, 86% 100%, 88% 0%, 90% 100%, 92% 0%, 94% 100%, 96% 0%, 98% 100%, 100% 0%)'
                            }} />
                        </div>

                        {/* Print style info */}
                        <div className="mt-8 text-center text-xs text-white/20 font-mono italic">
                            * This document is generated by TechCorp AI Core. Authenticity verified.
                        </div>
                    </div>
                )}
            </div>

            {/* Helpful links */}
            {!ticket && !isLoading && (
                <div className="mt-24 grid md:grid-cols-2 gap-6 animate-fade-in delay-300 w-full max-w-3xl px-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center gap-5 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                        <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📧</div>
                        <div>
                            <div className="font-bold text-base text-white">Need faster help?</div>
                            <div className="text-sm text-slate-400">Email us at support@techcorp.io</div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center gap-5 hover:border-cyan-500/30 transition-colors cursor-pointer group">
                        <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💬</div>
                        <div>
                            <div className="font-bold text-base text-white">WhatsApp Support</div>
                            <div className="text-sm text-slate-400">+1 (555) TECH-AI</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>}>
            <StatusContent />
        </Suspense>
    );
}
