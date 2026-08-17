---
type: Command Reference
title: "/trade report [tickers | basket]"
description: Today's capital-flow / 资金流向 read for one or more names — retail / 大单 / institutional proxied from options premium-flow computed off the Massive option tape, mapped to a comparison table + cross-section synthesis. Read-only, not investment advice.
tags: [command, report, capital-flow, money-flow, options-flow, funds-flow]
timestamp: 2026-06-22T20:00:00Z
---

# /trade report &lt;tickers | basket&gt;

A daily **capital-flow / 资金流向** read across one or more names: who is buying vs selling today, split as a **散户 / 大单 / 机构** proxy, plus the price/volume context — rendered as a comparison table with a cross-section synthesis.

Runs whenever the user invokes `/trade report ...`, or asks for 资金流向 / 流入流出 / 净流入·净流出 / 散户·大单·机构 / capital flow / money flow / "who's buying" across a name or a basket.

> **Read the 口径 (data-source reality) FIRST — and state it in every reply.** There is **no** stock-side "retail / large-order / institutional daily net inflow" feed available here, and — unlike the upstream skill — **no vendor-computed options-flow aggregate either.** This command *builds* the read from the raw option tape:
>
> - **大单 / 机构 (smart money)** ← net options premium **you compute** from Massive: prints from `/v3/trades/{optionsTicker}` classified ask-side vs bid-side against `/v3/quotes/{optionsTicker}`, then aggregated. Full method and its traps: [`../massive-data.md`](../massive-data.md) §4.2. Real institutional/large positioning shows up in options $ first — but the number is now **yours**, with your query's bound on it.
> - **散户 (retail)** ← Massive `/v2/reference/news` `insights` sentiment (a *weak* proxy, not $ flow; coverage is thin on small / niche names).
> - **机构 stock-side daily net flow** ← **not a net-flow feed, and weaker here than upstream.** There is no dark-pool product in this stack; off-exchange activity can only be *inferred* from FINRA-reported prints via exchange / condition codes ([`../massive-data.md`](../massive-data.md) §4.4). Prints carry **no aggressor side**, so it is block *activity* at price levels, never signed institutional inflow. Say which one you have; don't fabricate a signed number.
> - **The user's own book** ← Alpaca ([`../alpaca-data.md`](../alpaca-data.md)). This is the one "position" number in the report that is a fact rather than a proxy — keep it visibly separate from the flow proxies.
>
> **Two disclosures are mandatory in every reply**, because both numbers are derived rather than read: (1) the flow figure is **self-computed**, and (2) the **bound** you used — which strikes, which window, and how midpoint prints were bucketed.

## Arguments

- **Explicit tickers** (space- or comma-separated): `report COHR LITE MU` → run those.
- **A sector / theme word** (e.g. "光" / optical, "存储" / memory, "光模块+存储"): **confirm the ticker universe first** (propose constituents + a market, ask via `AskUserQuestion`) — don't silently guess a basket. Once confirmed, group the output by basket.
- **Optional date**: default **today**. The endpoints return the latest session; if the user names a date, pass it through where the endpoint supports `date=`.
- Mixed baskets → render one table per basket so the cross-section reads cleanly.

## Workflow

### 1. Resolve the data path

Run the availability gate in [`../massive-data.md`](../massive-data.md) §1. Massive is the only path to the flow numbers; Alpaca ([`../alpaca-data.md`](../alpaca-data.md)) supplies the user's own positions and the market calendar. If Massive isn't reachable, **say the flow read is unavailable** — a report built on quotes alone is not a 资金流向 read, and calling it one is the defect this whole 口径 block exists to prevent.

Check `/v1/marketstatus/now` (or Alpaca `get_clock`) before saying "today": a pre-open call has no session flow to aggregate, and an early-close day truncates the tape legitimately.

### 2. Pull, per ticker

**Use `store_as` + `query_data`, not a per-strike loop.** The whole point of the aggregation layer is to do steps 2–4 below in SQL server-side.

