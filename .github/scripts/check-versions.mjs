#!/usr/bin/env node
/**
 * Assert that `.claude-plugin/marketplace.json` stays in sync with each
 * plugin's own `plugins/<name>/plugin.json`.
 *
 * Why this exists: the two files are bumped by two different mechanisms
 * (`ccbump` touches the marketplace manifest, plugin.json has been edited by
 * hand at release time) and nothing tied them together. The drift is silent —
 * the release workflow only packages the skill directories, so a stale
 * marketplace.json never shows up in a release artifact. It only shows up for
 * people running `npx plugins add himself65/trade-skills`, which reads the
 * manifest off the default branch. v2.4.0 and v2.5.0 both shipped with
 * marketplace.json still pinned at 2.3.0.
 *
 * Checks:
 *   1. every marketplace `plugins[]` entry resolves to a real plugin.json
 *   2. each entry's `version` equals that plugin.json's `version`
 *   3. `metadata.version` equals the highest plugin version
 *
 * Usage: node .github/scripts/check-versions.mjs   (or: pnpm check:versions)
 * Exits 1 with a diff-style report on any mismatch.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()
const manifestPath = join(root, '.claude-plugin', 'marketplace.json')
const errors = []
let hasDrift = false

function readJson(path, label) {
  if (!existsSync(path)) {
    errors.push(`${label}: file not found at ${path}`)
    return null
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    errors.push(`${label}: invalid JSON — ${err.message}`)
    return null
  }
}

/** Numeric-segment semver compare; returns >0 when a is newer than b. */
function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

const manifest = readJson(manifestPath, '.claude-plugin/marketplace.json')

if (manifest) {
  const entries = Array.isArray(manifest.plugins) ? manifest.plugins : []
  if (entries.length === 0) {
    errors.push('.claude-plugin/marketplace.json: `plugins` is missing or empty')
  }

  const pluginVersions = []

  for (const entry of entries) {
    const name = entry.name ?? '<unnamed>'
    if (!entry.source) {
      errors.push(`plugins["${name}"]: missing \`source\``)
      continue
    }
    const pluginPath = resolve(root, entry.source, 'plugin.json')
    const plugin = readJson(pluginPath, `plugins["${name}"] -> ${entry.source}/plugin.json`)
    if (!plugin) continue

    if (entry.version !== plugin.version) {
      hasDrift = true
      errors.push(
        `version drift for plugin "${name}":\n` +
          `    - .claude-plugin/marketplace.json → plugins["${name}"].version = ${JSON.stringify(entry.version)}\n` +
          `    + ${entry.source}/plugin.json → version = ${JSON.stringify(plugin.version)}`,
      )
    }
    if (plugin.version) pluginVersions.push(plugin.version)
  }

  if (pluginVersions.length > 0) {
    const highest = pluginVersions.reduce((a, b) => (compareVersions(a, b) >= 0 ? a : b))
    const metaVersion = manifest.metadata?.version
    if (metaVersion !== highest) {
      hasDrift = true
      errors.push(
        'marketplace metadata version does not match the highest plugin version:\n' +
          `    - .claude-plugin/marketplace.json → metadata.version = ${JSON.stringify(metaVersion)}\n` +
          `    + highest plugin.json version = ${JSON.stringify(highest)}`,
      )
    }
  }
}

if (errors.length > 0) {
  console.error('✗ Version consistency check failed:\n')
  for (const err of errors) console.error(`  ${err}\n`)
  if (hasDrift) {
    console.error(
      'Fix: bump `.claude-plugin/marketplace.json` (metadata.version and every\n' +
        'plugins[].version) to match the plugin manifests, then re-run this check.\n',
    )
  }
  process.exit(1)
}

console.log('✓ marketplace.json and plugin manifests agree on versions')
