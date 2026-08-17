---
type: Framework
title: Overnight Index-Futures Framework (夜盘 read)
description: Answering "what is driving NQ/ES right now" during the Globex overnight session — tape vs prior settle, the three-complex divergence read, the catalyst clock, attribution discipline, and scenario output. Includes data-source caveats for the Massive futures/indices and TradingView stack.
tags: [overnight, globex, nq, es, index-futures, macro, divergence, catalyst-clock, session-structure, data-freshness]
timestamp: 2026-07-22T05:40:00Z
---

# Overnight Index-Futures Framework (夜盘 read)

How to answer "今天/现在哪里在影响 NQ 夜盘" — a *market-level* attribution read, distinct from single-name analysis. Output is always: current tape → ranked drivers with numbers → catalyst clock → base/bull/bear scenarios keyed to levels. Productized as the funda-app `overnight-futures` play (PR #4007); this file is the human/agent version of the same discipline.

---

## 0. Session clock (all ET)

| Window | What is live |
|---|---|
| 18:00 open (Sun–Thu) | Globex reopens; prior 17:00 settle is the anchor |
| 19:00–20:00 | Tokyo pre-open; JP data drops (trade balance 19:50, CPI Thu 19:30) |
| 20:00–02:00 | **Asia cash live**: Tokyo 20:00–02:00, Seoul 21:00–01:30, HK 21:30–04:00 |
| ~02:00–03:00 | Korea-morning corporate releases (SK Hynix / Samsung prints ≈ US 2–3 AM) |
| 03:00–09:30 | Europe cash + ECB (Thu 12:15/12:45 UTC in summer) |
| 08:30 | US data block (claims, CPI, etc.) — still "overnight" for positioning purposes |
| 09:30–16:00 | RTH; 17:00 settle; 17:00–18:00 maintenance break |

Foreign catalysts land **inside** the US night: a "7/22 KST" earnings date means tonight for the US session. Always convert before saying "no catalysts tonight."

## 1. Tape first

- NQ now vs **prior settle** (= live price − change on the quote), overnight high/low, and the path (grinding vs one-shot gap). A −0.3% drift and a −0.3% news gap are different animals.
- Compare with the prior **cash** session: a big RTH rally + flat/slightly-red overnight = digestion, not reversal. Don't narrate a −0.25% give-back as "selling off."
- Sample the trend with ≥2 points before calling direction (same rule as the MU after-hours lesson — one snapshot is not a trend).

## 2. The three-complex divergence read (core signal)

Read three groups against each other; the *divergence pattern* is the attribution:

| Pattern | Read |
|---|---|
| NQ↓ while gold/silver/oil↑ (DXY firm) | **Inflation/energy/geopolitics drag** on duration, not broad risk-off |
| NQ↓ while Asia cash (KOSPI/Nikkei) rips | Drag is **US-specific** (tariffs, US politics, US rates) — Asia bid limits downside |
| NQ↓, Asia↓, gold↑, oil↓ | Genuine **growth scare / risk-off** |
| NQ↑ with oil↑ + gold flat | Risk-on with a cyclical tint; don't over-read |
| Everything up, VIX crushed | Pre-event complacency — check what event is being front-run (§3) and note protection is cheap |

- Complexes: (a) equity futures NQ/ES/YM/RTY; (b) safe-haven/inflation: gold, silver, WTI/Brent, DXY, ZN; (c) live Asia cash: Nikkei, KOSPI, HSI (HK often diverges from JP/KR on China-specific fear — say which Asia).
- KOSPI/Nikkei fading from session highs while NQ drifts = the "Asia floor" thinning intra-night. Re-check mid-session; the 21:00 read expires by 01:00.

## 3. Catalyst clock

- Next 24–72h: high-impact macro prints (High everywhere + Medium US), mega-cap earnings (amc/bmo), central-bank decisions/pressers, **and foreign prints converted to ET** (§0).
- Flag what already dropped tonight (actual vs estimate) — a beat that Asia is trading on right now is a live driver, not a future one.
- **Fed blackout awareness**: in the ~10 days pre-FOMC there are no Fed speakers to counter a hawkish/dovish narrative — narratives run unopposed. Note it explicitly when a rate story is moving the tape.
- Un-dropped binary inside the night (e.g., a Korea-morning memory print) = open gap risk both ways; the pre-positioning (KOSPI front-running) is itself a driver.

## 4. Attribution discipline

- **Every driver needs a number and, ideally, a headline.** "Oil +1.1% to $85.3 on the 11th night of strikes (20:26 ET headline)" is attribution; "risk-off sentiment" is not.
- **Yields are a coincident reading, never the cause** — find the underlying driver (inflation print, supply, tariffs, geopolitics). See [`pitfalls/22-yields-not-causal.md`](pitfalls/22-yields-not-causal.md).
- Cross-verify anomalous prints before publishing them: a ±5% Asia index change on a quote feed gets checked against daily history (is the regime actually that volatile?) before it appears in the analysis. It was real for KOSPI in July 2026; it will not always be.
- Rank drivers (usually 2–3) by evidence weight, and say which one the *current* tape is obeying when they conflict (e.g., Asia chip euphoria vs war-premium oil → NQ obeys the oil leg).

## 5. Output: scenarios keyed to levels

Base/bull/bear with probabilities summing to 100%, each keyed to: prior settle, overnight high/low, round numbers, and the specific pending catalysts from §3 as the branch conditions. Include the "what would flip this" trigger per branch. VIX level + event density is worth one closing line (cheap vs expensive protection) — as observation, not advice.

---

## Data-source caveats (this stack, verified 2026-07)

| Source | Caveat |
|---|---|
| TradingView MCP | **Fast cross-complex scan**: `futures_category_snapshot("equity_index")` returns NQ/ES/YM/RTY front-month OHLCV in one call; `futures_top_movers` for the sweep. No app, no relaunch. Continuous-contract (`1!`) symbology; no bid/ask depth. Good for *breadth*; take the precise session numbers from Massive below. |
| TradingView desktop reader | Needs CDP relaunch if the port is down — **relaunch closes the user's charts**; don't do it mid-session without asking. |
| **Massive `/futures/v1/aggs/{ticker}`, `/futures/v1/trades/{ticker}`, `/futures/v1/contracts`** | **The upgrade in this fork — real per-contract CME data, not a continuous-contract proxy.** The upstream skill pinned 夜盘 to TradingView because its vendor's futures endpoints 500'd; that constraint is gone. **Session boundary trap:** a futures session opens the *evening before* the date it settles on, so to load the session settling on date D you query `window_start` for **D−1**. Getting this wrong shifts the whole overnight read by one session. `/futures/v1/market-status` says whether the product is open, paused, or closed before you interpret a flat tape. |
| Massive `/v3/snapshot/indices` (`I:VIX`, `I:VIX9D`, `I:VIX3M`, `I:VIX6M`), `/v2/aggs/ticker/{indicesTicker}/...` | The vol-complex leg of the three-complex read, and the VIX term structure the upstream stack could not reach. Index aggregates are built from index *values*, not trades — an empty interval means no index update, not zero volume. |
| Massive `/fed/v1/treasury-yields` | The rates leg. Daily series — **not** an intraday yield tick, so don't narrate an overnight rates move off it; use it for the level and the change-in-change ([`pitfalls/29-second-derivative-not-level.md`](pitfalls/29-second-derivative-not-level.md)). |
| Massive `/benzinga/v1/earnings`, `/tmx/v1/corporate-events` | The catalyst clock. `corporate-events` carries a confirmed/pending status — a *pending* date is not a scheduled catalyst, and treating it as one manufactures an event. |

Related: [`price-action-framework.md`](price-action-framework.md) (why the same headline lands differently), [`gamma-framework.md`](gamma-framework.md) (if the question turns into an options-structure question), [`ticker/nq-2026-07.md`](ticker/nq-2026-07.md) (worked example of this framework, live).
