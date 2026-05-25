const DATA_URL = "./data/overall_strategy_run.json?v=20260524-product-13";
const FD_BENCHMARK_RATE = 1.95;
const FD_BENCHMARK_YEARS = 4;
const SP500_BENCHMARK_RETURN = 56.1;
const SP500_BENCHMARK_PERIOD = "Jan 2022-May 2026";
const SP500_YEARLY_RETURNS = {
  "2022": -19.4,
  "2023": 24.2,
  "2024": 23.3,
  "2025": 16.4,
  "2026": 6.8,
};

const COLORS = {
  green: "#006b4f",
  teal: "#176f80",
  amber: "#b88935",
  red: "#b65349",
  ink: "#10211b",
  muted: "#68736d",
  grid: "#e6e1d8",
  line: "#e5e0d6",
  panel: "#f7f6f1",
  bg: "#f6f4ef",
};

let DATA = null;
let currentLang = "en";
let currentMobileSlide = 0;

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = byId(id);
  if (node) node.textContent = value;
}

function setHTML(id, value) {
  const node = byId(id);
  if (node) node.innerHTML = value;
}

const MARKET_REGIMES = {
  "2022": { type: "bear", en: "Bear", zh: "熊市" },
  "2023": { type: "mixed", en: "Mixed / recovery", zh: "震荡 / 修复" },
  "2024": { type: "bull", en: "Bull", zh: "牛市" },
  "2025": { type: "mixed", en: "Mixed / rotation", zh: "震荡 / 轮动" },
  "2026": { type: "mixed", en: "Mixed YTD", zh: "震荡 YTD" },
};

const REGIME_COLORS = {
  bull: "#006b4f",
  mixed: "#b88935",
  bear: "#176f80",
};

