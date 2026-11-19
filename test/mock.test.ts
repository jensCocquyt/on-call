import { describe, expect, it } from "vitest";
import { getDeploys, getMetrics, listSampleAlerts, listServices } from "../src/mock/index.js";

describe("listServices", () => {
  it("returns 3 services", () => {
    expect(listServices()).toHaveLength(3);
  });
});

describe("listSampleAlerts", () => {
  it("AC1: returns exactly 3 alerts for 3 different services", () => {
    const alerts = listSampleAlerts();
    expect(alerts).toHaveLength(3);
    expect(new Set(alerts.map((alert) => alert.service)).size).toBe(3);
  });

  it("covers a bad deploy, a traffic spike and a feature flag change", () => {
    const causes = listSampleAlerts()
      .map((alert) => alert.causeKind)
      .sort();
    expect(causes).toEqual(["bad-deploy", "feature-flag-change", "traffic-spike"]);
  });
});

describe("getMetrics", () => {
  it("AC2: shows a visible anomaly that starts at or after each alert's cause time", () => {
    for (const alert of listSampleAlerts()) {
      const series = getMetrics(alert.service, alert.window.from, alert.window.to);
      const before = series.filter((point) => point.timestamp < alert.causeAt);
      const atOrAfter = series.filter((point) => point.timestamp >= alert.causeAt);
      expect(before.length).toBeGreaterThan(0);
      expect(atOrAfter.length).toBeGreaterThan(0);

      const baselineLatency = Math.max(...before.map((point) => point.latencyP95Ms));
      const baselineErrorRate = Math.max(...before.map((point) => point.errorRatePct));
      const peakLatency = Math.max(...atOrAfter.map((point) => point.latencyP95Ms));
      const peakErrorRate = Math.max(...atOrAfter.map((point) => point.errorRatePct));

      expect(peakLatency).toBeGreaterThan(baselineLatency);
      expect(peakErrorRate).toBeGreaterThan(baselineErrorRate);

      const firstAnomalousPoint = series.find(
        (point) => point.latencyP95Ms > baselineLatency || point.errorRatePct > baselineErrorRate,
      );
      expect(firstAnomalousPoint).toBeDefined();
      expect(firstAnomalousPoint!.timestamp).toBeGreaterThanOrEqual(alert.causeAt);
    }
  });

  it("only returns points within the requested range", () => {
    const alert = listSampleAlerts()[0]!;
    const midpoint = (alert.window.from + alert.window.to) / 2;
    const series = getMetrics(alert.service, alert.window.from, midpoint);
    expect(series.every((point) => point.timestamp >= alert.window.from && point.timestamp <= midpoint)).toBe(true);
  });
});

describe("getDeploys", () => {
  it("AC3: the bad-deploy alert's window includes the deploy the anomaly follows", () => {
    const badDeployAlert = listSampleAlerts().find((alert) => alert.causeKind === "bad-deploy")!;
    const deploys = getDeploys(badDeployAlert.service, badDeployAlert.window.from, badDeployAlert.window.to);
    expect(deploys.some((deploy) => deploy.timestamp === badDeployAlert.causeAt)).toBe(true);
    expect(badDeployAlert.evidence).toContain(deploys.find((d) => d.timestamp === badDeployAlert.causeAt)!.version);
  });
});

describe("determinism", () => {
  it("AC4: repeated calls with the same arguments return deep-equal results", () => {
    expect(listServices()).toEqual(listServices());
    expect(listSampleAlerts()).toEqual(listSampleAlerts());

    for (const alert of listSampleAlerts()) {
      expect(getMetrics(alert.service, alert.window.from, alert.window.to)).toEqual(
        getMetrics(alert.service, alert.window.from, alert.window.to),
      );
      expect(getDeploys(alert.service, alert.window.from, alert.window.to)).toEqual(
        getDeploys(alert.service, alert.window.from, alert.window.to),
      );
    }
  });
});
