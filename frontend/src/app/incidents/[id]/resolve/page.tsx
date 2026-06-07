"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resolveIncident, IncidentResolve } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function ResolvePage() {
  const params = useParams();
  const router = useRouter();
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
      router.push(`/incidents/${params.id}/report`);
    } catch (err) {
      console.error(err);
      alert("Failed to resolve incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resolve Incident</h1>
          <p className="text-muted-foreground mt-1">Record the fix and save to Hindsight Memory.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resolution Details</CardTitle>
          <CardDescription>
            These details will be embedded into the vector database to help AI diagnose future incidents.
            Be as descriptive as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="actual_root_cause" className="text-sm font-medium">Actual Root Cause</label>
              <textarea
                id="actual_root_cause"
                name="actual_root_cause"
                required
                value={formData.actual_root_cause}
                onChange={handleChange}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="What was the actual underlying issue? E.g., The database connection pool limit was reached due to a rogue background job."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fix_applied" className="text-sm font-medium">Fix Applied</label>
              <textarea
                id="fix_applied"
                name="fix_applied"
                required
                value={formData.fix_applied}
                onChange={handleChange}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="What steps were taken to resolve it? E.g., Increased max_connections in postgres.conf and killed the blocking queries."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lessons_learned" className="text-sm font-medium">Lessons Learned</label>
              <textarea
                id="lessons_learned"
                name="lessons_learned"
                required
                value={formData.lessons_learned}
                onChange={handleChange}
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="How can this be prevented in the future? E.g., Add alerting for when pool utilization exceeds 80%."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="resolved_by" className="text-sm font-medium">Resolved By</label>
                <input
                  type="text"
                  id="resolved_by"
                  name="resolved_by"
                  required
                  value={formData.resolved_by}
                  onChange={handleChange}
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="resolution_time_minutes" className="text-sm font-medium">Time to Resolve (minutes)</label>
                <input
                  type="number"
                  id="resolution_time_minutes"
                  name="resolution_time_minutes"
                  required
                  min="1"
                  value={formData.resolution_time_minutes}
                  onChange={handleChange}
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {loading ? "Saving to Vector Memory..." : "Mark as Resolved & Save to Memory"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
