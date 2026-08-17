---
type: Data Source
title: Massive (Polygon) — primary market-data tier
description: How to use the user's own Massive/Polygon subscription as the primary data tier — availability gate, MCP vs REST access, endpoint map by trading question, the derivations that replace vendor-computed GEX / net-premium / IV-rank feeds, and an explicit list of what this tier cannot produce.
tags: [data-source, massive, polygon, options-chain, greeks, gex, market-data, api]
timestamp: 2026-08-16T00:00:00Z
---

# Massive (Polygon) — primary data tier

Massive is this fork's **tier 1** and the backbone of every quantitative read: full options chains with greeks / IV / open interest, tick-level option trades and quotes, equities, indices, **futures**, Fed macro series, financials, earnings, analyst consensus, FINRA short interest, and news with sentiment.

It replaces the upstream skill's Unusual Whales + Funda tiers. Two consequences you must carry into every reply:

1. **Several UW datasets were vendor-*computed*. Here they are *derived*** — dealer GEX, net premium flow, IV rank. The derivations are in §4 and they are honest approximations, not a vendor feed. Say so when you use one.
2. **A few UW datasets have no substitute at all.** They are listed in §6. Never fill those gaps with an estimate.
3. **Entitlement is not one block.** This plan covers options, equities, futures, Fed macro, and the partner feeds (news/earnings/analysts) — but **not indices**, which 403. Probe rather than assume: a plan that reaches futures tick data may still refuse `I:VIX`.

## 1. Availability gate — run before promising any Massive dataset

Check in order; first hit wins:

1. **Massive/Polygon MCP tools in the session** (see the repo README for wiring) → use `search_endpoints` → `call_api` → `query_data`. This is the normal path; the server receives its credentials at process start, so nothing needs to be resolved — or echoed — here.
2. **`$MASSIVE_API_KEY` or `$POLYGON_API_KEY` in the environment** → REST (§2B).
3. **Nothing found → this tier does not exist.** Fall back to Alpaca ([`alpaca-data.md`](alpaca-data.md)) and TradingView, and say in the reply which source the read is built on. Never present a Massive-only derivation (GEX map, net-premium series, IV rank) as available when it isn't.

## 2. Access

### A. MCP (preferred)

Three tools, used in this order:

| Tool | Use |
|---|---|
| `search_endpoints` | **Always first.** Finds the right path and — with `detail="more"` — its query parameters. Do not write a path from memory; the whitelist in §3 is a starting point, not a parameter reference. |
| `call_api` | Fetch. `store_as="<name>"` saves the result as an in-memory table and returns a workspace handle. `apply=` runs server-side functions (including Black-Scholes greeks — see §4). |
| `query_data` | SQL over stored tables. This is how a multi-strike or multi-ticker aggregation gets done in one round-trip instead of dozens of calls. |

**More than ~3 tickers, or any per-strike aggregation → `store_as` + `query_data`.** Looping `call_api` per strike is the wrong shape and will truncate your own attention before it truncates the data.

### B. REST

```
GET https://api.massive.com/...      # or api.polygon.io — same surface
Authorization: Bearer $MASSIVE_API_KEY
```

Never pass the key as `apiKey=` in a query string, and never echo it into a file, a commit, or a reply.

## 3. Endpoint map — by the question being asked

Paths verified against the live endpoint index. **Parameters are not listed here on purpose** — resolve them with `search_endpoints(..., detail="more")` at call time so this file cannot go stale against the API.

