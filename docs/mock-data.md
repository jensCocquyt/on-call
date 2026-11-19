# Mock infrastructure data

`src/mock/` provides typed, deterministic mock infrastructure data for the PoC. There is no
real cloud access: services, metrics, deploy history and alerts are all fixed TypeScript
constants, computed once at module load with no runtime randomness.

## API

- `listServices()` — the 3 mock services.
- `getMetrics(service, from, to)` — per-minute `latencyP95Ms` / `errorRatePct` points for a
  service, filtered to the `[from, to]` timestamp range (epoch ms).
- `getDeploys(service, from, to)` — deploy history for a service, filtered to the same range.
- `listSampleAlerts()` — the 3 sample alerts, each with a `window` (the recommended
  `from`/`to` range to pass to `getMetrics`/`getDeploys`) and a `causeAt` timestamp.

All functions are pure: the same arguments always return deep-equal results.

## The 3 scenarios

Each service has one sample alert with a different plausible cause. Each metric series covers
the 60 minutes centred on the cause, with a baseline before the cause and a ramped anomaly
starting at or after it.

### checkout-api — bad deploy

Deploy `v1.4.2` ships at 09:58 (author `alice`), after an earlier benign `v1.4.1`. Latency p95
and error rate ramp up starting at 09:58. The alert fires at 10:04 with evidence
`"deploy v1.4.2 at 09:58"`, and `getDeploys` for the alert's window returns the `v1.4.2` deploy
the anomaly follows.

### search — traffic spike

Query volume spikes at 11:10 with no accompanying deploy. Latency p95 ramps up from the spike;
error rate rises only mildly. The alert fires at 11:16.

### notifications — feature flag change

The `new-digest-template` feature flag is enabled at 14:20, breaking a notification template.
Error rate ramps up sharply from 14:20 while latency stays close to baseline. The alert fires
at 14:26.