| # | Source | Gives | Use for |
|---|---|---|---|
| 1 | `/v3/snapshot/options/{t}` | whole chain: per-contract greeks, IV, OI, day volume, quotes | **核心 context** — where the volume and OI actually sit; picks the strikes worth pulling tape for |
| 2 | `/v3/trades/{optionsTicker}` on the strikes from #1 | per-print price, size, exchange, conditions, ns timestamp | the raw material for net premium |
| 3 | `/v3/quotes/{optionsTicker}` at print timestamps | NBBO at execution | **the step that gives the number its sign** — ask-side (bought) vs bid-side (sold); bucket midpoint prints separately instead of forcing a side |
| 4 | derived — [`../massive-data.md`](../massive-data.md) §4.2 | `premium = price × size × 100`; net call/put premium; 5-min buckets | 大单/机构 direction **and** the intraday shape |
| 5 | `/v2/aggs/ticker/{t}/prev` + snapshot | day % change | 涨跌% |
| 6 | `/benzinga/v1/earnings` or `/tmx/v1/corporate-events` | next earnings date + confirmed/pending status | 财报日. A **pending** date is not a scheduled catalyst — don't present it as one |
| 7 | `/v2/reference/news` | `insights` sentiment + reasoning | 散户 tone proxy |
| 8 | exchange / condition codes on #2 (resolve via `/v3/reference/exchanges`, `/v3/reference/conditions`) | off-exchange share | block *activity* only — **never** summed into net flow ([`../massive-data.md`](../massive-data.md) §4.4) |
| 9 | Alpaca `get_all_positions` | the user's actual exposure in these names | keeps "what the tape says" separate from "what I own" |

**Bound the pull deliberately** — top strikes by volume, or a delta band — and carry the bound into the output. Scanning every strike of a liquid name is not feasible in one pass, so the only honest options are a stated bound or an explicit "I could not cover the whole chain."

**Traps** (full list in [`../massive-data.md`](../massive-data.md) §5): timestamps are **nanosecond epochs**; OI updates once daily so same-day "OI built up" is unsupported; an empty aggregate window means no trades, not a flat price; paginated responses carry a next-page hint — a first page is not the dataset. Mind market-holiday gaps when computing "vs prior close" (use Alpaca `get_calendar` — the prior trading day is often not yesterday).

**The cross-section backdrop** that UW's `market-tide` gave for free has no direct substitute. Approximate it from index snapshots (`I:SPX`, `I:NDX`) plus `/etf-global/v1/fund-flows`, and label it a **breadth proxy, not the tide**.

### 3. Derive the per-ticker metrics

Row numbers cite the §2 table. **Every premium metric below is computed by you, not read off a field** — the sign comes from your ask/bid classification in #3, so a sloppy classification silently inverts the verdict in §4.

- **涨跌%** — from #5.
- **净期权流向 (牛−熊)** = (ask-side call premium + bid-side put premium) − (bid-side call premium + ask-side put premium). Positive = net bullish smart-money $. Midpoint prints stay in their own bucket and are reported separately, never split 50/50 into the two sides.
- **净 Call 权利金 / 净 Put 权利金** = ask-side − bid-side premium, per type. **Sign matters**: positive = net *bought*; **negative call premium = calls net SOLD** (bearish/distribution).
- **放量倍数** = today's contract volume ÷ its trailing 30-day average, from option aggregates. <1 = below average / quiet. If you didn't pull the 30-day history, say the multiple is unavailable rather than eyeballing "heavy."
- **盘口** — ask-side vs bid-side **volume** (not premium), calls and puts separately. Cross-check it agrees with the premium signs — that agreement IS your adversarial check, and it is more valuable here than upstream because both numbers came from the same classification step you performed. If they disagree, your classification is suspect; investigate before publishing.
- **财报日** — from #6, with its confirmed/pending status.
- **日内形态** — from #4's 5-minute buckets: where in the session the premium arrived. A daily aggregate that is bullish only because of the first 15 minutes is a different fact from one that builds into the close; say which. Read the *derivative* per [`../parent-order-flow-framework.md`](../parent-order-flow-framework.md).
- **场外占比 (off-exchange share)** — from #8: FINRA-reported share of volume and the largest such prints. **Activity at price levels, not signed flow** — never sum it into the net-flow number, and label it an inference, not a dark-pool feed.

### 4. Classify each name (聪明钱判定)

| Label | Trigger |
|---|---|
| 🟢 **多头确认** | price up **and** net flow bullish (牛>熊) **and** calls net bought (net_call_prem>0, call ask>bid) **and** puts net sold — ideally with call volume ≥ ~1× avg (放量). Clean, confirmed long. |
| 🔴 **背离 / 派发** | **price up but options bearish** — calls net SOLD (net_call_prem<0, call ask<bid) and/or 熊>牛. The "价涨期权背离" tell; the relative weak name. |
| 🟡 **价拉·期权没跟** | price up but options **light** (volume << avg) and net flow ~flat. Momentum not yet confirmed by smart money — needs follow-through. |
| ⚖️ **双押 / 事件** | **both** call and put premium strongly net-bought **and** earnings within ~1–2 weeks → earnings straddle positioning. **Don't read the big "inflow" as single-direction conviction.** |

