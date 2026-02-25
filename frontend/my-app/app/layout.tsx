import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { MobileMenu } from "./components/MobileMenu";

export const metadata: Metadata = {
  title: "TechCorp Support — 24/7 AI Customer Success",
  description:
    "Get instant support for TechCorp ProjectHub. Submit tickets, check status, and get help 24/7 from our AI-powered customer success team.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/support", label: "Get Help" },
  { href: "/status", label: "Check Status" },
  { href: "/dashboard", label: "Dashboard" },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-2.5 no-underline group whitespace-nowrap">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-indigo-100 transition-colors">
            TechCorp<span className="text-indigo-400">Support</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <MobileMenu links={NAV_LINKS} />
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 py-10 px-6 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl w-full mt-auto">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 items-center w-full">
        <div className="space-y-2 text-center md:text-left flex flex-col md:items-start items-center">
          <div className="font-display font-black text-lg tracking-tight text-white">
            TechCorp <span className="text-indigo-400">Support</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md text-center md:text-left">
            The world&apos;s first autonomous AI Customer Success partner.
          </p>
        </div>
        <div className="text-center md:text-right space-y-1 flex flex-col md:items-end items-center">
          <p className="text-slate-400 text-xs italic">&quot;Powered by AI that never sleeps.&quot;</p>
          <p className="text-slate-600 text-[10px] uppercase tracking-wider">© 2025 TechCorp Solutions.</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
        {/* Animated background orbs */}
        <div className="bg-orbs" aria-hidden="true">
          <div className="bg-orb bg-orb--1" />
          <div className="bg-orb bg-orb--2" />
          <div className="bg-orb bg-orb--3" />
        </div>

        <Navbar />
        <main className="relative z-10 pt-28 md:pt-32 min-h-screen flex flex-col items-center w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
