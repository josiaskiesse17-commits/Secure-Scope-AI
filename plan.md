Purpose: This document is the product and technical source of
truth for SecureScope AI. When implementation choices conflict with
this document, follow this document unless the owner explicitly
approves a change. Record approved changes here before implementing
them.

Project goal: Deliver one small, complete application that
demonstrates the full AI Dev Tools Zoomcamp workflow. Do not turn the
MVP into an enterprise security platform.

1. Product summary

SecureScope AI helps developers inspect Python projects for common
security weaknesses, understand scanner findings, and obtain
AI-generated remediation suggestions. It also demonstrates
production-minded engineering: tests, containers, deployment, CI/CD,
observability, user-impact alerting, and a bounded incident-responder
agent.

Problem

Existing scanners can report security issues, but
developers---especially students and less experienced developers---may
struggle to understand a finding, assess its significance, and choose a
safe remediation. SecureScope presents scanner evidence clearly and uses
an AI model to explain findings and suggest fixes.

Target users

Students learning secure software development.

Developers maintaining small Python projects.

Developers who want an approachable interface for existing scanner
output.

Product promise

A user can upload a Python project ZIP, run a Bandit security scan,
review evidence-backed findings, and request an explanation or proposed
fix. Dependency vulnerability auditing is planned as a stretch goal. The
application can also detect a meaningful processing failure and
demonstrate a bounded, auditable recovery workflow.

2. Scope and non-goals

MVP must include

ZIP upload for a Python project, with strict validation and
size/file-count limits.

Static analysis using Bandit.

Persistent scan jobs, scan status, findings, and AI analyses in
PostgreSQL.

A React web UI to submit scans and inspect results.

AI explanations and remediation suggestions grounded in scanner
output.

Safe handling of untrusted ZIP contents; never execute uploaded
project code.

Unit, frontend, and integration tests.

Docker Compose for a documented one-command local startup.

GitHub Actions CI, automatic development deployment where the chosen
host supports it, manual production deployment, and a documented
rollback path.

Observability with structured logs, metrics, distributed traces,
trace-ID correlation, and a usable UI.

A user-impact alert that triggers an actual responder workflow.

A responder agent that inspects approved telemetry, attempts one
bounded retry of a failed scan job, verifies the outcome, and
records its actions.

English documentation, an issue/task tracker, agent-team
specification, and AGENTS.md.

Evidence that maps implementation and demonstrations to every
Zoomcamp rubric criterion.

Stretch goals (after Milestone 6)

Python dependency vulnerability auditing using pip-audit when
supported dependency manifests are present. Requirements.txt only,
sanitized to name==version lines, invoked with --no-deps
--disable-pip, network limited to the vulnerability service.

Explicitly out of scope for the MVP

User accounts, authentication, teams, or role management.

Private Git repository integration or GitHub OAuth.

Support for languages other than Python.

A custom vulnerability scanner.

Automatic patch application, automatic commits, or automatic pull
requests.

Running uploaded code, install scripts, tests, build scripts, or
package setup commands.

Unrestricted shell access for the responder agent.

Autonomous code edits or autonomous production deployments by the
responder.

Kubernetes, microservices for their own sake, complex orchestration,
or a large plugin system.

A claim that the application guarantees code is secure.

A guarantee that every scanner finding is a confirmed vulnerability.

Paid infrastructure unless the owner explicitly approves it.

3. User journeys

Journey A: scan a project

The user opens the application.

The user selects a ZIP containing a Python project.

The application validates the upload and explains any rejected
input.

The user submits the scan.

The UI displays queued/running/completed/failed status.

The user opens the completed scan and reviews findings.

The user can see the scanner, severity where available,
file/dependency, line or package information, and evidence.

Journey B: understand a finding

The user opens a finding.

The user requests an AI explanation.

The backend sends only the necessary finding evidence and safe,
bounded context to the configured model provider.

The UI displays an explanation, impact, and suggested remediation.

The UI clearly labels model-generated advice as a suggestion, not
verified fact.

The user can inspect the original scanner evidence used by the
explanation.

Journey C: operational failure and recovery

A scan job fails in a way that represents user impact.

The application emits structured logs, metrics, and traces.

The configured alert rule fires and Alertmanager sends a webhook to
the responder endpoint.

