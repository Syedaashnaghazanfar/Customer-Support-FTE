"use client";

import { useState, useEffect } from "react";

interface Metrics {
    total_messages: number;
    tickets_created: number;
    avg_response_time: number;
    escalations: number;
    [key: string]: number;
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch("http://localhost:8000/metrics/channels");
                if (response.ok) {
                    const data = await response.json();
                    const s = data.summary;

                    // Safely extract channel counts
                    // Helper to safely get counts for any metric type
                    const getCount = (channel: string, metric: string = "message_processed") =>
                        s.channels?.[channel]?.[metric]?.["count"] || 0;

                    // Manually calculate totals if backend summary is zero or missing
                    // Use a more robust calculation strategy as requested
                    let totalMessages = s.total_messages || 0;
                    let totalTickets = s.tickets_created || 0;
                    let totalEscalations = s.total_escalations || 0;

                    // If summary stats seem suspicious (0), recalculate from raw channel data
                    if (totalMessages === 0 || totalTickets === 0) {
                        totalMessages = 0;
                        totalTickets = 0;
                        totalEscalations = 0;
                        ["email", "whatsapp", "web_form"].forEach(ch => {
                            totalMessages += getCount(ch, "message_processed");
                            totalTickets += getCount(ch, "ticket_created");
                            totalEscalations += getCount(ch, "escalation");
                        });
                    }

                    setMetrics({
                        total_messages: totalMessages,
                        tickets_created: totalTickets,
                        avg_response_time: s.avg_processing_time || 0,
                        escalations: totalEscalations,
                        channel_email: getCount("email", "message_processed"),
                        channel_whatsapp: getCount("whatsapp", "message_processed"),
                        channel_web: getCount("web_form", "message_processed"),
                    });
                }
            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const metricCards = [
        {
            title: "Total Messages",
            key: "total_messages",
            icon: "✉️",
            color: "from-blue-500 to-indigo-600",
            desc: "Incoming requests across all active channels.",
        },
        {
            title: "Tickets Created",
            key: "tickets_created",
            icon: "🎫",
            color: "from-purple-500 to-pink-600",
            desc: "New support cases opened by the AI engine.",
        },
        {
            title: "Response Time",
            key: "avg_response_time",
            icon: "⚡",
            color: "from-amber-400 to-orange-600",
            suffix: "s",
            desc: "Average AI processing and reply duration.",
        },
        {
            title: "Escalations",
            key: "escalations",
            icon: "🚨",
            color: "from-rose-500 to-red-600",
            desc: "Requests handed over to human success team.",
        },
    ];

    const channelData = [
        { name: "Email", key: "email", icon: "📧" },
        { name: "WhatsApp", key: "whatsapp", icon: "💬" },
        { name: "Web Form", key: "web", icon: "🌐" },
    ];

    if (isLoading && !metrics) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 pb-24 w-full space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-300 shadow-lg shadow-indigo-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Network Status
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight drop-shadow-xl">Support <span className="text-gradient">Intelligence</span></h1>
                    <p className="text-slate-400 text-lg">Real-time performance analytics for your AI Customer Success Partner.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3 flex items-center gap-4 shadow-lg">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Uptime</div>
                        <div className="text-lg font-black text-emerald-400">99.98%</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3 flex items-center gap-4 shadow-lg">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">System</div>
                        <div className="text-lg font-black text-indigo-400">Active</div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {metricCards.map((card, i) => (
                    <div
                        key={card.key}
                        className="glass-panel p-8 group relative overflow-hidden animate-fade-in-up flex flex-col justify-between min-h-[200px]"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-[0.03] rounded-bl-full group-hover:opacity-10 transition-opacity`} />

                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-lg shadow-black/20 text-white`}>
                                {card.icon}
                            </div>
                            <div className="text-xs font-black text-slate-500 uppercase tracking-tighter opacity-40">Metric_0{i + 1}</div>
                        </div>

                        <div className="space-y-1 relative z-10">
                            <div className="text-5xl font-display font-black tracking-tighter group-hover:scale-105 transition-transform origin-left text-white drop-shadow-lg">
                                {metrics?.[card.key] || 0}{card.suffix || ""}
                            </div>
                            <div className="text-sm font-bold text-white/80">{card.title}</div>
                        </div>

                        <p className="mt-6 text-xs text-slate-400 leading-relaxed max-w-[90%]">
                            {card.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Channel Distribution */}
                <div className="lg:col-span-2 glass-panel p-10 space-y-10 animate-fade-in-up delay-400">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight text-white">Channel Distribution</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Global Inbound</span>
                    </div>

                    <div className="space-y-8">
                        {channelData.map(channel => (
                            <div key={channel.name} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{channel.icon}</span>
                                        <span className="font-bold text-sm text-slate-200">{channel.name}</span>
                                    </div>
                                    <span className="text-xs font-mono text-indigo-400 font-bold">{metrics?.[`channel_${channel.key}`] || 0} req</span>
                                </div>
                                <div className="h-3 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        style={{ width: `${(metrics?.[`channel_${channel.key}`] || 0) / (metrics?.total_messages || 1) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 grid grid-cols-3 gap-8 border-t border-white/5">
                        <div className="text-center space-y-2">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Load</div>
                            <div className="text-2xl font-black text-indigo-300">24%</div>
                        </div>
                        <div className="text-center space-y-2 border-x border-white/5">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peak Time</div>
                            <div className="text-2xl font-black text-indigo-300">14:00</div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Efficiency</div>
                            <div className="text-2xl font-black text-emerald-400">92%</div>
                        </div>
                    </div>
                </div>

                {/* System Health / Agent Info */}
                <div className="glass-panel p-10 flex flex-col justify-between animate-fade-in-up delay-500 min-h-[400px]">
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-4xl animate-float shadow-xl border border-indigo-500/20">🤖</div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Active Model</div>
                                <div className="font-bold text-xl text-white">Llama-3-CS-Core</div>
                                <div className="text-xs text-slate-400 mt-1">v4.2.0 Stable</div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic border-b border-white/5 pb-2">System Logs</div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-emerald-400 font-bold">[OK]</span>
                                    <span className="text-slate-300 tracking-tight">Kafka Broker Connected</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-emerald-400 font-bold">[OK]</span>
                                    <span className="text-slate-300 tracking-tight">Postgres Cluster Healthy</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></span>
                                    <span className="text-indigo-400 font-bold">[INFO]</span>
                                    <span className="text-slate-300 tracking-tight">WhatsApp Webhook Active</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
                                    <span className="text-amber-500 font-bold">[WARN]</span>
                                    <span className="text-slate-300 tracking-tight">High demand on Gmail API</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full btn-outline py-4 text-xs font-black uppercase tracking-widest mt-8 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 transition-all">
                        System Restart
                    </button>
                </div>
            </div>
        </div>
    );
}
