import type { Deploy, MetricPoint, SampleAlert, Service, ServiceId } from "./types.js";

const MINUTE_MS = 60_000;
const WINDOW_MINUTES = 60;
const ANOMALY_RAMP_MINUTES = 10;

const DAY = Date.UTC(2026, 10, 18);

function at(hours: number, minutes: number): number {
  return DAY + hours * 60 * MINUTE_MS + minutes * MINUTE_MS;
}

/**
 * Builds a 60-minute, per-minute series centred on `causeAt`: flat baseline values
 * before the cause, ramping linearly to the peak over ANOMALY_RAMP_MINUTES and then
 * holding, plus a small fixed sinusoidal wiggle so the series looks like real metrics.
 */
function buildSeries(
  causeAt: number,
  baseline: { latencyP95Ms: number; errorRatePct: number },
  peak: { latencyP95Ms: number; errorRatePct: number },
): MetricPoint[] {
  const windowStart = causeAt - (WINDOW_MINUTES / 2) * MINUTE_MS;
  const points: MetricPoint[] = [];
  for (let offset = 0; offset <= WINDOW_MINUTES; offset += 1) {
    const timestamp = windowStart + offset * MINUTE_MS;
    const wiggle = Math.sin(offset / 3);
    if (timestamp < causeAt) {
      points.push({
        timestamp,
        latencyP95Ms: Math.round(baseline.latencyP95Ms + wiggle * 3),
        errorRatePct: Math.round((baseline.errorRatePct + wiggle * 0.02) * 100) / 100,
      });
    } else {
      const minutesSinceCause = (timestamp - causeAt) / MINUTE_MS;
      const ramp = Math.min(1, minutesSinceCause / ANOMALY_RAMP_MINUTES);
      points.push({
        timestamp,
        latencyP95Ms: Math.round(
          baseline.latencyP95Ms + ramp * (peak.latencyP95Ms - baseline.latencyP95Ms) + wiggle * 3,
        ),
        errorRatePct:
          Math.round(
            (baseline.errorRatePct + ramp * (peak.errorRatePct - baseline.errorRatePct) + wiggle * 0.02) * 100,
          ) / 100,
      });
    }
  }
  return points;
}

export const SERVICES: readonly Service[] = [
  {
    id: "checkout-api",
    name: "checkout-api",
    description: "Handles cart checkout and payment capture.",
  },
  {
    id: "search",
    name: "search",
    description: "Serves product search and autocomplete queries.",
  },
  {
    id: "notifications",
    name: "notifications",
    description: "Sends order and shipping notifications to customers.",
  },
];

// checkout-api: a bad deploy at 09:58 degrades latency and errors soon after.
const CHECKOUT_DEPLOY_V141_AT = at(8, 30);
const CHECKOUT_BAD_DEPLOY_AT = at(9, 58);

export const CHECKOUT_ALERT_CAUSE_AT = CHECKOUT_BAD_DEPLOY_AT;

// search: a traffic spike at 11:10 pushes latency and errors up with no deploy involved.
export const SEARCH_ALERT_CAUSE_AT = at(11, 10);

// notifications: a feature flag change at 14:20 breaks a template, spiking errors.
export const NOTIFICATIONS_ALERT_CAUSE_AT = at(14, 20);

const METRICS: Readonly<Record<ServiceId, readonly MetricPoint[]>> = {
  "checkout-api": buildSeries(
    CHECKOUT_ALERT_CAUSE_AT,
    { latencyP95Ms: 140, errorRatePct: 0.3 },
    { latencyP95Ms: 420, errorRatePct: 7 },
  ),
  search: buildSeries(
    SEARCH_ALERT_CAUSE_AT,
    { latencyP95Ms: 90, errorRatePct: 0.2 },
    { latencyP95Ms: 310, errorRatePct: 2.5 },
  ),
  notifications: buildSeries(
    NOTIFICATIONS_ALERT_CAUSE_AT,
    { latencyP95Ms: 70, errorRatePct: 0.1 },
    { latencyP95Ms: 95, errorRatePct: 9 },
  ),
};

const DEPLOYS: Readonly<Record<ServiceId, readonly Deploy[]>> = {
  "checkout-api": [
    { service: "checkout-api", version: "v1.4.1", timestamp: CHECKOUT_DEPLOY_V141_AT, author: "priya" },
    { service: "checkout-api", version: "v1.4.2", timestamp: CHECKOUT_BAD_DEPLOY_AT, author: "alice" },
  ],
  search: [{ service: "search", version: "v2.9.0", timestamp: at(9, 0), author: "marco" }],
  notifications: [{ service: "notifications", version: "v0.11.3", timestamp: at(13, 0), author: "dana" }],
};

const ALERTS: readonly SampleAlert[] = [
  {
    id: "alert-checkout-api-bad-deploy",
    service: "checkout-api",
    severity: "critical",
    firedAt: at(10, 4),
    summary: "checkout-api p95 latency and error rate elevated",
    causeKind: "bad-deploy",
    causeAt: CHECKOUT_ALERT_CAUSE_AT,
    evidence: "deploy v1.4.2 at 09:58",
    window: {
      from: CHECKOUT_ALERT_CAUSE_AT - (WINDOW_MINUTES / 2) * MINUTE_MS,
      to: CHECKOUT_ALERT_CAUSE_AT + (WINDOW_MINUTES / 2) * MINUTE_MS,
    },
  },
  {
    id: "alert-search-traffic-spike",
    service: "search",
    severity: "warning",
    firedAt: at(11, 16),
    summary: "search p95 latency elevated under high query volume",
    causeKind: "traffic-spike",
    causeAt: SEARCH_ALERT_CAUSE_AT,
    evidence: "query volume 4x baseline starting 11:10",
    window: {
      from: SEARCH_ALERT_CAUSE_AT - (WINDOW_MINUTES / 2) * MINUTE_MS,
      to: SEARCH_ALERT_CAUSE_AT + (WINDOW_MINUTES / 2) * MINUTE_MS,
    },
  },
  {
    id: "alert-notifications-feature-flag",
    service: "notifications",
    severity: "critical",
    firedAt: at(14, 26),
    summary: "notifications error rate elevated",
    causeKind: "feature-flag-change",
    causeAt: NOTIFICATIONS_ALERT_CAUSE_AT,
    evidence: "feature flag new-digest-template enabled at 14:20",
    window: {
      from: NOTIFICATIONS_ALERT_CAUSE_AT - (WINDOW_MINUTES / 2) * MINUTE_MS,
      to: NOTIFICATIONS_ALERT_CAUSE_AT + (WINDOW_MINUTES / 2) * MINUTE_MS,
    },
  },
];

export function getServices(): readonly Service[] {
  return SERVICES;
}

export function getMetricsFor(service: ServiceId): readonly MetricPoint[] {
  return METRICS[service];
}

export function getDeploysFor(service: ServiceId): readonly Deploy[] {
  return DEPLOYS[service];
}

export function getAlerts(): readonly SampleAlert[] {
  return ALERTS;
}
