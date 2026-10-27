# Agent Workflow

## Development Agent Team

This project uses three lightweight roles. One model may perform more than one role but must keep responsibilities explicit.

*Source: AGENTS.md section 5*

### Planner
- Clarifies scope, acceptance criteria, task dependencies, and evidence.
- Keeps issues aligned with plan.md and backlog.md.
- Does not declare implementation complete.

### Implementer
- Implements only the assigned task.
- Adds or updates tests alongside code.
- Follows existing patterns and avoids unrelated changes.
- Reports exact files changed and commands run.

### Reviewer/Tester
- Checks changes against acceptance criteria and security constraints.
- Runs or reviews tests and looks for missing failure cases.
- Reports defects with reproduction steps.
- Does not approve based on appearance or agent assurances alone.

## Handoff Process

*Source: AGENTS.md section 5 (see docs/AGENT_WORKFLOW.md reference)*

1. **Planner** writes or refines the GitHub issue and acceptance criteria.
2. **Implementer** works on a branch named `issue-N-short-name` and opens a pull request containing `Closes #N`.
3. **Reviewer** verifies the acceptance criteria and test results.
4. The issue is closed only with a **completion report** posted as an issue comment.

### Completion Report Format
*Source: AGENTS.md section 11*

At the end of each task, the completion report must contain:
- **Implemented**: concise description
- **Files changed**: list
- **Verification**: exact commands and results
- **Acceptance criteria**: each passed, failed, or not verified
- **Risks/limitations**: remaining issues
- **Tracker**: issue/status update performed, or state that it was not performed

**Do not provide a broad success claim when any required acceptance criterion remains unverified.**

## Status Updates and Evidence Rules

*Source: AGENTS.md sections 4, 8, 10*

- Work on one tracker issue or one clearly bounded task at a time.
- Before coding, summarize the task, relevant acceptance criteria, files likely to change, and risks.
- Do not claim a task is complete until the relevant tests/checks have actually run.
- If a command cannot be run, state that clearly and identify the unverified behavior.
- Update the real task tracker with status, implementation summary, and test evidence when the connected environment permits.
- **Never fabricate tracker updates or evidence.**
- Do not report a commit, deployment, tracker update, or test run unless it actually occurred.
- For each task: 1) Add or update tests. 2) Run the narrow relevant tests. 3) Run broader checks when feasible. 4) Report exact commands and pass/fail results. 5) Identify tests not run and why.

## Runtime Responder Agent

*Source: plan.md section 16 (Approved decisions 2026-10-27)*

The runtime responder is a separate agent from the development team, documented here for completeness.

### Tools
- `get_scan` — retrieve scan job metadata
- `get_telemetry_summary` — retrieve correlated telemetry (logs, metrics, traces)
- `retry_scan` — request one retry of an eligible failed scan
- `escalate` — stop and escalate when unsafe or unhandled

### Deterministic Policy Layer
- The responder is LLM-driven but policy-gated.
- A deterministic policy layer checks that the scan is **failed**, **internal**, **retry-eligible**, and **never retried**, regardless of what the model asks.
- If the model is unavailable or returns invalid output, the policy runs alone.
- The model **never sees source code**.

### One-Retry Limit
- At most one retry per eligible failed scan job.
- Retry is guarded by atomic update:
  ```sql
  UPDATE scans SET attempt_count = 2, status = 'queued'
  WHERE id = ? AND status = 'failed' AND attempt_count = 1
  ```
- Zero rows affected means no retry.
- `responder_events` has a unique constraint on `(alert_fingerprint, scan_id)`.

### Escalation
- Stops and escalates when information is insufficient, the action is not allowlisted, or the retry fails.
- Does not loop or improvise privileged actions.
- No arbitrary shell commands, source code modification, security control changes, secret access, or production deployment.

### Alert Rule
- `increase(scan_failures_total{failure_class="internal"}[10m]) > 0`
- Responder queries eligible failed scans (failed, internal, attempt_count = 1, finished within window), max 3 per alert.
- Only internal failures increment `scan_failures_total{failure_class="internal"}` and are alertable/retry-eligible.
- User errors rejected synchronously with 4xx where possible.