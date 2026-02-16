# Demo Script — ERP AI Analytics PoC

## Goal
Show that the assistant can answer business questions by safely querying Postgres via pre-defined analytics tools.

## Setup checklist
1) Start Postgres (local or Neon)
2) Run schema + seed
3) Start API: `apps/api`
4) (Optional) Start Web: `apps/web`

## Suggested 5-minute demo flow

1) **Health check**
   - Open `/health` and show API is up.

2) **Question 1: last month top sold product**
   - Ask: "What was last month's most sold product?"
   - Explain: model selects `sales.top_products` with a date range.

3) **Question 2: revenue**
   - Ask: "Show revenue for last 30 days."
   - Explain: model uses `revenue.summary`.

4) **Question 3: top clients**
   - Ask: "Top 3 clients by revenue this month."
   - Explain: model uses `clients.top_by_revenue` and returns rows + narrative.

## What to emphasize
- Tool-restricted approach (safe by design)
- SQL is controlled by you, not generated at runtime
- Output is structured JSON + readable explanation
