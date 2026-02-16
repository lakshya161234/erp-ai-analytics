# Security Notes (PoC)

This PoC intentionally uses a **tool-restricted** design:
- The model does NOT get direct DB access.
- The model selects from a whitelist of tools.
- Each tool maps to a parameterized SQL query.

Recommended hardening steps for production:
- Add auth (JWT) + RBAC for tools
- Add tenant scoping (company_id/factory_id) to every tool query
- Add query timeouts and statement limits
- Add audit logs of tool calls (user, tool, args)
- Consider a second-pass validator that rejects unexpected args