const TEXT = {
  en: {
    asOf: "As of May 24, 2026",
    downloadScreenshot: "Download Screenshot",
    coverEyebrow: "Investor Overview",
    coverTitle: "Systematic Alpha Portfolio",
    coverSubtitle: "Validated across multiple market cycles.",
    coverNarrativeOne: "A portfolio of eight return engines, designed for allocation review rather than single-strategy storytelling.",
    coverNarrativeTwo: "Crypto is the first proof point. The product layer can extend into other liquid markets over time.",
    portfolioRoi: "Portfolio ROI",
    productEyebrow: "Company Product",
    productTitle: "Built for allocation.",
    productCopy: "The product is simple at the surface: portfolio ROI, yearly evidence, monthly behavior, and strategy contribution. The complexity stays behind the system.",
    productOneTitle: "Alpha Portfolio",
    productOneCopy: "Combined view of multiple strategy products, positioned as the main allocation story.",
    productTwoTitle: "Strategy Products",
    productTwoCopy: "Eight individual strategy engines with separate roles and standalone ROI records.",
    productThreeTitle: "Market Expansion",
    productThreeCopy: "Crypto is the first proof point. The product layer can later extend into FX, indices, commodities, and other liquid markets.",
    problemEyebrow: "The Problem",
    problemTitle: "The problem is not AI. It is unverified AI marketing.",
    problemOneTitle: "AI label first",
    problemOneCopy: "Many offers lead with the word AI before showing a real strategy process.",
    problemTwoTitle: "Generic indicator core",
    problemTwoCopy: "Under the surface, many systems are still basic Supertrend, MACD, RSI, and moving-average combinations.",
    problemThreeTitle: "No serious backtest",
    problemThreeCopy: "Without regime-tested evidence, a strategy is only a claim.",
    problemFourTitle: "No execution proof",
    problemFourCopy: "A signal that cannot survive lag, fees, execution, and review is not ready for allocation.",
    aiMarketEyebrow: "Market Reality",
    aiMarketTitle: "Malaysia's AI trading market is noisy.",
    aiMarketCopy: "The investor problem is simple: many products sound advanced, but the proof layer is thin. The gap between marketing language and validated process is where capital gets misled.",
    aiMarketOneTitle: "AI as packaging",
    aiMarketOneCopy: "The story can sound intelligent even when the underlying trading logic is ordinary.",
    aiMarketTwoTitle: "Screenshots over evidence",
    aiMarketTwoCopy: "A few profitable trades are not the same as a tested investment process.",
    aiMarketThreeTitle: "Low auditability",
    aiMarketThreeCopy: "Investors rarely get clean backtest, monthly behavior, contribution, and execution review in one place.",
    indicatorEyebrow: "Generic Indicator Problem",
    indicatorTitle: "Supertrend, MACD and RSI are not a strategy by themselves.",
    indicatorCopy: "Indicators can be useful inputs. But when they are simply stacked together and called AI, the result is usually reactive, crowded, and fragile across regimes.",
    indicatorOneTitle: "Easy to copy",
    indicatorOneCopy: "Common indicators rarely create lasting differentiation on their own.",
    indicatorTwoTitle: "Late by design",
    indicatorTwoCopy: "Many indicator combinations only confirm after the move has already developed.",
    indicatorThreeTitle: "Weak alone",
    indicatorThreeCopy: "Without portfolio context and validation, indicator logic can look good in one market and poor in another.",
    backtestGapEyebrow: "Proof Gap",
    backtestGapTitle: "No backtest, no allocation case.",
    backtestGapCopy: "A fundable strategy needs more than a signal screenshot. It needs enough evidence for investors to understand repeatability, behavior across cycles, and whether the edge survives real trading assumptions.",
    backtestGapCallout: "Evidence should be layered.",
    backtestGapCalloutCopy: "Backtest, annual ROI, monthly distribution, market regime review, contribution breadth, and reporting all need to point in the same direction.",
    lagEyebrow: "Signal Quality",
    lagTitle: "Lag kills edge before execution starts.",
    lagCopy: "A late signal can still look correct on a chart, but the investable return is already reduced by entry delay, fees, slippage, and market crowding.",
    lagCallout: "The goal is not more signals.",
    lagCalloutCopy: "The goal is better timing, better filtering, and fewer low-quality decisions reaching execution.",
    standardEyebrow: "Validation Standard",
    standardTitle: "A serious strategy must prove the process.",
    standardCopy: "For investor review, the question is not whether the system sounds intelligent. The question is whether the strategy has been tested, structured, monitored, and made explainable.",
    standardOne: "Backtested record",
    standardTwo: "Regime review",
    standardThree: "Monthly behavior",
    standardFour: "Veto logic",
    standardFive: "Execution awareness",
    standardSix: "Transparent reporting",
    evidenceStackEyebrow: "NTS Evidence Stack",
    evidenceStackTitle: "The pitch is built on evidence, not indicator names.",
    evidenceStackCopy: "NTS Alpha Labs presents the strategy as a portfolio with visible ROI, annual context, monthly behavior, contribution breadth, and a decision layer that can be reviewed before capital is allocated.",
    investorLensEyebrow: "Allocation Case",
    investorLensTitle: "A strong product has to prove more than one number.",
    investorLensCopy: "The case becomes stronger when return, process, discipline, visibility, and scalability are all visible in the same story.",
    investorLensOneTitle: "Return proof",
    investorLensOneCopy: "Headline ROI is stronger when annual and monthly evidence support it.",
    investorLensTwoTitle: "Visible process",
    investorLensTwoCopy: "The portfolio should be easy to review without exposing every internal detail.",
    investorLensThreeTitle: "Scalable base",
    investorLensThreeCopy: "The same infrastructure should support more engines and more liquid markets over time.",
    competitiveEyebrow: "Market Position",
    competitiveTitle: "NTS separates through proof, not AI wording.",
    competitiveCopy: "The advantage is not a louder claim. It is a stronger evidence layer: portfolio ROI, backtest behavior, multiple engines, veto logic, and transparent reporting.",
    edgeArchitectureEyebrow: "Return Architecture",
    edgeArchitectureTitle: "The edge is a system, not one indicator.",
    edgeArchitectureCopy: "NTS combines data analysis, regime review, veto discipline, and multiple return engines. The product is designed so weak signals are filtered before they become portfolio exposure.",
    forwardValueEyebrow: "Forward Value",
    forwardValueTitle: "Future value comes from repeatable expansion.",
    forwardValueCopy: "The upside case is not only one crypto strategy. It is the ability to expand the same research, validation, execution, and reporting discipline into more engines and more liquid markets.",
    forwardValueCallout: "The platform gets stronger as coverage expands.",
    forwardValueCalloutCopy: "More validated engines, more market coverage, and better reporting create a stronger platform value over time.",
    validationEyebrow: "Decision Quality",
    validationTitle: "AI alone is not an edge. Validation is.",
    validationCopy: "Many so-called AI trading systems still depend on delayed signals, black-box rules, and weak verification. NTS adds a decision layer that reviews data, learns from regime behavior, and can veto low-quality setups before execution.",
    validationOneTitle: "Data first",
    validationOneCopy: "Signals are read through market data, liquidity behavior, and historical evidence before they become decisions.",
    validationTwoTitle: "RL-assisted review",
    validationTwoCopy: "The learning layer helps evaluate how market conditions change, instead of assuming one fixed rule always works.",
    validationThreeTitle: "Veto before execution",
    validationThreeCopy: "Not every signal deserves capital. A veto layer is designed to filter weak, late, or low-conviction setups.",
    validationChartData: "Data analysis",
    validationChartRL: "RL review",
    validationChartVeto: "Veto gate",
    validationChartLag: "Lag control",
    validationChartReview: "Review trail",
    solutionEyebrow: "Our Solution",
    solutionTitle: "One portfolio. Multiple independent return engines.",
    solutionCopy: "NTS Alpha Labs is presented as a portfolio first. The strategy set is designed so different engines can contribute under different market conditions.",
    strategyEngines: "strategy engines",
    solutionNote: "Same goal: consistent, risk-aware compounding across cycles.",
    solutionOneTitle: "Portfolio first",
    solutionOneCopy: "Investors review one allocation profile, not isolated strategy claims.",
    solutionTwoTitle: "Multiple engines",
    solutionTwoCopy: "Different return sources are built to participate under different market moods.",
    solutionThreeTitle: "One reporting layer",
    solutionThreeCopy: "Performance, contribution, and monthly behavior stay visible in one investor view.",
    performanceEyebrow: "Performance",
    performanceTitle: "Let the return curve speak.",
    performanceSubtitle: "2022-2026 validated portfolio ROI with supporting evidence across yearly, monthly, and strategy-level records.",
    cumulativeRoi: "Cumulative ROI",
    returnCurve: "Return curve since inception",
    monthly: "Monthly",
    monthlyRoiRecord: "Monthly ROI record",
    contribution: "Contribution",
    portfolioContributionShare: "Portfolio contribution share",
    eightStrategies: "8 Strategies",
    latestStrategyRoi: "Latest strategy ROI",
    takeawayOneTitle: "Clear headline metric",
    takeawayOneCopy: "Cumulative ROI is supported by monthly observations and strategy-level return breadth.",
    takeawayTwoTitle: "Diversified contribution",
    takeawayTwoCopy: "Contribution is distributed across several engines, strengthening the portfolio presentation.",
    takeawayThreeTitle: "Allocation-focused",
    takeawayThreeCopy: "The visible materials focus on return quality, contribution, and portfolio structure.",
    benchmarkEyebrow: "ROI Benchmark",
    benchmarkTitle: "Outperformance needs a reference point.",
    benchmarkCopy: "NTS portfolio ROI is shown against Malaysia fixed deposit rates and a same-period S&P 500 investment so the return gap is immediately visible.",
    benchmarkOverallLabel: "2022-2026 portfolio ROI",
    benchmarkSp500Label: "S&P 500 same-period ROI",
    benchmarkFdLabel: "4-year FD benchmark",
    benchmarkMultipleLabel: "ROI multiple over S&P 500",
    singleYearBenchmark: "Single-year ROI: NTS vs S&P 500 vs FD",
    regimeEyebrow: "Market Regimes",
    regimeTitle: "Annual ROI across market moods.",
    regimeCopy: "Bull years, bear years, and mixed years do not behave the same. The evidence is stronger when annual ROI is shown together with market context.",
    contributionEyebrow: "Portfolio Contribution",
    contributionTitle: "Different engines. One portfolio.",
    contributionCopy: "A fundable portfolio should show both contribution and strategy ROI breadth. The profile is anchored by stronger engines, without presenting the return as a single-source outcome.",
    contributionBarsTitle: "Contribution by engine",
    monthlyBehaviorEyebrow: "Monthly Behavior",
    monthlyBehaviorTitle: "Consistency matters.",
    monthlyBehaviorCopy: "The monthly record turns headline ROI into a more reviewable allocation case: recurring positive months, visible distribution, and a clear pattern over time.",
    monthlyDistribution: "Monthly ROI distribution",
    strategyEyebrow: "Why Breadth Matters",
    strategyTitle: "Different alpha sources reduce dependence.",
    strategyCopy: "Each engine has a role. The point is not to sell eight separate products, but to show that portfolio return does not rely on one market behavior.",
    strategyRoiBreadth: "Strategy ROI breadth",
    strategySideCopy: "The leading engines drive the headline return, while the broader set demonstrates that the portfolio is not dependent on a single return source.",
    qualityEyebrow: "Durability",
    qualityTitle: "Consistency matters.",
    qualityCopy: "The allocation case is stronger when return is viewed together with monthly behavior, market cycles, and contribution breadth.",
    recentMonthlyProfile: "Recent monthly profile",
    annualRoiView: "Annual ROI view",
    marketCycleMap: "Annual market cycle map",
    mixEyebrow: "Portfolio Mix",
    mixTitle: "Return sources.",
    mixCopyTitle: "Return sources",
    mixCopy: "The portfolio is led by a small number of stronger engines, with the remaining strategies adding balance across different market conditions.",
    mixBulletOne: "The largest contributor anchors the portfolio's headline ROI.",
    mixBulletTwo: "Additional engines support the return profile when market leadership changes.",
    mixBulletThree: "This gives investors a clearer view of how the portfolio is built to grow over time.",
    riskEyebrow: "Risk Framework",
    riskTitle: "Protect first. Compound second.",
    riskOneTitle: "Exposure control",
    riskOneCopy: "Positioning is managed so the portfolio does not depend on one oversized view.",
    riskTwoTitle: "Execution discipline",
    riskTwoCopy: "The process favors repeatability over impulse.",
    riskThreeTitle: "Regime awareness",
    riskThreeCopy: "Market context affects how aggressively the portfolio should participate.",
    riskFourTitle: "Portfolio balancing",
    riskFourCopy: "Multiple engines are reviewed as one allocation profile.",
    infraEyebrow: "Infrastructure",
    infraTitle: "An operating system for systematic allocation.",
    infraCopy: "The product is not a trading bot. It is a repeatable operating rhythm that connects data analysis, signal review, veto logic, execution, and monitoring into one reviewable process.",
    railData: "Data",
    railSignal: "Signal",
    railVeto: "Veto",
    railExecution: "Execution",
    railMonitoring: "Monitoring",
    reportingEyebrow: "Reporting Layer",
    reportingTitle: "Transparency makes the portfolio investable.",
    reportingCopy: "Performance, contribution, and monthly behavior are presented clearly without requiring the full internal system to be explained.",
    reportingOneTitle: "Portfolio overview",
    reportingOneCopy: "One place to understand the headline return and active strategy set.",
    reportingTwoTitle: "Contribution review",
    reportingTwoCopy: "Return sources are visible instead of hidden behind a single number.",
    reportingThreeTitle: "Bilingual access",
    reportingThreeCopy: "Materials can be reviewed in English or Mandarin.",
    marketEyebrow: "Expansion",
    marketTitle: "The infrastructure is market-agnostic.",
    marketOneTitle: "Crypto as first proof",
    marketOneCopy: "Digital assets provide the first visible track record.",
    marketTwoTitle: "Same system, broader markets",
    marketTwoCopy: "The product layer can extend into FX, indices, commodities, and other liquid markets.",
    marketThreeTitle: "Longer-term allocation platform",
    marketThreeCopy: "The direction is to build a portfolio platform, not stay limited to one market.",
    cycleBullLabel: "Bull markets",
    cycleBullTitle: "More opportunity to compound",
    cycleBullCopy: "In stronger market years, the portfolio has more room to capture momentum and broader participation, so annual ROI can naturally look stronger.",
    cycleBearLabel: "Bear markets",
    cycleBearTitle: "A slower, more selective pace",
    cycleBearCopy: "In quieter or more defensive years, return tends to be more selective. The goal is still to keep the yearly profile productive instead of forcing every month to look the same.",
    cycleRangeLabel: "Mixed markets",
    cycleRangeTitle: "Different engines take turns",
    cycleRangeCopy: "Some years earn more and some years earn less. The value of the portfolio is that the return profile can come from different engines across different market moods.",
    marketNote: "Crypto is the first market where the system has built visible proof. Over time, NTS Alpha Labs can extend the same product discipline into FX, indices, commodities, and other liquid markets where repeatable opportunities can be measured.",
    closeEyebrow: "Allocation Review",
    closeTitle: "Systematic by design. Disciplined in execution. Built for long-term compounding.",
    currentSnapshot: "Current snapshot",
    closeCopy: "Total portfolio ROI, 2022-2026.",
    closeBulletOne: "Performance profile is already visible.",
    closeBulletTwo: "Portfolio has multiple return sources.",
    closeBulletThree: "Next discussion can focus on allocation size, reporting cadence, and investor terms.",
    growthMultiple: "Growth multiple",
    recentRoi: "Recent ROI",
    positiveMonths: "Positive months",
    cumulativeReturn: "Cumulative return",
    latestPeriod: "Latest period",
    compoundingProfile: "Compounding profile",
    avgStrategyRoi: "Avg strategy ROI",
    strategyReturnBreadth: "8-strategy return breadth",
    monthlyRecords: "monthly records",
    averageMonth: "Average month",
    acrossRun: "Across the run",
    bestMonth: "Best month",
    fdShort: "FD",
    fdLegend: "Malaysia FD",
    ntsYearlyRoi: "NTS yearly ROI",
    portfolioContribution: "Portfolio contribution",
    contributionShare: "Contribution share",
    sourceNote: "ROI percentages shown for simple comparison across the NTS strategy portfolio.",
    strategies: "strategies",
    monthlySamples: "monthly samples",
    active: "active",
    screenshotTitleOne: "NTS Alpha Labs",
    screenshotTitleTwo: "Performance Snapshot",
    screenshotSubtitle: "Diversified systematic crypto alpha portfolio.",
    screenshotMonthly: "Monthly returns",
    screenshotContribution: "Contribution",
    screenshotStrategy: "8-strategy ROI",
    mobilePrev: "Prev",
    mobileNext: "Next",
  },
  zh: {
    asOf: "更新日期：2026年5月24日",
    downloadScreenshot: "下载截图",
    coverEyebrow: "投资人简介",
    coverTitle: "系统化 Alpha 组合",
    coverSubtitle: "跨多个市场周期验证。",
    coverNarrativeOne: "这不是单一策略故事，而是一组可以进入 allocation review 的 return engines。",
    coverNarrativeTwo: "Crypto 是第一个 proof point，之后产品层可以继续扩展到其他流动性市场。",
    portfolioRoi: "组合 ROI",
    productEyebrow: "公司产品",
    productTitle: "为 allocation 而设计。",
    productCopy: "表层只保留投资人需要判断的东西：组合 ROI、年度证据、月度行为和策略贡献。复杂度留在系统内部。",
    productOneTitle: "Alpha 组合",
    productOneCopy: "把多条策略产品放在同一个组合里展示，让投资人先看到整体回报故事。",
    productTwoTitle: "策略产品",
    productTwoCopy: "八个独立策略产品，各自有不同角色，也有自己的 ROI 记录。",
    productThreeTitle: "市场扩展",
    productThreeCopy: "Crypto 是第一个 proof point。之后同一套产品层可以继续扩展到 FX、指数、商品和其他流动性市场。",
    problemEyebrow: "问题",
    problemTitle: "问题不是 AI，而是没有验证的 AI marketing。",
    problemOneTitle: "先卖 AI 名义",
    problemOneCopy: "很多产品先强调 AI，但没有先展示真正的策略流程。",
    problemTwoTitle: "底层只是普通指标",
    problemTwoCopy: "很多系统拆开看，还是 Supertrend、MACD、RSI、均线这类基础组合。",
    problemThreeTitle: "没有严肃回测",
    problemThreeCopy: "没有跨市场环境验证，策略就只是一个 claim。",
    problemFourTitle: "没有执行证明",
    problemFourCopy: "如果信号扛不住延迟、费用、执行和 review，就还不适合拿来 allocation。",
    aiMarketEyebrow: "市场现实",
    aiMarketTitle: "Malaysia 的 AI trading 市场很吵。",
    aiMarketCopy: "投资人真正面对的问题很简单：很多产品听起来很 advanced，但 proof layer 很薄。Marketing 语言和已验证流程之间的差距，就是 capital 容易被误导的地方。",
    aiMarketOneTitle: "AI 只是包装",
    aiMarketOneCopy: "故事可以听起来很聪明，但底层交易逻辑可能很普通。",
    aiMarketTwoTitle: "截图多过证据",
    aiMarketTwoCopy: "几张赚钱截图，不等于一个经过测试的投资流程。",
    aiMarketThreeTitle: "可审计性低",
    aiMarketThreeCopy: "投资人很少同时看到清楚的回测、月度行为、贡献来源和执行 review。",
    indicatorEyebrow: "普通指标问题",
    indicatorTitle: "Supertrend、MACD 和 RSI 本身不是策略。",
    indicatorCopy: "指标可以是 input。但如果只是把几个指标叠起来再叫 AI，结果通常是反应慢、容易拥挤，并且跨市场环境很脆弱。",
    indicatorOneTitle: "很容易复制",
    indicatorOneCopy: "普通指标本身很难长期形成真正差异化。",
    indicatorTwoTitle: "天生偏慢",
    indicatorTwoCopy: "很多指标组合是在行情已经走出来之后才确认。",
    indicatorThreeTitle: "单独看很弱",
    indicatorThreeCopy: "没有组合 context 和验证，指标逻辑可能在一种市场好看，换一种市场就失效。",
    backtestGapEyebrow: "证明缺口",
    backtestGapTitle: "没有 backtest，就没有 allocation case。",
    backtestGapCopy: "适合 fundraise 的策略不能只靠信号截图。它需要足够证据，让投资人理解重复性、跨周期表现，以及 edge 是否能经得起真实交易假设。",
    backtestGapCallout: "证据必须是一层一层的。",
    backtestGapCalloutCopy: "Backtest、年度 ROI、月度分布、市场周期 review、贡献广度和 reporting，方向都必须一致。",
    lagEyebrow: "信号质量",
    lagTitle: "Lag 会在执行前先吃掉 edge。",
    lagCopy: "一个偏慢的信号，在图表上还是可以看起来正确，但真正可投资回报已经被进场延迟、费用、滑点和拥挤交易压低。",
    lagCallout: "目标不是更多 signal。",
    lagCalloutCopy: "目标是更好的时机、更好的过滤，以及更少低质量决策进入 execution。",
    standardEyebrow: "验证标准",
    standardTitle: "严肃策略必须证明 process。",
    standardCopy: "投资人 review 时，重点不是系统听起来多智能，而是策略有没有被测试、结构化、监控，并且可以被解释。",
    standardOne: "Backtested record",
    standardTwo: "Regime review",
    standardThree: "Monthly behavior",
    standardFour: "Veto logic",
    standardFive: "Execution awareness",
    standardSix: "Transparent reporting",
    evidenceStackEyebrow: "NTS 证据层",
    evidenceStackTitle: "我们讲的是证据，不是指标名字。",
    evidenceStackCopy: "NTS Alpha Labs 用 portfolio 的方式呈现策略：可见 ROI、年度 context、月度行为、贡献广度，以及在 capital allocation 前可以 review 的决策层。",
    investorLensEyebrow: "配置逻辑",
    investorLensTitle: "强产品不能只证明一个数字。",
    investorLensCopy: "当回报、流程、纪律、透明度和扩展性都能在同一个 story 里看见，case 才会更强。",
    investorLensOneTitle: "回报证据",
    investorLensOneCopy: "Headline ROI 有年度和月度证据支撑，才更有力量。",
    investorLensTwoTitle: "流程可见",
    investorLensTwoCopy: "组合应该容易 review，但不需要暴露所有内部细节。",
    investorLensThreeTitle: "可扩展基础",
    investorLensThreeCopy: "同一套基础设施应该能支持更多策略引擎和更多流动性市场。",
    competitiveEyebrow: "市场定位",
    competitiveTitle: "NTS 靠 proof 拉开距离，不靠 AI wording。",
    competitiveCopy: "优势不是更会讲，而是证据层更完整：portfolio ROI、backtest behavior、多引擎、veto logic 和透明 reporting。",
    edgeArchitectureEyebrow: "回报架构",
    edgeArchitectureTitle: "Edge 是系统，不是一个指标。",
    edgeArchitectureCopy: "NTS 把数据分析、市场环境 review、veto 纪律和多个 return engines 接在一起。弱信号应该在进入 portfolio exposure 前先被过滤。",
    forwardValueEyebrow: "未来价值",
    forwardValueTitle: "未来价值来自可重复扩展。",
    forwardValueCopy: "Upside case 不只是一个 crypto 策略，而是把同一套 research、validation、execution 和 reporting 纪律扩展到更多引擎和更多流动性市场。",
    forwardValueCallout: "覆盖面越宽，平台价值越强。",
    forwardValueCalloutCopy: "更多已验证引擎、更多市场覆盖和更好的 reporting，会让平台价值随时间变得更强。",
    validationEyebrow: "决策质量",
    validationTitle: "AI 本身不是 edge，验证才是。",
    validationCopy: "市面上很多所谓 AI 交易，本质还是延迟信号、黑箱规则和薄弱验证。NTS 在执行前加入决策层：先读数据、理解市场状态，再用 veto 机制过滤低质量机会。",
    validationOneTitle: "数据优先",
    validationOneCopy: "信号会先经过市场数据、流动性行为和历史证据阅读，再进入决策。",
    validationTwoTitle: "RL 辅助 review",
    validationTwoCopy: "学习层用于观察市场环境如何变化，而不是假设一条固定规则永远有效。",
    validationThreeTitle: "执行前 veto",
    validationThreeCopy: "不是每个信号都值得投入 capital。veto 层用于过滤偏慢、偏弱或 conviction 不够的 setup。",
    validationChartData: "数据分析",
    validationChartRL: "RL review",
    validationChartVeto: "Veto gate",
    validationChartLag: "延迟控制",
    validationChartReview: "可复核流程",
    solutionEyebrow: "我们的解法",
    solutionTitle: "一个组合，多个独立回报引擎。",
    solutionCopy: "NTS Alpha Labs 先以 portfolio 呈现。不同策略在不同市场状态下轮流贡献，让整体回报不依赖单一行情。",
    strategyEngines: "个策略引擎",
    solutionNote: "共同目标：跨周期、可复利、风险意识清楚。",
    solutionOneTitle: "先看组合",
    solutionOneCopy: "投资人 review 的是一个 allocation profile，不是一堆分散策略叙事。",
    solutionTwoTitle: "多个引擎",
    solutionTwoCopy: "不同回报来源负责适应不同市场情绪，而不是押一种行情。",
    solutionThreeTitle: "统一报告层",
    solutionThreeCopy: "表现、贡献和月度行为放在同一个投资人视图里。",
    performanceEyebrow: "表现摘要",
    performanceTitle: "让回报曲线说话。",
    performanceSubtitle: "2022-2026 已验证 portfolio ROI，并由年度、月度和策略层面的记录支撑。",
    cumulativeRoi: "累计 ROI",
    returnCurve: "成立以来的回报曲线",
    monthly: "月度",
    monthlyRoiRecord: "月度 ROI 记录",
    contribution: "贡献",
    portfolioContributionShare: "组合贡献占比",
    eightStrategies: "8 个策略",
    latestStrategyRoi: "各策略 ROI",
    takeawayOneTitle: "核心数字清楚",
    takeawayOneCopy: "累计 ROI 不是单独展示，而是配合月度记录和策略层面的回报广度一起看。",
    takeawayTwoTitle: "贡献来源分散",
    takeawayTwoCopy: "回报不是只靠一个引擎，多个策略都有贡献，portfolio presentation 会更完整。",
    takeawayThreeTitle: "适合投资人阅读",
    takeawayThreeCopy: "页面重点放在 ROI、年度表现、贡献和组合结构，方便进入 allocation discussion。",
    benchmarkEyebrow: "ROI 对比",
    benchmarkTitle: "Outperformance 需要参照物。",
    benchmarkCopy: "这里把 NTS portfolio ROI、Malaysia FD 和同一时期 S&P 500 放在一起，让回报差距一眼看清楚。",
    benchmarkOverallLabel: "2022-2026 组合 ROI",
    benchmarkSp500Label: "S&P 500 同期 ROI",
    benchmarkFdLabel: "4 年 FD 基准",
    benchmarkMultipleLabel: "相对 S&P 500 的 ROI 倍数",
    singleYearBenchmark: "单年 ROI：NTS vs S&P 500 vs FD",
    regimeEyebrow: "市场周期",
    regimeTitle: "不同市场情绪下的年度 ROI。",
    regimeCopy: "牛市、熊市和震荡市不会用同一种节奏运行。把年度 ROI 和市场环境放在一起看，证据会更清楚。",
    contributionEyebrow: "组合贡献",
    contributionTitle: "不同引擎，一个组合。",
    contributionCopy: "适合 fundraise 的组合，需要同时讲清楚贡献来源和策略 ROI 广度。回报有主线，但不是单一来源。",
    contributionBarsTitle: "各引擎贡献",
    monthlyBehaviorEyebrow: "月度行为",
    monthlyBehaviorTitle: "Consistency matters.",
    monthlyBehaviorCopy: "月度记录让 headline ROI 更适合 review：正回报月份、分布形态和长期行为都能被看见。",
    monthlyDistribution: "月度 ROI 分布",
    strategyEyebrow: "为什么广度重要",
    strategyTitle: "不同 alpha sources 降低单点依赖。",
    strategyCopy: "每个策略都有自己的角色。重点不是卖八个产品，而是让投资人看到整体组合不是靠单一市场行为撑起来。",
    strategyRoiBreadth: "策略 ROI 覆盖",
    strategySideCopy: "领先策略负责拉高 headline return，其他策略则让组合看起来不是单点依赖。",
    qualityEyebrow: "持续性",
    qualityTitle: "Consistency matters.",
    qualityCopy: "真正适合 allocation 的表现，不只看 headline ROI，也要看月度行为、市场周期和贡献广度。",
    recentMonthlyProfile: "近期月度表现",
    annualRoiView: "年度 ROI",
    marketCycleMap: "年度市场环境图",
    mixEyebrow: "组合结构",
    mixTitle: "回报来源。",
    mixCopyTitle: "回报来源",
    mixCopy: "组合由几个表现较强的策略带动整体 ROI，同时其他策略负责补足不同市场环境下的表现，让回报结构更平衡。",
    mixBulletOne: "主要策略负责撑起组合的核心回报。",
    mixBulletTwo: "其他策略在市场节奏改变时提供额外机会。",
    mixBulletThree: "投资人看到的不是单一来源，而是一套可以持续扩展的组合结构。",
    riskEyebrow: "风控框架",
    riskTitle: "先保护，再复利。",
    riskOneTitle: "敞口控制",
    riskOneCopy: "组合不应该依赖一个过大的单边判断。",
    riskTwoTitle: "执行纪律",
    riskTwoCopy: "流程优先于冲动，重复性优先于情绪判断。",
    riskThreeTitle: "市场环境意识",
    riskThreeCopy: "不同市场环境下，组合参与的力度应该不一样。",
    riskFourTitle: "组合平衡",
    riskFourCopy: "多个策略不是分开看，而是作为一个 allocation profile 来 review。",
    infraEyebrow: "基础设施",
    infraTitle: "一个系统化 allocation operating system。",
    infraCopy: "这不是 trading bot，而是一套可重复的运行节奏，把数据分析、信号 review、veto 逻辑、执行和 monitoring 接到同一个可 review 的流程里。",
    railData: "Data",
    railSignal: "Signal",
    railVeto: "Veto",
    railExecution: "Execution",
    railMonitoring: "Monitoring",
    reportingEyebrow: "报告层",
    reportingTitle: "透明度，让组合更适合投资人 review。",
    reportingCopy: "Performance、贡献来源和月度行为会被清楚呈现，不需要先解释完整内部系统。",
    reportingOneTitle: "组合总览",
    reportingOneCopy: "用一个页面看 headline return 和 active strategy set。",
    reportingTwoTitle: "贡献 review",
    reportingTwoCopy: "回报来源是可见的，不是藏在一个总数字后面。",
    reportingThreeTitle: "中英双语",
    reportingThreeCopy: "材料可以用英文或中文阅读。",
    marketEyebrow: "扩展方向",
    marketTitle: "这套基础设施不绑定单一市场。",
    marketOneTitle: "Crypto 是第一站",
    marketOneCopy: "Digital assets 是第一条已经跑出证明的 track record。",
    marketTwoTitle: "同一套系统，更宽的市场",
    marketTwoCopy: "产品层之后可以扩展到 FX、指数、商品和其他流动性市场。",
    marketThreeTitle: "长期 allocation platform",
    marketThreeCopy: "方向不是停在单一市场，而是建立可以扩展的 portfolio platform。",
    cycleBullLabel: "牛市",
    cycleBullTitle: "更容易放大回报",
    cycleBullCopy: "市场强、行情活跃的年份，组合更容易参与趋势和市场热度，所以年度 ROI 自然会更好看。",
    cycleBearLabel: "熊市",
    cycleBearTitle: "节奏会更慢、更挑机会",
    cycleBearCopy: "市场冷、偏防守的年份，不需要硬追每一个机会。回报会更挑机会，节奏自然会慢一点，但目标还是保持年度表现有产出。",
    cycleRangeLabel: "震荡市",
    cycleRangeTitle: "不同策略轮流贡献",
    cycleRangeCopy: "有些年份会赚多一点，有些年份会赚少一点。组合的价值，是不同市场情绪下可以由不同策略轮流贡献。",
    marketNote: "Crypto 是第一个已经跑出证明的市场。随着系统成熟，NTS Alpha Labs 可以把同一套产品纪律扩展到 FX、指数、商品和其他流动性市场。",
    closeEyebrow: "Allocation review",
    closeTitle: "系统化设计。纪律化执行。为长期复利而建。",
    currentSnapshot: "当前快照",
    closeCopy: "2022-2026 total portfolio ROI。",
    closeBulletOne: "Performance profile 已经可以看得见。",
    closeBulletTwo: "组合有多个回报来源。",
    closeBulletThree: "下一步可以讨论 allocation size、reporting cadence 和 investor terms。",
    growthMultiple: "增长倍数",
    recentRoi: "近期 ROI",
    positiveMonths: "正回报月份",
    cumulativeReturn: "累计回报",
    latestPeriod: "近期区间",
    compoundingProfile: "复利表现",
    avgStrategyRoi: "平均策略 ROI",
    strategyReturnBreadth: "8 个策略的回报广度",
    monthlyRecords: "个月度样本",
    averageMonth: "平均月度",
    acrossRun: "整个周期",
    bestMonth: "最佳月份",
    fdShort: "FD",
    fdLegend: "Malaysia FD",
    ntsYearlyRoi: "NTS 单年 ROI",
    portfolioContribution: "组合贡献",
    contributionShare: "贡献占比",
    sourceNote: "ROI 百分比用于简单展示 NTS strategy portfolio 的整体表现。",
    strategies: "个策略",
    monthlySamples: "个月度样本",
    active: "运行中",
    screenshotTitleOne: "NTS Alpha Labs",
    screenshotTitleTwo: "表现摘要",
    screenshotSubtitle: "从 crypto 出发的系统化 alpha 组合。",
    screenshotMonthly: "月度回报",
    screenshotContribution: "贡献占比",
    screenshotStrategy: "8 个策略 ROI",
    mobilePrev: "上一页",
    mobileNext: "下一页",
  },
};

