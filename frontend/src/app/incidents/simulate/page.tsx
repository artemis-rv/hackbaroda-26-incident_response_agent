"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIncident, IncidentCreate } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Cpu, HardDrive, ShieldAlert, Globe, Activity, ServerCrash, Bug, Loader2 } from "lucide-react";

const getPastTime = (minutesAgo: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
};

const SIMULATORS: { id: string; title: string; icon: any; payload: IncidentCreate; description: string }[] = [
  {
    id: "db-timeout",
    title: "Database Timeout",
    icon: Database,
    description: "Connection pool exhaustion on the main PostgreSQL cluster causing 503s.",
    payload: {
      title: "Database Connection Pool Exhaustion",
      description: "Services are failing to connect to the database. Logs show repeated pool exhaustions and high latency.",
      symptoms: ["Increased latency (P99 > 5s)", "HTTP 503 Service Unavailable", "DB connection timeouts"],
      severity: "high",
      service: "postgres-main",
      environment: "production",
      tags: ["database", "timeout", "postgres"],
      affected_services: ["users-api", "billing-service", "auth-gateway"],
      logs: `2026-06-07 10:45:12 ERROR [users-api] pq: remaining connection slots are reserved for non-replication superuser connections
2026-06-07 10:45:14 WARN [billing-service] connection pool timeout after 5000ms
2026-06-07 10:45:15 ERROR [auth-gateway] 503 Service Unavailable - upstream database unreachable`,
      timeline: [
        { event: "Unusually high number of active DB connections detected", timestamp: getPastTime(15) },
        { event: "P99 latency spiked above 2 seconds", timestamp: getPastTime(10) },
        { event: "Connection pool fully exhausted", timestamp: getPastTime(5) }
      ]
    }
  },
  {
    id: "cpu-spike",
    title: "CPU Spike",
    icon: Cpu,
    description: "Massive CPU spike across background worker nodes processing queues.",
    payload: {
      title: "100% CPU usage on background workers",
      description: "Alert triggered for 100% CPU usage across all nodes in the background worker pool, stalling job processing.",
      symptoms: ["Queue backup (1M+ pending jobs)", "Node CPU at 100%", "Delayed email delivery"],
      severity: "medium",
      service: "worker-pool",
      environment: "production",
      tags: ["performance", "cpu", "queues"],
      affected_services: ["email-worker", "report-generator"],
      logs: `2026-06-07 11:02:01 INFO [worker-1] Starting job batch 84922
2026-06-07 11:02:05 WARN [system] CPU utilization at 98.5%
2026-06-07 11:03:10 ERROR [worker-2] Process stalled, failed to send heartbeat
2026-06-07 11:04:00 CRITICAL [healthcheck] Node unresponsiveness detected`,
      timeline: [
        { event: "Large batch job submitted by user XYZ", timestamp: getPastTime(30) },
        { event: "Worker CPU utilization exceeds 90%", timestamp: getPastTime(25) },
        { event: "Queue backlog exceeds 500,000 jobs", timestamp: getPastTime(10) }
      ]
    }
  },
  {
    id: "memory-leak",
    title: "Memory Leak",
    icon: Activity,
    description: "Gradual memory consumption leading to OOM Kills in Node.js microservices.",
    payload: {
      title: "OOMKilled pods in checkout-service",
      description: "Kubernetes is repeatedly restarting checkout-service pods due to Out Of Memory (OOM) errors.",
      symptoms: ["Pod restarts", "Intermittent 502s on checkout", "Memory usage sawtooth pattern"],
      severity: "high",
      service: "checkout-service",
      environment: "production",
      tags: ["kubernetes", "memory", "oom"],
      affected_services: ["checkout-api", "frontend-gateway"],
      logs: `[14251.232] node invoked oom-killer: gfp_mask=0x100cca(GFP_HIGHUSER_MOVABLE), order=0, oom_score_adj=998
[14251.232] Memory cgroup out of memory: Killed process 12 (node) total-vm:1453000kB, anon-rss:1048576kB, file-rss:0kB
[K8s] Pod checkout-service-7f89d9b6c-xh92z terminated (Reason: OOMKilled)`,
      timeline: [
        { event: "New release v1.4.2 deployed to checkout-service", timestamp: getPastTime(120) },
        { event: "Memory utilization crossed 80% threshold", timestamp: getPastTime(60) },
        { event: "First pod OOMKilled and restarted", timestamp: getPastTime(15) }
      ]
    }
  },
  {
    id: "disk-full",
    title: "Disk Full",
    icon: HardDrive,
    description: "Log volume partition reached 100% capacity.",
    payload: {
      title: "No space left on device: /var/log",
      description: "The primary log partition on the search-indexer nodes is completely full, causing the service to crash.",
      symptoms: ["Service crash", "Cannot write to logs", "Search indexing halted"],
      severity: "medium",
      service: "search-indexer",
      environment: "production",
      tags: ["disk", "infrastructure", "logging"],
      affected_services: ["search-api", "elasticsearch"],
      logs: `2026-06-07 09:12:33 ERROR [indexer] Failed to write to /var/log/app.log: ENOSPC: no space left on device
2026-06-07 09:12:34 FATAL [indexer] Unhandled exception: IOError: [Errno 28] No space left on device
2026-06-07 09:12:35 INFO [system] Service exited with status 1`,
      timeline: [
        { event: "Debug logging enabled temporarily by developer", timestamp: getPastTime(300) },
        { event: "Disk usage alert: /var/log at 90%", timestamp: getPastTime(60) },
        { event: "Disk usage reached 100%", timestamp: getPastTime(5) }
      ]
    }
  },
  {
    id: "nginx-failure",
    title: "Nginx Gateway Failure",
    icon: Globe,
    description: "Total failure of the primary ingress gateway returning 502s.",
    payload: {
      title: "502 Bad Gateway across all endpoints",
      description: "The primary Nginx ingress controller is misconfigured and returning 502s for all incoming traffic.",
      symptoms: ["Total external outage", "502 Bad Gateway pages"],
      severity: "critical",
      service: "ingress-nginx",
      environment: "production",
      tags: ["networking", "outage", "nginx"],
      affected_services: ["all-external-services", "frontend", "mobile-api"],
      logs: `2026/06/07 10:15:22 [error] 42#42: *1234 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.1.5, server: api.company.com, request: "GET /v1/users HTTP/2.0", upstream: "http://10.0.1.24:8080/v1/users"
2026/06/07 10:15:23 [error] 42#42: *1235 no live upstreams while connecting to upstream`,
      timeline: [
        { event: "Ingress configuration updated via CI/CD", timestamp: getPastTime(10) },
        { event: "Nginx reloaded successfully", timestamp: getPastTime(9) },
        { event: "Datadog triggered: Global error rate > 50%", timestamp: getPastTime(2) }
      ]
    }
  },
  {
    id: "api-failure",
    title: "Third-Party API Failure",
    icon: ServerCrash,
    description: "Payment gateway webhook integration is timing out.",
    payload: {
      title: "Stripe Webhooks Timing Out",
      description: "We are failing to process incoming payment webhooks from Stripe, leading to unfulfilled orders.",
      symptoms: ["Orders stuck in 'pending'", "Webhook 504 timeouts", "Customer complaints"],
      severity: "high",
      service: "payment-webhook-handler",
      environment: "production",
      tags: ["integration", "payments", "timeout"],
      affected_services: ["order-fulfillment", "billing-db"],
      logs: `2026-06-07 14:22:01 INFO [stripe-webhook] Received event evt_123456
2026-06-07 14:22:31 ERROR [stripe-webhook] Timeout processing event evt_123456 after 30s.
2026-06-07 14:22:31 HTTP [ingress] POST /webhooks/stripe - 504 Gateway Timeout`,
      timeline: [
        { event: "Stripe initiated a retry storm for failed webhooks", timestamp: getPastTime(45) },
        { event: "Webhook handler queue saturated", timestamp: getPastTime(20) },
        { event: "Customer support reports surge in 'unfulfilled order' tickets", timestamp: getPastTime(5) }
      ]
    }
  },
  {
    id: "security-alert",
    title: "Security Alert",
    icon: ShieldAlert,
    description: "Unauthorized access attempts detected on admin portal.",
    payload: {
      title: "Multiple failed logins from unknown IP",
      description: "Intrusion detection system flagged multiple failed admin logins from a single foreign IP (Brute force attempt).",
      symptoms: ["Failed admin logins", "IDS alerts triggered"],
      severity: "high",
      service: "admin-portal",
      environment: "production",
      tags: ["security", "auth", "brute-force"],
      affected_services: ["auth-service", "admin-dashboard"],
      logs: `192.168.1.100 - - [07/Jun/2026:15:30:12 +0000] "POST /admin/login HTTP/1.1" 401 53 "-" "Mozilla/5.0"
192.168.1.100 - - [07/Jun/2026:15:30:13 +0000] "POST /admin/login HTTP/1.1" 401 53 "-" "Mozilla/5.0"
WARN [auth] Account lockout threshold reached for user 'admin@company.com'`,
      timeline: [
        { event: "First failed login attempt detected", timestamp: getPastTime(10) },
        { event: "100+ failed login attempts in 60 seconds", timestamp: getPastTime(8) },
        { event: "Admin account locked automatically", timestamp: getPastTime(7) }
      ]
    }
  },
  {
    id: "redis-outage",
    title: "Redis Cache Eviction",
    icon: Bug,
    description: "Maxmemory reached, causing massive cache evictions and DB overload.",
    payload: {
      title: "Redis Maxmemory Reached - Eviction Storm",
      description: "The primary Redis cache hit its memory limit and is aggressively evicting keys, causing cache misses and spiking database load.",
      symptoms: ["Cache miss rate > 80%", "Database CPU spiked", "Slow page loads"],
      severity: "high",
      service: "redis-cache",
      environment: "production",
      tags: ["cache", "redis", "performance"],
      affected_services: ["product-api", "frontend-ssr", "postgres-replica"],
      logs: `67:M 07 Jun 2026 16:01:23.456 # WARNING: maxmemory limit reached, dropping 14502 keys
67:M 07 Jun 2026 16:01:24.123 # WARNING: maxmemory limit reached, dropping 18933 keys
2026-06-07 16:01:25 WARN [product-api] Cache miss for hot key 'homepage_products', querying DB`,
      timeline: [
        { event: "Marketing campaign launched, driving 5x traffic", timestamp: getPastTime(60) },
        { event: "Redis memory utilization reached 100%", timestamp: getPastTime(10) },
        { event: "Eviction storm begins, DB CPU rises to 85%", timestamp: getPastTime(5) }
      ]
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
        <p className="text-muted-foreground mt-2">Trigger test incidents to evaluate the AI Response Agent. Each scenario generates realistic logs and chronological timelines.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SIMULATORS.map((sim) => {
          const Icon = sim.icon;
          return (
            <Card key={sim.id} className="hover:border-primary/50 transition-colors flex flex-col h-full cursor-pointer" onClick={() => !loadingId && handleSimulate(sim.id, sim.payload)}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="p-2 bg-secondary rounded-lg mr-4 flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight">{sim.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="mt-2 flex-grow flex flex-col justify-between">
                <CardDescription className="text-xs mb-4">{sim.description}</CardDescription>
                <button
                  disabled={!!loadingId}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 mt-auto"
                >
                  {loadingId === sim.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loadingId === sim.id ? "Triggering..." : "Trigger"}
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
