"use client";

import { useState, useEffect } from "react";

interface Metrics {
    total_messages: number;
    tickets_created: number;
    avg_response_time: number;
    escalations: number;
    [key: string]: number;
}

/* ---- SVG Icons ---- */
function MailIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M22 7l-10 6L2 7" />
        </svg>
    );
}

function TicketIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 01-3 3v0a3 3 0 00-3 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3V9z" />
            <path d="M13 6v6" />
            <path d="M13 15v3" />
        </svg>
    );
}

function ZapIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function ChatBubbleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    );
}

function EnvelopeSmallIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M22 7l-10 6L2 7" />
        </svg>
    );
}

function CpuIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
            <path d="M9 1v3" /><path d="M15 1v3" />
            <path d="M9 20v3" /><path d="M15 20v3" />
            <path d="M20 9h3" /><path d="M20 14h3" />
            <path d="M1 9h3" /><path d="M1 14h3" />
        </svg>
    );
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

                    const getCount = (channel: string, metric: string = "message_processed") =>
                        s.channels?.[channel]?.[metric]?.["count"] || 0;

                    let totalMessages = s.total_messages || 0;
                    let totalTickets = s.tickets_created || 0;
                    let totalEscalations = s.total_escalations || 0;

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
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    const metricCards = [
        {
            title: "Total Messages",
            key: "total_messages",
            icon: <MailIcon />,
            color: "from-blue-500 to-indigo-600",
            desc: "Incoming requests across all active channels.",
        },
        {
            title: "Tickets Created",
            key: "tickets_created",
            icon: <TicketIcon />,
            color: "from-purple-500 to-pink-600",
            desc: "New support cases opened by the AI engine.",
        },
        {
            title: "Response Time",
            key: "avg_response_time",
            icon: <ZapIcon />,
            color: "from-amber-400 to-orange-600",
            suffix: "s",
            desc: "Average AI processing and reply duration.",
        },
        {
            title: "Escalations",
            key: "escalations",
            icon: <AlertIcon />,
            color: "from-rose-500 to-red-600",
            desc: "Requests handed over to human success team.",
        },
    ];

    const channelData = [
        { name: "Email", key: "email", icon: <EnvelopeSmallIcon /> },
        { name: "WhatsApp", key: "whatsapp", icon: <ChatBubbleIcon /> },
        { name: "Web Form", key: "web", icon: <GlobeIcon /> },
    ];

    if (isLoading && !metrics) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-10 pb-24 w-full space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-300 shadow-lg shadow-indigo-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Network Status
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight drop-shadow-xl">Support <span className="text-gradient">Intelligence</span></h1>
                    <p className="text-slate-400 text-base">Real-time performance analytics for your AI Customer Success Partner.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Uptime</div>
                        <div className="text-base font-black text-emerald-400">99.98%</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">System</div>
                        <div className="text-base font-black text-indigo-400">Active</div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((card, i) => (
                    <div
                        key={card.key}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 group relative overflow-hidden animate-fade-in-up transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-[0.03] rounded-bl-full group-hover:opacity-10 transition-opacity`} />

                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                                {card.icon}
                            </div>
                        </div>

                        <div className="space-y-1.5 relative z-10">
                            <div className="text-4xl font-display font-black tracking-tighter group-hover:scale-105 transition-transform origin-left text-white drop-shadow-lg">
                                {metrics?.[card.key] || 0}{card.suffix || ""}
                            </div>
                            <div className="text-sm font-bold text-white/80">{card.title}</div>
                        </div>

                        <p className="mt-5 text-xs text-slate-400 leading-relaxed">
                            {card.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Channel Distribution */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 space-y-8 animate-fade-in-up [animation-delay:400ms] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold tracking-tight text-white">Channel Distribution</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded">Global Inbound</span>
                    </div>

                    <div className="space-y-7">
                        {channelData.map(channel => (
                            <div key={channel.name} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">{channel.icon}</span>
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

                {/* System Health */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between animate-fade-in-up [animation-delay:500ms] transition-all duration-300">
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-float shadow-xl border border-indigo-500/20 flex-shrink-0">
                                <CpuIcon />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Active Model</div>
                                <div className="font-bold text-lg text-white">Llama-3-CS-Core</div>
                                <div className="text-xs text-slate-400 mt-1">v4.2.0 Stable</div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3">System Logs</div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] flex-shrink-0" />
                                    <span className="text-emerald-400 font-bold">[OK]</span>
                                    <span className="text-slate-300">Kafka Broker Connected</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] flex-shrink-0" />
                                    <span className="text-emerald-400 font-bold">[OK]</span>
                                    <span className="text-slate-300">Postgres Cluster Healthy</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)] flex-shrink-0" />
                                    <span className="text-indigo-400 font-bold">[INFO]</span>
                                    <span className="text-slate-300">WhatsApp Webhook Active</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] flex-shrink-0" />
                                    <span className="text-amber-500 font-bold">[WARN]</span>
                                    <span className="text-slate-300">High demand on Gmail API</span>
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