const STRATEGY_ICONS = {
  grapes: "./assets/engine-icons/grapes-pro.svg",
  citrus: "./assets/engine-icons/citrus-pro.svg",
  pomelo: "./assets/engine-icons/pomelo-pro.svg",
  peach: "./assets/engine-icons/peach-pro.svg",
  lychee: "./assets/engine-icons/lychee-pro.svg",
  watermelon: "./assets/engine-icons/watermelon-pro.svg",
  mango: "./assets/engine-icons/mango-pro.svg",
  kiwi: "./assets/engine-icons/kiwi-pro.svg",
};

const STRATEGY_COPY = {
  en: {
    grapes: "Core return engine",
    watermelon: "Tactical defense",
    peach: "Rebound capture",
    pomelo: "Portfolio quality",
    citrus: "Structured alpha",
    lychee: "Cross-market breadth",
    kiwi: "Expansion engine",
    mango: "Acceleration strategy",
  },
  zh: {
    grapes: "核心回报引擎",
    watermelon: "防守型策略",
    peach: "反弹捕捉",
    pomelo: "组合质量",
    citrus: "结构化 alpha",
    lychee: "跨市场广度",
    kiwi: "扩张型策略",
    mango: "加速策略",
  },
};

function t(key) {
  return TEXT[currentLang][key] || TEXT.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLang === "zh" ? "zh-Hans" : "en";
  document.body.classList.toggle("zh-mode", currentLang === "zh");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
}

