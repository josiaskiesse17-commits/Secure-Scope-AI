# Architecture

**Status**: Completed in Milestone 1 (Issue #2) — Local development foundation

## Planned Outline (from plan.md)

### Section 6: Architecture Principles
- Prefer a modular monolith and a small worker process over many microservices.
- Keep business logic separate from HTTP routes, database access, scanners, AI providers, and telemetry.
- Use explicit typed schemas at boundaries.
- Make long-running scan state persistent and observable.
- Keep the UI usable if AI analysis is unavailable.
- Use environment variables for configuration and secrets.
- Provide `.env.example` with placeholders only; never commit secrets.
- Make local setup reproducible with one documented command.
- Use migrations, health checks, timeouts, bounded retries, and graceful error handling.
- Make critical operations testable without calling a real model or public external service.
- Keep provider and hosting decisions replaceable when practical.

### Section 7: Suggested Repository Layout
```
securescope-ai/
├── AGENTS.md
├── CLAUDE.md
├── plan.md
├── backlog.md
├── README.md
├── .env.example
├── .gitignore
├── docs/
├── backend/
│   ├── app/
│   ├── worker/
│   ├── migrations/
│   └── tests/
├── frontend/
│   ├── src/
│   └── tests/
├── infra/
│   ├── docker/
│   ├── prometheus/
│   ├── alertmanager/
│   └── grafana/
└── .github/
    └── workflows/
```

### Section 8: Data Model (Initial Proposal)
- **scans**: id, status, original_filename, created_at/started_at/finished_at, error_code, failure_class (user_error/internal), attempt_count, trace_id
- **findings**: id, scan_id, scanner, native_id, title, description, severity, confidence, file_path, line_number, package_name, installed_version, fixed_version, advisory_url, evidence, created_at
- **ai_analyses**: id, finding_id, provider, model, structured explanation/impact/remediation/verification/uncertainty, created_at, safe failure status
- **responder_events**: id, alert_fingerprint, scan_id, alert name/status, investigation summary, action attempted, outcome, created/updated timestamps, trace correlation

### Section 9: API Outline
- `GET /health/live` — process liveness
- `GET /health/ready` — readiness including dependencies
- `POST /api/scans` — accept ZIP upload, create scan job (requires `X-Demo-Token` when `UPLOADS_ENABLED=true`)
- `GET /api/scans` — list recent scan jobs with bounded pagination
- `GET /api/scans/{scan_id}` — scan status and summary
- `GET /api/scans/{scan_id}/findings` — findings for a scan
- `GET /api/findings/{finding_id}` — one finding and its evidence
- `POST /api/findings/{finding_id}/analyze` — request AI analysis
- `GET /api/scans/{scan_id}/responder-events` — operational recovery events
- `POST /internal/alerts/alertmanager` — constrained Alertmanager webhook receiver (bearer token auth)
- `GET /metrics` — Prometheus scrape endpoint (restricted, not publicly routed in demo mode)

*Source: plan.md sections 6, 7, 8, 9*