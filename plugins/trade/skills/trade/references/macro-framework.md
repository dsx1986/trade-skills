---
type: Framework
title: Macro Analysis Framework (宏观七环节 — 定价先于预测)
description: Turning macro reading into a tradeable judgment — the seven questions any macro call must answer, the seven-stage pipeline (marginal driver → micro-to-macro → market-implied pricing → second derivative → price as evidence → cross-asset confirmation → expression & sizing), the eight dashboard families mapped to this stack's data tiers, and the eight output modes (晨报 / 收盘复盘 / 周报 / 交易前会诊 / 月报 / 13F / 背离监控 / 主题深度). Load for macro regime reads, "what is driving the market", digesting a brokerage macro report, or translating a macro view into an equity/options expression.
tags: [macro, regime, market-implied-pricing, second-derivative, cross-asset, expression, position-sizing, morning-note, dashboard, druckenmiller]
timestamp: 2026-07-30T04:30:00Z
---

# Macro Analysis Framework (宏观七环节 — 定价先于预测)

How to turn macro *reading* into macro *judgment*: a Druckenmiller-style PM pipeline, adapted to a US-equity **options** book. Source discipline is the seven-stage sell-side workflow; the adaptation here is the pricing map (§3), the expression bridge (§7), and the honest limits (§11) for this data stack.

**Where this sits**: this is the top-of-funnel framework — it produces a *regime and a driver ranking*. Structure selection still runs through [`strategies.md`](strategies.md)'s three axes (direction / vega / asymmetry); entry timing still runs through [`pitfalls/27-retest-entry-confirmation.md`](pitfalls/27-retest-entry-confirmation.md); market-level session attribution has its own file, [`overnight-futures-framework.md`](overnight-futures-framework.md), which is §1 + §3 of this framework specialized to the Globex night.

> **Hard rule of this file — 定价先于预测.** Never say a macro outcome is bullish or bearish before stating what the market already implies. 没有差距就没有交易 (see §3, and pitfalls [`08`](pitfalls/08-priced-in-not-binary.md) / [`28`](pitfalls/28-macro-right-trade-wrong.md)).

---

## 0. The seven questions (gate — answer all seven or the view isn't finished)

| # | Question | Plain reading |
|---|---|---|
| 1 | 边际上什么在变？ | Not "is the economy good" — *which variable turned vs last month* |
| 2 | 加速还是减速？ | Direction and speed are separate facts |
| 3 | 市场现在隐含了什么？ | What scenario is the current price already assuming |
| 4 | 基本面与定价的最大差距在哪？ | The gap **is** the alpha; no gap, no trade |
| 5 | 什么催化剂逼市场重新定价？ | Right with no catalyst = bleeding carry until you're wrong |
| 6 | 哪个资产/结构最干净地表达它？ | Same view, wrong expression, same loss |
| 7 | 什么能证明我错了，怎么减？ | 不会认错的人最终被清掉 |

**判断对经济 ≠ 判断对交易.** A correct forecast still loses money if it's ① already priced, ② early/late, ③ expressed through a contaminated instrument, or ④ sized too big for the vol. This is pitfall [`28`](pitfalls/28-macro-right-trade-wrong.md) — read it before publishing any macro-driven trade.

---

## 1. 识别边际驱动 (dynamic driver hierarchy)

No permanent ranking of asset classes. Rates / FX / liquidity are usually good anchors (they set the cost of capital), but each regime has its **own** dominant marginal variable: monetary policy · fiscal & Treasury supply · bank credit · housing · corporate earnings · technology adoption · commodity supply shock · FX & external imbalance · positioning / forced flows · geopolitics.

Every analysis opens by answering: what is the dominant marginal variable **now**; what leads it, what merely confirms it; what the transmission path is; which markets *must* respond if the call is right; and which markets, by *not* confirming, would weaken or kill it.

