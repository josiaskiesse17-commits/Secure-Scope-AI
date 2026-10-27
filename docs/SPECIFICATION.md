# Specification

## User Stories

### Journey A: Scan a Project (Milestone 2, Issue #3)

**User Story**: As a developer, I want to upload a Python project ZIP and run a Bandit security scan so that I can see evidence-backed findings.

**Acceptance Criteria** (from FR-1, FR-2, FR-3, FR-5):
- FR-1: Upload validation accepts ZIP uploads only, enforces configurable max upload size/entry count/expanded size, rejects malformed/encrypted/path-traversal/symlink entries, stores extracted content in isolated temp workspace, never executes uploaded code, deletes temp workspaces per cleanup policy, implements ZIP retention (stored on private volume keyed by scan ID, deleted on completion/user-error, kept max 24h after internal failure, each attempt uses own temp workspace deleted in finally block). (Milestone 2, Issue #3)
- FR-2: Scan orchestration creates persistent scan record with unique ID, tracks status (queued/running/completed/failed), executes Bandit against eligible Python files via scanner adapter interface (each adapter takes workspace path, returns normalized findings, orchestration iterates registered adapters), captures scanner exit status and parses machine-readable output, preserves scanner identity and evidence, handles timeouts/no eligible files/invalid input/scanner errors/empty findings predictably, prevents duplicate retries. (Milestone 2, Issue #3)
- FR-3: Findings store scan ID, scanner name, stable/native ID, title/message/description, severity/confidence, file path/line number or package details (nullable), evidence/remediation metadata, status (open/resolved/accepted_risk if implemented), normalizes scanner output without inventing fields, retains nullable package fields for future dependency scanning. (Milestone 2, Issue #3)
- FR-5: Frontend provides dashboard/landing page with upload and recent scan status, scan submission/validation states, scan detail page with job status/findings summary/list, finding detail/expandable panel with scanner evidence and AI analysis, operational status/incident view, loading/empty/error/retry states, responsive accessible baseline styling. (Milestone 2, Issue #3)

### Journey B: Understand a Finding (Milestone 3, Issue #4)

**User Story**: As a developer, I want to request an AI explanation for a finding so that I can understand its impact and get a suggested remediation.

**Acceptance Criteria** (from FR-4, FR-5):
- FR-4: AI analysis selects provider via config behind provider/service interface, sends only finding and minimum evidence (not entire project), treats uploaded content/scanner text as untrusted data, validates model output against schema, returns explanation/potential impact/remediation suggestion/verification steps/uncertainty, shows clear recoverable error if provider unavailable (scanning/viewing continues), never represents model output as verified scan result, never claims proposed fix is applied/verified without separate verification, does not log API keys/uploaded source/sensitive prompts. (Milestone 3, Issue #4)
- FR-5: Finding detail/expandable panel displays scanner evidence and AI analysis with clear advisory labeling. (Milestone 3, Issue #4)

### Journey C: Operational Failure and Recovery (Milestones 5-6, Issues #6-7)

**User Story**: As an operator, I want scan processing failures to trigger an alert and a bounded responder workflow so that failures are investigated and retried automatically with audit trail.

**Acceptance Criteria** (from FR-6, Observability, Alerting):
- FR-6: Responder accepts authenticated/constrained Alertmanager webhooks with payload validation, handles only configured alert types, is LLM-driven but policy-gated with tools (get_scan, get_telemetry_summary, retry_scan, escalate), deterministic policy layer checks scan is failed/internal/retry-eligible/never-retried regardless of model request, policy runs alone if model unavailable/invalid, model never sees source code, reads approved job metadata/telemetry, permits at most one retry per eligible failed scan, records alert_fingerprint/investigation summary/action/result/timestamps/trace correlation, responder_events has unique constraint on (alert_fingerprint, scan_id), retry guarded by atomic UPDATE scans SET attempt_count=2, status='queued' WHERE id=? AND status='failed' AND attempt_count=1, actions idempotent/resistant to duplicate webhooks, no arbitrary shell commands/source modification/security control changes/secret access/production deployment, stops/escalates on insufficient info/unallowlisted action/retry failure, demonstrates alert-to-agent-to-recovery path with repeatable test. (Milestone 6, Issue #7)
- Observability: OpenTelemetry instrumentation on API requests/scan jobs/scanner execution/database operations/responder activity, structured JSON logs with job/scan IDs and trace IDs, Prometheus metrics for scan totals/successes/failures/duration/responder outcomes, Prometheus/Grafana/Jaeger configured, user-impact alert rule: `increase(scan_failures_total{failure_class="internal"}[10m]) > 0`, Alertmanager delivers to responder webhook, operational UI for recent alerts/responder events. (Milestone 5, Issue #6)
- Alerting: Only internal failures increment `scan_failures_total{failure_class="internal"}` and are alertable/retry-eligible; user errors rejected synchronously with 4xx where possible. (Milestone 5, Issue #6)

## Functional Requirements Acceptance Criteria Summary

| Requirement | Description | Milestone | Issue |
|-------------|-------------|-----------|-------|
| FR-1 | Upload validation | 2 | #3 |
| FR-2 | Scan orchestration (Bandit via adapter) | 2 | #3 |
| FR-3 | Findings data model | 2 | #3 |
| FR-4 | AI analysis | 3 | #4 |
| FR-5 | Frontend screens | 2-3 | #3, #4 |
| FR-6 | Operational responder | 5-6 | #6, #7 |

*Source: plan.md sections 3 (User journeys) and 4 (Functional requirements); backlog.md milestones 2-6*