// Type definitions for the frontend based on backend schemas

export interface SimilarIncident {
  incident_id: string;
  score: number;
}

export interface Diagnosis {
  root_causes?: string[];
  confidence_score?: number;
  impact_analysis?: string;
  recommended_actions: string[];
  prevention_steps?: string[];
  similar_incidents: SimilarIncident[];
}

export interface Resolution {
  actual_root_cause?: string;
  fix_applied?: string;
  lessons_learned?: string;
  resolved_by?: string;
  resolution_time_minutes?: number;
}

export interface Memory {
  stored_in_hindsight: boolean;
  memory_summary?: string;
}

export interface TimelineEvent {
  event: string;
  timestamp: string;
}

export interface IncidentBase {
  title: string;
  description: string;
  symptoms: string[];
  severity?: string;
  service?: string;
  environment?: string;
  tags?: string[];
}

export interface IncidentCreate extends IncidentBase {}

export interface IncidentResolve {
  actual_root_cause: string;
  fix_applied: string;
  lessons_learned: string;
  resolved_by?: string;
  resolution_time_minutes: number;
}

export interface IncidentResponse extends IncidentBase {
  incident_id: string;
  status?: string;
  diagnosis?: Diagnosis;
  resolution?: Resolution;
  memory?: Memory;
  timeline?: TimelineEvent[];
  created_at: string;
  resolved_at?: string;
}

export interface DiagnoseResponse {
  incident_id: string;
  root_causes: string[];
  confidence_score: number;
  impact_analysis: string;
  recommended_actions: string[];
  prevention_steps: string[];
  similar_incidents: SimilarIncident[];
  investigation_mode?: boolean;
}