The responder validates the alert, loads the relevant job and
approved telemetry, and records an investigation.

The responder may request one retry for the failed scan through an
explicit, allowlisted tool.

The application executes the retry under normal validation and
resource limits.

The responder verifies whether the retry succeeded and records the
result.

If recovery fails or is unsafe, the responder stops and escalates;
it does not loop or improvise privileged actions.

4. Functional requirements

FR-1: upload validation

Accept ZIP uploads only.

Enforce configurable maximum upload size, entry count, and expanded
size.

Reject malformed archives, encrypted archives if unsupported, path
traversal entries, absolute paths, symlinks if unsafe to handle, and
suspicious paths.

Store extracted content in a temporary isolated workspace using safe
path resolution.

Do not execute any uploaded file or project-defined command.

Delete temporary workspaces according to a documented cleanup
policy.

ZIP retention: the uploaded ZIP is stored on a private volume keyed by
scan ID. It is deleted on completion and on user-error failure. After
an internal failure it is kept at most 24 hours, and deleted earlier
once the retry reaches a final outcome. Each attempt extracts into its
own temp workspace, always deleted in a finally block.

Do not expose uploaded source code publicly.

FR-2: scan orchestration

Create a persistent scan record with a unique ID.

Track status at minimum: queued, running, completed, failed.

Execute Bandit against eligible Python source files using a scanner
adapter interface. Each scanner adapter takes a workspace path and
returns normalized findings. Orchestration iterates over registered
adapters, so another scanner can be added without changing
orchestration logic.

Capture scanner exit status and parse machine-readable output.

Preserve scanner identity and useful evidence.

Handle timeouts, no eligible Python files, invalid input, scanner errors,
and empty findings predictably.

Prevent duplicate retries from creating unbounded work.

FR-3: findings

Each finding should store, where available: - Scan ID and scanner
name. - Stable finding identifier or scanner-native identifier. -
Title/message and description. - Severity or confidence where supplied
by the scanner. - File path and line number, or package/version/advisory
details (nullable). - Evidence and remediation metadata supplied by the
scanner. - Status (open, resolved, or accepted_risk) only if status
editing is implemented; do not imply a finding is fixed merely because
an AI suggestion was generated.

Normalize scanner output without inventing missing fields. Retain raw
scanner output only when useful and safe; avoid logging source code or
secrets. The findings data model retains nullable package fields
(package_name, installed_version, fixed_version, advisory URL) for
future dependency scanning.

FR-4: AI analysis

The AI provider is selected through configuration and isolated
behind a provider/service interface.

The request contains only the finding and the minimum necessary
evidence; do not send an entire uploaded project by default.

Treat uploaded content and scanner text as untrusted data, not
instructions.

Validate model output against a defined schema.

Return: explanation, potential impact, remediation suggestion,
verification steps, and uncertainty/limitations.

If the provider is unavailable, show a clear recoverable error;
scanning and viewing results must continue to work.

Never represent model output as a verified scan result.

Never claim a proposed fix is applied or verified unless a separate,
real verification step establishes that.

Do not log API keys, uploaded source, or sensitive prompts.

FR-5: frontend

Minimum screens/components: - Dashboard/landing page with upload and
recent scan status. - Scan submission/validation states. - Scan detail
page with job status, findings summary, and findings list. - Finding
detail or expandable panel with scanner evidence and AI analysis. -
Operational status/incident view showing alert and responder activity. -
Loading, empty, error, and retry states. - Responsive, accessible
baseline styling.

Avoid spending MVP time on elaborate animations or advanced visual
design.

FR-6: operational responder

Accept authenticated or otherwise safely constrained Alertmanager
webhooks; validate payload structure and protect the endpoint
against arbitrary public invocation.

Only handle the specific configured alert type(s).

Responder is LLM-driven but policy-gated. Tools: get_scan,
get_telemetry_summary, retry_scan, escalate. A deterministic policy
layer checks that the scan is failed, internal, retry-eligible and
never retried, regardless of what the model asks. If the model is
unavailable or returns invalid output, the policy runs alone. The
model never sees source code.

Read approved job metadata and correlated telemetry.

Permit at most one retry per eligible failed scan job.

