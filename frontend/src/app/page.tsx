"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchIncidents, IncidentResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle2, Clock, TrendingUp, Shield, ArrowUpRight, Zap, BrainCircuit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { SeverityBadge } from "@/components/SeverityBadge";

function SkeletonCard() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-48 mb-2" />
            <div className="skeleton h-4 w-72" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const total = incidents.length;
  const open = incidents.filter(i => i.status === "open").length;
  const resolved = incidents.filter(i => i.status === "resolved").length;

  const getCount = (pLevel: string, legacyLevel: string) => {
    return incidents.filter(i => {
      const s = i.severity.toLowerCase();
      return s.includes(pLevel) || s === legacyLevel;
    }).length;
  };

  const p1Count = getCount("p1", "critical");
  const p2Count = getCount("p2", "high");
  const p3Count = getCount("p3", "medium");
  const p4Count = getCount("p4", "low");

  const severityData = [
    { name: 'P4 Low', count: p4Count, fill: '#3b82f6' },
    { name: 'P3 Medium', count: p3Count, fill: '#eab308' },
    { name: 'P2 High', count: p2Count, fill: '#f97316' },
    { name: 'P1 Critical', count: p1Count, fill: '#ef4444' },
  ];

  const pieData = [
    { name: 'Open', value: open, fill: '#f97316' },
    { name: 'Resolved', value: resolved, fill: '#22c55e' },
  ].filter(d => d.value > 0);

  const mttr = incidents.filter(i => i.resolution?.resolution_time_minutes).reduce((sum, i) => sum + (i.resolution?.resolution_time_minutes || 0), 0);
  const avgMttr = resolved > 0 ? Math.round(mttr / resolved) : 0;

  const statCards = [
    { title: "Total Incidents", value: total, icon: Activity, color: "text-primary", bgColor: "bg-primary/10", trend: null },
    { title: "Open", value: open, icon: Clock, color: "text-orange-400", bgColor: "bg-orange-500/10", trend: open > 0 ? "Active" : null },
    { title: "Resolved", value: resolved, icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10", trend: null },
    { title: "P1 Critical", value: p1Count, icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10", trend: p1Count > 0 ? "Alert" : null },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time operational intelligence overview</p>
        </div>
        <Link
          href="/incidents/simulate"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
        >
          <Zap className="w-4 h-4 mr-2" />
          Simulate
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden hover:border-primary/30 transition-all duration-300 group">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity`} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.title}</span>
                  <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</span>
                  {stat.trend && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${stat.color} ${stat.bgColor}`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={severityData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'var(--secondary)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">No data yet</div>
            )}
            <div className="w-full mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg. MTTR</span>
                <span className="font-bold text-foreground">{avgMttr > 0 ? `${avgMttr} min` : "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              Recent Incidents
            </CardTitle>
            <Link href="/incidents" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {incidents.slice(-6).reverse().map((inc) => (
              <Link
                key={inc.incident_id}
                href={`/incidents/${inc.incident_id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inc.status === "open" ? "bg-orange-400 animate-pulse" : "bg-emerald-400"}`} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{inc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.service || "unknown"} · {new Date(inc.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <SeverityBadge severity={inc.severity} />
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
            {incidents.length === 0 && (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm">
                No incidents yet. Use the Simulator to create one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
