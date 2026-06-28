# clients.lol

This repository is a public database of VRChat clients. Client records live in
`clients/*.toml`; the filename is the client ID.

## Commands

```bash
bun install          # install dependencies
bun dev              # dev server at http://localhost:6521 (rebuilds on change)
bun run validate     # parse and validate all client TOML files
bun run build        # emit packages/web/dist/
bun run typecheck    # type-check both packages
bun run lint         # oxlint
bun run lint:fix     # oxlint --fix
bun run fmt          # oxfmt
bun run fmt:check    # oxfmt --check
```

## Architecture

This is a static site that publishes a database of VRChat clients as HTML and a public JSON API.

**Data → build → deploy pipeline:**

1. `clients/*.toml` — one file per client; the filename (minus `.toml`) becomes the client ID.
2. `packages/core/src/generate.ts` — reads every TOML with `Bun.Glob`, validates each against the Zod schema in `schema.ts`, and returns a sorted `Record<id, Client>`.
3. `packages/web/script/build.ts` — calls `generate()`, inlines minified JS/CSS via `Bun.build`, and writes `dist/index.html`, `dist/404.html`, and `dist/api.json`.
4. SST (`sst.config.ts`) deploys `dist/` to Cloudflare as a static site (`clients.lol` on the `master` stage).

`packages/core` is the only shared library; `packages/web` imports it as `@clients/core`.

The frontend (`packages/web/src/app.js`) is vanilla JS — no framework. Filtering, sorting, and row expansion are all handled client-side using `data-*` attributes baked into the HTML at build time. State is synced to URL query params.

## Client database work

Load the `client-database` skill before adding or updating a client record.
Treat its eligibility, evidence, schema, and field rules as mandatory.

Keep client PRs focused on one client. Do not commit generated files from
`packages/web/dist`.