Record alert_fingerprint, investigation summary, attempted action,
result, timestamps, and trace/job correlation. responder_events has a
unique constraint on (alert_fingerprint, scan_id).

The retry is guarded by an atomic UPDATE scans SET attempt_count = 2,
status = 'queued' WHERE id = ? AND status = 'failed' AND
attempt_count = 1; zero rows affected means no retry.

Make actions idempotent and resistant to duplicate webhook
deliveries.

Do not execute arbitrary shell commands, modify uploaded source,
alter security controls, access secrets, or deploy production code.

Stop and escalate when information is insufficient, the action is
not allowlisted, or the retry fails.

Demonstrate the alert-to-agent-to-recovery path with a repeatable
test or controlled failure scenario.

5. Proposed technology stack

Use these technologies unless a documented constraint requires an
approved change.

Frontend

React

TypeScript

Vite

Tailwind CSS

Vitest

React Testing Library

Backend and scanning

Python

FastAPI

Pydantic

SQLAlchemy

Alembic

pytest

Bandit

pip-audit (stretch goal)

Data

PostgreSQL as the persistent database.

Use database migrations; do not rely on manually created production
tables.

AI

One available model API selected after checking actual access, cost,
limits, and deployment feasibility.

Provider-neutral service interface and environment-based
configuration.

Do not assume coding-agent model access also provides an application
API.

Runtime and delivery

Docker and Docker Compose.

GitHub Actions.

A free/low-cost hosting arrangement selected only after checking
current limits and whether it can run the required services.

If a complete hosted observability stack is not viable on free
infrastructure, deploy the user-facing application and document/demo
the full operational workflow in a reproducible environment. Clearly
state what is deployed and what is demonstrated locally; never
misrepresent it as fully hosted.

Observability and alerting

OpenTelemetry instrumentation.

Prometheus metrics and alert rules.

Grafana dashboard(s).

Jaeger or a compatible trace UI.

Structured JSON logs with trace IDs where applicable.

Alertmanager webhook to the responder service.

Do not add Celery, Redis, Kubernetes, or another queue/orchestration
service unless a measured requirement proves it necessary. A small
database-backed worker process is preferred for the MVP.

6. Architecture principles

Prefer a modular monolith and a small worker process over many
microservices.

Keep business logic separate from HTTP routes, database access,
scanners, AI providers, and telemetry.

Use explicit typed schemas at boundaries.

Make long-running scan state persistent and observable.

Keep the UI usable if AI analysis is unavailable.

Use environment variables for configuration and secrets.

Provide .env.example with placeholders only; never commit secrets.

Make local setup reproducible with one documented command.

Use migrations, health checks, timeouts, bounded retries, and
graceful error handling.

Make critical operations testable without calling a real model or
public external service.

Keep provider and hosting decisions replaceable when practical.

7. Suggested repository layout

Adjust only when implementation provides a clear reason; update this
plan if the structure changes.

securescope-ai/
├── AGENTS.md
├── CLAUDE.md
├── plan.md
├── backlog.md
├── README.md
├── .env.example
├── .gitignore
├── docs/
│   ├── PROBLEM.md
│   ├── SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── OBSERVABILITY.md
│   ├── RUNBOOK.md
│   ├── AGENT_WORKFLOW.md
│   └── RUBRIC_EVIDENCE.md
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

This is a target layout, not a reason to create empty files or
directories before they are needed.

8. Data model --- initial proposal

Implement only the fields needed by the functional requirements. The
exact schema may evolve through migrations.

scans

id

status

original_filename (sanitized)

created_at, started_at, finished_at

error_code, failure_class (user_error or internal), and a safe,
user-readable error summary

attempt_count

trace_id or trace correlation metadata when available

findings

id

scan_id

scanner

native_id (nullable)

title

description or message

severity (nullable)

confidence (nullable)

file_path and line_number (nullable)

package_name, installed_version, fixed_version, advisory URL
(nullable)

evidence as bounded JSON

created_at

ai_analyses

id

finding_id

provider

model (if available)

structured explanation, impact, remediation, verification steps,
uncertainty

created_at

safe failure status/message when needed

responder_events

id

alert_fingerprint (unique with scan_id)

scan_id (nullable until resolved)

alert name and status

investigation summary

action attempted

outcome

