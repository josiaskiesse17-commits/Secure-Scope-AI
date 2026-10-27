# Testing

**Status**: Completed in Milestone 4 (Issue #5) — Complete test coverage and security hardening

## Planned Outline (from plan.md section 11)

### Backend Unit Tests
- ZIP validation and path traversal rejection.
- Scanner-output parsing and normalization.
- Scan state transitions.
- AI response schema validation and provider failure handling.
- Alert payload validation, idempotency, and responder action policy.
- Resource/time-limit handling.
- Fault injection: `FAULT_INJECTION_ENABLED` defaults to false, logs startup warning if on, never set in production config; test asserts default. Reserved filename fixture fails once then succeeds on retry; another fails permanently to demo escalation.

### Frontend Tests
- Upload validation and submission.
- Loading, empty, success, and failure states.
- Scan status and finding rendering.
- AI analysis display and provider error display.
- Operational event display.

### Integration Tests
- API + PostgreSQL persistence.
- Scan job lifecycle with scanner calls mocked where appropriate.
- Real scanner smoke test against a tiny safe fixture.
- AI provider contract using a deterministic fake provider.
- Alert webhook → responder → bounded retry → recorded outcome.
- Duplicate alert delivery does not cause duplicate retries.

### End-to-End / Operational Verification
- Run the application locally with the documented command.
- Submit a known safe fixture and a fixture that produces a known finding.
- Trigger a controlled scan failure and prove the alert reaches the responder.
- Demonstrate successful recovery and failed-recovery escalation.
- Run the CI pipeline and prove deployment/rollback behavior.

### Test Requirements
- Tests must not depend on a paid model API, public network availability, or nondeterministic AI output for the core CI path.
- Critical workflow tests must not require a live paid LLM API or unreliable public network.
- Use deterministic fake providers for CI and a real-provider smoke test only when credentials are available.
- Do not weaken or delete a test merely to make a pipeline pass.
- If a test appears incorrect, explain why and propose a justified correction.
- Single `make test` command runs backend unit, integration, and frontend tests; also used by CI.

*Source: plan.md section 11; backlog.md Milestone 4; plan.md section 15 (Definition of done)*