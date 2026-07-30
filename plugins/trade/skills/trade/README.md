# Trade

Multi-leg options trading assistant — concrete strikes, IV-aware structures, probability-weighted scenarios. Single skill with four subcommands, modeled on the [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) pattern.

## Commands

```
/trade setup                           # scaffold a personal knowledge directory
/trade import <file_path | url>        # parse one PDF / screenshot / text artifact into YAML, or digest shared research
/trade report [tickers | basket]       # today's capital-flow read
/trade analysis [ticker | situation]   # default — trade analysis flow
/trade <natural language>              # any unrecognized first word routes to analysis
```

Each subcommand has its own reference file under `references/commands/`. The main `SKILL.md` carries always-on context (Hard Rule, Response Rules, Core Principles, Structure-to-Regime matrix) plus the routing logic.

## Triggers

- Trade analysis requests, options strategy recommendations, post-mortems
- Mentions of multi-leg structures: Jade Lizard, bull put / bear call spread, iron condor, diagonal, calendar
- Earnings positioning, IV / IV crush, channel checks, AH price action
- Any single-stock options play in a US-equity context
- Personal-knowledge management: "save this substack post", "parse this tweet screenshot", "set up my trade knowledge"

Full trigger list in the `description` field of `SKILL.md`.

## Platform

**CLI only** — primary market data via the headless TradingView MCP (`finance-data-providers:tradingview-mcp`, bundled server, no app/login); TradingView desktop reader (`finance-data-providers:tradingview-reader`) for options greeks / IV skew / watchlists / alerts; Funda AI API (`finance-data-providers:funda-data`) for fundamentals, options flow / GEX, transcripts, sentiment, etc.

## Setup

1. Install the [`finance-skills`](https://github.com/himself65/finance-skills) plugin marketplace and the `finance-data-providers:tradingview-mcp`, `finance-data-providers:tradingview-reader`, and `finance-data-providers:funda-data` skills (the `finance-data-providers` plugin bundles the [tradingview-mcp](https://github.com/atilaahmettaner/tradingview-mcp) server — requires `uv`).
2. Set the Funda API key (read from repo-root `.env` so worktrees inherit):
   ```bash
   export FUNDA_API_KEY="your-funda-api-key"
   ```
3. (Optional) Run `/trade setup` once to scaffold a personal knowledge directory for substack posts, X / twitter threads, and writedowns.

## Reference Files

### Always-relevant frameworks

| File | Description |
|---|---|
| `references/strategies.md` | Structure-to-regime matching, LEAPS stock replacement, setup checklist, position management |
| `references/gamma-framework.md` | Dealer GEX + options chain + IV term + flow → multi-factor probability map |
| `references/price-action-framework.md` | Orderbook microstructure mental model — buy/sell imbalance, vacuum zones, consensus shifts |
| `references/macro-framework.md` | Macro judgment pipeline — pricing before forecasting, marginal driver, micro-to-macro, second derivative, cross-asset confirmation, expression & sizing; 8 dashboard families + 8 output modes (morning note / EOD review / weekly / monthly …) |
| `references/overnight-futures-framework.md` | Overnight index-futures attribution — session clock, three-complex divergence read, catalyst clock |
| `references/parent-order-flow-framework.md` | Parent-order net-flow × vol × trend state matrix — accumulation / momentum / distribution / absorption / covert distribution |

### Subcommand references (lazy-loaded by the router)

| File | Subcommand |
|---|---|
| `references/commands/setup.md` | `/trade setup` workflow |
| `references/commands/import.md` | `/trade import` workflow (raw artifact → YAML; shared research → writedown digest) |
| `references/commands/report.md` | `/trade report` workflow (daily capital-flow read) |
| `references/commands/analysis.md` | Default analysis preflight + situation → reference map |

### Lazy-loaded library

| File | Description |
|---|---|
| `references/pitfalls/index.md` | Index of 31 trading pitfalls (severity-tagged, lookup by trade type) |
| `references/pitfalls/NN-*.md` | One file per pitfall — loaded only when relevant |
| `references/ticker/index.md` | Index of closed trade case studies |
| `references/ticker/<name>.md` | One file per case study (INTC, Mag-7, APP, NOK, TSEM, CBRS, SNOW, MDB, VIX, SATS, 6981, MU, NQ) |

### Templates (used by `/trade setup`)

| File | Copied to |
|---|---|
| `references/commands/templates/knowledge-README.md` | `<knowledge>/README.md` |
| `references/commands/templates/substack-template.yaml` | `<knowledge>/substack/_template.yaml` |
| `references/commands/templates/twitter-template.yaml` | `<knowledge>/twitter/_template.yaml` |
| `references/commands/templates/writedown-template.md` | `<knowledge>/writedowns/_template.md` |

## Coverage

- 31 analytical and risk-management pitfalls covering consensus anchoring, flow misreading, IV crush traps, T+1 reverse drift, LEAPS vega tax, manipulator-tape recognition, channel-check sample bias, AH order-book fades, demand-IV vs event-IV, vega-axis sanity checks, retest entry confirmation, macro-right/trade-wrong, second-derivative reading, stop-distance-determines-size, daily-loss-limit / drawdown governors, and more.
- 13 detailed case studies (INTC, Mag-7, APP, NOK, TSEM, CBRS, SNOW, MDB, VIX, SATS, 6981, MU, NQ) showing thesis evolution, structure selection, and post-mortem lessons.
- Structure-to-regime quick reference covering high/low IV regimes paired with directional / neutral / manipulator-tape views.
- Personal-knowledge layer for the user's own substack / X / writedown collection, auto-loaded on every analysis.