- **Open with one variable, then a 3-link chain.** e.g. `oil supply shock → core-inflation risk → Fed reaction function → rate path repriced → cross-asset`. Never open with YoY GDP — that's the rear-view mirror.
- 上一阶段的主导变量常已让位 (2023 的加息预期 → 2026 的油价供给冲击 / AI capex). Re-ask the question every month, not once a cycle.
- Multiple central banks = multiple independent paths, not one "global rates" object (Fed hold-longer vs ECB hiking vs BoJ hiking price differently).

**自检**: ☐ 第一段点出单一主导变量（不是罗列数据） ☐ 画出了 变量 → 传导 → 被定价的资产 ☐ 说明"若对，哪些市场必须响应" ☐ 说明"哪些市场不确认就削弱判断"

## 2. 微观到宏观的拼图

A macro conclusion built only on GDP / CPI / NFP / central-bank statements is crippled. Official data should **confirm, challenge, or update** the bottom-up picture — not dictate it because it's official.

| Family | Leading evidence to pull | Typical lead (经验值，非定律) |
|---|---|---|
| Banks | loan demand, lending standards (SLOOS), deposit flow, funding cost, delinquency | 2–4 quarters on capex & defaults |
| Housing | mortgage rate, permits, starts, builder orders, cancellation rate | 1–3 quarters on the housing GDP line |
| Consumer | card spend, foot traffic, units, inventory, promo intensity, low-income stress | 1–2 quarters on retail sales |
| Manufacturing | new orders, backlog, lead times, utilization, freight, IP | 1–2 quarters on industrial production |
| Corporate investment | capex guidance, equipment orders, **data-center spend**, software/ad budgets | 2–4 quarters |
| Labor | job postings, temp help, hours worked, hiring intentions, wage pressure | 1–3 months on payrolls |
| Tech | semi demand, lead times, cloud capex, **power demand**, component bottlenecks | 1–3 quarters |
| Commodities | inventories, spot premium, producer discipline, term structure, freight | weeks–months |
| Corporate comms | management tone, guidance, order visibility, margin commentary | contemporaneous → 1 quarter |
| Earnings revisions | breadth, magnitude, sector leadership, dispersion | 1–2 quarters, and a *top* warning when breadth deteriorates while growth holds |

For each micro signal state: which macro variable it leads, the typical lead, whether other indicators confirm it, and **whether the market has already reacted** (reacted = the value is eaten).

**The industry-scale test**: when a sector-level boom shows up (AI power demand, memory pricing, defense), force the question *"are these orders / this capex large enough to move the aggregate?"* If yes, you have a genuine micro→macro chain (AI power demand → grid & generation capex → total fixed investment → GDP composition → rates/inflation pull), not just a narrative. Cross-check the single-name side with [`parent-order-flow-framework.md`](parent-order-flow-framework.md) before assuming the theme is still un-crowded.

**自检**: ☐ 至少 1–2 个微观领先指标支撑 ☐ 每个信号说得出"领先谁、领先多久" ☐ 信号之间相互确认还是矛盾 ☐ 市场是否已反应

## 3. 定价先于预测 (the highest-value stage)

Split every material call into: **基本面观点** (what will happen) · **市场隐含** (what price assumes) · **错价** (the gap) · **催化剂** (what forces convergence) · **时间窗** (when) · **失败点** (what proves the market right and you wrong).

Where the implied view lives, and how to pull it **in this stack** (tiers per `SKILL.md` → Data Access):

