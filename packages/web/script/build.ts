#!/usr/bin/env bun

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { generate, type ClientData } from "@clients/core";

import config from "../config";

const outDir = path.join(import.meta.dirname, "..", "dist");
const clientsDir = path.join(import.meta.dirname, "..", "..", "..", "clients");
const srcDir = path.join(import.meta.dirname, "..", "src");
const jsonIndent = 2;
const featureNames = [
  ["movement", "Movement"],
  ["esp", "ESP"],
  ["teleports", "Teleports"],
  ["vr", "VR"],
  ["crashers", "Crashers"],
  ["protections", "Protections"],
] as const;

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function bool(value: unknown): string {
  return value ? "Yes" : "No";
}

function option(value: string): string {
  return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
}

function repoIcon(): string {
  return `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.23.49-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.5 7.5 0 0 1 8 3.89c.68 0 1.36.09 2 .27 1.52-1.03 2.19-.82 2.19-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>`;
}

function minifyHtml(html: string): string {
  return `${html.trim().replaceAll(/>\s+</g, "><")}\n`;
}

async function minifyAsset(filePath: string): Promise<string> {
  const result = await Bun.build({
    entrypoints: [filePath],
    minify: true,
    target: "browser",
  });

  if (!result.success) {
    throw new Error(
      result.logs.map((log) => log.message).join("\n") || `${filePath} minification failed`,
    );
  }

  const [output] = result.outputs;
  if (!output) {
    throw new Error(`${filePath} minification produced no output`);
  }

  return output.text();
}

function renderRows(clients: Record<string, ClientData>): string {
  return Object.values(clients)
    .map((client) => {
      const enabledFeatures = featureNames
        .filter(([key]) => client.features[key])
        .map(([, label]) => label);
      const searchText = [
        client.name,
        client.type,
        client.os,
        client.status,
        client.website ?? "",
        client.access,
        client.staffQuality,
        enabledFeatures.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      let website = "-";
      if (client.website) {
        website = `<a href="${escapeHtml(client.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(client.website)}</a>`;
      }
      const featureRows = featureNames
        .map(
          ([key, label]) =>
            `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(bool(client.features[key]))}</dd></div>`,
        )
        .join("");

      return `<tr class="client-row" tabindex="0" aria-expanded="false" data-search="${escapeHtml(searchText)}" data-status="${escapeHtml(client.status)}" data-access="${escapeHtml(client.access)}" data-os="${escapeHtml(client.os)}" data-movement="${client.features.movement}" data-esp="${client.features.esp}" data-teleports="${client.features.teleports}" data-vr="${client.features.vr}" data-crashers="${client.features.crashers}" data-protections="${client.features.protections}"><td>${escapeHtml(client.name)}</td><td>${escapeHtml(client.type)}</td><td>${escapeHtml(client.os)}</td><td>${escapeHtml(client.status)}</td><td>${website}</td><td>${escapeHtml(client.access)}</td><td>${escapeHtml(client.staffQuality)}</td></tr><tr class="detail-row" hidden><td colspan="7"><div class="detail-panel"><dl>${featureRows}</dl></div></td></tr>`;
    })
    .join("");
}

function renderPage(clients: Record<string, ClientData>, css: string, app: string): string {
  const rows = Object.values(clients);
  const statuses = [...new Set(rows.map((client) => client.status))].sort();
  const accessTypes = [...new Set(rows.map((client) => client.access))].sort();
  const operatingSystems = [...new Set(rows.map((client) => client.os))].sort();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VRChat Client Database | clients.lol</title>
<meta name="description" content="An open-source database of VRChat clients with access, compatibility, and feature data.">
<meta property="og:title" content="VRChat Client Database | clients.lol">
<meta property="og:type" content="website">
<meta property="og:description" content="An open-source database of VRChat clients with access, compatibility, and feature data.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<main>
<section class="controls" aria-label="Controls">
<div class="search-control"><label for="search">Search</label><input id="search" type="search" autocomplete="off" placeholder="Search clients"></div>
<div class="filter-control"><label for="status-filter">Status</label><select id="status-filter"><option value="">All</option>${statuses.map(option).join("")}</select></div>
<div class="filter-control"><label for="access-filter">Access</label><select id="access-filter"><option value="">All</option>${accessTypes.map(option).join("")}</select></div>
<div class="filter-control"><label for="os-filter">OS</label><select id="os-filter"><option value="">All</option>${operatingSystems.map(option).join("")}</select></div>
<div class="filter-control"><label for="feature-filter">Feature</label><select id="feature-filter"><option value="">All</option>${featureNames.map(([key, label]) => `<option value="${key}">${escapeHtml(label)}</option>`).join("")}</select></div>
<a class="repo-link" href="${escapeHtml(config.github)}" target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub" title="GitHub repository">${repoIcon()}</a>
<button id="api-usage" type="button">API usage</button>
<button id="tools" type="button">Tools</button>
</section>
<p id="result-count" aria-live="polite">Showing ${rows.length} of ${rows.length}</p>
<div class="table-wrap">
<table id="clients-table">
<caption>VRChat client database. Click a row to show feature details.</caption>
<thead><tr>
<th class="sortable" data-column="name"><button type="button">Name <span class="sort-indicator"></span></button></th>
<th class="sortable" data-column="type"><button type="button">Type <span class="sort-indicator"></span></button></th>
<th class="sortable" data-column="os"><button type="button">OS <span class="sort-indicator"></span></button></th>
<th class="sortable" data-column="status"><button type="button">Status <span class="sort-indicator"></span></button></th>
<th class="sortable" data-column="website"><button type="button">Website <span class="sort-indicator"></span></button></th>
<th class="sortable" data-column="access"><button type="button">Access <span class="sort-indicator"></span></button></th>
<th class="sortable" data-column="staff-quality"><button type="button">Staff quality <span class="sort-indicator"></span></button></th>
</tr></thead>
<tbody>${renderRows(clients)}</tbody>
</table>
</div>
</main>
<dialog id="tools-modal">
<div class="modal-head"><h1>Tools</h1><button data-modal-close type="button" aria-label="Close">Close</button></div>
<div class="modal-body"><p>Useful tools from clients.lol.</p><p><a href="https://unicode.clients.lol" target="_blank" rel="noopener noreferrer">Unicode Text Tools</a></p></div>
</dialog>
<dialog id="api-modal">
<div class="modal-head"><h1>API usage</h1><button data-modal-close type="button" aria-label="Close">Close</button></div>
<div class="modal-body"><p>Fetch the client database as JSON.</p><pre><code>curl https://clients.lol/api.json</code></pre><p>Use the client name as the main lookup field.</p></div>
</dialog>
<script type="module">${app}</script>
</body>
</html>`;
}

function render404(css: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not found | clients.lol</title><style>${css}</style></head><body><main><p>Not found.</p><p><a href="/">Back to clients.lol</a></p></main></body></html>`;
}

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

const clients = await generate(clientsDir);
const app = await minifyAsset(path.join(srcDir, "app.js"));
const css = await minifyAsset(path.join(srcDir, "style.css"));

await Promise.all([
  writeFile(path.join(outDir, "index.html"), minifyHtml(renderPage(clients, css, app))),
  writeFile(path.join(outDir, "404.html"), minifyHtml(render404(css))),
  writeFile(path.join(outDir, "api.json"), `${JSON.stringify(clients, null, jsonIndent)}\n`),
]);

console.log(`[build] built ${Object.keys(clients).length} clients into ${outDir}`);
