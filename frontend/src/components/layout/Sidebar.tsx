import Link from "next/link";
import { Activity, LayoutDashboard, List, AlertTriangle, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Activity className="h-6 w-6 text-primary mr-2" />
        <span className="text-lg font-bold tracking-tight">IncidentIQ</span>
      </div>
      
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-1">
          <Link href="/" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/incidents" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <List className="h-5 w-5 mr-3" />
            All Incidents
          </Link>
          <Link href="/incidents/simulate" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <AlertTriangle className="h-5 w-5 mr-3" />
            Simulator
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center px-4 py-2 text-sm text-muted-foreground">
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </div>
      </div>
    </div>
  );
}
