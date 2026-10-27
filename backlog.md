This is the ordered delivery backlog. Keep it to meaningful milestones
rather than dozens of microtasks. Track work in the project's GitHub
Issues/Projects (or the course-approved public tracker) and link each
issue to the relevant milestone below.

Rules: Work in order unless a dependency justifies otherwise. Each
milestone must meet its acceptance checks before being marked
complete. Do not mark work complete based only on generated code; run
the checks and retain evidence.

Milestone 0 --- Repository, requirements, and tracker

Outcome: The project has a stable source of truth before application
implementation begins.

Rubric criteria: Product Specification (tracker), Agent Team Specification, Context Management

Tasks: - Create the repository and baseline branch strategy. - Add
plan.md, backlog.md, AGENTS.md, and CLAUDE.md. - Add
problem/specification, architecture, security, testing, deployment,
observability, runbook, agent workflow, and rubric-evidence docs. -
Create a public task tracker if required by the course; record
acceptance criteria and link issues to this backlog. - Define the agent
roles and rules for updating tracker status. - Confirm the exact
Zoomcamp rubric and keep a criterion-to-evidence checklist.

Acceptance checks: - A new coding agent can understand the product and
constraints from repository docs without chat history. - Every rubric
item has a planned deliverable and verification method. - No application
feature is started before the product boundaries and core acceptance
criteria are documented.

Milestone 1 --- Local development foundation

Outcome: A reproducible, minimal full-stack skeleton.

Rubric criteria: Application (skeleton), Containerization (docker-compose), Testing (smoke tests)

Tasks: - Create the React/TypeScript/Vite frontend. - Create the FastAPI
backend with typed request/response schemas and health endpoints. -
Configure PostgreSQL, SQLAlchemy, and Alembic migrations. - Add
Dockerfiles and Docker Compose for the required local services. - Add
.env.example, .gitignore, formatting/lint conventions, and a clear
README setup command. - Add a minimal smoke test for the frontend,
backend, and database connection.

Acceptance checks: - A developer can start the required application
stack with one documented command. - /health/live and /health/ready
behave correctly. - Database migrations run from a clean database. - No
secrets are stored in the repository.

Milestone 2 --- Safe upload and scan lifecycle

Outcome: Users can submit a Python ZIP and see a persistent scan
job.

Rubric criteria: Application (scan flow), Testing (unit/integration), Containerization (services)

Tasks: - Implement upload validation, safe archive
inspection/extraction, and cleanup. - Implement scan persistence and
explicit status transitions. - Implement a simple database-backed worker
process or equivalent small job mechanism; avoid adding a heavy queue
unless needed. - Implement a scanner adapter interface: each adapter
takes a workspace path and returns normalized findings; orchestration
iterates over registered adapters. - Integrate Bandit using the adapter
interface with safe subprocess invocation, timeouts, bounded output,
and machine-readable results. - Normalize and persist findings. - Build
the upload form, scan status, scan details, and findings list.

Acceptance checks: - A valid fixture completes and its results persist
after backend restart. - A known vulnerable-pattern fixture yields an
expected Bandit finding. - Malformed ZIPs, ZIP Slip paths, oversized
archives, excessive file counts, timeouts, and scanner errors are safely
rejected or reported. - Uploaded code and setup scripts are never
executed. - Frontend loading, empty, success, and failure states are
tested. - Scanner adapter interface allows adding a new scanner without
changing orchestration code.

Milestone 3 --- AI finding explanations

Outcome: Users can request useful, bounded AI guidance for a
finding.

Rubric criteria: Application (AI analysis)

Tasks: - Confirm an accessible model API, cost/usage limits, and
deployment constraints. - Implement a provider-neutral AI service
interface and configuration. - Define and validate a structured response
schema. - Send only the selected finding and minimum required evidence;
treat source/scanner text as untrusted. - Add explanation, potential
impact, remediation, verification steps, and uncertainty to the UI. -
Handle model timeout, quota, invalid output, and unavailable-provider
errors. - Add deterministic fake-provider tests for CI.

Acceptance checks: - A finding can be analyzed and the validated
response is persisted and displayed. - AI failure does not break
scanning or viewing existing results. - The UI makes clear that advice
is not a verified fix. - Core CI tests do not require a real paid or
external model API. - Secrets and full source code are not written to
logs.

Milestone 4 --- Complete test coverage and security hardening

Outcome: The core application has the required test categories and
safe boundaries.

Rubric criteria: Testing (unit, frontend, integration), Application (security hardening)

Tasks: - Add backend unit tests for validators, state transitions,
scanner parsers, AI output validation, and responder policy. - Add
frontend tests using Vitest and React Testing Library. - Add integration
tests for API + PostgreSQL and scan persistence. - Add scanner smoke
tests using controlled fixtures. - Add tests for timeouts, malformed
input, duplicate submissions where relevant, and safe error handling. -
Review ZIP extraction, subprocess use, resource limits, CORS, error
responses, temporary-file cleanup, and secret handling. - Document how
tests run locally and in CI.

Acceptance checks: - Unit, frontend, and integration tests are all
present and pass. - Critical security cases have explicit tests. - Test
results are reproducible and documented. - No test requires executing
untrusted uploaded project code.

