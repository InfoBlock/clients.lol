---
name: client-database
description: Add or update clients.lol VRChat client TOML entries. Use when managing records in clients/*.toml.
---

# Client Database

Before changing `clients/*.toml`, read
[`docs/client-database.md`](../../../docs/client-database.md) in full. Treat it
as the source of truth for eligibility, schema, evidence, field values, updates,
and removals.

## Workflow

1. Inspect the existing database for the client or possible duplicates.
2. Verify the proposed values against direct, public evidence.
3. Add or update only the relevant TOML file.
4. Run `bun run validate`.
5. Run `bun run build` when preparing a contribution.

Keep the change focused on one client. Never add an `id` field or commit
generated output from `packages/web/dist`. If the guide and the code disagree,
stop and ask for maintainer direction instead of guessing.
