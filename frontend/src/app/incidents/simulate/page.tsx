"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIncident, IncidentCreate } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Cpu, Globe, ShieldAlert, Loader2 } from "lucide-react";

const SIMULATORS: { id: string; title: string; icon: any; payload: IncidentCreate; description: string }[] = [
  {
    id: "db-timeout",
    title: "Database Timeout",
    icon: Database,
    description: "Simulates connection pool exhaustion on the main database cluster.",
    payload: {
      title: "Connection pool timeout in main DB",
      description: "Services are failing to connect to the database. Logs show pool exhaustions.",
      symptoms: ["Increased latency", "503 errors", "DB connection timeouts"],
      severity: "high",
      service: "users-db",
      environment: "production",
      tags: ["database", "timeout"]
    }
  },
  {
    id: "cpu-spike",
    title: "CPU Spike",
    icon: Cpu,
    description: "Simulates a massive CPU spike across worker nodes.",
    payload: {
      title: "100% CPU usage on background workers",
      description: "Alert triggered for 100% CPU usage across all nodes in the background worker pool.",
      symptoms: ["Queue backup", "High CPU usage", "Delayed job processing"],
      severity: "medium",
      service: "background-workers",
      environment: "production",
      tags: ["performance", "cpu"]
    }
  },
  {
    id: "nginx-failure",
    title: "Nginx Gateway Failure",
    icon: Globe,
    description: "Simulates a total failure of the primary ingress gateway.",
    payload: {
      title: "502 Bad Gateway across all endpoints",
      description: "The primary Nginx ingress is returning 502s for all incoming traffic.",
      symptoms: ["Total outage", "502 Bad Gateway"],
      severity: "critical",
      service: "ingress-nginx",
      environment: "production",
      tags: ["networking", "outage"]
    }
  },
  {
    id: "security-alert",
    title: "Security Alert",
    icon: ShieldAlert,
    description: "Simulates an unauthorized access attempt.",
    payload: {
      title: "Multiple failed logins from unknown IP",
      description: "Intrusion detection system flagged multiple failed admin logins from a single foreign IP.",
      symptoms: ["Failed logins", "Admin portal alerts"],
      severity: "high",
      service: "admin-portal",
      environment: "production",
      tags: ["security", "auth"]
    }
  }
];

export default function SimulatorPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSimulate = async (id: string, payload: IncidentCreate) => {
    try {
      setLoadingId(id);
      const created = await createIncident(payload);
      router.push(`/incidents/${created.incident_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to simulate incident");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incident Simulator</h1>
        <p className="text-muted-foreground mt-2">Trigger test incidents to evaluate the AI Response Agent.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {SIMULATORS.map((sim) => {
          const Icon = sim.icon;
          return (
            <Card key={sim.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => !loadingId && handleSimulate(sim.id, sim.payload)}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="p-2 bg-secondary rounded-lg mr-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{sim.title}</CardTitle>
                  <CardDescription className="mt-1">{sim.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="mt-4">
                <button
                  disabled={!!loadingId}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {loadingId === sim.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loadingId === sim.id ? "Triggering..." : "Trigger Incident"}
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
