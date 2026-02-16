# Database (Demo)

This folder contains:
- `schema.sql` — minimal ERP-like schema used by the PoC tools
- `seed.sql` — generates demo clients, products, and ~60 days of orders

Run:

```bash
psql "$DATABASE_URL" -f schema.sql
psql "$DATABASE_URL" -f seed.sql
```
