"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
    links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100 transition-opacity p-2 z-[60]"
                aria-label="Toggle menu"
            >
                <div
                    className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[4px]" : ""
                        }`}
                />
                <div
                    className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : "opacity-100"
                        }`}
                />
                <div
                    className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[4px]" : ""
                        }`}
                />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-in Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col pt-20 px-6 transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="space-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3.5 rounded-xl text-base font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto pb-8">
                    <div className="border-t border-white/5 pt-6">
                        <p className="text-xs text-slate-500 text-center">TechCorp Support</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