| What you need implied | Read it from | This stack |
|---|---|---|
| Policy path | fed funds / SOFR futures strip, OIS forwards | **No direct OIS feed here** — proxy with the futures strip via TradingView MCP quotes (ZQ / SR3 continuous) and label it a proxy |
| Inflation expectations | breakevens, 5y5y | FRED via funda-data: `T10YIE`, `T5YIE`, `T5YIFR` |
| Real discount rate | TIPS real yield | FRED `DFII10`, `DFII05` |
| Curve shape / term premium | 2s10s, 3m10y, ACM term premium | FRED `DGS2` `DGS10` `DGS3MO`; ACM series if available |
| Credit risk appetite | IG / HY spreads, CDX | FRED `BAMLC0A0CM`, `BAMLH0A0HYM2`; HYG/LQD tape via TV MCP |
| Equity assumptions | index multiple, EPS growth, margin path, breadth, dispersion | funda-data estimates + TV MCP screeners; equal-weight vs cap-weight (RSP/SPY) |
| Vol / event premium | IV level, term structure, skew, correlation | TV desktop reader (per-strike IV + greeks); VIX9D/VIX/VIX3M/VIX6M — see [`pitfalls/25`](pitfalls/25-vix-options-futures-mechanics.md) |
| FX / cross-border | carry, growth differentials, policy divergence | DXY + pairs via TV MCP |
| Event odds | prediction-market odds | Polymarket via funda-data |
| Positioning | CFTC, CTA/vol-control triggers, dealer gamma | funda-data GEX/flow → [`gamma-framework.md`](gamma-framework.md) |

Then quantify the gap in the *market's* units: "点阵图中位 2026 不变或加息一次 vs 期货 strip 隐含 X bp 降息 → 差 Y bp" is a tradeable statement. "我觉得会更鹰" is not.

**A central bank's minutes are a reaction function, not a forecast.** Your job isn't guessing the next move — it's judging whether the market's pricing of the *reaction function* matches the one the bank just described. Mismatch = trade.

**自检**: ☐ 说出了对应的市场隐含定价（哪个工具、什么数值） ☐ 量化了差距 ☐ 承认"没差距 = 没 alpha" ☐ 给了催化剂 + 时间窗

## 4. 变化的变化 (second derivative)

For every core variable, separate seven dimensions: **水平 · 方向 · 加速度 · 意外 (vs consensus/前值) · 扩散 (broad vs single-line) · 持续性 (base effect/weather vs structural) · 定价**.

Canonical asymmetries — 边际分析 beats static labels:

- 「弱但改善」往往比「强但减速」更看涨
- 「通胀在减速，但减速在放慢」比通胀的绝对水平更重要
- 「盈利仍增长但修正广度恶化」= 预警
- 「流动性仍充裕但其冲量转负」= 预警
- headline 与 core 背离（油价推 headline，服务/薪资撑 core）= 别用 headline 推政策
- 同一因子方向可反转（AI 先推高 core PCE：内存/硬件涨价；后拉低：生产率）→ 这是「持续性」维度的价值

This is pitfall [`29`](pitfalls/29-second-derivative-not-level.md); it's also the single most common failure when reading a data print live.

**自检**: ☐ 区分了水平 vs 方向 ☐ 问了加速度 ☐ surprise 是广泛的还是单点的 ☐ 暂时 vs 持久 ☐ 是否已定价

## 5. 价格反应作为证据

Price action is **evidence**, not just the scoreboard. Ask every session:

- Can good news still produce upside? Can bad news still produce downside?
- Is the asset out/under-performing its benchmark on the same news?
- Volume, vol, gaps, intraday reversals — see [`price-action-framework.md`](price-action-framework.md)
- Do correlations behave the way the thesis predicts?
- Is leadership **broadening** (healthy) or **narrowing** (dangerous)?
- Are repeated catalysts producing **decaying** price response? (= narrative digested)
- Is the market accepting or rejecting the current narrative?

**核心规则**: 一个被数据支持、却被价格反复拒绝的判断 → 降低置信度、换时机证据、或换表达。Not "the market is wrong."

**Regime-change tell**: when a catalyst that *should* work stops working (hikes that no longer cool the economy — an "inelastic" economy under supply constraints), that's not the market being stupid; it's the transmission channel changing. Re-run §1 instead of doubling down. Related: [`pitfalls/04`](pitfalls/04-flip-on-invalidation.md) (precondition broken → flip), [`pitfalls/03`](pitfalls/03-tape-over-dcf.md) (tape outranks the macro opinion), [`pitfalls/20`](pitfalls/20-post-earnings-momentum-vs-fade.md) (pattern vs actual flow).

