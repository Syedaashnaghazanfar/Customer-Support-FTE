"use client";

import Link from "next/link";

const FEATURES = [
  {
    icon: "📧",
    title: "Email Support",
    desc: "AI-powered email handling that provides context-aware, professional responses in minutes.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: "💬",
    title: "WhatsApp Chat",
    desc: "Real-time intelligent assistance on your favorite messaging app, active 24/7.",
    gradient: "from-emerald-500 to-cyan-600",
  },
  {
    icon: "🌐",
    title: "Web Form",
    desc: "Smart ticket generation via our portal with instant resolution for common issues.",
    gradient: "from-amber-500 to-rose-600",
  },
];

const STATS = [
  { value: "< 30s", label: "Response Time" },
  { value: "24/7", label: "Availability" },
  { value: "99.9%", label: "Resolution" },
  { value: "3", label: "Channels" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden selection:bg-indigo-500/30 w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 text-center w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8 w-full max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-medium text-sm animate-fade-in shadow-lg shadow-indigo-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered • Global Support
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-black leading-[1.1] tracking-tight animate-fade-in-up drop-shadow-2xl text-center">
            Your 24/7 <br />
            <span className="text-gradient-accent">Customer Success</span> Partner
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms] text-center">
            Get instant, intelligent support across email, WhatsApp, and web — powered by AI that never sleeps. Experience the future of support.
          </p>

          <div className="flex flex-wrap gap-4 justify-center w-full animate-fade-in-up [animation-delay:400ms]">
            <Link href="/support">
              <button className="btn-glow flex items-center gap-2 group">
                Get Support Now
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link href="/status">
              <button className="btn-outline">
                Check Ticket Status
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-7xl px-6 py-12 mx-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center w-full">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center group flex flex-col items-center justify-center w-full"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-white group-hover:text-indigo-400 transition-colors drop-shadow-lg text-center">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2 text-center">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Channels Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative w-full flex flex-col items-center">
        <div className="text-center mb-16 space-y-4 flex flex-col items-center w-full max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-center">
            Support, <span className="text-gradient">Your Way</span>
          </h2>
          <p className="text-slate-400 text-lg text-center leading-relaxed">
            Our AI engine integrates seamlessly across multiple platforms to ensure you&apos;re always covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel p-10 group relative overflow-hidden flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-white text-center">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm text-center">
                {feature.desc}
              </p>

              {/* Decorative hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl w-full mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center w-full">
          <div className="space-y-4 text-center md:text-left flex flex-col md:items-start items-center">
            <div className="font-display font-black text-xl tracking-tight text-white">
              TechCorp <span className="text-indigo-400">Support</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md text-center md:text-left">
              The world&apos;s first autonomous AI Customer Success partner.
            </p>
          </div>
          <div className="text-center md:text-right space-y-1 flex flex-col md:items-end items-center">
            <p className="text-slate-400 text-xs italic text-center md:text-right">&quot;Powered by AI that never sleeps.&quot;</p>
            <p className="text-slate-600 text-[10px] uppercase tracking-wider text-center md:text-right">© 2025 TechCorp Solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