| Question | Path | Paired rule |
|---|---|---|
| **Whole chain: greeks, IV, OI, quotes, trades, break-even** | `/v3/snapshot/options/{underlyingAsset}` | The workhorse. One call feeds §4's GEX, skew, and IV-term derivations. |
| **One contract in depth** | `/v3/snapshot/options/{underlyingAsset}/{optionContract}` | Pricing a specific leg before quoting a structure. |
| **Contract reference / expiries / strikes listed** | `/v3/reference/options/contracts/{options_ticker}`, `/v3/reference/options/contracts` | Expiry discovery. Mind the rolling-listing ceiling on long DTE. |
| **Option tape (per-print size, price, exchange, conditions)** | `/v3/trades/{optionsTicker}` | §4.2 net-premium derivation; [`pitfalls/32-multi-leg-share-before-block-direction.md`](pitfalls/32-multi-leg-share-before-block-direction.md) — condition codes are the only multi-leg tell you get here, and they are weaker than UW's package IDs. |
| **Option NBBO history** | `/v3/quotes/{optionsTicker}` | Classifying a print as ask-side vs bid-side (§4.2). Without this a "net premium" number is unsigned. |
| **Condition / exchange code meanings** | `/v3/reference/conditions`, `/v3/reference/exchanges` | **Required** before reading conditions or inferring off-exchange (§4.4). |
| **Equity quotes / bars / snapshot** | `/v3/snapshot`, `/v2/aggs/ticker/{t}/range/...`, `/v2/aggs/ticker/{t}/prev` | Day change, ATR, the price half of every setup. |
| **Top gainers / losers** | `/v2/snapshot/locale/us/markets/stocks/{direction}` | Movers scan. Volume floor 10k; table clears 03:30 ET. |
| ~~Indices (VIX curve)~~ | ~~`/v3/snapshot/indices`~~ | **NOT ENTITLED on this plan — verified 2026-08-16, HTTP 403 `NOT_AUTHORIZED`.** `I:VIX` / `I:SPX` / `I:NDX` all fail. Do not route VIX or index-level work here; see §6. |
| **Futures — NQ / ES 夜盘** | `/futures/v1/aggs/{ticker}`, `/futures/v1/trades/{ticker}`, `/futures/v1/contracts`, `/futures/v1/market-status` | **Also a gap closed** — UW's futures endpoints 500'd, so the upstream skill pinned 夜盘 to TradingView. A futures session opens the **evening before** its settle date: to load the session settling on date D, query `window_start` for D−1. [`overnight-futures-framework.md`](overnight-futures-framework.md) |
| **Macro — yields, inflation, labor** | `/fed/v1/treasury-yields`, `/fed/v1/inflation`, `/fed/v1/inflation-expectations`, `/fed/v1/labor-market` | [`macro-framework.md`](macro-framework.md); [`pitfalls/29-second-derivative-not-level.md`](pitfalls/29-second-derivative-not-level.md) — read the change in the change, not the level. |
| **Earnings dates + actual/estimate/surprise** | `/benzinga/v1/earnings`, `/tmx/v1/corporate-events` | The catalyst clock the Hard Rule requires before any "IV crush" call. `corporate-events` also carries dividends, splits, conferences, and a confirmed/pending status. |
| **Analyst ratings / targets / consensus** | `/benzinga/v1/analyst-insights`, `/benzinga/v1/consensus-ratings/{ticker}` | [`pitfalls/01-consensus-not-bearish.md`](pitfalls/01-consensus-not-bearish.md) — consensus is trailing, not a ceiling. |
| **Guidance** | `/benzinga/v1/guidance` | Priced-in checks ([`pitfalls/05-priced-in-percentage.md`](pitfalls/05-priced-in-percentage.md)). |
| **Financials** | `/stocks/financials/v1/income-statements`, `/cash-flow-statements`, `/ratios` | Tape → catalysts → valuation. Never DCF-first. |
| **News + sentiment** | `/v2/reference/news` (carries `insights` with sentiment **and** sentiment reasoning), `/benzinga/v2/news` | The 散户-tone proxy in [`commands/report.md`](commands/report.md). Thin coverage on small caps — say so. |
| **Short interest** | `/stocks/v1/short-interest` | FINRA, **two-week cadence** — structurally stale, never an intraday signal. [`price-action-framework.md`](price-action-framework.md) float composition. |
| **ETF fund flows** | `/etf-global/v1/fund-flows` | Sector/theme rotation confirmation in [`macro-framework.md`](macro-framework.md). |
| **Market open/closed** | `/v1/marketstatus/now` | Pre/post session gating before any "today's flow" claim. |

## 4. Derivations — what you compute here instead of reading off a vendor feed

This is the section that carries the fork's real risk. Each derivation below stands in for something UW served pre-computed. **Every one of them must be labeled in the reply as self-computed**, with its assumption stated.

### 4.1 Dealer GEX (replaces UW `spot-exposures/strike`, `gex-levels`)

From one `/v3/snapshot/options/{underlying}` call you have per contract: `greeks_gamma`, `open_interest`, `details_strike_price`, `details_contract_type`, `implied_volatility`, `day_volume`, and the underlying price `underlying_asset_price` (`S`). Field names come back **flattened with underscores** through the MCP layer — `greeks_gamma`, not `greeks.gamma`.

