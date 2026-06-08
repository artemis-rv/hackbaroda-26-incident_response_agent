"use client";

import { Bell, Search, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function Topbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md hidden sm:flex">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents, services, or logs..."
            className="h-9 w-full rounded-lg border border-input bg-secondary/50 px-9 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background"
          />
          <kbd className="absolute right-3 top-2 pointer-events-none text-[10px] text-muted-foreground font-mono bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
          <Zap className="w-3 h-3 text-primary" />
          <span>{time}</span>
        </div>
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          A
        </div>
      </div>
    </header>
  );
}
