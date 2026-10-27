# Runbook

**Status**: Completed in Milestone 5 (Issue #6) — Observability and user-impact alert (documentation), demonstrated in Milestone 8 (Issue #9)

## Planned Outline (from plan.md sections 12, 16, and backlog.md Milestone 5)

### Failure Investigation
- Correlate logs, metrics, and traces using trace/job IDs.
- Check structured JSON logs for scan/job ID and trace ID.
- Query Prometheus for `scan_failures_total{failure_class="internal"}` and scan duration metrics.
- Use Jaeger/Grafana to trace request → scan job → scanner execution → persistence.
- Inspect `responder_events` for alert_fingerprint, scan_id, action attempted, outcome.

### Recovery Procedures

**Scan Job Failure (Internal)**
1. Alert fires: `increase(scan_failures_total{failure_class="internal"}[10m]) > 0`
2. Alertmanager delivers webhook to responder endpoint (bearer token auth).
3. Responder validates and deduplicates via `alert_fingerprint`.
4. Responder queries eligible failed scans (failed, internal, attempt_count=1, finished within window), max 3 per alert.
4. Policy layer checks: scan is failed, internal, retry-eligible, never retried.
5. If model available: LLM-driven with tools `get_scan`, `get_telemetry_summary`, `retry_scan`, `escalate`.
6. If model unavailable/invalid: policy runs alone.
7. Retry guarded by atomic UPDATE: `UPDATE scans SET attempt_count=2, status='queued' WHERE id=? AND status='failed' AND attempt_count=1`.
8. Zero rows affected = no retry (already retried or not eligible).
9. Responder verifies final state, writes `responder_events` with unique constraint on `(alert_fingerprint, scan_id)`.
10. If retry fails or unsafe: escalate (stop, record escalation outcome).

**Scan Job Failure (User Error)**
- Rejected synchronously with 4xx where possible.
- Not alertable, not retry-eligible.
- Does not increment `scan_failures_total{failure_class="internal"}`.

**Responder Escalation**
- Stops when: information insufficient, action not allowlisted, retry fails.
- Does not loop or improvise privileged actions.
- No arbitrary shell commands, source code modification, security control changes, secret access, or production deployment.

### Operational Verification (Milestone 8, Issue #9)
- Demonstrate controlled failure → alert → responder → bounded retry → verified outcome.
- Demonstrate failed-recovery escalation.
- Verify alert payload reaches responder endpoint.
- Verify telemetry contains no secrets, uploaded source code, or unnecessary sensitive data.

### Configuration
- `FAULT_INJECTION_ENABLED` defaults to false, logs startup warning if enabled, never set in production config.
- `UPLOADS_ENABLED` plus `X-Demo-Token` for public demo mode.
- `WORKER_MODE=embedded|separate`.

*Source: plan.md sections 12, 16 (Approved decisions); backlog.md Milestones 5, 8*