**自检**: ☐ 最近 3–5 个催化剂的价格反应是否符合判断 ☐ 不符合 → 时机 / 表达 / 判断本身 ☐ 领涨在扩散还是收窄 ☐ 重复催化剂反应是否递减

## 6. 跨资产确认（不强行因果）

Test the core conclusion across ≥2 market families, while distinguishing **相关性** (moving together) from **因果传导** (A drives B) from **巧合** (both respond to a third variable). Yields are the standing example of a variable that is coincident, never causal — [`pitfalls/22`](pitfalls/22-yields-not-causal.md).

If the call is "Fed holds longer," then curve + DXY + commodities + EM should respond **consistently**. If rates rise but the dollar doesn't, commodities don't move, and EM doesn't fall — that's a **divergence, and divergence is more informative than confluence**. Adjudicate it as one of three things: normal transmission lag · temporary positioning distortion · the thesis is wrong.

When leaning on a single leading market, say why it leads, which markets should eventually confirm, the expected lag, and what non-confirmation would mean. **Don't bolt two markets together just to fill the template.**

**自检**: ☐ ≥2 个资产族确认 ☐ 是真因果还是同因巧合 ☐ 背离归因（滞后/扭曲/推翻） ☐ 领先市场应被谁跟随

## 7. 最佳表达与仓位风险 (the options-book bridge)

Same view, different expression, different P/L. Score 2–4 candidates on: **敏感度 · 已定价 · carry · 凸性 · 时机 · 流动性 · 拥挤 · 污染 (exposure to unrelated factors) · 组合适配 · 工具适配**.

For this book, 污染 is usually the deciding column:

| Macro view | Contaminated expression | Cleaner expression |
|---|---|---|
| Short-term inflation up, long-term productivity-deflation | TIPS long (contaminated by the oil leg); memory/hardware equity (contaminated by the AI capex cycle) | Front-end real rates vs long end; front-end inflation upside vs selling long-end inflation upside |
| A single sector's capex boom | Index long (diluted by 9 other sectors) | The bottleneck component name — but check crowding + whether earnings revisions already reflect it |
| Broad risk-off | Single-name puts (idio noise dominates) | Index put spread / VIX **futures**-anchored structure ([`pitfalls/25`](pitfalls/25-vix-options-futures-mechanics.md)) |
| Policy repricing | Rate-sensitive equity basket (multi-factor) | Duration proxy vs cyclical, or the rate instrument itself |

Then hand off: the vega sign comes from IV regime not the macro view ([`pitfalls/19`](pitfalls/19-direction-vega-independent-axes.md)); if the macro read produces a **high-conviction directional** setup, capped-upside structures are banned ([`pitfalls/24`](pitfalls/24-capped-upside-vs-bull-conviction.md)); size and exit thresholds go through [`pitfalls/13`](pitfalls/13-take-profit-discipline.md) and [`pitfalls/23`](pitfalls/23-hazard-rate-discounting.md).

**Lifecycle tagging** — every live macro judgment carries a stage, and position size follows the stage: **观察 (small) → 发展 → 确认 (add) → 拥挤 (trim) → 恶化 → 破碎 (out)**. 高置信 ≠ 大仓位: size must reflect liquidity, vol, correlation to the rest of the book, and how *clearly falsifiable* the thesis is. A thesis with no clean invalidation level cannot be sized up, however convincing it reads.

**自检**: ☐ 列了 ≥3 个候选表达 ☐ 选中的那个污染最少 ☐ 标明生命周期阶段且仓位匹配 ☐ 写下认错条件（减仓 or 翻仓） ☐ 仓位反映了波动率/相关性/流动性，不只是"信心"

---

## 8. 八大 dashboard 家族

Before analyzing, ask which **1–2** families the current regime's dominant driver lives in; go deep there, use the rest as confirmation. In a broad-market mode, sweep all eight.

