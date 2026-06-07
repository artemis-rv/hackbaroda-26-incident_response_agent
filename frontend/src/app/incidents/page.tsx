"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchIncidents, IncidentResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IncidentList() {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <Link href="/incidents/simulate" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
          Simulate Incident
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No incidents reported yet.</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Service</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Severity</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {incidents.slice().reverse().map((inc) => (
                    <tr key={inc.incident_id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <Link href={`/incidents/${inc.incident_id}`} className="font-medium hover:underline text-primary">
                          {inc.title}
                        </Link>
                      </td>
                      <td className="p-4 align-middle">{inc.service || "Unknown"}</td>
                      <td className="p-4 align-middle">
                        <Badge variant={inc.severity === "critical" ? "destructive" : "default"}>
                          {inc.severity.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={inc.status === "resolved" ? "secondary" : "outline"} className={inc.status === "open" ? "bg-orange-500/20 text-orange-500 border-none" : ""}>
                          {inc.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(inc.created_at).toLocaleString()}
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
