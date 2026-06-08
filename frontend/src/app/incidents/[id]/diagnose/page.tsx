"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { diagnoseIncident, DiagnoseResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, CheckCircle2, AlertCircle, ArrowLeft, Lightbulb, History, ShieldAlert, Activity, ArrowRight, Zap } from "lucide-react";

export default function DiagnosePage() {
  const params = useParams();
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState<DiagnoseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!params.id) return;

    // Animated loading phases
    const phases = [
      { delay: 0 },
      { delay: 800 },
      { delay: 1600 },
      { delay: 2400 },
    ];
    const timers = phases.map((p, i) => setTimeout(() => setLoadingPhase(i), p.delay));

    diagnoseIncident(params.id as string)
      .then(data => setDiagnosis(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    return () => timers.forEach(clearTimeout);
  }, [params.id]);

  if (loading) {
    const phases = [
      "Initializing AI engine...",
      "Scanning incident logs & symptoms...",
      "Searching vector memory for similar incidents...",
      "Generating root cause analysis...",
    ];
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-24 h-24 rounded-full border-t-2 border-b-2 border-primary animate-spin" style={{ animationDuration: '1.5s' }} />
          <div className="absolute w-16 h-16 rounded-full border-r-2 border-l-2 border-primary/50 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-xl font-bold tracking-tight">AI Diagnosis in Progress</h2>
          <div className="space-y-2">
            {phases.map((phase, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm transition-all duration-500 ${i <= loadingPhase ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-30'}`}>
                {i < loadingPhase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : i === loadingPhase ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                )}
                {phase}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;
  if (!diagnosis) return null;

  const confidencePercentage = Math.round(diagnosis.confidence_score || 0);
  const confidenceColor = confidencePercentage >= 70 ? "text-emerald-400" : confidencePercentage >= 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Diagnosis Results
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Powered by Groq LLM + Semantic Vector Memory</p>
        </div>
      </div>

      {/* Confidence Hero */}
      <Card className="border-primary/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Combined Confidence Score</p>
              <p className="text-xs text-muted-foreground">AI Analysis + Semantic Memory Similarity</p>
            </div>
            <div className={`text-4xl font-bold tracking-tight ${confidenceColor}`}>
              {confidencePercentage}<span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Root Causes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            Root Causes (Ranked)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 stagger-children">
            {diagnosis.root_causes?.map((cause, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm font-medium leading-relaxed">{cause}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{diagnosis.impact_analysis}</p>
        </CardContent>
      </Card>

      {/* Actions + Prevention + Memory */}
      <div className="grid md:grid-cols-3 gap-4 stagger-children">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {diagnosis.recommended_actions?.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                  <span className="text-xs leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Prevention Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {diagnosis.prevention_steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                  <span className="text-xs leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Hindsight Memory
            </CardTitle>
            <CardDescription className="text-xs">Similar past incidents</CardDescription>
          </CardHeader>
          <CardContent>
            {diagnosis.investigation_mode ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center">
                <AlertCircle className="w-5 h-5 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-xs text-muted-foreground">No similar incidents found. Zero-shot diagnosis.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {diagnosis.similar_incidents?.map((sim, i) => {
                  const matchPct = Math.round(sim.similarity_score * 100);
                  const matchColor = matchPct >= 80 ? "bg-emerald-500/15 text-emerald-400" : matchPct >= 50 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400";
                  return (
                    <li key={i} className="p-3 bg-secondary/30 rounded-lg border border-border text-xs space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-foreground">{sim.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${matchColor}`}>
                          {matchPct}%
                        </span>
                      </div>
                      <p className="text-muted-foreground"><strong className="text-foreground">Cause:</strong> {sim.root_cause}</p>
                      <p className="text-muted-foreground"><strong className="text-foreground">Fix:</strong> {sim.resolution}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Link href={`/incidents/${params.id}/resolve`} className="bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-6 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-600/20">
          Proceed to Resolution
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
