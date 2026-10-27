# Deployment

**Status**: Completed in Milestone 7 (Issue #8) — CI/CD, deployment, and rollback

## Planned Outline (from plan.md sections 13, 15, 16)

### CI (GitHub Actions)
- On pull requests and pushes:
  - Install dependencies reproducibly.
  - Run formatting/lint/type checks selected for the codebase.
  - Run backend unit/integration tests.
  - Run frontend tests and production build.
  - Run appropriate security/dependency checks.
  - Build container images.
  - Fail the pipeline when required checks fail.

### CD
- Target highest feasible CI/CD rubric level:
  - CI runs tests on pull requests.
  - Successful changes deploy automatically to a development environment where supported.
  - Production deployment requires a manual approval/action (workflow_dispatch or protected environment).
  - Deployment records the release/version and provides health verification.
  - A rollback path returns to a previous known-good release.

### Hosting & Rollback
- Host chosen at Milestone 7 after checking current free-tier constraints.
- Immutable images tagged with the git SHA in GHCR.
- Rollback means redeploying the previous tag.
- `WORKER_MODE=embedded|separate`.
- Additive-only migrations; document migration compatibility and recovery limitations.
- Document what is deployed versus demonstrated locally; never misrepresent as fully hosted.
- If the full observability stack cannot run online for free, clearly separate deployed services from the reproducible local demonstration.
- A rollback plan must be real and documented, not merely the word "rollback" in a README.

### Definition of Done (plan.md section 15)
- Two deployed environments exist: development (auto-deploy on successful CI) and production (manual approval via workflow_dispatch or protected environment); CI/CD behavior is demonstrated.
- Rollback is documented and tested to a reasonable extent.

*Source: plan.md sections 13, 15, 16 (Approved decisions); backlog.md Milestone 7*