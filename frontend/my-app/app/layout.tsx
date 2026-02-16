import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TechCorp Support — 24/7 AI Customer Success",
  description:
    "Get instant support for TechCorp ProjectHub. Submit tickets, check status, and get help 24/7 from our AI-powered customer success team.",
};

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-3 no-underline group whitespace-nowrap">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            ⚡
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-indigo-100 transition-colors">
            TechCorp<span className="text-indigo-400">Support</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">
            Home
          </Link>
          <Link href="/support" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">
            Get Help
          </Link>
          <Link href="/status" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">
            Check Status
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">
            Dashboard
          </Link>
        </div>

        <div className="md:hidden">
          {/* Mobile menu placeholder */}
          <div className="w-10 h-10 flex flex-col justify-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100 transition-opacity p-2">
            <div className="w-full h-0.5 bg-white rounded-full shadow-sm" />
            <div className="w-2/3 h-0.5 bg-white rounded-full shadow-sm ml-auto" />
            <div className="w-full h-0.5 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>
    </nav>
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
        <Navbar />
        <main className="pt-32 md:pt-40 min-h-screen flex flex-col items-center w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
