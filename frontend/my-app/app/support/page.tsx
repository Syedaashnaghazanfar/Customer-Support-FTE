"use client";

import { useState } from "react";
import Link from "next/link";

interface SubmitResult {
    success: boolean;
    ticket_id?: string;
    ai_reply?: string;
    message?: string;
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
        <div className="w-full flex justify-center py-12 md:py-24 px-6">
            <div className="w-full max-w-6xl flex flex-col items-center">
                <div className="text-center mb-16 space-y-6 max-w-4xl w-full flex flex-col items-center">
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight animate-fade-in drop-shadow-2xl text-center">
                        Get <span className="text-gradient">Intelligent</span> Help
                    </h1>
                    <p className="text-slate-400 text-xl md:text-2xl animate-fade-in delay-100 leading-relaxed text-center max-w-3xl">
                        Our AI assistant will analyze your request and provide instant solutions.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-12 w-full">
                    {/* Form Side */}
                    <div className="lg:col-span-3 space-y-8 w-full">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 space-y-6 animate-fade-in-up delay-200 shadow-2xl"
                        >
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600 font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600 font-medium"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600 font-medium"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white appearance-none font-medium cursor-pointer"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="general" className="bg-slate-900">General Inquiry</option>
                                            <option value="technical" className="bg-slate-900">Technical Issue</option>
                                            <option value="billing" className="bg-slate-900">Billing & Account</option>
                                            <option value="feature" className="bg-slate-900">Feature Request</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            ▼
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Priority</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white appearance-none font-medium cursor-pointer"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low" className="bg-slate-900">Low</option>
                                            <option value="medium" className="bg-slate-900">Medium</option>
                                            <option value="high" className="bg-slate-900">High</option>
                                            <option value="urgent" className="bg-slate-900">Urgent</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Message</label>
                                <textarea
                                    required
                                    rows={6}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600 resize-none font-medium"
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
                                    "Submit Support Request"
                                )}
                            </button>
                        </form>
                        <p className="text-center text-slate-500 text-xs font-medium tracking-wide">
                            Our AI responds instantly • Human escalation for complex issues • Available 24/7
                        </p>
                    </div>

                    {/* Results Side */}
                    <div className="lg:col-span-2 space-y-6 w-full h-full">
                        {!result && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 border-dashed opacity-70">
                                <div className="text-6xl animate-bounce drop-shadow-2xl">🤖</div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-2xl text-white">AI Ready to Assist</h3>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto">Fill out the form to get an instant AI analysis and ticket number.</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 space-y-8 animate-fade-in-up border h-full ${result.success ? "border-emerald-500/20 shadow-emerald-500/5 shadow-2xl" : "border-rose-500/20"}`}>
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
                                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl shadow-lg border border-indigo-500/20">🤖</div>
                                            <div className="font-bold text-indigo-300 text-lg">AI Assistant Response</div>
                                        </div>

                                        <div className="bg-slate-900/80 rounded-2xl p-8 text-base leading-relaxed text-slate-300 italic border border-white/10 relative shadow-inner">
                                            <div className="absolute -top-3 -left-2 text-4xl opacity-20 font-serif">&quot;</div>
                                            {result.ai_reply}
                                            <div className="absolute -bottom-6 -right-2 text-4xl opacity-20 font-serif">&quot;</div>
                                        </div>

                                        <div className="pt-8 flex flex-col items-center gap-4 border-t border-white/5">
                                            <p className="text-xs text-center text-slate-500 font-bold uppercase tracking-widest">You can track this ticket using the number above</p>
                                            <Link href="/status" className="w-full">
                                                <button className="btn-outline w-full py-4 text-xs font-bold uppercase tracking-widest flex justify-center hover:bg-white/5">Check Recent Tickets</button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-rose-400 text-base py-8 text-center font-medium bg-rose-500/5 rounded-2xl border border-rose-500/10">
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
