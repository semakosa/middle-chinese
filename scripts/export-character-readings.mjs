#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import TshetUinh from "tshet-uinh";
import { 推導方案 } from "tshet-uinh-deriver-tools";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const ACTION = {
  defaults: {
    output_path: path.join(ROOT, "character-readings.csv"),
    profile_name: "main",
  },
  sources: {
    upstream: {
      base_url: "https://raw.githubusercontent.com/nk2028/tshet-uinh-examples/main",
      position: "position.js",
      baxter: "baxter.js",
    },
    local_rules: {
      emc: {
        path: path.join(ROOT, "rules", "emc-wg2026-semakosa.js"),
        label: "emc-wg2026-semakosa",
      },
      lmc: {
        path: path.join(ROOT, "testing", "rules", "lmc-semakosa.js"),
        label: "lmc-semakosa",
        variants: [
          {
            field: "lmc",
            options: { 演變階段: "普通晚期中古" },
          },
          {
            field: "nw",
            options: { 演變階段: "晚期中古（西北）" },
          },
          {
            field: "nw_late",
            options: { 演變階段: "晚期河西漢語" },
          },
        ],
      },
    },
  },
  reference_csv_paths: [
    path.join(ROOT, "character-readings.csv"),
    path.join(ROOT, "testing", "character-readings-with-lmc.csv"),
    path.join(ROOT, "webapp", "public", "character-readings.csv"),
  ],
  profiles: {
    main: {
      key: "main",
      output_path: path.join(ROOT, "character-readings.csv"),
      source_rules: ["emc"],
      headers: ["character", "position", "baxter", "emc"],
      includes_lmc: false,
    },
    withLmc: {
      key: "withLmc",
      output_path: path.join(ROOT, "testing", "character-readings-with-lmc.csv"),
      source_rules: ["emc", "lmc"],
      headers: ["character", "position", "baxter", "emc", "lmc", "nw", "nw_late"],
      includes_lmc: true,
    },
  },
};

function makeDeriver(source, label, options = {}) {
  const rawDeriver = new Function(
    "TshetUinh",
    "選項 = {}",
    "音韻地位",
    "字頭 = null",
    source,
  ).bind(undefined, TshetUinh);

  try {
    return new 推導方案(rawDeriver)(options);
  } catch (error) {
    throw new Error(`Failed to initialize deriver: ${label}`, { cause: error });
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  values.push(current);
  return values;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/u.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function compareByCodePoint(a, b) {
  return (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0);
}

async function tryFetchText(url) {
  try {
    return await fetchText(url);
  } catch {
    return null;
  }
}

async function loadReferenceReadings() {
  for (const csvPath of ACTION.reference_csv_paths) {
    try {
      const text = await fs.readFile(csvPath, "utf8");
      const lines = text.split("\n").map(line => line.replace(/\r$/, "")).filter(line => line.trim());
      if (lines.length < 2) continue;

      const headers = parseCSVLine(lines[0]);
      const characterIndex = headers.indexOf("character");
      const positionIndex = headers.indexOf("position");
      const baxterIndex = headers.indexOf("baxter");
      const emcIndex = headers.indexOf("emc_unt_semakosa") >= 0
        ? headers.indexOf("emc_unt_semakosa")
        : headers.indexOf("emc");
      if (characterIndex < 0 || positionIndex < 0 || baxterIndex < 0) continue;

      const rows = new Map();
      for (const line of lines.slice(1)) {
        const cols = parseCSVLine(line);
        const key = `${cols[characterIndex]}\t${cols[positionIndex]}`;
        rows.set(key, {
          position: cols[positionIndex],
          baxter: cols[baxterIndex],
          emc: emcIndex >= 0 ? cols[emcIndex] : undefined,
        });
      }
      if (rows.size > 0) return rows;
    } catch {
      /* try next reference CSV */
    }
  }

  return new Map();
}

async function main() {
  const profileName = process.argv[3] === "with-lmc" ? "withLmc" : ACTION.defaults.profile_name;
  const profile = ACTION.profiles[profileName];
  const outputPath = path.resolve(process.argv[2] ?? profile.output_path ?? ACTION.defaults.output_path);
  const selectedRuleNames = profile.source_rules ?? [];
  const rulePaths = {
    emc: ACTION.sources.local_rules.emc.path,
    lmc: ACTION.sources.local_rules.lmc.path,
  };
  const [positionSource, baxterSource, emcSource, lmcSource, referenceReadings] = await Promise.all([
    tryFetchText(`${ACTION.sources.upstream.base_url}/${ACTION.sources.upstream.position}`),
    tryFetchText(`${ACTION.sources.upstream.base_url}/${ACTION.sources.upstream.baxter}`),
    selectedRuleNames.includes("emc")
      ? fs.readFile(rulePaths.emc, "utf8")
      : null,
    selectedRuleNames.includes("lmc")
      ? fs.readFile(rulePaths.lmc, "utf8")
      : null,
    loadReferenceReadings(),
  ]);

  const derivePosition = positionSource
    ? makeDeriver(positionSource, "position")
    : (音韻地位 => 音韻地位.描述);
  const deriveBaxter = baxterSource
    ? makeDeriver(baxterSource, "baxter")
    : null;
  const deriveEmcWg2026Semakosa = emcSource
    ? makeDeriver(emcSource, ACTION.sources.local_rules.emc.label)
    : null;
  const deriveVariants = lmcSource
    ? ACTION.sources.local_rules.lmc.variants.map(variant => ({
      field: variant.field,
      derive: makeDeriver(
        lmcSource,
        `${ACTION.sources.local_rules.lmc.label}:${variant.field}`,
        variant.options,
      ),
    }))
    : [];

  const rows = [];
  const seen = new Set();

  for (const 音韻地位 of TshetUinh.資料.iter音韻地位()) {
    for (const entry of TshetUinh.資料.query音韻地位(音韻地位)) {
      const key = `${entry.字頭}\t${音韻地位.描述}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const position = derivePosition(音韻地位, entry.字頭);
      const referenceReading =
        referenceReadings.get(`${entry.字頭}\t${position}`) ??
        referenceReadings.get(`${entry.字頭}\t${音韻地位.描述}`);

      rows.push({
        character: entry.字頭,
        position,
        baxter: deriveBaxter
          ? deriveBaxter(音韻地位, entry.字頭)
          : referenceReading?.baxter ?? "",
        emc: deriveEmcWg2026Semakosa?.(音韻地位, entry.字頭),
        ...Object.fromEntries(deriveVariants.map(({ field, derive }) => [field, derive(音韻地位, entry.字頭)])),
      });
    }
  }

  rows.sort((a, b) =>
    compareByCodePoint(a.character, b.character) ||
    a.position.localeCompare(b.position, "zh-Hant-u-co-stroke") ||
    a.baxter.localeCompare(b.baxter)
  );

  const lines = [
    profile.headers.join(","),
    ...rows.map(row => {
      const values = [
        row.character,
        row.position,
        row.baxter,
        row.emc,
      ];

      if (profile.includes_lmc) {
        values.push(row.lmc, row.nw, row.nw_late);
      }

      return values.map(csvEscape).join(",");
    }),
  ];

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");

  const uniqueCharacters = new Set(rows.map(row => row.character)).size;
  console.log(`Wrote ${rows.length} rows for ${uniqueCharacters} unique characters to ${outputPath}`);
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

await main();