```
GEX_contract = gamma × open_interest × 100 × S² × 0.01        # $ per 1% spot move
GEX_strike   = Σ_calls GEX_contract − Σ_puts GEX_contract
```

Do it server-side: `store_as` the chain, then `query_data` with a SQL `GROUP BY strike`. The Black-Scholes functions (`bs_gamma`, `bs_vanna`, `bs_volga`, `bs_delta`, `bs_theta`, `bs_vega`, `bs_rho`) are available through `apply` when you need a greek the snapshot didn't return, or a **what-if** greek at a hypothetical spot / IV — that is the piece the snapshot genuinely cannot give you.

**The silent-gap trap — measured on SPY, 2026-08-16.** The snapshot omits the **entire greeks and IV block** for some contracts: the columns are absent from those rows, so a naive `SUM(gamma × OI)` drops them **without erroring**.

The trigger is **lack of recent trading activity, not moneyness** — do not assume the gaps are harmlessly deep ITM. In the measured SPY 2026-08-21 chain the six gamma-less contracts sat 20–38 points from spot (2.7–4.9% away, i.e. near the money), and what they shared was near-zero `day_volume` (1, 27, 82, 166, 176). One of them (call 738) carried **2,339 OI** — a contract that close to spot has real gamma, so dropping it is a real omission.

**Scale it before you worry about it, and say which case you're in.** On SPY the gaps were 6 of 160 rows carrying 2,410 of 1,111,112 OI — **0.22%**, immaterial. On a wider pull (250 rows, two expiries) it was 67 rows / 2.5% of OI. On an illiquid underlying it will be far worse, because the trigger *is* illiquidity. So: count `gamma IS NOT NULL` against the total, report the share of **OI** (not rows) that lacked a gamma, and if that share is material either fill it with `apply`/`bs_gamma` (you have strike, expiry, spot, and can supply an IV) or declare the map bounded to liquid strikes.

**What is *not* worth cleaning:** the vendor's IV solve degenerates on deep-ITM contracts, emitting negative gamma (~−1e-10) and near-zero IV (~0.0006). It looks alarming and is numerically inert — on the SPY chain, filtering those rows moved net GEX by **$10.9 out of $3,697.1M (3e-9)**. Deep-ITM gamma really is ≈0, so the garbage values are ≈0 too. Don't build a cleaning step for this and don't cite it as a caveat; spend the attention on the missing-row share above, which is the one that actually moves the number.

**Vintage mismatch:** in the same response, `last_quote_timeframe` can read `REAL-TIME` while `underlying_asset_timeframe` reads `DELAYED` (observed on SPY). Since `S²` scales the whole GEX number, a delayed underlying quietly biases it. Check both timeframe fields and say which vintage the map is built on.

**Three assumptions you must state, not bury:**

- **The call-positive / put-negative sign convention encodes "dealers are short calls, long puts."** That is a convention, not a measurement. It is wrong on names where the retail flow is inverted, and it is exactly the failure [`pitfalls/17-dealer-flow-not-retail.md`](pitfalls/17-dealer-flow-not-retail.md) warns about.
- **Open-interest GEX ≠ volume GEX.** UW split these (`*_oi` vs `*_vol`) and they disagree on heavy-new-flow days. Here you get OI from the snapshot; a volume-weighted variant has to be built from `/v3/trades/*`. Say which one you used.
- **GEX outputs levels and probabilities, never direction** — [`gamma-framework.md`](gamma-framework.md) is unchanged by the source swap.

### 4.2 Net options premium flow (replaces UW `options-volume`, `net-prem-ticks`)

UW returned `bullish_premium` / `net_call_premium` / `*_volume_ask_side` as a finished daily aggregate. Here you build it:

1. Pull the chain snapshot for the day's volume and OI context.
2. Pull `/v3/trades/{optionsTicker}` for the strikes that carry the volume.
3. Join each print against `/v3/quotes/{optionsTicker}` at the print timestamp to classify **ask-side (bought) vs bid-side (sold)** — this is the step that gives the number its sign. A midpoint print is genuinely ambiguous; bucket it separately rather than forcing a side.

   > ⚠️ **This step is only valid against an NBBO, and the snapshot's quote is NOT one.** The `last_quote_*` fields in `/v3/snapshot/options/*` carry a **single exchange's** book — verified 2026-08-16 on XLE 2026-08-21: the snapshot showed 62C at 0.49/0.76 (spread 0.27) and 65C at 0.05/0.15, while the true NBBO from Alpaca was 0.70/0.72 and 0.07/0.08 — a **13× and 10× overstatement of the spread**. Classifying prints against a single-venue book mislabels anything that executed at the *national* best, which is most of the tape, and the resulting net-premium sign is then unreliable.
   >
   > **Whether the dedicated `/v3/quotes/{optionsTicker}` endpoint returns NBBO or the same per-venue book is UNVERIFIED.** Test it before trusting any net-premium number built on it; until then, cross-check the classification against Alpaca's NBBO on a sample of prints, or state that the sign is provisional. Do not silently assume the dedicated endpoint is better than the snapshot field.
4. `premium = price × size × 100`. Aggregate: net call premium = ask-side call premium − bid-side call premium; same for puts.
5. For the **intraday shape** (the thing `net-prem-ticks` gave for free), bucket by 5-minute windows and read the *derivative* per [`parent-order-flow-framework.md`](parent-order-flow-framework.md) — a bullish aggregate built entirely in the first 15 minutes is a different fact from one that builds into the close.

**Sign convention stays the same as upstream**: negative net call premium = calls net **sold**.

**Cost warning:** doing this across a whole chain is expensive. Bound it — top strikes by volume, or a delta band — and **disclose the bound**, the same way the upstream skill required disclosing `flow-alerts` truncation. A silently truncated tape reads as a complete one.

### 4.3 IV rank (replaces UW `iv-rank`)

No `iv_rank_1y` field exists here. Build it from history: sample ATM IV over the lookback (chain snapshots historically, or option aggregates), then `IV rank = (IV_today − IV_min) / (IV_max − IV_min)`.

This is a **real cost** — it is many calls, not one field. Two honest options, both acceptable, neither silent:

- Compute it over a **shorter, stated** window (e.g. 3 months) and label the window. A 3-month rank is not a 1-year rank and must not be reported as one.
- Skip the rank, use the **IV term structure and realized-vs-implied spread** from the current chain instead, and say the vega axis was set without a rank.

[`pitfalls/19-direction-vega-independent-axes.md`](pitfalls/19-direction-vega-independent-axes.md) needs the *vega sign* decided correctly. It does not need a specific vendor's rank number — but it does need you to say which basis you used.

### 4.4 Off-exchange / block activity (partial substitute for UW dark pool)

Equity and option trades carry exchange IDs and condition codes. FINRA-reported prints (the TRF/ADF tape) identify off-exchange activity — resolve the codes with `/v3/reference/exchanges` and `/v3/reference/conditions` **before** classifying anything.

**This is weaker than UW's dark-pool feed and must be labeled as such.** Same caveat as upstream, now doubly true: prints carry **no aggressor side**, so direction is an inference from print price vs the NBBO at execution. A print is a *transfer* — not evidence of institutional intent ([`pitfalls/02-single-flow-not-smart-money.md`](pitfalls/02-single-flow-not-smart-money.md)). Never sum it into a net-flow number.

## 5. Field traps

