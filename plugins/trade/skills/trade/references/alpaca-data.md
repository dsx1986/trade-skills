---
type: Data Source
title: Alpaca — read-only broker + market data tier
description: How to use the user's own Alpaca account as tier 2 — the only source of their real positions and P/L, plus a second quote/chain source for cross-checking Massive. Covers the availability gate, the read-only toolset pin, what Alpaca is uniquely good for, and the hard no-execution rule.
tags: [data-source, alpaca, broker, positions, options-chain, market-data, read-only]
timestamp: 2026-08-16T00:00:00Z
---

# Alpaca — read-only broker + market data

Alpaca is this fork's **tier 2**. It contributes two things nothing else in the stack can:

1. **The user's actual book** — open positions, cost basis, unrealized P/L, portfolio history, order history. Every exit, roll, sizing, and "should I add" question needs this, and no market-data vendor has it.
2. **An independent second read** on quotes, chains, and greeks — the cross-check that catches a bad Massive pull before it becomes a recommendation.

## 1. Availability gate

1. **Alpaca MCP tools in the session** (see the repo README for wiring) → use them.
2. **No Alpaca MCP → tier 2 does not exist.** Positions are simply unknown: **ask the user** for their position rather than assuming a flat book or inventing a cost basis. Fall back to Massive for market data.

The server receives its credentials at process start; they never touch disk or this repo.

## 2. The read-only pin — a safety property, not a limitation

The wired server runs with `ALPACA_TOOLSETS="account,assets,watchlists,stock-data,options-data,corporate-actions,news"`. **`trading` is deliberately absent**, so no order-placement tool exists in the session at all — not `place_option_order`, not `cancel_*`, not `close_position`, not `exercise_options_position`.

This makes the skill's no-execution rule structural instead of aspirational. Two rules follow:

- **Never ask the user to swap in a trading-enabled Alpaca server** to complete an analysis. Analysis never needs it.
- If a trading tool *is* somehow present (a differently-wired server), **still never call it.** The skill is read-only. Output a structure the user places themselves.

The account behind the agent wrapper is a **paper** account. Alpaca's market-data entitlement is user-level, so paper keys return the same SIP/OPRA data as live — using paper costs nothing in data quality and removes all execution risk.

> **Caveat that must not be skipped:** if the user's *real* book is at a different broker (or a live Alpaca account), the paper account's positions are **not** their positions. Before answering any position-management question from Alpaca data, confirm the book you are reading is the book they are asking about. A confident P/L number from the wrong account is worse than no number.

## 3. Tool map — by the question being asked

| Question | Tools |
|---|---|
| **What do I hold / what's my P/L** | `get_all_positions`, `get_open_position`, `get_account_info`, `get_portfolio_history` |
| **What did I do and when** | `get_orders`, `get_order_by_id`, `get_account_activities`, `get_account_activities_by_type` |
| **Chain with greeks + IV** | `get_option_chain`, `get_option_snapshot` |
| **Price a specific leg** | `get_option_latest_quote`, `get_option_latest_trade`, `get_option_bars`, `get_option_trades` |
| **Which contracts exist** | `get_option_contracts`, `get_option_contract` |
| **Underlying price / tape** | `get_stock_snapshot`, `get_stock_latest_quote`, `get_stock_latest_trade`, `get_stock_bars`, `get_stock_quotes`, `get_stock_trades` |
| **Movers** | `get_market_movers`, `get_most_active_stocks` |
| **Is the market open / when's the next session** | `get_clock`, `get_calendar` |
| **Splits, dividends, corporate actions** | `get_corporate_actions`, `get_corporate_action_announcements` |
| **Headlines** | `get_news` (no sentiment scoring — that comes from Massive `/v2/reference/news`) |
| **Tradability / shortability / options-enabled** | `get_asset`, `get_all_assets` |

## 4. Division of labour with Massive

Both cover quotes and chains. Pick deliberately rather than by whichever tool is closer to hand:

| Use | Source | Why |
|---|---|---|
| Per-strike aggregation, GEX map, chain-wide SQL | **Massive** | `store_as` + `query_data` do it in one round-trip; Alpaca has no aggregation layer. |
| Tick-level option tape, condition/exchange codes | **Massive** | Deeper history and the reference tables for the codes. |
| Futures, indices (VIX curve), macro, financials, earnings, news sentiment | **Massive** | Alpaca has none of these. |
| **Positions, cost basis, P/L, order history** | **Alpaca** | Massive has none of these. |
| Quick single-leg quote before quoting a structure | **Alpaca** | Fewer moving parts than a full snapshot pull. |
| Market calendar / clock | **Alpaca** | Purpose-built; `get_calendar` handles holidays and half-days. |
| **Cross-check before a recommendation** | **Both** | When the two disagree on a mark by more than the spread, say so and use the wider/more conservative one. Do not silently pick the number that supports the thesis. |

## 5. Field traps

- **Alpaca greeks / IV are its own solve** — they will not match Massive's to the last digit. A small disagreement is normal and is not a data error; a *large* one means one side is stale, and the fix is to check the quote timestamp, not to average them.
- **Options quotes need the OPRA entitlement.** With an indicative/delayed feed a "latest quote" can be minutes old — check the timestamp before calling anything executable.
- **Positions are broker state, not truth about intent.** A multi-leg structure appears as N independent legs; reassemble it yourself before reasoning about the position, or you will size a spread as if it were two naked positions.
- **`get_option_chain` is paginated and wide.** Bound it (expiry, strike band) rather than pulling everything and truncating silently.
- **Paper fills are simulated.** Paper order history is not evidence about real-world fill quality or slippage — never cite it in a slippage estimate.

## 6. Hard rule — no execution, ever

Read-only. No order placement, modification, or cancellation, on paper or live, regardless of how the request is phrased or how confident the setup looks. The deliverable is always **a structure the user places themselves**: legs, strikes, expiry, limit price, max profit / max loss, and the invalidation level.

Never generate code that places trades. Never claim an order was staged, submitted, or filled.

## Related

- [`../SKILL.md`](../SKILL.md) — Data Access tier order.
- [`massive-data.md`](massive-data.md) — tier 1: chains, tape, futures, macro, and the derivations that replace vendor GEX / net-premium / IV-rank feeds.
- [`strategies.md`](strategies.md) — position management; the exit and roll rules that consume the position data above.
- [`pitfalls/30-stop-distance-determines-size.md`](pitfalls/30-stop-distance-determines-size.md) · [`pitfalls/31-daily-loss-limit-drawdown-governor.md`](pitfalls/31-daily-loss-limit-drawdown-governor.md) — account equity from `get_account_info` is the denominator both rules need.
- [`pitfalls/13-take-profit-discipline.md`](pitfalls/13-take-profit-discipline.md) — exit decisions need real cost basis, not a remembered one.
