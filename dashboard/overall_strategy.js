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
    problemTitle: "Why most systematic strategies fail.",
    problemOneTitle: "Single-strategy dependence",
    problemOneCopy: "One return source can look strong until the market regime changes.",
    problemTwoTitle: "Regime fragility",
    problemTwoCopy: "A strategy that only works in one market mood is difficult to allocate to with confidence.",
    problemThreeTitle: "Lack of portfolio breadth",
    problemThreeCopy: "Without multiple return engines, performance becomes too dependent on one behavior.",
    problemFourTitle: "Inconsistent execution",
    problemFourCopy: "A good idea still needs a repeatable process before it becomes an investable product.",
    solutionEyebrow: "Our Solution",
    solutionTitle: "One portfolio. Multiple independent return engines.",
    solutionCopy: "NTS Alpha Labs is presented as a portfolio first. The strategy set is designed so different engines can contribute under different market conditions.",
    strategyEngines: "strategy engines",
    solutionNote: "Same goal: consistent, risk-aware compounding across cycles.",
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
    infraCopy: "The product is not a trading bot. It is a repeatable operating rhythm that connects research, decisioning, execution, and monitoring into one reviewable process.",
    reportingEyebrow: "Reporting Layer",
    reportingTitle: "Transparency makes the portfolio investable.",
    reportingCopy: "Investors should be able to review performance, contribution, and monthly behavior without needing to understand the full internal system.",
    reportingOneTitle: "Portfolio overview",
    reportingOneCopy: "One place to understand the headline return and active strategy set.",
    reportingTwoTitle: "Contribution review",
    reportingTwoCopy: "Return sources are visible instead of hidden behind a single number.",
    reportingThreeTitle: "Bilingual access",
    reportingThreeCopy: "Investor-facing materials can be reviewed in English or Mandarin.",
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
    closeEyebrow: "Investor Discussion",
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
    problemTitle: "为什么大多数系统化策略很难交付。",
    problemOneTitle: "依赖单一策略",
    problemOneCopy: "单一回报来源在某些阶段很好看，但市场环境一变就容易失效。",
    problemTwoTitle: "对市场环境太敏感",
    problemTwoCopy: "如果只适合一种市场情绪，投资人很难长期配置。",
    problemThreeTitle: "缺少组合广度",
    problemThreeCopy: "没有多个 return engines，表现就太依赖一种市场行为。",
    problemFourTitle: "执行不稳定",
    problemFourCopy: "好的策略想法，也需要可重复的流程，才会变成可投资产品。",
    solutionEyebrow: "我们的解法",
    solutionTitle: "一个组合，多个独立回报引擎。",
    solutionCopy: "NTS Alpha Labs 先以 portfolio 呈现。不同策略在不同市场状态下轮流贡献，让整体回报不依赖单一行情。",
    strategyEngines: "个策略引擎",
    solutionNote: "共同目标：跨周期、可复利、风险意识清楚。",
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
    infraCopy: "这不是 trading bot，而是一套可重复的运行节奏，把 research、decision、execution 和 monitoring 接到同一个可 review 的流程里。",
    reportingEyebrow: "报告层",
    reportingTitle: "透明度，让组合更适合投资人 review。",
    reportingCopy: "投资人应该可以看懂 performance、贡献来源和月度行为，而不需要先理解完整内部系统。",
    reportingOneTitle: "组合总览",
    reportingOneCopy: "用一个页面看 headline return 和 active strategy set。",
    reportingTwoTitle: "贡献 review",
    reportingTwoCopy: "回报来源是可见的，不是藏在一个总数字后面。",
    reportingThreeTitle: "中英双语",
    reportingThreeCopy: "投资人材料可以用英文或中文阅读。",
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
    closeEyebrow: "投资人讨论",
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

function drawContributionWheel() {
  const canvas = document.getElementById("contribution-wheel");
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

function drawMarketCycleChart() {
  const canvas = document.getElementById("market-cycle-chart");
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
  drawContributionWheel();
  renderBars("solution-bars", DATA.strategy_contribution, Math.max(...DATA.strategy_contribution.map((d) => d.contribution_pct)), "contribution_pct", "%", () => t("contributionShare"));
  renderBars("contribution-bars", DATA.strategy_contribution, Math.max(...DATA.strategy_contribution.map((d) => d.contribution_pct)), "contribution_pct", "%", () => t("portfolioContribution"));
  renderBars("strategy-ranking", DATA.strategy_returns, Math.max(...DATA.strategy_returns.map((d) => d.return_pct)), "return_pct", "%", (row) => `${strategyRole(row.strategy)}`);
  renderBars("composition-bars", DATA.strategy_contribution, Math.max(...DATA.strategy_contribution.map((d) => d.contribution_pct)), "contribution_pct", "%", () => t("contributionShare"));
  renderStrategyCards();
  renderQuality();
  renderBenchmark();
  drawEquityChart();
  drawMonthlyProfileChart();
  drawAnnualRoiChart();
  drawMarketCycleChart();
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
  if (active.querySelector("#equity-chart")) drawEquityChart();
  if (active.querySelector("#annual-fd-chart")) drawAnnualFdChart();
  if (active.querySelector("#strategy-roi-chart")) drawStrategyRoiChart();
  if (active.querySelector("#quality-heatmap")) renderHeatmap("quality-heatmap");
  if (active.querySelector("#monthly-profile-chart")) drawMonthlyProfileChart();
  if (active.querySelector("#annual-roi-chart")) drawAnnualRoiChart();
  if (active.querySelector("#market-cycle-chart")) drawMarketCycleChart();
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