created/updated timestamps

trace correlation metadata

Do not store API secrets, full raw environment dumps, or unnecessary
copies of uploaded source code.

9. API outline

Exact paths and payloads must be documented in the API implementation
and tests. This is the intended minimum contract:

GET /health/live --- process liveness.

GET /health/ready --- readiness including required dependencies.

POST /api/scans --- accept ZIP upload and create a scan job (requires
X-Demo-Token header when UPLOADS_ENABLED=true).

GET /api/scans --- list recent scan jobs, with bounded pagination.

GET /api/scans/{scan_id} --- scan status and summary.

GET /api/scans/{scan_id}/findings --- findings for a scan.

GET /api/findings/{finding_id} --- one finding and its evidence.

POST /api/findings/{finding_id}/analyze --- request AI analysis.

GET /api/scans/{scan_id}/responder-events --- operational recovery
events, or an equivalent bounded operational endpoint.

POST /internal/alerts/alertmanager --- constrained Alertmanager
webhook receiver (bearer token auth).

GET /metrics --- Prometheus scrape endpoint, restricted
appropriately in deployed environments; not publicly routed in demo
mode.

Do not expose internal endpoints or metrics indiscriminately on a public
deployment. Validate IDs, request sizes, and all external input.

10. Security and privacy requirements

Treat uploaded ZIP files, filenames, source files, dependency
manifests, scanner output, and model output as untrusted.

Never execute uploaded code, package scripts, or installation
commands.

Enforce upload, archive expansion, file-count, scan-time, and
output-size limits.

Use safe path handling; prevent ZIP Slip/path traversal and symlink
escapes.

Use subprocess calls with argument arrays, fixed executable paths,
controlled working directories, timeouts, and minimal environment
variables. Never interpolate user input into shell commands.

Run scanner processes with least privilege and no unnecessary
network access. For the stretch-goal pip-audit integration: only
requirements.txt is used, sanitized to name==version lines, invoked
with --no-deps --disable-pip, and network access is limited to the
vulnerability service.

Do not expose uploaded code or findings across users; no-auth MVP
must not be presented as a secure multi-user public service.

Public deployment is demo mode: UPLOADS_ENABLED plus an X-Demo-Token
for uploads, read-only with seeded sample scans otherwise, tight
limits, rate limiting, a banner against uploading sensitive code,
webhook bearer token, /metrics not publicly routed.

Restrict or disable public upload on a deployment unless abuse
controls, resource quotas, isolation, retention, and access
expectations are adequate.

Keep secrets out of source control, logs, traces, screenshots, and
test fixtures.

Do not send full projects to the LLM by default.

Apply timeouts, bounded retries, rate limits where appropriate, and
cost limits to model calls.

Keep telemetry free of source code, tokens, credentials, and
unnecessary personal data.

Record responder actions, limit its tools, enforce idempotency, and
require human intervention for actions outside the allowlist.

Failure classification: scans have failure_class (user_error or
internal). Only internal failures are alertable and retry-eligible.
User errors are rejected synchronously with 4xx where possible. Only
internal failures increment scan_failures_total{failure_class="internal"}.

Document residual risks honestly.

11. Testing strategy

Backend unit tests

ZIP validation and path traversal rejection.

Scanner-output parsing and normalization.

Scan state transitions.

AI response schema validation and provider failure handling.

Alert payload validation, idempotency, and responder action policy.

Resource/time-limit handling.

Frontend tests

Upload validation and submission.

Loading, empty, success, and failure states.

Scan status and finding rendering.

AI analysis display and provider error display.

Operational event display.

Integration tests

API + PostgreSQL persistence.

Scan job lifecycle with scanner calls mocked where appropriate.

Real scanner smoke test against a tiny safe fixture.

AI provider contract using a deterministic fake provider.

Alert webhook → responder → bounded retry → recorded outcome.

Duplicate alert delivery does not cause duplicate retries.

Fault injection: FAULT_INJECTION_ENABLED defaults to false, logs
startup warning if on, never set in production config; test asserts
default. Reserved filename fixture fails once then succeeds on retry;
another fails permanently to demo escalation.

End-to-end / operational verification

Run the application locally with the documented command.

Submit a known safe fixture and a fixture that produces a known
finding.