| Family | Purpose | Panels | Where in this stack |
|---|---|---|---|
| 1. 流动性与资金 | financial-conditions tightness, liquidity impulse | Fed balance sheet, reserves, RRP, TGA, SOFR, FCI, FX basis | FRED via funda-data: `WALCL`, `WRESBAL`, `RRPONTSYD`, `WTREGEN`, `SOFR`, `NFCI` |
| 2. 利率与通胀 | market-implied policy & inflation path | nominal/real yields, breakevens, curve, futures strip, term premium | §3 table |
| 3. 信用与银行 | credit leads the cycle | IG/HY spreads, CDX, HYG/LQD, issuance, defaults, lending standards | FRED spreads + TV MCP tape |
| 4. 股票内构与盈利 | is the move healthy | equal- vs cap-weight, breadth, earnings revisions, dispersion | TV MCP screeners; funda-data estimates |
| 5. 仓位/系统资金流/衍生品 | squeeze risk & mechanical flow | CTA, vol-control, dealer gamma, HF exposure, CFTC, fund flows | funda-data GEX & flow → [`gamma-framework.md`](gamma-framework.md), [`parent-order-flow-framework.md`](parent-order-flow-framework.md) |
| 6. 大宗与外汇 | supply shocks & global demand thermometer | DXY, carry, copper/gold, oil & metals curves, inventories | TV MCP `futures_category_snapshot`, `futures_top_movers` |
| 7. 微观到宏观 | verify the leading signals | bank lending, builders, retail, freight, semis, cloud capex | funda-data fundamentals/transcripts/supply-chain (§2) |
| 8. 新闻与催化剂流 | when is the next repricing window | high-information catalysts tied to the dominant driver | funda-data calendar + TV news; convert foreign prints to ET ([`overnight-futures-framework.md`](overnight-futures-framework.md) §0) |

## 9. 八种输出模式

Each mode has a **fixed output order** — the point is to force framework order instead of writing thoughts as they arrive. These are reachable through the normal `analysis` route (natural language: 「晨报」「收盘复盘」「盯住 NVDA」…), see [`commands/analysis.md`](commands/analysis.md).

| Mode | Trigger | Output order |
|---|---|---|
| A. 晨报 | 晨报 / 今天怎么看 | 主导论点 → 变化 → 已定价 → 确认与摩擦 → 微观拼图 → 最佳表达 → 认错条件 → regime |
| B. 收盘复盘 | EOD / 收盘复盘 | 论点 mark-to-market → 真正驱动 → 变化的变化 → 新定价与未确认 → 交易复盘 → 明日验证图 |
| C. 周报 | 周报 / 下周怎么看 | 周论点 mark → regime 演进 → 微观拼图 → 叙事 vs 定价 → 仓位与被迫资金流 → 下周不对称 → 情景图 |
| D. 交易前会诊 | 交易前看一眼 / 仓位怎么下 | 用户隐含论点 → 论点碰撞检查 → 基本面与定价差 → 盘面与仓位 → 最佳工具 → 交易计划 → 仓位 |
| E. 月报 | 月报 / regime review | 主导变量与 regime → 增长/通胀/政策/流动性/盈利各自的变化 → 三情景框架 |
| F. 13F 复盘 | 13F / why did he buy | 结论先行 → 硬事实 → 合理推断 → 微观宏观契合 → 定价与仓位 → 替代解释 |
| G. 资产背离监控 | 盯住 [TICKER] | 目标资产语境 → 叙事 vs 盘面 → 微观宏观支撑 → 仓位资金流 → 背离裁决 → 验证与执行位 |
| H. 主题/行业深度 | 深度分析 [主题] | 核心论点 → 价值链与领先指标 → 供需产能定价权 → capex 与盈利修正周期 → 宏观传导 → 已定价 → 赢家输家 → 仓位拥挤 → 催化剂时机失败点 |

