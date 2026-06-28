# clients.lol

An open-source database of VRChat clients.

## Development

Install dependencies and run the site locally:

```bash
bun install
bun dev
```

`bun dev` rebuilds the static site into `packages/web/dist` when files change
and serves it at `http://localhost:6521`. Set `PORT` to use a different port:

```bash
PORT=3000 bun dev
```

Validate changes before opening a PR:

```bash
bun run validate
bun run build
```

## Structure

```text
clients/              # Client TOML files
docs/                 # Contributor and database documentation
packages/core/        # TOML loader and schema validation
packages/web/         # Static site/API build script
packages/web/dist/    # Generated deploy output
```

## Adding a client

Each client is a TOML file in `clients/`. The filename is the client ID.

Read the [client database guide](docs/client-database.md) for eligibility, the
TOML template, accepted values, evidence requirements, and field rules.

1. Fork the repo.
2. Create a branch, for example `add-client-name`.
3. Add or update the client TOML file.
4. Follow the client database guide.
5. Run `bun run validate`.
6. Run `bun run build`.
7. Commit the file and open a pull request.


## API

The public JSON endpoint is:

```text
https://clients.lol/api.json
```
