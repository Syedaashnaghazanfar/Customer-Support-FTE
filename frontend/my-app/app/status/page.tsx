"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Ticket {
    ticket_number: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    subject: string;
    category: string;
    resolution_notes?: string;
    messages?: { role: string; content: string }[];
}

/* ---- SVG Icons ---- */
function EnvelopeIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M22 7l-10 6L2 7" />
        </svg>
    );
}

function ChatBubbleIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
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
            {/* Page Header */}
            <div className="text-center mb-14 md:mb-16 space-y-5 max-w-4xl flex flex-col items-center mt-4">
                <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight animate-fade-in drop-shadow-xl text-center">
                    Track Your <span className="text-gradient">Request</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl animate-fade-in [animation-delay:100ms] leading-relaxed text-center max-w-2xl">
                    Enter your ticket ID below to see real-time updates from our AI and support team.
                </p>
            </div>

            <div className="max-w-4xl w-full flex flex-col items-center space-y-10">
                {/* Lookup Form */}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleLookup(ticketId); }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex gap-3 animate-fade-in-up [animation-delay:200ms] w-full shadow-2xl max-w-2xl"
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
                        className="btn-glow px-10 py-4 rounded-xl disabled:opacity-50 text-base font-bold tracking-wide flex items-center gap-3"
                    >
                        <SearchIcon />
                        {isLoading ? "Searching..." : "Track"}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="bg-rose-500/10 backdrop-blur-md p-6 border border-rose-500/20 rounded-2xl text-rose-400 text-center animate-fade-in w-full max-w-2xl">
                        <p className="text-base font-medium">{error}</p>
                    </div>
                )}

                {/* Ticket Result (Receipt Style) */}
                {ticket && (
                    <div className="relative animate-fade-in-up w-full">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl w-full">
                            {/* Header */}
                            <div className="bg-indigo-500/10 p-8 md:p-10 border-b border-indigo-500/20">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-400">Official Receipt</div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Support Ticket</h2>
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

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</div>
                                        <div className="font-mono text-base font-bold text-indigo-300">#{ticket.ticket_number}</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</div>
                                        <div className="flex items-center gap-2 font-bold text-base text-white">
                                            <span className={`w-2.5 h-2.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-rose-500' :
                                                ticket.priority === 'high' ? 'bg-orange-500' :
                                                    'bg-emerald-500'
                                                }`} />
                                            <span className="capitalize">{ticket.priority}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</div>
                                        <div className="text-base font-bold text-white">{new Date(ticket.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Section */}
                            <div className="p-8 md:p-10 space-y-10">
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-500">Subject</div>
                                    <div className="text-xl md:text-2xl font-bold leading-tight text-white">{ticket.subject}</div>
                                    <div className="inline-block px-4 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wide">{ticket.category}</div>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-xs font-black uppercase tracking-widest text-indigo-400">Communication Log</div>
                                    <div className="space-y-8">
                                        {/* Original Message */}
                                        <div className="relative pl-7 border-l-2 border-white/10">
                                            <div className="absolute top-2 -left-[7px] w-3 h-3 rounded-full bg-slate-800 border-2 border-white/20" />
                                            <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Ticket Details</div>
                                            <div className="bg-white/5 rounded-xl p-6 text-sm leading-relaxed text-slate-300 italic border border-white/5">
                                                {ticket.subject || "No details available."}
                                            </div>
                                        </div>

                                        {/* AI Resolution */}
                                        {ticket.resolution_notes && (
                                            <div className="relative pl-7 border-l-2 border-indigo-500/30">
                                                <div className="absolute top-2 -left-[7px] w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-500" />
                                                <div className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wide">AI Agent Resolution</div>
                                                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6 text-sm leading-relaxed text-slate-200">
                                                    {ticket.resolution_notes}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer decorative jagged edge */}
                            <div className="h-5 w-full bg-white/5" style={{
                                clipPath: 'polygon(0% 0%, 2% 100%, 4% 0%, 6% 100%, 8% 0%, 10% 100%, 12% 0%, 14% 100%, 16% 0%, 18% 100%, 20% 0%, 22% 100%, 24% 0%, 26% 100%, 28% 0%, 30% 100%, 32% 0%, 34% 100%, 36% 0%, 38% 100%, 40% 0%, 42% 100%, 44% 0%, 46% 100%, 48% 0%, 50% 100%, 52% 0%, 54% 100%, 56% 0%, 58% 100%, 60% 0%, 62% 100%, 64% 0%, 66% 100%, 68% 0%, 70% 100%, 72% 0%, 74% 100%, 76% 0%, 78% 100%, 80% 0%, 82% 100%, 84% 0%, 86% 100%, 88% 0%, 90% 100%, 92% 0%, 94% 100%, 96% 0%, 98% 100%, 100% 0%)'
                            }} />
                        </div>

                        <div className="mt-8 text-center text-xs text-white/20 font-mono italic">
                            * This document is generated by TechCorp AI Core. Authenticity verified.
                        </div>
                    </div>
                )}
            </div>

            {/* Helpful links */}
            {!ticket && !isLoading && (
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in [animation-delay:300ms] w-full max-w-4xl px-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center gap-5 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0">
                            <EnvelopeIcon />
                        </div>
                        <div>
                            <div className="font-bold text-base text-white">Need faster help?</div>
                            <div className="text-sm text-slate-400 mt-1">Email us at support@techcorp.io</div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center gap-5 hover:border-cyan-500/30 transition-colors cursor-pointer group">
                        <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0">
                            <ChatBubbleIcon />
                        </div>
                        <div>
                            <div className="font-bold text-base text-white">WhatsApp Support</div>
                            <div className="text-sm text-slate-400 mt-1">+1 (555) TECH-AI</div>
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
