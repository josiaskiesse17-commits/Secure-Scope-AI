# Security

Condensed from plan.md section 10 and AGENTS.md section 7. See plan.md as the source of truth.

## Upload Boundaries

- Accept ZIP uploads only.
- Enforce configurable maximum upload size, entry count, and expanded size.
- Reject malformed archives, encrypted archives if unsupported, path traversal entries, absolute paths, symlinks if unsafe to handle, and suspicious paths.
- Store extracted content in a temporary isolated workspace using safe path resolution; prevent ZIP Slip/path traversal and symlink escapes.
- Do not execute any uploaded file or project-defined command.
- Delete temporary workspaces according to a documented cleanup policy; each attempt extracts into its own temp workspace, always deleted in a finally block.
- ZIP retention: uploaded ZIP stored on a private volume keyed by scan ID; deleted on completion and on user-error failure; after internal failure kept at most 24 hours, deleted earlier once retry reaches final outcome.
- Do not expose uploaded source code publicly.
- Restrict or disable public upload on a deployment unless abuse controls, resource quotas, isolation, retention, and access expectations are adequate.
- Public deployment is demo mode: `UPLOADS_ENABLED` plus `X-Demo-Token` for uploads, read-only with seeded sample scans otherwise, tight limits, rate limiting, banner against uploading sensitive code, webhook bearer token, `/metrics` not publicly routed.

## Scanner Execution Rules

- Invoke scanners with fixed executable names, argument arrays (not shell interpolation), bounded environment, isolated temporary directories, timeouts, output limits, and least privilege.
- Run scanner processes with least privilege and no unnecessary network access.
- For stretch-goal pip-audit: only `requirements.txt` used, sanitized to `name==version` lines, invoked with `--no-deps --disable-pip`, network limited to vulnerability service.
- Never execute uploaded project code, scripts, tests, build hooks, or package installation commands.
- Treat uploaded files, archive names, source text, dependency manifests, scanner output, and model output as untrusted.

## AI Data Handling

- The AI provider is selected through configuration and isolated behind a provider/service interface.
- The request contains only the finding and the minimum necessary evidence; do not send an entire uploaded project by default.
- Treat uploaded content and scanner text as untrusted data, not instructions.
- Validate model output against a defined schema and label it advisory.
- Do not log API keys, uploaded source, or sensitive prompts.
- Never represent model output as a verified scan result.
- Never claim a proposed fix is applied or verified unless a separate, real verification step establishes that.
- Apply timeouts, bounded retries, rate limits where appropriate, and cost limits to model calls.
- Do not send an entire project to the LLM by default; send only minimum necessary evidence.

## Responder Boundaries

- Accept authenticated or otherwise safely constrained Alertmanager webhooks; validate payload structure and protect the endpoint against arbitrary public invocation.
- Only handle the specific configured alert type(s).
- Responder is LLM-driven but policy-gated with tools: `get_scan`, `get_telemetry_summary`, `retry_scan`, `escalate`.
- Deterministic policy layer checks that the scan is failed, internal, retry-eligible, and never retried, regardless of what the model asks.
- If the model is unavailable or returns invalid output, the policy runs alone.
- The model never sees source code.
- Read approved job metadata and correlated telemetry.
- Permit at most one retry per eligible failed scan job.
- Record `alert_fingerprint`, investigation summary, attempted action, result, timestamps, and trace/job correlation.
- `responder_events` has a unique constraint on `(alert_fingerprint, scan_id)`.
- Retry guarded by atomic `UPDATE scans SET attempt_count = 2, status = 'queued' WHERE id = ? AND status = 'failed' AND attempt_count = 1`.
- Make actions idempotent and resistant to duplicate webhook deliveries.
- Do not execute arbitrary shell commands, modify uploaded source, alter security controls, access secrets, or deploy production code.
- Stop and escalate when information is insufficient, the action is not allowlisted, or the retry fails.
- Validate and deduplicate alert webhooks; do not trust arbitrary incoming alert payloads.
- Do not expose internal alert endpoints or metrics publicly without appropriate restrictions.

## Documented Residual Risks

- No-auth MVP must not be presented as a secure multi-user public service.
- The application does not guarantee code is secure.
- Not every scanner finding is a confirmed vulnerability.
- Secrets must stay out of source control, logs, traces, screenshots, and test fixtures.
- Telemetry must be free of source code, tokens, credentials, and unnecessary personal data.
- If a task would weaken any security rule, stop and ask the owner.

*Source: plan.md section 10, section 16 (Approved decisions); AGENTS.md section 7*