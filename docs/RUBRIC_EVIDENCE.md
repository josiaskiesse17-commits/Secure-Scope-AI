# Rubric Evidence Mapping

| Criterion | Max Points | What Earns Full Marks | Planned Deliverable | Verification Method | Evidence Link | Status |
|-----------|------------|----------------------|---------------------|---------------------|---------------|--------|
| Problem Description | 2 | README clearly describes problem, functionality, expected behavior | README.md with problem statement, features, user journey | Manual review of README | | Not started |
| Product Specification | 2 | Spec plus public task tracker with acceptance criteria and evidence agents used it | SPECIFICATION.md, public GitHub Issues/Projects tracker linked to backlog milestones | Review tracker issues, acceptance criteria, agent comments | | Not started |
| Agent Team Specification | 2 | Agents defined and how they work together | AGENTS.md section 5, docs/AGENT_WORKFLOW.md | Review agent roles, handoff process | | Not started |
| Context Management | 2 | AGENTS.md pointing to modular docs | AGENTS.md section 2 (read order), docs/ index | Verify AGENTS.md references all docs | | Not started |
| Application | 2 | Full stack end to end, persistence, single local command | React + FastAPI + PostgreSQL, Docker Compose up, scan → findings → AI analysis | Run `docker compose up`, submit ZIP, verify results persist | | Not started |
| Testing | 2 | Unit and integration, single command, passing | `make test` runs backend unit/integration + frontend tests, all pass in CI | Run `make test`, check CI logs | | Not started |
| Containerization | 2 | Full system including DB, single command | docker-compose.yml with app, worker, db, prometheus, grafana, jaeger, alertmanager | `docker compose up` starts all services | | Not started |
| Deployment | 2 | Public URL or clear demo | Dev auto-deploy URL, prod manual deploy URL, or documented local demo | Access deployed URLs or follow local demo guide | | Not started |
| CI/CD | 3 | Tests on PR, auto deploy to dev, manual prod | GitHub Actions: PR runs tests, dev auto-deploy on merge, prod manual workflow_dispatch | Open PR, merge to main, trigger prod deploy | | Not started |
| Observability | 2 | Metrics, traces, structured logs sharing a trace ID; no customer data/credentials; viewable in UI | OpenTelemetry, Prometheus, Grafana, Jaeger; trace ID correlation; sanitized logs | Submit scan, trace request through system, verify in Grafana/Jaeger | | Not started |
| Alerting on User Impact | 1 | At least one alert | Prometheus rule: `increase(scan_failures_total{failure_class="internal"}[10m]) > 0` | Trigger failure, verify alert fires in Alertmanager | | Not started |
| On-Call Agent | 2 | Agent wakes on alert and fixes the issue | Responder service: receives webhook, policy-gated retry, records event | Trigger alert, verify responder retries scan, records event | | Not started |

**Pass threshold**: 10 of 24 points  
**Mandatory**: Three peer reviews on course platform