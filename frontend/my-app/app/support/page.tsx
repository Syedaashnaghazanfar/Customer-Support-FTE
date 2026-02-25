"use client";

import { useState } from "react";
import Link from "next/link";

interface SubmitResult {
    success: boolean;
    ticket_id?: string;
    ai_reply?: string;
    message?: string;
}

/* ---- SVG Icons ---- */
function BotIcon({ className = "" }: { className?: string }) {
    return (
        <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="3" />
            <circle cx="9" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <path d="M8.5 11V8a3.5 3.5 0 017 0v3" />
            <path d="M12 4.5V2" />
            <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function SendIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22 11 13 2 9l20-7z" />
        </svg>
    );
}

export default function SupportPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        category: "general",
        priority: "medium",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<SubmitResult | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        try {
            const response = await fetch("http://localhost:8000/support/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            setResult({
                success: response.ok,
                ticket_id: data.ticket_number,
                ai_reply: data.message,
                message: response.ok ? "Request submitted successfully!" : data.detail || "Submission failed",
            });

            if (response.ok) {
                setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    category: "general",
                    priority: "medium",
                    message: "",
                });
            }
        } catch (_error) {
            setResult({
                success: false,
                message: "Could not connect to the support server.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full flex justify-center py-10 md:py-16 px-6 md:px-12">
            <div className="w-full max-w-7xl flex flex-col items-center">
                {/* Page Header — generous spacing */}
                <div className="text-center mb-14 md:mb-16 space-y-5 max-w-4xl w-full flex flex-col items-center">
                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight animate-fade-in drop-shadow-2xl text-center">
                        Get <span className="text-gradient">Intelligent</span> Help
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl animate-fade-in [animation-delay:100ms] leading-relaxed text-center max-w-3xl">
                        Our AI assistant will analyze your request and provide instant solutions.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 w-full">
                    {/* Form Side */}
                    <div className="lg:col-span-3 space-y-6 w-full">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 space-y-6 animate-fade-in-up [animation-delay:200ms] shadow-2xl"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Category</label>
                                    <div className="relative">
                                        <select
                                            className="form-input appearance-none cursor-pointer pr-10"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="general" className="bg-slate-900">General Inquiry</option>
                                            <option value="technical" className="bg-slate-900">Technical Issue</option>
                                            <option value="billing" className="bg-slate-900">Billing &amp; Account</option>
                                            <option value="feature" className="bg-slate-900">Feature Request</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            <ChevronDownIcon />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Priority</label>
                                    <div className="relative">
                                        <select
                                            className="form-input appearance-none cursor-pointer pr-10"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low" className="bg-slate-900">Low</option>
                                            <option value="medium" className="bg-slate-900">Medium</option>
                                            <option value="high" className="bg-slate-900">High</option>
                                            <option value="urgent" className="bg-slate-900">Urgent</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            <ChevronDownIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="form-input resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 py-4 text-base font-bold shadow-2xl shadow-indigo-500/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <SendIcon />
                                        Submit Support Request
                                    </>
                                )}
                            </button>
                        </form>
                        <p className="text-center text-slate-500 text-xs font-medium tracking-wide pt-2">
                            Our AI responds instantly • Human escalation for complex issues • Available 24/7
                        </p>
                    </div>

                    {/* Results Side */}
                    <div className="lg:col-span-2 space-y-6 w-full h-full">
                        {!result && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 border-dashed opacity-70">
                                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-float">
                                    <BotIcon className="w-10 h-10" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-2xl text-white">AI Ready to Assist</h3>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">Fill out the form to get an instant AI analysis and ticket number.</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-8 space-y-7 animate-fade-in-up border h-full ${result.success ? "border-emerald-500/20 shadow-emerald-500/5 shadow-2xl" : "border-rose-500/20"}`}>
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${result.success ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                        {result.success ? "Request Created" : "System Error"}
                                    </span>
                                    {result.ticket_id && (
                                        <span className="font-mono text-sm font-bold text-indigo-300">#{result.ticket_id}</span>
                                    )}
                                </div>

                                {result.success ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-lg border border-indigo-500/20">
                                                <BotIcon className="w-6 h-6" />
                                            </div>
                                            <div className="font-bold text-indigo-300 text-lg">AI Assistant Response</div>
                                        </div>

                                        <div className="bg-slate-900/80 rounded-xl p-6 text-sm leading-relaxed text-slate-300 italic border border-white/10 relative shadow-inner">
                                            <div className="absolute -top-3 -left-2 text-4xl opacity-20 font-serif">&quot;</div>
                                            {result.ai_reply}
                                            <div className="absolute -bottom-6 -right-2 text-4xl opacity-20 font-serif">&quot;</div>
                                        </div>

                                        <div className="pt-6 flex flex-col items-center gap-4 border-t border-white/5">
                                            <p className="text-xs text-center text-slate-500 font-bold uppercase tracking-widest">Track this ticket using the number above</p>
                                            <Link href="/status" className="w-full">
                                                <button className="btn-outline w-full py-4 text-xs font-bold uppercase tracking-widest flex justify-center hover:bg-white/5">Check Recent Tickets</button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-rose-400 text-base py-8 text-center font-medium bg-rose-500/5 rounded-xl border border-rose-500/10">
                                        {result.message}
                                    </div>
                                )}

                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full text-xs text-slate-500 hover:text-white transition-colors pt-2 font-black uppercase tracking-widest"
                                >
                                    Start New Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
