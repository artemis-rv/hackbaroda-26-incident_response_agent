"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchIncident, generateRCAReport, IncidentResponse } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft, BrainCircuit, ShieldCheck, Download, FileDown, Loader2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchIncident(params.id as string)
        .then(data => setIncident(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleGenerate = async () => {
    if (!incident) return;
    setGenerating(true);
    try {
      const updatedIncident = await generateRCAReport(incident.incident_id);
      setIncident(updatedIncident);
      addToast("RCA Report generated successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to generate RCA report", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!incident || !incident.rca_report) return;
    const blob = new Blob([incident.rca_report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_${incident.incident_id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Markdown file downloaded", "info");
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 10,
      filename: `RCA_${incident?.incident_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(reportRef.current).save();
    addToast("PDF export started", "info");
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-64" />
        <div className="skeleton h-64 w-full rounded-lg" />
      </div>
    );
  }
  if (!incident || !incident.resolution) return <div className="p-8 text-center text-destructive">Report not available or incident not resolved.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/incidents")} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              RCA Post-Mortem
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Incident {incident.incident_id}</p>
          </div>
        </div>

        {incident.rca_report && (
          <div className="flex items-center gap-2">
            <button onClick={handleExportMarkdown} className="flex items-center h-9 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
              <FileDown className="w-4 h-4 mr-1.5" />
              .md
            </button>
            <button onClick={handleExportPDF} className="flex items-center h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20">
              <Download className="w-4 h-4 mr-1.5" />
              PDF
            </button>
          </div>
        )}
      </div>

      {!incident.rca_report ? (
        <Card className="border-primary/20 mt-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <CardContent className="py-16 text-center relative">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-pulse-glow">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">AI RCA Generator</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
              Transform this incident's lifecycle data into a professional, blameless SRE post-mortem document.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating SRE Report...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />Generate Professional RCA</>
              )}
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <div className="bg-secondary/30 border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-muted-foreground">Generated by AI SRE Engine</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{new Date().toLocaleDateString()}</span>
          </div>
          <CardContent className="p-8">
            <div ref={reportRef} className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-a:text-primary prose-pre:bg-[#0d0d0d] prose-pre:text-emerald-400 prose-code:text-primary prose-strong:text-foreground prose-li:text-sm">
              <ReactMarkdown>{incident.rca_report}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
