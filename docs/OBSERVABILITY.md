# Observability

**Status**: Completed in Milestone 5 (Issue #6) — Observability and user-impact alert

## Planned Outline (from plan.md section 12)

### Required Signals

**Metrics**
- Scan submissions, scan successes/failures, duration.
- Queue age/backlog if applicable.
- AI provider failures.
- Responder attempts and outcomes.
- `scan_failures_total{failure_class="internal"}` — only internal failures increment this.

**Traces**
- Request → scan job → scanner execution → persistence.
- Alert/responder activity correlated where technically possible.
- Trace IDs correlated with scan/job IDs.

**Logs**
- Structured JSON, severity, event name, timestamp, scan/job ID, and trace ID when available.
- Never include source code, secrets, or sensitive payloads in telemetry.

**UI**
- Grafana dashboards and a trace viewer such as Jaeger.
- Application operational view for recent responder events.

### User-Impact Alert
- Alert rule: `increase(scan_failures_total{failure_class="internal"}[10m]) > 0`
- Based on actual user-facing failure (scan job enters failed due to internal processing error), not CPU alone.
- Must avoid excessive false alerts in low-volume demo environment.
- Provide a repeatable test/controlled failure path so the alert can be demonstrated even when normal traffic is low.
- Only internal failures are alertable and retry-eligible; user errors rejected synchronously with 4xx where possible.

### Responder Behavior (from plan.md section 12 and section 16)
- Alertmanager calls a constrained webhook with bearer token auth.
- Receiver validates and deduplicates the alert using `alert_fingerprint`.
- Agent obtains approved telemetry and job metadata.
- Agent is LLM-driven but policy-gated with tools: `get_scan`, `get_telemetry_summary`, `retry_scan`, `escalate`.
- Deterministic policy layer checks scan is failed, internal, retry-eligible, never retried.
- If model unavailable or returns invalid output, policy runs alone.
- Model never sees source code.
- One retry maximum, guarded by atomic UPDATE.
- Verifies final state and writes responder event.
- `responder_events` has unique constraint on `(alert_fingerprint, scan_id)`.

### Observability Stack (from plan.md section 5)
- OpenTelemetry instrumentation.
- Prometheus metrics and alert rules.
- Grafana dashboard(s).
- Jaeger or compatible trace UI.
- Structured JSON logs with trace IDs where applicable.
- Alertmanager webhook to responder service.

*Source: plan.md sections 5, 12, 16 (Approved decisions); backlog.md Milestone 5*