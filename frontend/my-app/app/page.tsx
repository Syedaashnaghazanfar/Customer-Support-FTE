"use client";

import Link from "next/link";
import RobotMascot from "./components/RobotMascot";

/* ---- SVG Icon Components ---- */
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

function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <EnvelopeIcon />,
    title: "Email Support",
    desc: "AI-powered email handling that provides context-aware, professional responses in minutes.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: <ChatBubbleIcon />,
    title: "WhatsApp Chat",
    desc: "Real-time intelligent assistance on your favorite messaging app, active 24/7.",
    gradient: "from-emerald-500 to-cyan-600",
  },
  {
    icon: <GlobeIcon />,
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
      <section className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full">
          {/* Text Side */}
          <div className="flex flex-col items-center lg:items-start space-y-8 w-full lg:flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-medium text-sm animate-fade-in shadow-lg shadow-indigo-500/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI-Powered • Global Support
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black leading-[1.1] tracking-tight animate-fade-in-up drop-shadow-2xl">
              Your 24/7 <br />
              <span className="text-gradient-accent">Customer Success</span> Partner
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl animate-fade-in-up [animation-delay:200ms]">
              Get instant, intelligent support across email, WhatsApp, and web — powered by AI that never sleeps.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full animate-fade-in-up [animation-delay:400ms]">
              <Link href="/support">
                <button className="btn-glow flex items-center gap-2 group">
                  Get Support Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
              <Link href="/status">
                <button className="btn-outline">
                  Check Ticket Status
                </button>
              </Link>
            </div>
          </div>

          {/* Robot Mascot Side — large screens only */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0 max-w-[280px] overflow-hidden animate-fade-in-up [animation-delay:500ms]">
            <RobotMascot />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-7xl px-6 py-8 mx-auto mb-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 md:p-14 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14 justify-items-center w-full">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center group flex flex-col items-center justify-center w-full animate-fade-in-up"
                style={{ animationDelay: `${i * 100 + 600}ms` }}
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-white group-hover:text-indigo-400 transition-colors drop-shadow-lg text-center">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest mt-3 text-center">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Channels Section */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto relative w-full flex flex-col items-center">
        <div className="text-center mb-16 space-y-10 flex flex-col items-center w-full max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-center">
            Support, <span className="text-gradient">Your Way</span>
          </h2>
          <p className="text-slate-400 text-lg text-center leading-relaxed">
            Our AI engine integrates seamlessly across multiple platforms to ensure you&apos;re always covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-15 w-full">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-panel p-15 group relative flex flex-col items-center text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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
    </div>
  );
}
