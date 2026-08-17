# Trade

> [!WARNING]
> This project is for educational and informational purposes only. Nothing here constitutes financial advice. Always do your own research and consult a qualified financial advisor before making investment decisions.

A personal Claude Code plugin marketplace housing one options-trading skill — backed by a curated [Open Knowledge Format (OKF)](plugins/trade/skills/trade/references/OKF.md) library of 33 pitfalls and case studies (INTC, Mag-7, APP, NOK, TSEM, CBRS, SNOW, MDB, VIX, SATS, 6981, MU, NQ, NBIS).

**This is a fork of [`himself65/trade-skills`](https://github.com/himself65/trade-skills)**, rewired from the upstream Unusual Whales + Funda data stack onto **Massive (Polygon) + Alpaca**. See [Data stack](#data-stack) for what that changes — including what it gains, and what it can no longer do.

> [!IMPORTANT]
> **No API key belongs in this repository.** Both data tiers are reached through MCP servers that receive credentials from your environment or a secret manager at process start. Never commit a key, and never paste one into a skill file, a knowledge-dir note, or a commit message.

## Data stack

| Tier | Source | Covers |
|---|---|---|
| 1 | **Massive (Polygon)** | Options chains with greeks / IV / OI, tick-level option trades and quotes, equities, indices (VIX curve), **futures (NQ / ES 夜盘)**, Fed macro series, financials, earnings + surprise, analyst consensus, FINRA short interest, news with sentiment |
| 2 | **Alpaca** (read-only) | **Your own positions, cost basis, P&L, order history**, market calendar, plus a second quote / chain / greeks read for cross-checks |
| 3 | **TradingView** | TA readouts and indicator ratings, screeners, watchlists, alerts, chart screenshots |

**Honest ledger of the swap** — the skill states these in its own replies, and so should this README:

- **Derived, not read.** Dealer GEX, net options premium flow, IV rank, and off-exchange activity were vendor-*computed* fields upstream. Here they are **computed from the raw chain and tape** ([`massive-data.md`](plugins/trade/skills/trade/references/massive-data.md) §4). Each carries a provenance line and a stated bound.
- **Genuinely lost.** Exact multi-leg package reassembly, a true dark-pool feed, market tide, congressional trades, earnings-call transcripts, and 13F ownership have **no substitute**. The skill declares them unavailable instead of estimating into the gap (§6).
- **Genuinely gained.** Futures (夜盘) now work from first-party CME data, where the upstream vendor returned 500s.
- **Entitlement is not one block.** Verified 2026-08-16: this plan covers options, equities, futures, Fed macro, and the partner feeds (news / earnings / analysts) — but **indices 403** (`I:VIX`, `I:SPX`, `I:NDX`). So the **VIX term structure is still not solved**; it comes from TradingView or from entitled VX futures. Probe, don't assume.
- **Read-only by construction.** The Alpaca server is wired **without** the `trading` toolset, so no order-placement tool exists in the session at all. The skill never executes trades.

## Setup

### 1. Wire the data MCP servers

Both servers must be reachable before the skill is useful. Pick whichever path matches your setup.

**Massive (Polygon)** — set `MASSIVE_API_KEY` (or `POLYGON_API_KEY`) in your environment, then register the server:

```bash
claude mcp add --scope user polygon -- npx -y @polygon.io/mcp-server
```

**Alpaca** — read-only. Set `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` for a **paper** account (Alpaca's market-data entitlement is user-level, so paper keys return the same SIP/OPRA data as live, with no execution risk), then:

```bash
claude mcp add --scope user alpaca-paper-agent -- alpaca-mcp-server --transport stdio
```

Pin the read-only toolset in that server's environment — this is what makes the no-execution rule structural rather than aspirational:

```bash
ALPACA_PAPER_TRADE=true
ALPACA_TOOLSETS=account,assets,watchlists,stock-data,options-data,corporate-actions,news
```

> **If you use a secret manager** (this machine injects both from Infisical via launcher scripts in `~/.local/bin/`), point the MCP `command` at your launcher instead and let it inject the credentials into the child process. Keys then never touch disk, a dotfile, or this repo — which is the arrangement this fork assumes.

Verify both are up before installing the skill:

```bash
claude mcp list
```

### 2. Install the skill

**Claude Code — plugin (recommended):**

```bash
npx plugins add dsx1986/trade-skills
```

**Claude Code — skill only:**

```bash
npx skills add dsx1986/trade-skills
```

**Claude Code / Claude Desktop — from a clone.** Both read the same `~/.claude/skills/` directory, so one symlink installs for both. Note the **single** level of nesting: `~/.claude/skills/<name>/SKILL.md` is the only layout discovered — an extra directory level silently fails to load, with no warning.

```bash
git clone https://github.com/dsx1986/trade-skills.git ~/trade-skills
ln -sfn ~/trade-skills/plugins/trade/skills/trade ~/.claude/skills/trade
```

**Codex (CLI and desktop app):**

```bash
ln -sfn ~/trade-skills/plugins/trade/skills/trade ~/.codex/skills/trade
```

**Other agents:**

```bash
npx skills add dsx1986/trade-skills -a <agent-name>
```

Restart the desktop apps after symlinking; the CLIs pick the skill up on the next session.

### 3. Optional — scaffold your knowledge directory

```
/trade setup
```

Creates the substack / twitter / writedowns layout for your own collected research. It is **private and never committed back to this repo** — third-party articles and research digests belong there, not in `references/`.

## Available Skills

### Trade (`trade`)

Multi-leg options trading assistant with concrete strikes, IV-aware structures, and probability-weighted scenarios.

| Skill | Description |
|---|---|
| [trade](plugins/trade/skills/trade/) | Options trading knowledge base — 33 pitfalls + case studies (INTC, Mag-7, APP, NOK, TSEM, CBRS, SNOW, MDB, VIX, SATS, 6981, MU, NQ, NBIS) + structure-to-regime framework. Lazy-loaded, OKF-conformant. |

```
/trade setup                           # scaffold a personal knowledge directory
/trade import <file_path | url>        # parse a PDF / screenshot / text into YAML, or digest shared research
/trade report [tickers | basket]       # today's capital-flow (资金流向) read
/trade analysis [ticker | situation]   # default — trade analysis flow
/trade <natural language>              # any unrecognized first word routes to analysis
```

## Open Knowledge Format

The skill's knowledge base is an **[Open Knowledge Format (OKF) v0.1](plugins/trade/skills/trade/references/OKF.md)** bundle — a portable, vendor-neutral graph of markdown concept files with YAML frontmatter, navigable via `index.md` and version-controlled alongside the code. Each pitfall, case study, and framework is a typed concept.

- [`references/OKF.md`](plugins/trade/skills/trade/references/OKF.md) — type vocabulary, frontmatter schema, and conformance contract
- [`references/index.md`](plugins/trade/skills/trade/references/index.md) — the bundle root / graph entry point
- [`references/log.md`](plugins/trade/skills/trade/references/log.md) — chronological change history

Learn more about OKF: [Google Cloud announcement](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing/) · [spec & tooling](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf).

## Credits

Upstream project by [@himself65](https://github.com/himself65) — [`himself65/trade-skills`](https://github.com/himself65/trade-skills). Bugs in *this fork's* data layer are this fork's; report upstream issues to the upstream repo.

## License

MIT