Trigger a controlled scan failure and prove the alert reaches the
responder.

Demonstrate successful recovery and failed-recovery escalation.

Run the CI pipeline and prove deployment/rollback behavior.

Tests must not depend on a paid model API, public network availability,
or nondeterministic AI output for the core CI path.

12. Observability and alert design

Required signals

Metrics: scan submissions, scan successes/failures, duration,
queue age/backlog if applicable, AI provider failures, responder
attempts and outcomes.

Traces: request → scan job → scanner execution → persistence;
alert/responder activity correlated where technically possible.

Logs: structured JSON, severity, event name, timestamp, scan/job
ID, and trace ID when available.

UI: Grafana dashboards and a trace viewer such as Jaeger, plus
an application operational view for recent responder events.

User-impact alert

Alert rule: increase(scan_failures_total{failure_class="internal"}[10m]) > 0.
Only internal failures increment scan_failures_total{failure_class="internal"}.
The responder queries eligible failed scans (failed, internal,
attempt_count = 1, finished within the window), max 3 per alert.

The exact rule must avoid excessive false alerts in a low-volume demo
environment. Provide a repeatable test/controlled failure path so the
alert can be demonstrated even when normal traffic is low.

Responder behavior

Alertmanager calls a constrained webhook with bearer token auth.

The receiver validates and deduplicates the alert using
alert_fingerprint.

The agent obtains approved telemetry and job metadata.

The agent is LLM-driven but policy-gated. Tools: get_scan,
get_telemetry_summary, retry_scan, escalate. A deterministic policy
layer checks that the scan is failed, internal, retry-eligible and
never retried, regardless of what the model asks. If the model is
unavailable or returns invalid output, the policy runs alone. The
model never sees source code.

One retry maximum for an eligible scan, guarded by atomic UPDATE.

It verifies final state and writes a responder event.

responder_events has a unique constraint on (alert_fingerprint, scan_id).

If retry is not safe or does not work, it records an escalation
outcome.

No unbounded loops, arbitrary command execution, code edits, or
production deployments.

13. CI/CD, deployment, and rollback

CI

On pull requests and pushes: - Install dependencies reproducibly. - Run
formatting/lint/type checks selected for the codebase. - Run backend
unit/integration tests. - Run frontend tests and production build. - Run
appropriate security/dependency checks. - Build container images. - Fail
the pipeline when required checks fail.

CD

Target the highest CI/CD rubric level that is feasible: - CI runs tests
on pull requests. - Successful changes deploy automatically to a
development environment where supported. - Production deployment
requires a manual approval/action (workflow_dispatch or protected
environment). - Deployment records the release/version and provides
health verification. - A rollback path returns to a previous known-good
release.

Hosting: immutable images tagged with the git SHA in GHCR; rollback
means redeploying the previous tag; WORKER_MODE=embedded|separate;
additive-only migrations; document what is deployed versus
demonstrated locally; host chosen at Milestone 7 after checking
current free-tier limits.

The exact host and release mechanism are to be selected after confirming
current free-tier constraints. A rollback plan must be real and
documented, not merely the word "rollback" in a README. Avoid
destructive database migrations; document migration compatibility and
recovery limitations.

14. Documentation and rubric evidence

Required project documentation: - README.md: purpose, problem
statement, functionality, expected behavior, screenshots/demo,
prerequisites, one-command local setup, configuration, tests, and
links to detailed docs. - plan.md: this source of truth. - backlog.md:
ordered implementation phases and acceptance checks. - AGENTS.md:
cross-agent rules and project conventions. - CLAUDE.md: compatibility
pointer to the shared instructions, not a separate source of truth. -
docs/PROBLEM.md: problem and target users. - docs/SPECIFICATION.md:
user stories and acceptance criteria. - docs/ARCHITECTURE.md:
components, boundaries, and data flow. - docs/SECURITY.md: upload and
responder security boundaries. - docs/TESTING.md: test commands and
strategy, including single `make test` command running backend unit,
integration, and frontend tests. - docs/DEPLOYMENT.md: environments,
CI/CD, deployment, rollback. - docs/OBSERVABILITY.md: metrics,
traces, logs, dashboards, alerts. - docs/RUNBOOK.md: failure
investigation and recovery. - docs/AGENT_WORKFLOW.md: development-agent
roles and use of the task tracker. - docs/RUBRIC_EVIDENCE.md:
criterion → implementation → verification evidence mapping.

