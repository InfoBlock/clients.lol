# clients.lol

This repository is a public database of VRChat clients. Client records live in
`clients/*.toml`; the filename is the client ID.

## Commands

- Install dependencies with `bun install`.
- Validate client records with `bun run validate`.
- Type-check the project with `bun run typecheck`.
- Build the site with `bun run build`.

## Client database work

Load the `client-database` skill before adding or updating a client record.
Treat its eligibility, evidence, schema, and field rules as mandatory.

Keep client PRs focused on one client. Do not commit generated files from
`packages/web/dist`.