Milestone 5 --- Observability and user-impact alert

Outcome: A failure can be followed across logs, metrics, and traces,
and an alert can be demonstrated.

Rubric criteria: Observability (metrics, traces, logs, UI), Alerting on User Impact

Tasks: - Instrument API requests, scan jobs, scanner execution, database
operations where appropriate, and responder activity with
OpenTelemetry. - Emit structured JSON logs with job/scan identifiers and
trace IDs where available. - Add Prometheus metrics for scan totals,
successes/failures, duration, and responder outcomes. - Configure
Prometheus, Grafana dashboards, and a trace UI such as Jaeger in the
reproducible observability environment. - Define a user-impact alert
rule based on scan processing failures, not CPU alone. - Configure
Alertmanager to deliver the alert to the responder webhook. - Add an
operational UI or view for recent alerts and responder events. -
Document the local demonstration and any hosting limitations honestly.

Acceptance checks: - A request/scan can be traced through relevant
components. - Logs and traces can be correlated using trace/job
identifiers. - Metrics and dashboards show the key user-impact
signals. - A controlled failure triggers the configured alert. - The
alert payload reaches the responder endpoint. - Telemetry contains no
secrets, uploaded source code, or unnecessary sensitive data.

Milestone 6 --- Bounded responder agent

Outcome: An alert causes an auditable, constrained investigation and
recovery attempt.

Rubric criteria: On-Call Agent

Tasks: - Define the allowed alert type, tool schemas, decision policy,
and escalation behavior. - Implement safe Alertmanager webhook
validation and deduplication/idempotency. - Implement read-only access
to approved job metadata and telemetry. - Implement one allowlisted
action: retry an eligible failed scan job once. - Add verification of
final scan state and persistent responder event records. - Add
safeguards against duplicate retries, unbounded loops, arbitrary shell
access, code modification, and production deployment. - Add integration
tests for success, retry failure, invalid alerts, duplicate delivery,
and escalation.

Acceptance checks: - A controlled alert wakes the responder. - The
responder inspects the relevant context and invokes only permitted
tools. - At most one retry is attempted for an eligible job. - The agent
verifies and records success or failure. - Duplicate alerts do not cause
duplicate recovery actions. - An unsafe or unhandled case stops and
escalates. - A repeatable end-to-end demonstration proves alert →
responder → action → verification.

Milestone 7 --- CI/CD, deployment, and rollback

Outcome: The app is deployed and the delivery path is automated and
demonstrable.

Rubric criteria: CI/CD (tests on PR, auto dev deploy, manual prod), Deployment (two environments)

Tasks: - Add GitHub Actions workflows for dependency setup, lint/type
checks, backend tests, frontend tests/build, security checks, and
container build. - Select a host after checking current free-tier
constraints and required services. - Configure automatic deployment to
development after successful CI where supported. - Configure manual
approval/action for production deployment. - Add health verification and
release/version tracking. - Document and test rollback to a known-good
release. - Ensure database migration strategy avoids unsafe destructive
changes. - If the full observability stack cannot run online for free,
clearly separate deployed services from the reproducible local
demonstration.

Acceptance checks: - Pull requests run the required CI checks and block
on failure. - Successful changes can reach a development environment
automatically where supported. - Production release requires an explicit
manual action. - A rollback path is documented and exercised or
demonstrated with a controlled test. - The deployed environment is
accessible to reviewers or a clear review/demo alternative is
documented. - Hosting limits, service sleep behavior, secrets, and known
limitations are documented.

Milestone 8 --- Final verification and course submission

Outcome: The project is reviewable and every rubric item has
evidence.

Rubric criteria: Problem Description, Product Specification, Agent Team Specification, Context Management, Application, Testing, Containerization, Deployment, CI/CD, Observability, Alerting on User Impact, On-Call Agent (all criteria complete)

Tasks: - Run the full local setup from a clean checkout. - Run all tests
and save CI evidence. - Demonstrate scanning a known fixture and
inspecting findings. - Demonstrate AI explanation with a real configured
provider if available, plus deterministic test coverage. - Demonstrate
controlled failure → alert → responder → bounded retry → verified
outcome. - Demonstrate deployment, CI/CD, and rollback path. - Complete
docs/RUBRIC_EVIDENCE.md with links/screenshots/log excerpts/CI runs
for every criterion. - Check README, screenshots, English docs, known
limitations, and security disclosures. - Complete the required peer
reviews on the course platform.

Acceptance checks: - A reviewer can reproduce the main journey using the
README. - Each Zoomcamp criterion maps to concrete implementation and
evidence. - The project does not claim functionality that was not
implemented and demonstrated. - Required peer reviews are completed
separately from project submission.

Priority rule

If time becomes constrained, preserve the rubric-critical workflow
first: 1. Safe full-stack scan flow with persistent results. 2. Required
tests and containerization. 3. Deployment and CI/CD with rollback. 4.
Correlated observability and a user-impact alert. 5. Actual
alert-triggered responder action with verification. 6. Documentation and
evidence. 7. UI polish and optional enhancements.

Do not drop a required criterion silently. If a requirement appears
infeasible, document the constraint and ask the owner before changing
scope.