A public task tracker is mandatory (GitHub Issues/Projects or
course-approved equivalent). Agents must use the actual tracker, link
implementation work to tasks, and update task status based on
evidence---not claim work complete without verification.

Two deployed environments are required: development (auto-deploy on
successful CI) and production (manual approval via workflow_dispatch or
protected environment).

15. Definition of done

The MVP is done only when: - The main user journey works end to end. -
The application persists scan results in PostgreSQL. - Bandit
integration behaves safely and predictably. - AI analysis is optional,
validated, and clearly labeled as advisory. - All three required test
categories exist and pass, runnable via single `make test` command
(also used by CI). - The project starts locally with the documented
single command. - Two deployed environments exist: development
(auto-deploy on successful CI) and production (manual approval via
workflow_dispatch or protected environment); CI/CD behavior is
demonstrated. - Rollback is documented and tested to a reasonable
extent. - Metrics, traces, structured logs, trace correlation, and UI
are demonstrated. - A user-impact alert triggers the responder
workflow. - The responder performs a bounded action, verifies the
outcome, and records it. - Security boundaries and limitations are
documented. - Every Zoomcamp rubric criterion is mapped to evidence in
docs/RUBRIC_EVIDENCE.md. - No secrets are committed and no uploaded
code is executed.

16. Approved decisions (2026-10-27)

Scope: Bandit is the only MVP scanner behind a scanner adapter
interface. pip-audit is a stretch goal (after Milestone 6).

ZIP retention: uploaded ZIP stored on a private volume keyed by scan
ID; deleted on completion and on user-error failure; after internal
failure kept at most 24 hours, deleted earlier once retry reaches
final outcome; each attempt extracts into its own temp workspace,
always deleted in a finally block.

Scans table adds failure_class (user_error or internal) next to
error_code. Only internal failures are alertable and retry-eligible.
User errors rejected synchronously with 4xx where possible. Only
internal failures increment scan_failures_total{failure_class="internal"}.

Fault injection: FAULT_INJECTION_ENABLED env var defaults to false,
logs a startup warning if enabled, never set in production config; a
test asserts the default. A reserved filename fixture fails once then
succeeds on retry; another fails permanently to demo escalation.

Responder: LLM-driven but policy-gated. Tools: get_scan,
get_telemetry_summary, retry_scan, escalate. A deterministic policy
layer checks that the scan is failed, internal, retry-eligible and
never retried, regardless of what the model asks. If the model is
unavailable or returns invalid output, the policy runs alone. The
model never sees source code.

Alert rule: increase(scan_failures_total{failure_class="internal"}[10m]) > 0.
The responder queries eligible failed scans (failed, internal,
attempt_count = 1, finished within the window), max 3 per alert.
responder_events has a unique constraint on (alert_fingerprint,
scan_id). The retry is guarded by an atomic UPDATE scans SET
attempt_count = 2, status = 'queued' WHERE id = ? AND status =
'failed' AND attempt_count = 1; zero rows affected means no retry.

Public deployment is demo mode: UPLOADS_ENABLED plus an X-Demo-Token
for uploads, read-only with seeded sample scans otherwise, tight
limits, rate limiting, a banner against uploading sensitive code,
webhook bearer token, /metrics not publicly routed.

Hosting: immutable images tagged with the git SHA in GHCR; rollback
means redeploying the previous tag; WORKER_MODE=embedded|separate;
additive-only migrations; document what is deployed versus
demonstrated locally; host chosen at Milestone 7 after checking
current free-tier limits.

17. Decision/change policy

Before changing a core decision, the coding agent must: 1. Explain the
constraint or benefit that motivates the change. 2. State which
requirements or acceptance criteria are affected. 3. Prefer the smallest
change that preserves rubric compliance. 4. Ask the owner when the
change alters product scope, permissions, cost, hosting, data handling,
or security boundaries. 5. Update this plan and relevant docs after
approval.

If an implementation detail is unspecified, choose the simplest secure
option consistent with this plan, document the decision, and continue.
Do not invent new product features merely because they are easy to
implement.