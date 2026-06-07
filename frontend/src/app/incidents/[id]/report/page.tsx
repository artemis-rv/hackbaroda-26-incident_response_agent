"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchIncident, generateRCAReport, IncidentResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ArrowLeft, BrainCircuit, ShieldCheck, Download, FileDown, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
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
    } catch (err) {
      console.error(err);
      alert("Failed to generate RCA. Check console.");
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
  };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin:       10,
      filename:     `RCA_${incident?.incident_id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

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
            <h1 className="text-3xl font-bold tracking-tight">RCA Post-Mortem</h1>
            <p className="text-muted-foreground mt-1">Incident {incident.incident_id}</p>
          </div>
        </div>
        
        {incident.rca_report && (
          <div className="flex items-center space-x-3">
            <button onClick={handleExportMarkdown} className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
              <FileDown className="w-4 h-4 mr-2" />
              Markdown
            </button>
            <button onClick={handleExportPDF} className="flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
          </div>
        )}
      </div>

      {!incident.rca_report ? (
        <Card className="border-primary/20 shadow-lg mt-8">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">AI RCA Generator</CardTitle>
            <CardDescription className="text-base mt-2">
              Transform this incident's timeline, diagnostics, and human resolution notes into a polished, SRE-formatted Root Cause Analysis document.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-6 pb-8">
            <button 
              onClick={handleGenerate} 
              disabled={generating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 inline-flex items-center justify-center rounded-md text-base font-medium transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating SRE Report...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5 mr-2" />
                  Generate Professional RCA
                </>
              )}
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8 border-border/50 shadow-sm overflow-hidden bg-card">
          <div className="bg-muted/30 border-b border-border/50 px-8 py-4 flex items-center">
            <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-muted-foreground">Generated by AI SRE Engine</span>
          </div>
          <CardContent className="p-8">
            <div ref={reportRef} className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2 prose-a:text-primary">
              <ReactMarkdown>{incident.rca_report}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
