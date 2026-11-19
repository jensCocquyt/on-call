export type ServiceId = "checkout-api" | "search" | "notifications";

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
}

export interface MetricPoint {
  timestamp: number;
  latencyP95Ms: number;
  errorRatePct: number;
}

export interface Deploy {
  service: ServiceId;
  version: string;
  timestamp: number;
  author: string;
}

export type AlertCauseKind = "bad-deploy" | "traffic-spike" | "feature-flag-change";

export interface SampleAlert {
  id: string;
  service: ServiceId;
  severity: "warning" | "critical";
  firedAt: number;
  summary: string;
  causeKind: AlertCauseKind;
  causeAt: number;
  evidence: string;
  window: { from: number; to: number };
}