Mode D is the one that must always run the three-axis check from [`strategies.md`](strategies.md) before it prints a structure.

## 10. 刻意练习 (research-report reps)

Reading is passive; these are active. Applied to the user's own research library and to anything digested via [`commands/import.md`](commands/import.md).

1. **拆解式阅读** — force a report into the seven stages; mark each ✓ / △ / ✗. Even a top-tier house rarely covers all seven. **Your alpha is the stage it skipped** (typically 5 价格反应 and 7 表达).
2. **时间序列对比** — read 2–3 consecutive issues of one series: did the dominant driver change; which stage got overturned; was the confidence adjustment right?
3. **反方辩论** — take a bullish report, write the bear case using stages 1–4, and require the bear side to answer all seven questions too. A view a clean opposite can kill shouldn't have been sized.
4. **定价缺口量化** — take a report with an explicit policy path, pull the contemporaneous strip / curve / spreads, and quantify report-vs-market. Gap = candidate alpha.
5. **跨资产互验** — split a global-macro weekly into rates / commodities / FX / EM, then ask where the four disagree and adjudicate the divergence (§6).
6. **模拟 PM 决策** — one week: mode A or B daily, mode C on the weekend, mode D on Monday with entry / invalidation / target / size. This is the only rep that actually builds the skill.

| Stage | Marker | Focus |
|---|---|---|
| L1 | can slot a report into the seven stages | rep 1, ~20 reports |
| L2 | can name *which stage is missing* | reps 1+3 |
| L3 | can quantify the pricing gap unaided | rep 4 (needs curve/strip data) |
| L4 | can cross-verify and spot divergence | rep 5 |
| L5 | can run mock-PM decisions with trade parameters | rep 6, ≥4 weeks |
| L6 | admits error fast when price rejects the view | live + review |

The L5→L6 jump is not accuracy, it's **speed of admitting error**. Druckenmiller has said publicly he was directionally right less than half the time; survival came from cutting. Stage 7's invalidation condition and stage 5's price-as-evidence exist for exactly that jump.

## 11. Limits of this framework here (be honest about these)

- **No OIS / swap-forward feed in this stack.** §3's policy-path row is a *futures-strip proxy*. Label it as a proxy rather than quoting an implied cut count as fact.
- **Macro → single-name beta is unstable.** A correct macro call can be completely dominated by idio news on any given name. For a clean idiosyncratic setup, the macro backdrop is noise unless the event *is* a macro print ([`pitfalls/22`](pitfalls/22-yields-not-causal.md) §5).
- **Lead times in §2 are empirical regularities, not laws** — they stretch and compress by regime, so treat them as ordering hints, not timing signals.
- **A macro thesis is not a position.** Nothing here authorizes a structure; every trade still passes the three axes, the counterfactual P/L matrix (`SKILL.md` Hard Rule 3), and a written invalidation level.
- **Third-party macro reports are the user's knowledge, not this library's.** A digest of a shared brokerage/macro report belongs in the personal knowledge dir as a writedown ([`commands/import.md`](commands/import.md)); this file is the lens used to read it, not a place to store it.

---

**Related**: [`overnight-futures-framework.md`](overnight-futures-framework.md) (this framework specialized to the 夜盘 session) · [`price-action-framework.md`](price-action-framework.md) (stage 5 microstructure) · [`parent-order-flow-framework.md`](parent-order-flow-framework.md) (stage 5/§8-family-5 positioning) · [`gamma-framework.md`](gamma-framework.md) (dealer/mechanical flow) · [`strategies.md`](strategies.md) (stage 7 structure selection) · pitfalls [`28`](pitfalls/28-macro-right-trade-wrong.md), [`29`](pitfalls/29-second-derivative-not-level.md), [`22`](pitfalls/22-yields-not-causal.md), [`08`](pitfalls/08-priced-in-not-binary.md), [`19`](pitfalls/19-direction-vega-independent-axes.md), [`24`](pitfalls/24-capped-upside-vs-bull-conviction.md).
