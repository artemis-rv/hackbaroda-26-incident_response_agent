"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchIncident, IncidentResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { BrainCircuit, CheckCircle, Activity, Box, Tag, ArrowLeft, Clock, Server, ArrowUpRight } from "lucide-react";

export default function IncidentDetails() {
  const params = useParams();
  const router = useRouter();
  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchIncident(params.id as string)
        .then(data => setIncident(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="skeleton h-32 w-full rounded-lg" />
            <div className="skeleton h-48 w-full rounded-lg" />
          </div>
          <div className="skeleton h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  if (!incident) return <div className="p-8 text-center text-destructive">Incident not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <button onClick={() => router.push("/incidents")} className="mt-1 p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{incident.title}</h1>
              <SeverityBadge severity={incident.severity} />
              <Badge variant="secondary" className={incident.status === "open" ? "bg-orange-500/15 text-orange-400" : "bg-emerald-500/15 text-emerald-400"}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${incident.status === "open" ? "bg-orange-400 animate-pulse" : "bg-emerald-400"}`} />
                {incident.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{incident.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {incident.status === "open" && (
            <>
              <Link href={`/incidents/${incident.incident_id}/diagnose`} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20">
                <BrainCircuit className="w-4 h-4 mr-2" />
                AI Diagnosis
              </Link>
              <Link href={`/incidents/${incident.incident_id}/resolve`} className="bg-emerald-600 text-white hover:bg-emerald-700 h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-600/20">
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve
              </Link>
            </>
          )}
          {incident.status === "resolved" && (
            <Link href={`/incidents/${incident.incident_id}/report`} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors">
              View RCA Report
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        <div className="col-span-2 space-y-6">
          {/* Symptoms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incident.symptoms.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          {incident.logs && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  Terminal Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#0d0d0d] text-emerald-400 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-zinc-800 leading-relaxed">
                  {incident.logs}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {incident.timeline.map((event, i) => (
                  <div key={i} className="flex relative group">
                    {i < incident.timeline.length - 1 && (
                      <div className="absolute top-6 left-[9px] w-0.5 h-full bg-border" />
                    )}
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-primary bg-background mt-0.5 mr-4 flex-shrink-0 z-10 group-hover:bg-primary/20 transition-colors" />
                    <div className="pb-6">
                      <p className="text-sm font-medium">{event.event}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-secondary"><Activity className="w-3.5 h-3.5 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Severity</p>
                  <SeverityBadge severity={incident.severity} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-secondary"><Box className="w-3.5 h-3.5 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Service</p>
                  <p className="text-sm font-medium">{incident.service || "N/A"}</p>
                </div>
              </div>

              {incident.affected_services && incident.affected_services.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Affected Services</p>
                  <div className="flex flex-wrap gap-1">
                    {incident.affected_services.map(s => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {incident.tags.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {incident.diagnosis && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                  <BrainCircuit className="w-4 h-4" />
                  AI Diagnosis Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">The AI has analyzed this incident.</p>
                <Link href={`/incidents/${incident.incident_id}/diagnose`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  View Analysis <ArrowUpRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
