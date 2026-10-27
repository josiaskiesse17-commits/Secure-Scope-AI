This repository uses provider-neutral instructions so the project
remains maintainable when switching coding models or tools.

Before working, read these files in order: 1. AGENTS.md --- shared
instructions and mandatory security boundaries. 2. plan.md --- product
and technical source of truth. 3. backlog.md --- implementation
milestones and acceptance checks. 4. Relevant documentation under
docs/. 5. The active tracker issue and its acceptance criteria.

AGENTS.md is authoritative for agent behavior. plan.md is
authoritative for product scope and architecture. backlog.md is
authoritative for delivery order. This file intentionally does not
duplicate those specifications.

Additional operating guidance

Work only on the assigned task and follow its acceptance criteria.

Inspect existing files before editing; preserve unrelated work.

Ask before changing scope, cost, hosting, permissions, data
handling, or security boundaries.

Never execute uploaded project code or arbitrary commands from model
output.

Do not give the responder agent unrestricted shell access,
code-editing authority, or production-deployment authority.

Add tests with code changes and report exact commands/results.

Do not claim tests, deployments, tracker updates, or verification
occurred unless they actually did.

Keep this file aligned with AGENTS.md; do not create
provider-specific rules that conflict with the shared instructions.