- **Timestamps are nanosecond epochs** on trades/quotes (`sip_timestamp`, `participant_timestamp`). Convert before comparing to anything, and never mix a nanosecond field with an ISO string in one sentence.
- **`window_start` on a futures session bar is the day *before* the settle date** — see §3. This has already produced off-by-one session reads.
- **An empty aggregate window means no trades, not zero price.** Options chains are sparse; a missing bar is missing, not flat.
- **`last_quote_*` in the options snapshot is a SINGLE EXCHANGE's book, not the NBBO.** Verified 2026-08-16 on XLE: snapshot 62C 0.49/0.76 vs true NBBO 0.70/0.72 — the spread looked **13× wider than it was**. Never price a leg, estimate slippage, judge liquidity, or mark a position off this field; take quotes from Alpaca ([`alpaca-data.md`](alpaca-data.md)). Note the `last_quote_bid_exchange` / `last_quote_ask_exchange` fields differ from each other — that is the tell. This also compromises the §4.2 trade classification; see the warning there.
- **IV inherits the quote's error.** Because the vendor solves IV off its own midpoint, a per-venue quote produces a per-venue IV: XLE 62C came back 23.10% here vs 25.56% on the NBBO mid (2.5pp), and 65C 31.29% vs 28.96%. A skew or term-structure read built purely on snapshot IV carries that distortion, and it is **largest exactly where the venue book is thinnest** — the illiquid strikes a skew read cares about most.
- **Snapshot greeks come from the vendor's own IV solve.** They are internally consistent, but they are not your broker's marks — do not quote them as executable. Cross-check a leg against Alpaca before quoting it ([`alpaca-data.md`](alpaca-data.md) §4). Deltas agreed closely in testing (0.4850 vs 0.4932); it is the **quotes and IV**, not the greeks, that diverge.
- **Greeks / IV are missing entirely on untraded contracts** — see §4.1. Any per-strike aggregate must report its coverage, or it is silently under-counting.
- **Field names arrive flattened**: `greeks_gamma`, `details_strike_price`, `underlying_asset_price`, `last_quote_midpoint`. Writing the dotted form from the API docs into a `query_data` SQL statement returns nothing rather than erroring loudly.
- **Two vintages in one row.** `last_quote_timeframe` (REAL-TIME) and `underlying_asset_timeframe` (DELAYED) can disagree — never narrate them as one snapshot.
- **Open interest updates once daily (previous session).** Intraday OI change is not observable here; a same-day "OI built up" claim is unsupported.
- **Short interest is two-week cadence** — structurally stale by construction.
- **Paginated responses carry a next-page hint.** A first page is not the dataset; either follow the pages or state the cap.

## 6. What this tier genuinely cannot produce

State the gap; never estimate into it.

| Gone with UW / Funda | Status here |
|---|---|
| Exact multi-leg package reassembly (`/option-trades/multi-leg` + `/legs`) | **No substitute.** Condition codes hint at spread prints but give no package ID. [`pitfalls/32-multi-leg-share-before-block-direction.md`](pitfalls/32-multi-leg-share-before-block-direction.md) reverts from *exact* de-contamination to a *share estimate* — which is precisely the regime that pitfall was written for. Filter conservatively and report unfiltered tallies as **activity only**. |
| True dark-pool print feed | Partial — off-exchange inference only (§4.4). |
| Market tide / sector tide / total options volume | **No direct substitute.** Approximate from index + ETF flows (`/etf-global/v1/fund-flows`) and say it is a proxy for breadth, not the tide. |
| Vendor IV rank (`iv_rank_1y`) | Derived at cost (§4.3). |
| **Indices — `I:VIX`, `I:VIX9D`, `I:VIX3M`, `I:VIX6M`, `I:SPX`, `I:NDX`** | **NOT ENTITLED — 403 `NOT_AUTHORIZED`, verified 2026-08-16.** This plan buys options + equities + futures + partner data, **not** the indices product. So the **VIX term structure is still unavailable** — the upstream skill's gap was not closed. For VIX work use TradingView (tier 3), or the **VX futures** via `/futures/v1/*`, which *are* entitled and which [`pitfalls/25-vix-options-futures-mechanics.md`](pitfalls/25-vix-options-futures-mechanics.md) wants you anchored to anyway. An index-level read (SPX/NDX level) has to come from the ETF proxy (SPY/QQQ) — say that you used the proxy. |
| Congressional trades, Polymarket | **Not available.** Say so. |
| Earnings-call transcripts | **Not available.** Earnings *numbers*, estimates, surprise, and guidance are (§3). |
| Insider / institutional 13F ownership | **Not available** on this tier. |
| Analyst estimate *revisions* history | Partial — consensus and insights only. |

## Related

- [`../SKILL.md`](../SKILL.md) — Data Access tier order.
- [`alpaca-data.md`](alpaca-data.md) — tier 2: the user's own positions, plus a second quote/chain source for cross-checks.
- [`commands/report.md`](commands/report.md) — the daily 资金流向 read, rebuilt on the §4.2 derivation.
- [`gamma-framework.md`](gamma-framework.md) · [`parent-order-flow-framework.md`](parent-order-flow-framework.md) — the interpretation layers. **A source swap changes the numbers' provenance, not what they mean.**
- [`pitfalls/17-dealer-flow-not-retail.md`](pitfalls/17-dealer-flow-not-retail.md) · [`pitfalls/02-single-flow-not-smart-money.md`](pitfalls/02-single-flow-not-smart-money.md) · [`pitfalls/32-multi-leg-share-before-block-direction.md`](pitfalls/32-multi-leg-share-before-block-direction.md)
