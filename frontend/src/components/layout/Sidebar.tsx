"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, List, AlertTriangle, BrainCircuit, Zap } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "All Incidents", icon: List },
  { href: "/incidents/simulate", label: "Simulator", icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center animate-pulse-glow">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-sidebar-foreground">IncidentIQ</span>
            <span className="text-[10px] block text-muted-foreground -mt-0.5 tracking-wider uppercase">AI Response Agent</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Navigation</p>
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 mr-3 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"}`} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 px-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Intelligence</p>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">AI Engine</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Groq LLM + Vector Memory for intelligent diagnosis</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-medium">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            SRE
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">SRE Team</p>
            <p className="text-[10px] text-muted-foreground">On-Call Engineer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
