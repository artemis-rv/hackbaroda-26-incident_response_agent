import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/90 px-6 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Activity className="h-5 w-5 text-blue-500" />
          <span className="text-blue-500">Incident</span>IQ
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium hover:text-blue-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/incidents/new" className="text-sm font-medium hover:text-blue-400 transition-colors">
            Report Incident
          </Link>
          <Link href="/memory" className="text-sm font-medium hover:text-blue-400 transition-colors">
            Memory Timeline
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10 mx-auto w-full max-w-6xl">
        {children}
      </main>
    </div>
  );
}
