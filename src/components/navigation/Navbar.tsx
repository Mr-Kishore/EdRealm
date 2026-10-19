"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FolderKanban, Settings, LayoutDashboard, Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trainers", label: "Trainers", icon: Users },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2.5 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-sm transition-transform duration-300 group-hover:scale-105">
            ER
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              EdRealm
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 mt-0.5">
              Trainer Ops
            </span>
          </div>
        </Link>

        {/* Center Pill Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-full border border-slate-200/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/trainers/new"
            className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trainer</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