function strategyIcon(name) {
  return STRATEGY_ICONS[String(name || "").toLowerCase()] || "./assets/engine-icons/overview.svg";
}

function strategyRole(name) {
  const fallback = currentLang === "zh" ? "组合策略" : "Portfolio strategy";
  return STRATEGY_COPY[currentLang][String(name || "").toLowerCase()] || fallback;
}

function fmtPct(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  return `${Number(value).toFixed(digits)}%`;
}

function fmtMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtMultiple(returnPct) {
  if (returnPct == null || Number.isNaN(Number(returnPct))) return "--";
  return `${(1 + Number(returnPct) / 100).toFixed(2)}x`;
}

function monthlyStats() {
  const months = DATA.monthly_returns.filter((row) => row.return_pct != null);
  const positive = months.filter((row) => row.return_pct > 0);
  const best = months.reduce((acc, row) => (row.return_pct > acc.return_pct ? row : acc), months[0]);
  const avg = months.reduce((sum, row) => sum + row.return_pct, 0) / Math.max(1, months.length);
  return {
    positiveRate: (positive.length / Math.max(1, months.length)) * 100,
    bestMonth: best,
    avgMonthly: avg,
    months: months.length,
  };
}

function annualReturns() {
  const byYear = new Map();
  DATA.monthly_returns
    .filter((row) => row.return_pct != null)
    .forEach((row) => {
      const year = row.month.slice(0, 4);
      const values = byYear.get(year) || [];
      values.push(row.return_pct);
      byYear.set(year, values);
    });
  return Array.from(byYear.entries()).map(([year, values]) => ({
    year,
    return_pct: (values.reduce((acc, value) => acc * (1 + value / 100), 1) - 1) * 100,
  }));
}

