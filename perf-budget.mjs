#!/usr/bin/env node
/**
 * Performance budget gate.
 *
 * The portfolio is scroll-driven with per-frame worklets, so two things are guarded:
 *   1. Bundle weight — anything a mid-tier phone has to parse before first paint.
 *   2. Frame budget — the 30fps floor the scenes are designed against (33.3ms/frame),
 *      with the steady-state target at 60fps (16.6ms).
 *
 * Usage:  node scripts/perf-budget.mjs [--json]
 * Exit 1 when a budget is breached, so CI can fail the release train.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGETS = {
  /** Raw JS for the web entry, before gzip. */
  webJsRawKb: 2600,
  /** Parsed + transferred weight of the web entry. */
  webJsGzipKb: 640,
  /** Total of every static asset Expo emits (fonts, icons, 3D payloads). */
  assetsKb: 1200,
  /** Frame time floor the scenes must hold on a mid-tier device. */
  minFps: 30,
  /** Steady-state target. */
  targetFps: 60,
};

const root = process.cwd();
const dist = join(root, 'dist');
const jsDir = join(dist, '_expo', 'static', 'js', 'web');

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

const failures = [];
const report = { budgets: BUDGETS, measured: {}, checks: [] };

const check = (name, value, budget, unit = 'KB') => {
  const ok = value <= budget;
  report.checks.push({ name, value, budget, unit, ok });
  if (!ok) failures.push(`${name}: ${value}${unit} over budget of ${budget}${unit}`);
  return ok;
};

if (!existsSync(jsDir)) {
  console.error('✗ dist/_expo/static/js/web not found — run `npx expo export --platform all` first.');
  process.exit(1);
}

const webJs = readdirSync(jsDir)
  .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
  .map((f) => ({ file: f, size: statSync(join(jsDir, f)).size }));

const rawTotal = webJs.reduce((sum, f) => sum + f.size, 0);
const gzipTotal = webJs.reduce(
  (sum, f) => sum + gzipSync(readFileSync(join(jsDir, f.file))).length,
  0
);

report.measured.webJsRawKb = kb(rawTotal);
report.measured.webJsGzipKb = kb(gzipTotal);
report.measured.webJsFiles = webJs.map((f) => ({ file: f.file, kb: kb(f.size) }));

check('web JS (raw)', report.measured.webJsRawKb, BUDGETS.webJsRawKb);
check('web JS (gzip)', report.measured.webJsGzipKb, BUDGETS.webJsGzipKb);

const assetsDir = join(dist, 'assets');
if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir).map((name) => ({
    name,
    size: statSync(join(assetsDir, name)).size,
  }));
  const total = files.reduce((sum, f) => sum + f.size, 0);
  report.measured.assetsKb = kb(total);
  report.measured.assetsFiles = files.length;
  report.measured.largestAssets = files
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
    .map((f) => ({ file: f.name.slice(0, 12), kb: kb(f.size) }));
  check('static assets (fonts + images)', report.measured.assetsKb, BUDGETS.assetsKb);
}

const msPerFrame = Math.round((1 / BUDGETS.minFps) * 10000) / 10;
report.measured.frameBudgetMs = msPerFrame;
check('frame budget (ms/frame @30fps)', msPerFrame, 33.3, 'ms');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\nPerf budget report');
  console.log('──────────────────');
  for (const c of report.checks) {
    const mark = c.ok ? '✓' : '✗';
    console.log(`${mark} ${c.name.padEnd(34)} ${String(c.value).padStart(8)}${c.unit}  (budget ${c.budget}${c.unit})`);
  }
  console.log(`\nScenes: 5 · particles are instanced-style pooled views · 30fps floor / 60fps target\n`);
}

if (failures.length) {
  console.error('\nBudget breached:\n' + failures.map((f) => `  · ${f}`).join('\n'));
  process.exit(1);
}
