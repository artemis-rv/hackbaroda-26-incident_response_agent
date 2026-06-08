"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resolveIncident, IncidentResolve } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, BrainCircuit } from "lucide-react";

export default function ResolvePage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IncidentResolve>({
    actual_root_cause: "",
    fix_applied: "",
    lessons_learned: "",
    resolved_by: "Admin User",
    resolution_time_minutes: 30
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'resolution_time_minutes' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id) return;

    try {
      setLoading(true);
      await resolveIncident(params.id as string, formData);
      addToast("Incident resolved & saved to vector memory!", "success");
      router.push(`/incidents/${params.id}/report`);
    } catch (err) {
      console.error(err);
      addToast("Failed to resolve incident", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3 rounded-lg border border-input bg-secondary/30 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-background focus-visible:border-primary/50";

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resolve Incident</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Record the fix and save to Hindsight Memory</p>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center gap-3 text-sm">
        <BrainCircuit className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-muted-foreground">These details will be vectorized and embedded into semantic memory. <strong className="text-foreground">Be as descriptive as possible</strong> to improve future AI diagnoses.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Resolution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="actual_root_cause" className="text-sm font-medium">Actual Root Cause</label>
              <textarea
                id="actual_root_cause"
                name="actual_root_cause"
                required
                value={formData.actual_root_cause}
                onChange={handleChange}
                className={`${inputClasses} min-h-[100px]`}
                placeholder="What was the actual underlying issue?"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fix_applied" className="text-sm font-medium">Fix Applied</label>
              <textarea
                id="fix_applied"
                name="fix_applied"
                required
                value={formData.fix_applied}
                onChange={handleChange}
                className={`${inputClasses} min-h-[100px]`}
                placeholder="What steps were taken to resolve it?"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lessons_learned" className="text-sm font-medium">Lessons Learned</label>
              <textarea
                id="lessons_learned"
                name="lessons_learned"
                required
                value={formData.lessons_learned}
                onChange={handleChange}
                className={`${inputClasses} min-h-[100px]`}
                placeholder="How can this be prevented in the future?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="resolved_by" className="text-sm font-medium">Resolved By</label>
                <input type="text" id="resolved_by" name="resolved_by" required value={formData.resolved_by} onChange={handleChange} className={`${inputClasses} h-10`} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="resolution_time_minutes" className="text-sm font-medium">Time to Resolve (min)</label>
                <input type="number" id="resolution_time_minutes" name="resolution_time_minutes" required min="1" value={formData.resolution_time_minutes} onChange={handleChange} className={`${inputClasses} h-10`} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? "Saving to Vector Memory..." : "Mark as Resolved & Save to Memory"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
