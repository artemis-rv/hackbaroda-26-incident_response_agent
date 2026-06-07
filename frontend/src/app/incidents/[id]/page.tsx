"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchIncident, IncidentResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, CheckCircle, Activity, Box, Tag } from "lucide-react";

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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading details...</div>;
  if (!incident) return <div className="p-8 text-center text-destructive">Incident not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{incident.title}</h1>
            <Badge variant={incident.status === "resolved" ? "secondary" : "default"} className="uppercase text-xs tracking-wider">
              {incident.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{incident.description}</p>
        </div>
        
        <div className="flex space-x-3">
          {incident.status === "open" && (
            <>
              <Link href={`/incidents/${incident.incident_id}/diagnose`} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                <BrainCircuit className="w-4 h-4 mr-2" />
                AI Diagnosis
              </Link>
              <Link href={`/incidents/${incident.incident_id}/resolve`} className="bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve
              </Link>
            </>
          )}
          {incident.status === "resolved" && (
            <Link href={`/incidents/${incident.incident_id}/report`} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
              View RCA Report
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {incident.symptoms.map((s, i) => (
                  <li key={i} className="text-sm">{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incident.timeline.map((event, i) => (
                  <div key={i} className="flex relative">
                    <div className="absolute top-2 left-[7px] w-0.5 h-full bg-border -z-10 last:hidden"></div>
                    <div className="w-4 h-4 rounded-full bg-primary mt-1 mr-4 ring-4 ring-background z-10"></div>
                    <div>
                      <p className="text-sm font-medium">{event.event}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Severity</p>
                  <p className="font-medium capitalize">{incident.severity}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Box className="w-4 h-4 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Service</p>
                  <p className="font-medium">{incident.service || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Tag className="w-4 h-4 mr-3 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {incident.tags.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {incident.diagnosis && (
             <Card className="border-primary/50 bg-primary/5">
               <CardHeader>
                 <CardTitle className="flex items-center text-primary">
                   <BrainCircuit className="w-5 h-5 mr-2" />
                   AI Diagnosis Ready
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm mb-4">The Incident Response Agent has analyzed this issue.</p>
                 <Link href={`/incidents/${incident.incident_id}/diagnose`} className="text-sm font-medium text-primary hover:underline">
                   View Analysis Results &rarr;
                 </Link>
               </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