function fdBenchmarkReturn(years = FD_BENCHMARK_YEARS) {
  return ((1 + FD_BENCHMARK_RATE / 100) ** years - 1) * 100;
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function drawAxes(ctx, x, y, w, h, yTicks = 4) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.fillStyle = COLORS.muted;
  ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
  for (let i = 0; i <= yTicks; i += 1) {
    const yy = y + (h * i) / yTicks;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = "#cbd2c6";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
}

function drawMarketNoiseChart() {
  const canvas = document.getElementById("market-noise-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const rows = [
    { label: currentLang === "zh" ? "AI marketing" : "AI marketing", typical: 92, nts: 38 },
    { label: currentLang === "zh" ? "Backtest 证据" : "Backtest evidence", typical: 22, nts: 88 },
    { label: currentLang === "zh" ? "月度记录" : "Monthly record", typical: 18, nts: 84 },
    { label: currentLang === "zh" ? "执行 review" : "Execution review", typical: 20, nts: 78 },
  ];
  const pad = { l: compact ? 118 : 180, r: 30, t: 34, b: 28 };
  const x = pad.l;
  const w = width - pad.l - pad.r;
  const rowH = (height - pad.t - pad.b) / rows.length;
  ctx.font = "800 11px ui-monospace, Menlo, monospace";
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(currentLang === "zh" ? "普通 AI offer" : "Typical AI offer", x, 16);
  ctx.fillText("NTS", x + w * .55, 16);
  rows.forEach((row, index) => {
    const yy = pad.t + index * rowH;
    ctx.fillStyle = COLORS.ink;
    ctx.font = `${compact ? "700 12px" : "800 14px"} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(row.label, 10, yy + rowH * .52);
    const barH = compact ? 16 : 22;
    const barY = yy + rowH * .32;
    const half = w * .42;
    ctx.fillStyle = "rgba(184, 137, 53, .16)";
    ctx.beginPath();
    ctx.roundRect(x, barY, half, barH, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.amber;
    ctx.beginPath();
    ctx.roundRect(x, barY, half * row.typical / 100, barH, 10);
    ctx.fill();
    const ntsX = x + w * .55;
    ctx.fillStyle = "rgba(6, 107, 79, .12)";
    ctx.beginPath();
    ctx.roundRect(ntsX, barY, half, barH, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.roundRect(ntsX, barY, half * row.nts / 100, barH, 10);
    ctx.fill();
  });
}

function drawIndicatorStackChart() {
  const canvas = document.getElementById("indicator-stack-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const rows = [
    { label: "Supertrend", lag: 74, validation: 28 },
    { label: "MACD", lag: 68, validation: 24 },
    { label: "RSI", lag: 58, validation: 30 },
    { label: currentLang === "zh" ? "NTS portfolio" : "NTS portfolio", lag: 26, validation: 86 },
  ];
  const pad = { l: compact ? 104 : 168, r: 32, t: 32, b: 28 };
  const w = width - pad.l - pad.r;
  const rowH = (height - pad.t - pad.b) / rows.length;
  ctx.fillStyle = COLORS.muted;
  ctx.font = "800 11px ui-monospace, Menlo, monospace";
  ctx.fillText(currentLang === "zh" ? "滞后感" : "Lag", pad.l, 16);
  ctx.fillText(currentLang === "zh" ? "验证强度" : "Validation", pad.l + w * .52, 16);
  rows.forEach((row, index) => {
    const yy = pad.t + index * rowH;
    const barH = compact ? 16 : 22;
    ctx.fillStyle = COLORS.ink;
    ctx.font = `${compact ? "800 12px" : "800 15px"} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(row.label, 10, yy + rowH * .52);
    const half = w * .4;
    ctx.fillStyle = "rgba(184, 137, 53, .14)";
    ctx.beginPath();
    ctx.roundRect(pad.l, yy + rowH * .32, half, barH, 10);
    ctx.fill();
    ctx.fillStyle = row.label.includes("NTS") ? "rgba(184, 137, 53, .55)" : COLORS.amber;
    ctx.beginPath();
    ctx.roundRect(pad.l, yy + rowH * .32, half * row.lag / 100, barH, 10);
    ctx.fill();
    const vx = pad.l + w * .52;
    ctx.fillStyle = "rgba(6, 107, 79, .12)";
    ctx.beginPath();
    ctx.roundRect(vx, yy + rowH * .32, half, barH, 10);
    ctx.fill();
    ctx.fillStyle = row.label.includes("NTS") ? COLORS.green : COLORS.teal;
    ctx.beginPath();
    ctx.roundRect(vx, yy + rowH * .32, half * row.validation / 100, barH, 10);
    ctx.fill();
  });
}

function drawBacktestGapChart() {
  const canvas = document.getElementById("backtest-gap-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const steps = compact
    ? currentLang === "zh"
      ? ["截图", "参数", "回测", "周期", "月度", "报告"]
      : ["Shot", "Set", "Test", "Reg", "Mth", "Rpt"]
    : currentLang === "zh"
      ? ["截图", "指标参数", "Backtest", "Regime", "月度", "Reporting"]
      : ["Screenshots", "Settings", "Backtest", "Regime", "Monthly", "Reporting"];
  const pad = { l: 26, r: 26, t: 48, b: compact ? 44 : 58 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const stepW = w / steps.length;
  steps.forEach((label, index) => {
    const level = (index + 1) / steps.length;
    const barH = h * level;
    const x = pad.l + index * stepW + stepW * .16;
    const y = pad.t + h - barH;
    ctx.fillStyle = index < 2 ? "rgba(184, 137, 53, .76)" : index < 4 ? COLORS.teal : COLORS.green;
    ctx.beginPath();
    ctx.roundRect(x, y, stepW * .56, barH, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(level * 100)}%`, x + stepW * .28, y - 8);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `${compact ? "9px" : "12px"} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(label, x + stepW * .28, pad.t + h + 24);
  });
  ctx.textAlign = "left";
}

function drawLagChart() {
  const canvas = document.getElementById("lag-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const pad = { l: 42, r: 30, t: 28, b: 38 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  drawAxes(ctx, x, y, w, h, 3);
  const points = Array.from({ length: 52 }, (_, i) => {
    const t0 = i / 51;
    return { x: x + t0 * w, y: y + h - (Math.pow(t0, 1.35) * .86 + Math.sin(t0 * 7) * .03) * h };
  });
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
  ctx.stroke();
  const reviewed = points[21];
  const late = points[38];
  [
    { p: reviewed, c: COLORS.green, label: currentLang === "zh" ? "review point" : "review point" },
    { p: late, c: COLORS.amber, label: currentLang === "zh" ? "late signal" : "late signal" },
  ].forEach((item) => {
    ctx.fillStyle = item.c;
    ctx.beginPath();
    ctx.arc(item.p.x, item.p.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = item.c;
    ctx.font = "800 12px ui-monospace, Menlo, monospace";
    ctx.fillText(item.label, Math.min(item.p.x + 10, width - 110), item.p.y - 12);
  });
}

function drawValidationStandardChart() {
  const canvas = document.getElementById("validation-standard-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const items = [
    { label: currentLang === "zh" ? "Backtest" : "Backtest", value: 92 },
    { label: currentLang === "zh" ? "Regime" : "Regime", value: 84 },
    { label: currentLang === "zh" ? "Monthly" : "Monthly", value: 89 },
    { label: currentLang === "zh" ? "Veto" : "Veto", value: 78 },
    { label: currentLang === "zh" ? "Execution" : "Execution", value: 80 },
    { label: currentLang === "zh" ? "Reporting" : "Reporting", value: 86 },
  ];
  const cx = width / 2;
  const cy = height / 2 + (compact ? 4 : 12);
  const r = Math.min(width, height) * (compact ? .29 : .32);
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * ring / 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  items.forEach((item, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / items.length;
    const rr = r * item.value / 100;
    const px = cx + Math.cos(angle) * rr;
    const py = cy + Math.sin(angle) * rr;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(6, 107, 79, .18)";
  ctx.fill();
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 3;
  ctx.stroke();
  items.forEach((item, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / items.length;
    ctx.fillStyle = COLORS.ink;
    ctx.font = `800 ${compact ? 10 : 12}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = Math.cos(angle) > .2 ? "left" : Math.cos(angle) < -.2 ? "right" : "center";
    ctx.fillText(item.label, cx + Math.cos(angle) * (r + 18), cy + Math.sin(angle) * (r + 18));
  });
  ctx.textAlign = "left";
}

function drawEvidenceStackChart() {
  const canvas = document.getElementById("evidence-stack-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const layers = currentLang === "zh"
    ? ["Portfolio ROI", "年度 ROI", "月度分布", "贡献广度", "Decision layer", "Reporting"]
    : ["Portfolio ROI", "Annual ROI", "Monthly distribution", "Contribution breadth", "Decision layer", "Reporting"];
  const pad = { l: compact ? 24 : 46, r: compact ? 24 : 46, t: 26, b: 26 };
  const gap = compact ? 8 : 14;
  const layerH = (height - pad.t - pad.b - gap * (layers.length - 1)) / layers.length;
  layers.forEach((label, index) => {
    const inset = compact ? index * 4 : index * 12;
    const x = pad.l + inset;
    const y = pad.t + index * (layerH + gap);
    const w = width - pad.l - pad.r - inset * 2;
    ctx.fillStyle = index < 2 ? COLORS.green : index < 4 ? COLORS.teal : COLORS.amber;
    ctx.globalAlpha = 1 - index * .08;
    ctx.beginPath();
    ctx.roundRect(x, y, w, layerH, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fffaf0";
    ctx.font = `850 ${compact ? 13 : 17}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(label, x + 18, y + layerH * .6);
  });
}

function drawInvestorLensChart() {
  const canvas = document.getElementById("investor-lens-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const items = currentLang === "zh"
    ? [
      ["回报", 92],
      ["流程", 84],
      ["风险纪律", 78],
      ["透明度", 86],
      ["扩展性", 80],
    ]
    : [
      ["Return", 92],
      ["Process", 84],
      ["Risk discipline", 78],
      ["Visibility", 86],
      ["Scalability", 80],
    ];
  const pad = { l: compact ? 88 : 150, r: 34, t: 30, b: 26 };
  const x = pad.l;
  const w = width - pad.l - pad.r;
  const rowH = (height - pad.t - pad.b) / items.length;
  items.forEach(([label, value], index) => {
    const yy = pad.t + index * rowH;
    ctx.fillStyle = COLORS.ink;
    ctx.font = `${compact ? "800 12px" : "800 15px"} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(label, 12, yy + rowH * .56);
    ctx.fillStyle = "rgba(6, 107, 79, .11)";
    ctx.beginPath();
    ctx.roundRect(x, yy + rowH * .32, w, compact ? 16 : 22, 12);
    ctx.fill();
    ctx.fillStyle = index < 2 ? COLORS.green : index < 4 ? COLORS.teal : COLORS.amber;
    ctx.beginPath();
    ctx.roundRect(x, yy + rowH * .32, w * value / 100, compact ? 16 : 22, 12);
    ctx.fill();
    ctx.fillStyle = COLORS.muted;
    ctx.font = "800 11px ui-monospace, Menlo, monospace";
    ctx.fillText(`${value}%`, x + w * value / 100 + 8, yy + rowH * .32 + (compact ? 13 : 16));
  });
}

function drawCompetitiveMatrixChart() {
  const canvas = document.getElementById("competitive-matrix-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const rows = currentLang === "zh"
    ? [
      ["AI 名义", "High", "Medium"],
      ["严肃回测", "Low", "High"],
      ["多策略组合", "Low", "High"],
      ["Veto 纪律", "Low", "High"],
      ["透明 reporting", "Low", "High"],
    ]
    : [
      ["AI wording", "High", "Medium"],
      ["Serious backtest", "Low", "High"],
      ["Multi-engine portfolio", "Low", "High"],
      ["Veto discipline", "Low", "High"],
      ["Transparent reporting", "Low", "High"],
    ];
  const pad = { l: compact ? 18 : 42, r: compact ? 18 : 42, t: 52, b: 28 };
  const col1 = compact ? width * .42 : width * .38;
  const col2 = compact ? width * .27 : width * .25;
  const col3 = compact ? width * .27 : width * .25;
  const rowH = (height - pad.t - pad.b) / rows.length;
  ctx.fillStyle = COLORS.muted;
  ctx.font = "800 11px ui-monospace, Menlo, monospace";
  ctx.fillText(currentLang === "zh" ? "维度" : "Dimension", pad.l, 26);
  ctx.fillText(currentLang === "zh" ? "普通 offer" : "Typical offer", pad.l + col1, 26);
  ctx.fillText("NTS", pad.l + col1 + col2, 26);
  rows.forEach((row, index) => {
    const y = pad.t + index * rowH;
    ctx.fillStyle = index % 2 ? "rgba(16, 33, 27, .025)" : "rgba(247, 246, 241, .78)";
    ctx.fillRect(pad.l - 12, y - 8, width - pad.l - pad.r + 24, rowH - 4);
    ctx.fillStyle = COLORS.ink;
    ctx.font = `800 ${compact ? 11 : 15}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(row[0], pad.l, y + rowH * .45);
    ctx.fillStyle = row[1] === "High" ? COLORS.amber : COLORS.muted;
    ctx.fillText(row[1], pad.l + col1, y + rowH * .45);
    ctx.fillStyle = row[2] === "High" ? COLORS.green : COLORS.amber;
    ctx.fillText(row[2], pad.l + col1 + col2, y + rowH * .45);
  });
}

function drawEdgeArchitectureChart() {
  const canvas = document.getElementById("edge-architecture-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const nodes = currentLang === "zh"
    ? ["Data", "Regime", "Veto", "Engines", "Portfolio", "Reporting"]
    : ["Data", "Regime", "Veto", "Engines", "Portfolio", "Reporting"];
  const pad = { l: compact ? 20 : 48, r: compact ? 20 : 48, t: compact ? 58 : 100, b: 38 };
  const w = width - pad.l - pad.r;
  const y = height * .5;
  const nodeW = compact ? Math.min(74, w / nodes.length - 8) : Math.min(150, w / nodes.length - 18);
  const nodeH = compact ? 54 : 82;
  const innerW = w - nodeW;
  nodes.forEach((label, index) => {
    const centerX = pad.l + nodeW / 2 + index * (innerW / (nodes.length - 1));
    const x = centerX - nodeW / 2;
    if (index > 0) {
      const prevCenterX = pad.l + nodeW / 2 + (index - 1) * (innerW / (nodes.length - 1));
      const px = prevCenterX + nodeW / 2;
      ctx.strokeStyle = index === 2 ? COLORS.amber : COLORS.green;
      ctx.lineWidth = compact ? 2 : 3;
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.fillStyle = index === 2 ? "rgba(184, 137, 53, .14)" : "rgba(6, 107, 79, .11)";
    ctx.strokeStyle = index === 2 ? "rgba(184, 137, 53, .55)" : "rgba(6, 107, 79, .36)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y - nodeH / 2, nodeW, nodeH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = index === 2 ? COLORS.amber : COLORS.green;
    ctx.font = "800 11px ui-monospace, Menlo, monospace";
    ctx.fillText(String(index + 1).padStart(2, "0"), x + 12, y - nodeH / 2 + 18);
    ctx.fillStyle = COLORS.ink;
    ctx.font = `850 ${compact ? 12 : 17}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(label, x + 12, y + 12);
  });
}

function drawForwardValueChart() {
  const canvas = document.getElementById("forward-value-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const compact = width < 520;
  const stages = currentLang === "zh"
    ? [
      ["Crypto proof", 1],
      ["更多 engines", 2],
      ["更多 markets", 3],
      ["Portfolio platform", 4],
    ]
    : [
      ["Crypto proof", 1],
      ["More engines", 2],
      ["More markets", 3],
      ["Portfolio platform", 4],
    ];
  const pad = { l: compact ? 32 : 58, r: compact ? 24 : 42, t: 36, b: compact ? 54 : 70 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const stepW = w / stages.length;
  stages.forEach(([label, level], index) => {
    const barH = h * (level / stages.length);
    const x = pad.l + index * stepW + stepW * .18;
    const y = pad.t + h - barH;
    ctx.fillStyle = index < 2 ? COLORS.teal : COLORS.green;
    ctx.globalAlpha = .72 + index * .07;
    ctx.beginPath();
    ctx.roundRect(x, y, stepW * .52, barH, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${level}x`, x + stepW * .26, y - 8);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `${compact ? "9px" : "12px"} -apple-system, BlinkMacSystemFont, sans-serif`;
    const short = compact ? label.replace("Portfolio platform", "Platform").replace("More ", "+") : label;
    ctx.fillText(short, x + stepW * .26, pad.t + h + 24);
  });
  ctx.textAlign = "left";
}

function drawValidationChart() {
  const canvas = document.getElementById("validation-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);

  const rows = [
    { nts: t("validationChartData"), other: currentLang === "zh" ? "薄弱" : "Weak", level: 1 },
    { nts: t("validationChartRL"), other: currentLang === "zh" ? "少见" : "Rare", level: 1 },
    { nts: t("validationChartVeto"), other: currentLang === "zh" ? "没有" : "Absent", level: 1 },
    { nts: t("validationChartLag"), other: currentLang === "zh" ? "偏慢" : "Lagging", level: .72 },
    { nts: t("validationChartReview"), other: currentLang === "zh" ? "不透明" : "Opaque", level: 1 },
  ];

  const pad = { l: width < 520 ? 22 : 44, r: width < 520 ? 18 : 34, t: 34, b: 26 };
  const labelW = width < 520 ? 112 : 190;
  const x = pad.l + labelW;
  const y = pad.t;
  const w = width - pad.l - pad.r - labelW;
  const rowH = Math.min(width < 520 ? 34 : 66, (height - pad.t - pad.b) / rows.length);
  const gap = width < 520 ? 10 : 22;
  const ntsW = w * (width < 520 ? .62 : .64);
  const otherW = w * (width < 520 ? .24 : .28);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "800 11px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillText("NTS", x, 16);
  ctx.fillText(width < 520 ? "AI bot" : currentLang === "zh" ? "普通 AI bot" : "Typical AI bot", x + ntsW + gap, 16);

  rows.forEach((row, index) => {
    const yy = y + index * rowH;
    ctx.fillStyle = COLORS.ink;
    ctx.font = `${width < 520 ? "700 12px" : "800 14px"} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(row.nts, pad.l, yy + rowH * .55);

    ctx.fillStyle = "rgba(6, 107, 79, .11)";
    ctx.beginPath();
    ctx.roundRect(x, yy + 10, ntsW, width < 520 ? 20 : 24, 12);
    ctx.fill();
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.roundRect(x, yy + 10, ntsW * row.level, width < 520 ? 20 : 24, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(184, 137, 53, .14)";
    ctx.beginPath();
    ctx.roundRect(x + ntsW + gap, yy + 10, otherW, width < 520 ? 20 : 24, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(184, 137, 53, .82)";
    ctx.beginPath();
    ctx.roundRect(x + ntsW + gap, yy + 10, otherW * .3, width < 520 ? 20 : 24, 12);
    ctx.fill();

    if (width >= 520) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "700 11px ui-monospace, Menlo, monospace";
      ctx.fillText(row.other, x + ntsW + gap, yy + 54);
    }
  });
}

function drawEquityChart() {
  const canvas = document.getElementById("equity-chart");
  const { ctx, width, height } = setupCanvas(canvas);
  const data = DATA.equity_curve;
  ctx.clearRect(0, 0, width, height);
  const pad = { l: 62, r: 28, t: 18, b: 42 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  drawAxes(ctx, x, y, w, h);

  const initial = data[0].equity;
  const values = data.map((d) => ((d.equity / initial) - 1) * 100);
  const min = Math.min(0, Math.min(...values) * 0.96);
  const max = Math.max(...values) * 1.08;
  const sx = (i) => x + (w * i) / Math.max(1, data.length - 1);
  const sy = (v) => y + h - ((v - min) / (max - min)) * h;

  const area = new Path2D();
  data.forEach((d, i) => {
    const xx = sx(i);
    const yy = sy(values[i]);
    if (i === 0) area.moveTo(xx, y + h);
    area.lineTo(xx, yy);
  });
  area.lineTo(sx(data.length - 1), y + h);
  area.closePath();
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, "rgba(8, 120, 79, 0.24)");
  gradient.addColorStop(1, "rgba(8, 120, 79, 0.02)");
  ctx.fillStyle = gradient;
  ctx.fill(area);

  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  data.forEach((d, i) => {
    const xx = sx(i);
    const yy = sy(values[i]);
    if (i === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.stroke();

  ctx.fillStyle = COLORS.green;
  const last = data[data.length - 1];
  const lastRoi = values[values.length - 1];
  ctx.beginPath();
  ctx.arc(sx(data.length - 1), sy(lastRoi), 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.muted;
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(fmtPct(max / 1.08, 0), 8, y + 6);
  ctx.fillText("0%", 28, y + h);
  ctx.font = "700 14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = COLORS.green;
  ctx.fillText(fmtPct(DATA.portfolio.validated_combo_return_pct), sx(data.length - 1) - 88, sy(lastRoi) - 16);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(data[0].date, x, y + h + 28);
  ctx.textAlign = "right";
  ctx.fillText(last.date, x + w, y + h + 28);
  ctx.textAlign = "left";
}

function drawMonthlyProfileChart() {
  const canvas = document.getElementById("monthly-profile-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const data = DATA.monthly_returns.filter((row) => row.return_pct != null).slice(-24);
  ctx.clearRect(0, 0, width, height);
  const pad = { l: 42, r: 18, t: 16, b: 34 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  drawAxes(ctx, x, y, w, h, 3);
  const max = Math.max(1, ...data.map((d) => d.return_pct));
  const min = Math.min(-1, ...data.map((d) => d.return_pct));
  const zeroY = y + h - ((0 - min) / (max - min)) * h;
  ctx.strokeStyle = "#cbd2c6";
  ctx.beginPath();
  ctx.moveTo(x, zeroY);
  ctx.lineTo(x + w, zeroY);
  ctx.stroke();
  const barW = Math.max(4, (w / data.length) - 4);
  data.forEach((row, i) => {
    const value = row.return_pct;
    const barH = Math.abs(value / (max - min)) * h;
    const xx = x + i * (w / data.length) + 2;
    const yy = value >= 0 ? zeroY - barH : zeroY;
    ctx.fillStyle = value >= 0 ? COLORS.green : "rgba(189, 122, 19, 0.35)";
    ctx.beginPath();
    ctx.roundRect(xx, yy, barW, Math.max(2, barH), 4);
    ctx.fill();
  });
  ctx.fillStyle = COLORS.muted;
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(fmtPct(max, 0), 8, y + 8);
  ctx.fillText("0%", 18, zeroY - 4);
  ctx.fillText(data[0].month, x, y + h + 24);
  ctx.textAlign = "right";
  ctx.fillText(data[data.length - 1].month, x + w, y + h + 24);
  ctx.textAlign = "left";
}

function drawMonthlyDistributionChart() {
  const canvas = document.getElementById("monthly-distribution-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const values = DATA.monthly_returns
    .filter((row) => row.return_pct != null)
    .map((row) => row.return_pct);
  const buckets = [
    { label: "<0%", min: -Infinity, max: 0 },
    { label: "0-2%", min: 0, max: 2 },
    { label: "2-4%", min: 2, max: 4 },
    { label: "4-6%", min: 4, max: 6 },
    { label: "6%+", min: 6, max: Infinity },
  ].map((bucket) => ({
    ...bucket,
    count: values.filter((value) => value >= bucket.min && value < bucket.max).length,
  }));

  ctx.clearRect(0, 0, width, height);
  const pad = { l: 42, r: 22, t: 20, b: 42 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  drawAxes(ctx, x, y, w, h, 3);
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1) * 1.18;
  const groupW = w / buckets.length;
  const barW = Math.max(22, groupW * 0.48);

  buckets.forEach((bucket, index) => {
    const barH = Math.max(2, (bucket.count / max) * h);
    const xx = x + index * groupW + (groupW - barW) / 2;
    const yy = y + h - barH;
    ctx.fillStyle = index === 0 ? "rgba(184, 137, 53, .72)" : index > 2 ? COLORS.green : COLORS.teal;
    ctx.beginPath();
    ctx.roundRect(xx, yy, barW, barH, 7);
    ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 13px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(bucket.count), xx + barW / 2, yy - 9);
    ctx.fillStyle = COLORS.muted;
    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(bucket.label, xx + barW / 2, y + h + 24);
  });
  ctx.textAlign = "left";
}

function drawContributionWheel(canvasId = "contribution-wheel") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const rows = DATA.strategy_contribution.slice().sort((a, b) => b.contribution_pct - a.contribution_pct);
  ctx.clearRect(0, 0, width, height);
  const cx = width * 0.48;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.34;
  const inner = radius * 0.58;
  const total = rows.reduce((sum, row) => sum + row.contribution_pct, 0);
  let start = -Math.PI / 2;
  rows.forEach((row, index) => {
    const angle = (row.contribution_pct / total) * Math.PI * 2;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = index < 2 ? COLORS.green : index < 4 ? COLORS.teal : COLORS.amber;
    ctx.globalAlpha = 1 - Math.min(index, 6) * 0.075;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (width > 520 && row.contribution_pct >= 8) {
      const mid = start + angle / 2;
      const lx = cx + Math.cos(mid) * (radius + 30);
      const ly = cy + Math.sin(mid) * (radius + 8);
      ctx.fillStyle = COLORS.ink;
      ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = lx > cx ? "left" : "right";
      ctx.fillText(row.strategy, lx, ly);
      ctx.fillStyle = COLORS.muted;
      ctx.font = "700 11px ui-monospace, Menlo, monospace";
      ctx.fillText(fmtPct(row.contribution_pct, 1), lx, ly + 16);
      ctx.textAlign = "left";
    }
    start = end;
  });

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STRATEGY", cx, cy - 8);
  ctx.fillText("CONTRIBUTION", cx, cy + 10);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "700 11px ui-monospace, Menlo, monospace";
  ctx.fillText("2022-2026", cx, cy + 30);
  ctx.textAlign = "left";
}

function drawAnnualRoiChart() {
  const canvas = document.getElementById("annual-roi-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const data = annualReturns();
  ctx.clearRect(0, 0, width, height);
  const pad = { l: 46, r: 18, t: 18, b: 34 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  drawAxes(ctx, x, y, w, h, 3);
  const max = Math.max(...data.map((d) => d.return_pct), 1) * 1.18;
  const barW = Math.max(22, w / data.length - 18);
  data.forEach((row, index) => {
    const regime = MARKET_REGIMES[row.year];
    const xx = x + index * (w / data.length) + 8;
    const barH = Math.max(2, (row.return_pct / max) * h);
    const yy = y + h - barH;
    ctx.fillStyle = regime ? REGIME_COLORS[regime.type] : index >= data.length - 2 ? COLORS.green : COLORS.teal;
    ctx.beginPath();
    ctx.roundRect(xx, yy, barW, barH, 7);
    ctx.fill();
    ctx.fillStyle = COLORS.muted;
    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(row.year, xx, y + h + 24);
    ctx.fillStyle = COLORS.ink;
    ctx.font = "700 12px ui-monospace, Menlo, monospace";
    ctx.fillText(fmtPct(row.return_pct, 0), xx, yy - 8);
  });
}

function drawMarketCycleChart(canvasId = "market-cycle-chart") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const data = annualReturns();
  ctx.clearRect(0, 0, width, height);
  if (width < 520) {
    const pad = { l: 12, r: 12, t: 12, b: 12 };
    const x = pad.l;
    const y = pad.t;
    const w = width - pad.l - pad.r;
    const rowH = Math.min(52, (height - pad.t - pad.b) / data.length);
    data.forEach((row, index) => {
      const regime = MARKET_REGIMES[row.year] || { type: "mixed", en: "Mixed", zh: "震荡" };
      const yy = y + index * rowH;
      const color = REGIME_COLORS[regime.type] || COLORS.teal;
      ctx.fillStyle = index % 2 === 0 ? "rgba(17, 25, 22, .025)" : "rgba(17, 25, 22, .045)";
      ctx.fillRect(x, yy, w, rowH - 8);

      ctx.fillStyle = COLORS.ink;
      ctx.font = "800 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(row.year === "2026" ? "2026 YTD" : row.year, x + 12, yy + 30);

      const pillX = x + 118;
      const pillW = Math.min(112, Math.max(78, w - 200));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(pillX, yy + 10, pillW, 25, 999);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = currentLang === "zh" ? "800 11px -apple-system, BlinkMacSystemFont, sans-serif" : "800 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(regime[currentLang], pillX + 12, yy + 27);

      ctx.fillStyle = color;
      ctx.font = "800 13px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(fmtPct(row.return_pct, 1), x + w - 10, yy + 28);
      ctx.textAlign = "left";
    });
    return;
  }
  const pad = { l: 34, r: 28, t: 24, b: 28 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const rowH = Math.min(58, (height - pad.t - pad.b) / data.length);
  const max = Math.max(...data.map((row) => row.return_pct), 1);

  data.forEach((row, index) => {
    const regime = MARKET_REGIMES[row.year] || { type: "mixed", en: "Mixed", zh: "震荡" };
    const yy = y + index * rowH;
    const color = REGIME_COLORS[regime.type] || COLORS.teal;
    const roiWidth = Math.max(6, (row.return_pct / max) * (w * 0.34));

    ctx.fillStyle = index % 2 === 0 ? "rgba(17, 25, 22, .025)" : "rgba(17, 25, 22, .045)";
    ctx.fillRect(x, yy, w, rowH - 8);

    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(row.year === "2026" ? "2026 YTD" : row.year, x + 14, yy + 32);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 126, yy + 13, 132, 25, 999);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(regime[currentLang], x + 142, yy + 30);

    const barX = x + 292;
    ctx.fillStyle = "rgba(17, 25, 22, .08)";
    ctx.beginPath();
    ctx.roundRect(barX, yy + 18, w - 420, 14, 999);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(barX, yy + 18, roiWidth, 14, 999);
    ctx.fill();

    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 14px ui-monospace, Menlo, monospace";
    ctx.fillText(fmtPct(row.return_pct, 1), x + w - 92, yy + 31);
  });
}

function drawAnnualFdChart() {
  const canvas = document.getElementById("annual-fd-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const data = annualReturns();
  ctx.clearRect(0, 0, width, height);
  const pad = { l: 54, r: 34, t: 22, b: 36 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  drawAxes(ctx, x, y, w, h, 4);
  const values = data.flatMap((d) => [d.return_pct, SP500_YEARLY_RETURNS[d.year] ?? 0, FD_BENCHMARK_RATE]);
  const max = Math.max(...values, 1) * 1.18;
  const min = Math.min(...values, 0) * 1.18;
  const range = max - min;
  const zeroY = y + h - ((0 - min) / range) * h;
  ctx.strokeStyle = "#bfc7bc";
  ctx.beginPath();
  ctx.moveTo(x, zeroY);
  ctx.lineTo(x + w, zeroY);
  ctx.stroke();
  const groupW = w / data.length;
  const barW = Math.max(11, groupW * 0.18);
  const drawGroupedBar = (xx, value, color) => {
    const barH = Math.max(2, Math.abs(value / range) * h);
    const yy = value >= 0 ? zeroY - barH : zeroY;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(xx, yy, barW, barH, 5);
    ctx.fill();
    return { yy, barH };
  };
  data.forEach((row, index) => {
    const baseX = x + index * groupW + groupW * 0.16;
    const spValue = SP500_YEARLY_RETURNS[row.year] ?? 0;
    const nts = drawGroupedBar(baseX, row.return_pct, index === data.length - 1 ? "rgba(6, 109, 73, .52)" : COLORS.green);
    drawGroupedBar(baseX + barW + 5, spValue, COLORS.teal);
    drawGroupedBar(baseX + (barW + 5) * 2, FD_BENCHMARK_RATE, "rgba(104, 113, 109, .5)");
    ctx.fillStyle = COLORS.ink;
    ctx.font = "800 11px ui-monospace, Menlo, monospace";
    ctx.fillText(fmtPct(row.return_pct, 0), baseX - 1, nts.yy - 8);
    ctx.fillStyle = COLORS.teal;
    ctx.font = "800 10px ui-monospace, Menlo, monospace";
    const spLabelY = spValue >= 0 ? zeroY - Math.max(2, Math.abs(spValue / range) * h) - 8 : zeroY + Math.max(14, Math.abs(spValue / range) * h + 14);
    ctx.fillText(fmtPct(spValue, 0), baseX + barW + 3, spLabelY);
    ctx.fillStyle = COLORS.muted;
    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(row.year, baseX, y + h + 24);
  });
}

function drawStrategyRoiChart() {
  const canvas = document.getElementById("strategy-roi-chart");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const rows = DATA.strategy_returns.slice().sort((a, b) => b.return_pct - a.return_pct);
  ctx.clearRect(0, 0, width, height);
  const pad = { l: 94, r: 42, t: 16, b: 22 };
  const x = pad.l;
  const y = pad.t;
  const w = width - pad.l - pad.r;
  const rowH = (height - pad.t - pad.b) / rows.length;
  const max = Math.max(...rows.map((row) => row.return_pct));
  rows.forEach((row, index) => {
    const yy = y + index * rowH + 7;
    const barW = (row.return_pct / max) * w;
    ctx.fillStyle = COLORS.ink;
    ctx.font = "700 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(row.strategy, 0, yy + 13);
    ctx.fillStyle = "rgba(17, 25, 22, 0.08)";
    ctx.beginPath();
    ctx.roundRect(x, yy, w, 14, 999);
    ctx.fill();
    ctx.fillStyle = index < 2 ? COLORS.green : index < 4 ? COLORS.teal : COLORS.amber;
    ctx.beginPath();
    ctx.roundRect(x, yy, barW, 14, 999);
    ctx.fill();
    ctx.fillStyle = index < 4 ? COLORS.teal : COLORS.amber;
    ctx.font = "700 12px ui-monospace, Menlo, monospace";
    ctx.fillText(fmtPct(row.return_pct, 1), x + w + 8, yy + 13);
  });
}

function renderKpis() {
  if (!byId("kpi-grid")) return;
  const p = DATA.portfolio;
  const h = DATA.headline;
  const m = monthlyStats();
  const cards = [
    [t("portfolioRoi"), fmtPct(p.validated_combo_return_pct), t("cumulativeReturn"), "green"],
    [t("recentRoi"), fmtPct(p.independent_combo_return_pct), t("latestPeriod"), "green"],
    [t("growthMultiple"), fmtMultiple(p.validated_combo_return_pct), t("compoundingProfile"), "teal"],
    [t("avgStrategyRoi"), fmtPct(h.headline_average_return_pct), t("strategyReturnBreadth"), "teal"],
    [t("positiveMonths"), fmtPct(m.positiveRate, 0), `${m.months}${currentLang === "zh" ? t("monthlyRecords") : ` ${t("monthlyRecords")}`}`, "green"],
  ];
  setHTML("kpi-grid", cards
    .map(([title, value, label, tone]) => `<article class="kpi-card ${tone}"><strong>${value}</strong><span>${title}<br>${label}</span></article>`)
    .join(""));
}

function renderRiskStats() {
  const p = DATA.portfolio;
  const m = monthlyStats();
  const items = [
    ["Annualized ROI", fmtPct(p.annual_return_pct)],
    ["Avg monthly", fmtPct(m.avgMonthly)],
    ["Best month", `${m.bestMonth.month} · ${fmtPct(m.bestMonth.return_pct)}`],
    ["Strategies", `${DATA.headline.engine_count} active`],
  ];
  document.getElementById("risk-stats").innerHTML = items
    .map(([label, value]) => `<div class="mini-stat"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function heatColor(value, min, max) {
  if (value == null) return "#eceee7";
  if (value >= 0) {
    const t = Math.min(1, value / Math.max(1, max));
    return `rgba(8, 120, 79, ${0.18 + t * 0.66})`;
  }
  const t = Math.min(1, Math.abs(value) / Math.max(1, Math.abs(min)));
  return `rgba(182, 83, 73, ${0.18 + t * 0.62})`;
}

function renderHeatmap(id = "monthly-heatmap") {
  if (!byId(id)) return;
  const h = DATA.monthly_heatmap;
  const monthLabels = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  let html = monthLabels.map((m) => `<div class="heat-label">${m}</div>`).join("");
  h.years.forEach((year, rowIndex) => {
    html += `<div class="heat-label">${year}</div>`;
    h.months.forEach((month, colIndex) => {
      const value = h.matrix[rowIndex][colIndex];
      const cls = value == null ? "" : value >= 0 ? "positive" : "negative";
      html += `<div class="heat-cell ${cls}" style="background:${heatColor(value, h.min_value, h.max_value)}" title="${year}-${month}: ${value ?? "--"}%">${value == null ? "" : value.toFixed(1)}</div>`;
    });
  });
  setHTML(id, html);
}

function renderBars(id, rows, maxValue, valueKey, labelSuffix = "%", meta = null) {
  if (!byId(id)) return;
  setHTML(id, rows
    .map((row, index) => {
      const value = row[valueKey];
      const width = Math.max(1, (value / maxValue) * 100);
      const color = index < 2 ? COLORS.green : index < 4 ? COLORS.teal : COLORS.amber;
      const sub = meta ? `<div class="bar-meta">${meta(row)}</div>` : "";
      return `
        <div class="bar-row">
          <div class="bar-name"><img src="${strategyIcon(row.strategy)}" alt="" /> <span>${row.strategy}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%;background:${color}"></div></div>
          <div class="bar-value" style="color:${color}">${Number(value).toFixed(1)}${labelSuffix}</div>
          ${sub}
        </div>`;
    })
    .join(""));
}

function renderCover() {
  const p = DATA.portfolio;
  const m = monthlyStats();
  setText("cover-roi", fmtPct(p.validated_combo_return_pct));
  setText("performance-roi", fmtPct(p.validated_combo_return_pct));
  setText("close-roi", fmtPct(p.validated_combo_return_pct));
  setHTML("cover-metrics", [
    [t("growthMultiple"), fmtMultiple(p.validated_combo_return_pct)],
    [t("recentRoi"), fmtPct(p.independent_combo_return_pct)],
    [t("positiveMonths"), fmtPct(m.positiveRate, 0)],
  ].map(([label, value]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join(""));
  renderIconStrip("cover-icon-strip");
  renderIconStrip("mix-icons");
}

function renderIconStrip(id) {
  if (!byId(id)) return;
  const rows = DATA.strategy_returns;
  setHTML(id, rows
    .map((row) => `<img src="${strategyIcon(row.strategy)}" alt="${row.strategy}" title="${row.strategy}" />`)
    .join(""));
}

function renderStrategyCards() {
  if (!byId("strategy-card-grid")) return;
  const rows = DATA.strategy_returns;
  setHTML("strategy-card-grid", rows
    .map((row, index) => `
      <article class="strategy-card ${index < 3 ? "lead-card" : ""}">
        <img src="${strategyIcon(row.strategy)}" alt="" />
        <div>
          <strong>${row.strategy}</strong>
          <span>${strategyRole(row.strategy)}</span>
        </div>
        <em>${fmtPct(row.return_pct, 1)}</em>
      </article>`)
    .join(""));
}

function renderQuality() {
  if (!byId("quality-metrics")) return;
  const m = monthlyStats();
  setHTML("quality-metrics", [
    [t("positiveMonths"), fmtPct(m.positiveRate, 0), currentLang === "zh" ? `${m.months}${t("monthlyRecords")}` : `${m.months} ${t("monthlyRecords")}`],
    [t("averageMonth"), fmtPct(m.avgMonthly), t("acrossRun")],
    [t("bestMonth"), fmtPct(m.bestMonth.return_pct), m.bestMonth.month],
    [t("recentRoi"), fmtPct(DATA.portfolio.independent_combo_return_pct), t("latestPeriod")],
  ].map(([label, value, note]) => `<article><strong>${value}</strong><span>${label}</span><small>${note}</small></article>`).join(""));
}

function renderReportingBoard() {
  const m = monthlyStats();
  setText("reporting-roi", fmtPct(DATA.portfolio.validated_combo_return_pct));
  setText("reporting-positive", fmtPct(m.positiveRate, 0));
  setText("reporting-engines", String(DATA.headline.engine_count));
  setText("reporting-recent", fmtPct(DATA.portfolio.independent_combo_return_pct));
}

function renderBenchmark() {
  if (!byId("benchmark-overall-roi")) return;
  const portfolioRoi = DATA.portfolio.validated_combo_return_pct;
  const fdRoi = fdBenchmarkReturn();
  setText("benchmark-overall-roi", fmtPct(portfolioRoi));
  setText("benchmark-sp500-roi", fmtPct(SP500_BENCHMARK_RETURN));
  setText("benchmark-fd-roi", fmtPct(fdRoi));
  setText("benchmark-multiple", `${(portfolioRoi / SP500_BENCHMARK_RETURN).toFixed(1)}x`);
  setHTML("annual-roi-table", annualReturns()
    .map((row) => `
      <div>
        <span>${row.year}${row.year === "2026" ? " YTD" : ""}</span>
        <strong>${fmtPct(row.return_pct)}</strong>
        <em>S&P 500 ${fmtPct(SP500_YEARLY_RETURNS[row.year] ?? 0, 1)}</em>
        <em>${t("fdShort")} ${fmtPct(FD_BENCHMARK_RATE, 2)}</em>
      </div>`)
    .join(""));
}

function renderPage() {
  applyLanguage();
  setText("source-note", t("sourceNote"));
  setHTML("source-metrics", [
    `${DATA.meta.updated_at}`,
    currentLang === "zh" ? `${DATA.headline.engine_count}${t("strategies")}` : `${DATA.headline.engine_count} ${t("strategies")}`,
    currentLang === "zh" ? `${DATA.monthly_returns.length}${t("monthlySamples")}` : `${DATA.monthly_returns.length} ${t("monthlySamples")}`,
  ].map((x) => `<span>${x}</span>`).join(""));

  renderCover();
  renderKpis();
  renderHeatmap("monthly-heatmap");
  renderHeatmap("quality-heatmap");
  renderHeatmap("monthly-quality-heatmap");
  drawContributionWheel();
  renderBars("solution-bars", DATA.strategy_contribution, Math.max(...DATA.strategy_contribution.map((d) => d.contribution_pct)), "contribution_pct", "%", () => t("contributionShare"));
  renderBars("contribution-bars", DATA.strategy_contribution, Math.max(...DATA.strategy_contribution.map((d) => d.contribution_pct)), "contribution_pct", "%", () => t("portfolioContribution"));
  renderBars("strategy-ranking", DATA.strategy_returns, Math.max(...DATA.strategy_returns.map((d) => d.return_pct)), "return_pct", "%", (row) => `${strategyRole(row.strategy)}`);
  renderBars("composition-bars", DATA.strategy_contribution, Math.max(...DATA.strategy_contribution.map((d) => d.contribution_pct)), "contribution_pct", "%", () => t("contributionShare"));
  renderStrategyCards();
  renderQuality();
  renderReportingBoard();
  renderBenchmark();
  drawMarketNoiseChart();
  drawIndicatorStackChart();
  drawBacktestGapChart();
  drawLagChart();
  drawValidationStandardChart();
  drawEvidenceStackChart();
  drawInvestorLensChart();
  drawCompetitiveMatrixChart();
  drawEdgeArchitectureChart();
  drawForwardValueChart();
  drawValidationChart();
  drawEquityChart();
  drawMonthlyProfileChart();
  drawMonthlyDistributionChart();
  drawContributionWheel("portfolio-contribution-wheel");
  drawAnnualRoiChart();
  drawMarketCycleChart();
  drawMarketCycleChart("regime-cycle-chart");
  drawStrategyRoiChart();
  drawAnnualFdChart();
  updateMobileSlides(false);
}

function isMobileSlideMode() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function drawVisibleSlideCharts() {
  const active = document.querySelector(".slide-page.is-active");
  if (!active) return;
  if (active.querySelector("#contribution-wheel")) drawContributionWheel();
  if (active.querySelector("#portfolio-contribution-wheel")) drawContributionWheel("portfolio-contribution-wheel");
  if (active.querySelector("#market-noise-chart")) drawMarketNoiseChart();
  if (active.querySelector("#indicator-stack-chart")) drawIndicatorStackChart();
  if (active.querySelector("#backtest-gap-chart")) drawBacktestGapChart();
  if (active.querySelector("#lag-chart")) drawLagChart();
  if (active.querySelector("#validation-standard-chart")) drawValidationStandardChart();
  if (active.querySelector("#evidence-stack-chart")) drawEvidenceStackChart();
  if (active.querySelector("#investor-lens-chart")) drawInvestorLensChart();
  if (active.querySelector("#competitive-matrix-chart")) drawCompetitiveMatrixChart();
  if (active.querySelector("#edge-architecture-chart")) drawEdgeArchitectureChart();
  if (active.querySelector("#forward-value-chart")) drawForwardValueChart();
  if (active.querySelector("#equity-chart")) drawEquityChart();
  if (active.querySelector("#validation-chart")) drawValidationChart();
  if (active.querySelector("#annual-fd-chart")) drawAnnualFdChart();
  if (active.querySelector("#strategy-roi-chart")) drawStrategyRoiChart();
  if (active.querySelector("#quality-heatmap")) renderHeatmap("quality-heatmap");
  if (active.querySelector("#monthly-quality-heatmap")) renderHeatmap("monthly-quality-heatmap");
  if (active.querySelector("#monthly-profile-chart")) drawMonthlyProfileChart();
  if (active.querySelector("#monthly-distribution-chart")) drawMonthlyDistributionChart();
  if (active.querySelector("#annual-roi-chart")) drawAnnualRoiChart();
  if (active.querySelector("#market-cycle-chart")) drawMarketCycleChart();
  if (active.querySelector("#regime-cycle-chart")) drawMarketCycleChart("regime-cycle-chart");
}

function updateMobileSlides(scrollTop = true) {
  const slides = Array.from(document.querySelectorAll(".slide-page"));
  const controls = document.querySelector(".mobile-slide-controls");
  const count = document.getElementById("mobile-slide-count");
  const prev = document.getElementById("mobile-prev");
  const next = document.getElementById("mobile-next");
  if (!slides.length || !controls || !count || !prev || !next) return;

  if (!isMobileSlideMode()) {
    slides.forEach((slide) => slide.classList.remove("is-active"));
    controls.classList.remove("is-visible");
    return;
  }

  currentMobileSlide = Math.min(Math.max(currentMobileSlide, 0), slides.length - 1);
  slides.forEach((slide, index) => slide.classList.toggle("is-active", index === currentMobileSlide));
  controls.classList.add("is-visible");
  count.textContent = `${currentMobileSlide + 1} / ${slides.length}`;
  prev.textContent = t("mobilePrev");
  next.textContent = t("mobileNext");
  prev.disabled = currentMobileSlide === 0;
  next.disabled = currentMobileSlide === slides.length - 1;
  drawVisibleSlideCharts();
  if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveMobileSlide(direction) {
  if (!isMobileSlideMode()) return;
  const total = document.querySelectorAll(".slide-page").length;
  currentMobileSlide = Math.min(Math.max(currentMobileSlide + direction, 0), total - 1);
  updateMobileSlides(true);
}

function loadIcon(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function downloadScreenshot() {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(17, 25, 22, 0.08)";
  ctx.lineWidth = 1;
  for (let gx = 72; gx < 1848; gx += 96) {
    ctx.beginPath();
    ctx.moveTo(gx, 34);
    ctx.lineTo(gx, 1046);
    ctx.stroke();
  }
  for (let gy = 70; gy < 1040; gy += 96) {
    ctx.beginPath();
    ctx.moveTo(72, gy);
    ctx.lineTo(1848, gy);
    ctx.stroke();
  }

  ctx.fillStyle = COLORS.green;
  ctx.beginPath();
  ctx.arc(88, 60, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.panel;
  ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("N", 83, 65);
  ctx.fillStyle = COLORS.green;
  ctx.font = "800 14px ui-monospace, Menlo, monospace";
  ctx.fillText("NTS ALPHA LABS", 114, 65);

  ctx.strokeStyle = COLORS.line;
  ctx.beginPath();
  ctx.moveTo(72, 104);
  ctx.lineTo(1848, 104);
  ctx.stroke();

  ctx.fillStyle = COLORS.ink;
  ctx.font = "800 68px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(t("screenshotTitleOne"), 72, 190);
  ctx.fillText(t("screenshotTitleTwo"), 72, 258);
  ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(t("screenshotSubtitle"), 72, 310);

  const p = DATA.portfolio;
  const m = monthlyStats();
  const kpis = [
    [t("portfolioRoi"), fmtPct(p.validated_combo_return_pct)],
    [t("recentRoi"), fmtPct(p.independent_combo_return_pct)],
    [t("growthMultiple"), fmtMultiple(p.validated_combo_return_pct)],
    [t("avgStrategyRoi"), fmtPct(DATA.headline.headline_average_return_pct)],
    [t("positiveMonths"), fmtPct(m.positiveRate, 0)],
  ];
  ctx.strokeStyle = COLORS.line;
  ctx.beginPath();
  ctx.moveTo(72, 360);
  ctx.lineTo(620, 360);
  ctx.stroke();

  ctx.fillStyle = COLORS.green;
  ctx.font = "800 118px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(kpis[0][1], 72, 480);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(t("portfolioRoi"), 72, 512);
  ctx.fillText(t("cumulativeReturn"), 72, 536);

  kpis.slice(1).forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 72 + col * 300;
    const y = 612 + row * 92;
    ctx.fillStyle = i === 1 || i === 2 ? COLORS.teal : COLORS.green;
    ctx.font = "800 42px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(value, x, y);
    ctx.fillStyle = COLORS.muted;
    ctx.font = "17px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(label, x, y + 28);
  });

  const sourceEquity = document.getElementById("equity-chart");
  ctx.drawImage(sourceEquity, 790, 235, 960, 450);

  ctx.fillStyle = COLORS.ink;
  ctx.font = "700 28px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(t("screenshotMonthly"), 72, 790);
  ctx.fillText(t("screenshotContribution"), 650, 790);
  ctx.fillText(t("screenshotStrategy"), 1160, 790);
  drawExportHeatmap(ctx, 72, 825);
  await drawExportBars(ctx, DATA.strategy_contribution, "contribution_pct", 650, 825, 270, 16, "%");
  await drawExportBars(ctx, DATA.strategy_returns, "return_pct", 1160, 825, 390, 16, "%");

  ctx.fillStyle = COLORS.muted;
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(t("sourceNote"), 72, 1040);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "nts-overall-strategy-run.png";
  link.click();
}

async function drawExportBars(ctx, rows, key, x, y, w, rowH, suffix) {
  const max = Math.max(...rows.map((d) => d[key]));
  for (const [i, row] of rows.slice(0, 8).entries()) {
    const yy = y + i * (rowH + 13);
    const val = row[key];
    const icon = await loadIcon(strategyIcon(row.strategy));
    if (icon) {
      ctx.drawImage(icon, x, yy - 3, 23, 23);
    }
    ctx.fillStyle = COLORS.ink;
    ctx.font = "17px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(row.strategy, x + 32, yy + 14);
    ctx.fillStyle = "#e2e5dc";
    ctx.beginPath();
    ctx.roundRect(x + 150, yy, w, rowH, 8);
    ctx.fill();
    ctx.fillStyle = i < 2 ? COLORS.green : i < 4 ? COLORS.teal : COLORS.amber;
    ctx.beginPath();
    ctx.roundRect(x + 150, yy, Math.max(4, (val / max) * w), rowH, 8);
    ctx.fill();
    ctx.font = "700 16px ui-monospace, Menlo, monospace";
    ctx.fillText(`${val.toFixed(1)}${suffix}`, x + 162 + w, yy + 14);
  }
}

function drawExportHeatmap(ctx, x, y) {
  const h = DATA.monthly_heatmap;
  const months = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const cell = 28;
  const gap = 5;
  ctx.font = "700 13px ui-monospace, Menlo, monospace";
  months.forEach((m, i) => {
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(m, x + i * (cell + gap) + 9, y);
  });
  h.years.forEach((year, rowIndex) => {
    const yy = y + 18 + rowIndex * (cell + gap);
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(String(year), x, yy + 19);
    h.months.forEach((month, colIndex) => {
      const value = h.matrix[rowIndex][colIndex];
      const xx = x + 48 + colIndex * (cell + gap);
      ctx.fillStyle = heatColor(value, h.min_value, h.max_value);
      ctx.beginPath();
      ctx.roundRect(xx, yy, cell, cell, 5);
      ctx.fill();
      if (value != null) {
        ctx.fillStyle = value >= 0 ? "#063b28" : "#5a1f1a";
        ctx.font = "700 11px ui-monospace, Menlo, monospace";
        ctx.fillText(value.toFixed(0), xx + 7, yy + 18);
      }
    });
  });
}

async function init() {
  const response = await fetch(DATA_URL);
  DATA = await response.json();
  renderPage();
  window.addEventListener("resize", () => {
    renderPage();
    updateMobileSlides(false);
  });
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentLang = button.dataset.lang === "zh" ? "zh" : "en";
      renderPage();
    });
  });
  document.getElementById("download-screenshot")?.addEventListener("click", () => {
    downloadScreenshot().catch((error) => console.error(error));
  });
  document.getElementById("mobile-prev")?.addEventListener("click", () => moveMobileSlide(-1));
  document.getElementById("mobile-next")?.addEventListener("click", () => moveMobileSlide(1));
  window.addEventListener("keydown", (event) => {
    if (!isMobileSlideMode()) return;
    if (event.key === "ArrowLeft") moveMobileSlide(-1);
    if (event.key === "ArrowRight") moveMobileSlide(1);
  });
}

init().catch((error) => {
  document.body.innerHTML = `<pre style="padding:24px;color:#b65349">${error.stack || error}</pre>`;
});
