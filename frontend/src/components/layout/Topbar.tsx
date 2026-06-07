import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between px-6 bg-background border-b border-border">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md hidden sm:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents, logs, or memories..."
            className="h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
