import { getAlerts, getDeploysFor, getMetricsFor, getServices } from "./data.js";
import type { Deploy, MetricPoint, SampleAlert, Service, ServiceId } from "./types.js";

export type { AlertCauseKind, Deploy, MetricPoint, SampleAlert, Service, ServiceId } from "./types.js";

export function listServices(): Service[] {
  return [...getServices()];
}

export function getMetrics(service: ServiceId, from: number, to: number): MetricPoint[] {
  return getMetricsFor(service).filter((point) => point.timestamp >= from && point.timestamp <= to);
}

export function getDeploys(service: ServiceId, from: number, to: number): Deploy[] {
  return getDeploysFor(service).filter((deploy) => deploy.timestamp >= from && deploy.timestamp <= to);
}

export function listSampleAlerts(): SampleAlert[] {
  return [...getAlerts()];
}
