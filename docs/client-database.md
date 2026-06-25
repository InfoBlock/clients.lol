# Client database guide

This is the source of truth for adding and updating records in `clients/`.

## Eligibility

Add only actual VRChat clients or menus with substantial client functionality.
Do not add products that are only bypasses, anti-cheat emulators, launchers,
loaders, injectors, marketplaces, reseller listings, services, or unrelated
products.

Verify the exact product. A vendor homepage, marketplace category, VRChat tag,
launch announcement, price, or generic storefront does not establish that a
client exists. If eligibility is ambiguous, ask a maintainer.

Do not create duplicate or renamed entries for an existing client. Update the
existing TOML file instead.

## File format

Use one lowercase, hyphenated TOML file per client:

```text
clients/example-client.toml
```

The filename is the client ID. Do not add an `id` field.

Use this template:

```toml
name = "Example Client"
os = "Windows"
type = "Standalone"
status = "Active"
staffQuality = "Unknown"
access = "Free"
website = "https://example.com"

[features]
movement = false
esp = false
teleports = false
vr = false
crashers = false
protections = false
```

`website` is optional. Omit it when there is no reliable public product URL or
invite.

## Accepted values

- `status`: `Active`, `Inactive`, `Discontinued`, `Unknown`
- `staffQuality`: `Excellent`, `Good`, `Average`, `Poor`, `Unknown`
- `access`: `Free`, `Invite`, `Paid`
- feature values: `true` or `false`

`name`, `os`, and `type` must be non-empty strings. `website` must be a valid
URL. The schema does not provide `Unknown` values for `os` or `type`, so do not
guess either field.

## Evidence

Use sources in this order:

1. Official product pages or documentation.
2. Official release announcements.
3. Official demonstration videos.
4. Public official Discord channels.

Private messages and unsupported staff claims do not count. Community reports
may corroborate or dispute official claims, but cannot be the only evidence that
a client or feature exists. Specific, documented community reports may support
`Poor`, `Inactive`, or scam findings.

When sources conflict, prefer the newest first-party source. Archived sources
may establish historical facts but cannot establish that a client is active.

## Data quality

- Do not invent websites, dates, features, status, access, staff quality, OS, or
  type.
- Require direct evidence for every feature set to `true`.
- Use `false` when a feature cannot be verified. Here, `false` means not
  verified; it does not prove the feature is unsupported.
- Point `website` directly to the client product when possible.
- Use `Unknown` when the schema permits it and evidence is unavailable.
- Use `Invite` for private or gated clients even when payment is required.

## Status

- `Active`: require a current release, working download or purchase path, or
  recent official maintenance evidence.
- `Inactive`: the client exists but is no longer maintained or currently usable.
- `Discontinued`: require explicit evidence that it ended permanently.
- `Unknown`: use when evidence is missing or conflicts.

A temporarily unreachable website is acceptable when another official source
verifies the client. Do not retain a dead link without replacement evidence.

## Access

- `Free`: publicly obtainable without payment.
- `Paid`: publicly purchasable.
- `Invite`: private, application-based, role-gated, or otherwise restricted,
  even when payment is also required.

Invite-only clients are allowed when their identity and existence are
verifiable. Leave unverified features `false`.

## Staff quality

Default to `Unknown`.

- `Excellent`: require a long, independently supported history of exceptional
  service.
- `Good`: require an established positive support record.
- `Average`: use for a mixed or limited support record.
- `Poor`: require documented neglect, abuse, scams, or persistent unresolved
  problems.

Vendor-hosted ratings alone never justify a staff-quality rating.

## Updates and removals

Apply the same evidence standard to new entries and updates. Remove an entry
only with evidence that the client was discontinued, fraudulent, renamed,
duplicated, or otherwise no longer belongs in the database.

## Pull requests

- Add or update one client per PR.
- Keep unrelated changes out of client PRs.
- Include sources and explain uncertain fields.
- Do not commit generated files such as `packages/web/dist`.
- Run `bun run validate` and `bun run build` before opening the PR.
