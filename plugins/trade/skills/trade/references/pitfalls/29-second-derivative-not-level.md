---
type: Trading Pitfall
title: Read the second derivative, not the level — "weak but improving" beats "strong but decelerating"
description: A data print has seven separable dimensions (level, direction, acceleration, surprise, breadth, persistence, priced). Static labels ("inflation is high", "growth is strong") mis-price turns; the marginal change is what trades.
severity: HIGH
appliesTo: macro-framing, data-print, earnings-revisions, thematic, regime-identification
tags: [second-derivative, acceleration, breadth, surprise, persistence, inflation, earnings-revisions, macro]
timestamp: 2026-07-30T04:30:00Z
---

## Read the second derivative, not the level — "weak but improving" beats "strong but decelerating"

Markets trade the **marginal change**, not the absolute state. A data point collapsed into a static label ("通胀高" / "增长强" / "盈利还在增长") throws away the information that actually moves price. Every core variable has seven separable dimensions, and a call that hasn't separated them is not finished:

| Dimension | Question |
|---|---|
| 水平 Level | absolute current state |
| 方向 Direction | improving or deteriorating |
| **加速度 Acceleration** | is the change speeding up or slowing down |
| 意外 Surprise | vs consensus and vs prior |
| 扩散 Breadth | broad-based or one line item |
| 持续性 Persistence | transitory (base effect, weather, one-off) or structural |
| 定价 Priced | has the market already absorbed it |

**Why it matters**: the classic asymmetries all live in the derivative, not the level:

- **「弱但改善」往往比「强但减速」更看涨** — the turn is the trade; the level is the rear-view mirror.
- **「通胀在减速，但减速在放慢」** is a different (and more hawkish) fact than "inflation is falling," and it's invisible if you only track the YoY level.
- **「盈利仍在增长，但修正广度在恶化」** is a top warning while the level still reads healthy.
- **「流动性仍充裕，但冲量转负」** is a tightening signal while the stock of liquidity looks fine.
- **headline vs core divergence**: an oil-driven headline pickup with sticky-but-not-accelerating core is not the same regime as a broad core re-acceleration — reading headline alone produces the wrong policy conclusion.
- **A single factor can reverse sign over the horizon**: AI capex pushes core PCE *up* near-term (memory/hardware pricing) and *down* later (productivity). Direction without a persistence judgment is a coin flip on the horizon you actually hold.

A downside CPI surprise driven by one volatile line (used cars, car insurance, airfares) and a downside surprise with broad-based declines have the same headline and opposite trading implications: the first mean-reverts next month, the second changes the disinflation *path* and therefore the policy path.

**How to apply**:

1. **Write the print as a 3-tuple before any conclusion**: level → direction → acceleration. If you can't state the acceleration, you haven't computed the second derivative yet (3m annualized vs 6m annualized vs YoY; MoM sequence over 3 prints, not one).
2. **Decompose the surprise for breadth** before treating it as signal: how much came from ≤2 line items? Is the diffusion index / share of components rising or falling? Single-line surprise → discount to near zero for the policy read.
3. **Classify persistence explicitly** — base effect, weather, strike/one-off, seasonal quirk, or structural (wages, rents, capacity, supply discipline). Say which, and say when it rolls off.
4. **Apply the same test to bottom-up data, not just macro prints** — earnings revision *breadth*, not just direction; parent-order net flow's *derivative* (a decaying outflow is a different state from a steady one — see [`../parent-order-flow-framework.md`](../parent-order-flow-framework.md)); backlog growth rate, not backlog level.
5. **Close with the pricing dimension** — a correctly identified second-derivative turn that the market has already absorbed is not tradeable ([`28-macro-right-trade-wrong.md`](28-macro-right-trade-wrong.md), [`08-priced-in-not-binary.md`](08-priced-in-not-binary.md)).
6. **When reporting a data print in a 晨报/复盘**, the required output line is: `变量 — 水平 / 方向 / 加速度 / surprise(广度) / 持续性 / 已定价?` Anything shorter is a headline, not analysis.

**Cross-references**:
- [`../macro-framework.md`](../macro-framework.md) §4 — this rule as a pipeline stage, with the eight dashboard families that supply the inputs
- [`28-macro-right-trade-wrong.md`](28-macro-right-trade-wrong.md) — the pricing/expression half of the same problem
- [`22-yields-not-causal.md`](22-yields-not-causal.md) — decompose the yield move (real vs breakeven, slope) instead of reading the nominal level
- [`01-consensus-not-bearish.md`](01-consensus-not-bearish.md) — consensus is a trailing level, not a ceiling
- [`../parent-order-flow-framework.md`](../parent-order-flow-framework.md) — flow states split by the derivative of the flow, not its level
