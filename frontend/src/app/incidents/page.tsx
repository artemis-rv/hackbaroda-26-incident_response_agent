"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchIncidents, IncidentResponse } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Filter, ArrowUpDown, Search, ArrowUpRight } from "lucide-react";

export default function IncidentList() {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Severity">("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getSeverityRank = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes("p1") || s === "critical") return 1;
    if (s.includes("p2") || s === "high") return 2;
    if (s.includes("p3") || s === "medium") return 3;
    if (s.includes("p4") || s === "low") return 4;
    return 5;
  };

  const filteredAndSortedIncidents = incidents
    .filter(inc => {
      if (severityFilter !== "All") {
        const rank = getSeverityRank(inc.severity);
        if (severityFilter === "P1" && rank !== 1) return false;
        if (severityFilter === "P2" && rank !== 2) return false;
        if (severityFilter === "P3" && rank !== 3) return false;
        if (severityFilter === "P4" && rank !== 4) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return inc.title.toLowerCase().includes(q) || inc.service?.toLowerCase().includes(q) || false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "Oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "Severity") {
        const diff = getSeverityRank(a.severity) - getSeverityRank(b.severity);
        return diff !== 0 ? diff : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{incidents.length} total · {incidents.filter(i => i.status === "open").length} open</p>
        </div>
        <Link
          href="/incidents/simulate"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20"
        >
          Simulate Incident
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-3 h-9">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-sm bg-transparent border-none outline-none text-foreground cursor-pointer"
            >
              <option value="All">All</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-3 h-9">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm bg-transparent border-none outline-none text-foreground cursor-pointer"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Severity">Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <div className="skeleton h-4 w-[40%]" />
                  <div className="skeleton h-4 w-[15%]" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-4 w-[20%]" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedIncidents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No incidents found.</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Service</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Severity</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Created</th>
                    <th className="h-10 px-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAndSortedIncidents.map((inc) => (
                    <tr key={inc.incident_id} className="transition-colors hover:bg-secondary/20 group">
                      <td className="px-4 py-3">
                        <Link href={`/incidents/${inc.incident_id}`} className="font-medium hover:text-primary transition-colors">
                          {inc.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">{inc.service || "—"}</code>
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={inc.status === "open"
                            ? "bg-orange-500/15 text-orange-400 border-orange-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                          }
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${inc.status === "open" ? "bg-orange-400 animate-pulse" : "bg-emerald-400"}`} />
                          {inc.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(inc.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/incidents/${inc.incident_id}`}>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
