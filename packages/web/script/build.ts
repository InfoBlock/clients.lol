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

interface PageAssets {
  readonly app: string;
  readonly css: string;
  readonly template: string;
}

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

function minifyHtml(html: string): string {
  return `${html.trim().replaceAll(/>\s+</g, "><")}\n`;
}

function renderTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
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

function renderPage(clients: Record<string, ClientData>, assets: PageAssets): string {
  const rows = Object.values(clients);
  const statuses = [...new Set(rows.map((client) => client.status))].sort();
  const accessTypes = [...new Set(rows.map((client) => client.access))].sort();
  const operatingSystems = [...new Set(rows.map((client) => client.os))].sort();

  return renderTemplate(assets.template, {
    ACCESS_OPTIONS: accessTypes.map(option).join(""),
    APP: assets.app,
    CSS: assets.css,
    FEATURE_OPTIONS: featureNames
      .map(([key, label]) => `<option value="${key}">${escapeHtml(label)}</option>`)
      .join(""),
    GITHUB_URL: escapeHtml(config.github),
    OS_OPTIONS: operatingSystems.map(option).join(""),
    RESULT_TOTAL: String(rows.length),
    ROWS: renderRows(clients),
    STATUS_OPTIONS: statuses.map(option).join(""),
  });
}

function render404(template: string, css: string): string {
  return renderTemplate(template, { CSS: css });
}

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

const clients = await generate(clientsDir);
const app = await minifyAsset(path.join(srcDir, "app.js"));
const css = await minifyAsset(path.join(srcDir, "style.css"));
const indexTemplate = await Bun.file(path.join(srcDir, "index.html")).text();
const notFoundTemplate = await Bun.file(path.join(srcDir, "404.html")).text();

await Promise.all([
  writeFile(
    path.join(outDir, "index.html"),
    minifyHtml(renderPage(clients, { app, css, template: indexTemplate })),
  ),
  writeFile(path.join(outDir, "404.html"), minifyHtml(render404(notFoundTemplate, css))),
  writeFile(path.join(outDir, "api.json"), `${JSON.stringify(clients, null, jsonIndent)}\n`),
]);

console.log(`[build] built ${Object.keys(clients).length} clients into ${outDir}`);
