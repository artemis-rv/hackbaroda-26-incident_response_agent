"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchIncident, IncidentResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ArrowLeft, BrainCircuit, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default function ReportPage() {
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading report...</div>;
  if (!incident || !incident.resolution) return <div className="p-8 text-center text-destructive">Report not available or incident not resolved.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/incidents")} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RCA Report</h1>
            <p className="text-muted-foreground mt-1">Post-Mortem for {incident.incident_id}</p>
          </div>
        </div>
        <div className="flex items-center px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Resolved
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="bg-secondary/30 pb-4 border-b border-border">
            <CardTitle className="text-xl">1. Incident Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="font-medium mt-1">{incident.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Service</p>
              <p className="font-medium mt-1">{incident.service}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time Reported</p>
              <p className="font-medium mt-1">{new Date(incident.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time Resolved</p>
              <p className="font-medium mt-1">{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Symptoms</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {incident.symptoms.map((s, i) => <li key={i} className="text-sm">{s}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>

        {incident.diagnosis && (
          <Card>
            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
              <CardTitle className="text-xl flex items-center text-primary">
                <BrainCircuit className="w-5 h-5 mr-2" />
                2. AI Diagnosis Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Predicted Root Cause</p>
                  <p className="text-sm mt-1">{incident.diagnosis.predicted_root_cause}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                  <p className="text-sm mt-1">{Math.round(incident.diagnosis.confidence * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-green-500/20 shadow-lg shadow-green-500/5">
          <CardHeader className="bg-green-500/5 pb-4 border-b border-green-500/10">
            <CardTitle className="text-xl flex items-center text-green-600">
              <ShieldCheck className="w-5 h-5 mr-2" />
              3. Resolution & Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                Actual Root Cause
              </h4>
              <p className="text-sm leading-relaxed p-4 bg-secondary/30 rounded-lg">{incident.resolution.actual_root_cause}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-muted-foreground" />
                Fix Applied
              </h4>
              <p className="text-sm leading-relaxed p-4 bg-secondary/30 rounded-lg">{incident.resolution.fix_applied}</p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <BrainCircuit className="w-4 h-4 mr-2 text-muted-foreground" />
                Lessons Learned
              </h4>
              <p className="text-sm leading-relaxed p-4 bg-secondary/30 rounded-lg">{incident.resolution.lessons_learned}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Resolution Time: <span className="font-medium text-foreground ml-1">{incident.resolution.resolution_time_minutes} mins</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Resolved by <span className="font-medium text-foreground">{incident.resolution.resolved_by}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {incident.memory && incident.memory.stored_in_hindsight && (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 p-4 rounded-lg flex items-center justify-center text-sm font-medium">
            <BrainCircuit className="w-5 h-5 mr-2" />
            This RCA has been successfully embedded into Vector Memory for future AI context.
          </div>
        )}
      </div>
    </div>
  );
}