Always flag **earnings proximity** (from #6): a name reporting in days explains two-sided premium; a name reporting weeks out gives a *cleaner* directional read.

### 5. Output

- **One table per basket**, columns: `Ticker | Chg% | Net options flow (bull−bear, $M) | Net call $M | Net put $M | Call vol / 30d | Bid-ask skew | Smart-money verdict`. Premiums in `$M`, one decimal.
- Then a **cross-section synthesis**: who's the clean long, who's diverging/distributing, who's price-only-unconfirmed, who's event-driven; and the **basket vs basket** comparison if more than one.
- A **retail (散户) news-sentiment** line: counts + tone, with the thin-coverage caveat.
- Add the **intraday shape** line (when in the session the premium arrived) and the **场外占比** line, each with its caveat.
- **A provenance clause is mandatory, not optional polish** — one sentence naming that the flow numbers are computed from the Massive option tape and stating the bound you used (strikes / window / midpoint handling). Without it the reader cannot tell a full-chain read from a top-5-strike sample, and the two support different conclusions.
- If the user holds any of these names, show the **Alpaca position line separately** from the flow table — a fact next to proxies, never merged into them.
- **Respond in the user's language** (see `SKILL.md` User Profile — the report is chat output; only git-tracked files stay English). The 散户 / 大单 / 机构 taxonomy keeps its Chinese names as domain terms — gloss them (retail / block / institutional) on first use when replying in English.

## Constraints

- **Read-only.** This is data presentation, never a trade recommendation, price target, or buy/sell call. Close with a one-line **非投资建议** note.
- **State the 口径 every time**: the flow numbers are **self-computed** from the Massive option tape and **bounded** by your query; options-flow proxy for 大单/机构 + news sentiment for 散户; no stock-side three-layer net flow, and no dark-pool feed — off-exchange share is an unsigned inference; earnings-driven two-sided flow ≠ single-direction.
- **A single big order ≠ smart money** — read the *aggregate* premium, not one print. See [`../pitfalls/02-single-flow-not-smart-money.md`](../pitfalls/02-single-flow-not-smart-money.md).
- **Options flow is dealer-/positioning-driven, not "retail money"** — see [`../pitfalls/17-dealer-flow-not-retail.md`](../pitfalls/17-dealer-flow-not-retail.md).
- **Don't fabricate** numbers or a retail/institutional split the feed doesn't provide. If an endpoint errors or a name has no listed options, say so for that name and continue.
- This is a **read**, not the full structure flow — if the user then wants to *act* (size, pick a structure, model P/L), route to [`analysis.md`](analysis.md) and run the three-axes / bull-conviction checks there.

## Related

- [`../massive-data.md`](../massive-data.md) — the tier-1 data path: availability gate, endpoint map, the §4.2 net-premium derivation this whole command rests on, field traps, and §6's list of what cannot be produced.
- [`../alpaca-data.md`](../alpaca-data.md) — tier 2: the user's own positions (the one fact in the report), plus the market calendar.
- [`../pitfalls/32-multi-leg-share-before-block-direction.md`](../pitfalls/32-multi-leg-share-before-block-direction.md) — **read before ranking any block by premium**: spread legs print full premium with their own aggressor side, so an unfiltered tally manufactures a net direction that isn't there (a real case sign-flipped +$68.9M to $0.0M). Filter on `multi_leg_volume` and `stock_multi_leg_volume`.
- [`../pitfalls/02-single-flow-not-smart-money.md`](../pitfalls/02-single-flow-not-smart-money.md) — one institutional order isn't edge.
- [`../pitfalls/17-dealer-flow-not-retail.md`](../pitfalls/17-dealer-flow-not-retail.md) — options flow is dealer hedging, not retail direction.
- [`../pitfalls/20-post-earnings-momentum-vs-fade.md`](../pitfalls/20-post-earnings-momentum-vs-fade.md) · [`../pitfalls/21-event-iv-vs-demand-iv.md`](../pitfalls/21-event-iv-vs-demand-iv.md) — pull flow + check the catalyst clock before any "fade / IV crush" call.
- [`../parent-order-flow-framework.md`](../parent-order-flow-framework.md) — the interpretation layer: map the flow read + trend + volatility into a named state (吸筹 / 派发 / 承接 / 风险释放) when the user asks *what the flow means*, not just what it is.
- [`../gamma-framework.md`](../gamma-framework.md) — add GEX (`type=greek-exposure`) for dealer-positioning context when asked.
- [`analysis.md`](analysis.md) — when the read turns into an actual trade decision.
