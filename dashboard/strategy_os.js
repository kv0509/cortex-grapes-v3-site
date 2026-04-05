const DATA_URL = "./data/strategy_os.json";
const EVOLUTION_API_BASE = "http://127.0.0.1:8000/api/v1/evolution";

const COLORS = {
  text: "#e7efe9",
  muted: "#8fa79a",
  grid: "rgba(117,255,181,0.09)",
  border: "rgba(117,255,181,0.14)",
  green: "#33d17a",
  blue: "#63a4ff",
  amber: "#d5a441",
  red: "#e06d6d",
  panel: "#101b16",
};

const LIVE_FIXED_NOTIONAL_USD = 2000;
const STRATEGY_KEYS = ["grapes", "citrus", "equity"];
const OVERVIEW_STRATEGY_KEYS = ["grapes", "citrus"];
const STRATEGY_META = {
  grapes: { label: "Grapes", display: "🍇 Grapes", role: "Live Trend Engine", overviewColor: "#8d6bff", strategyColor: COLORS.green },
  citrus: { label: "Citrus", display: "🍊 Citrus", role: "Live Adaptive Engine", overviewColor: "#ffb03b", strategyColor: COLORS.green },
  equity: { label: "Equity", display: "📈 Equity", role: "Synthetic Flow PPO Engine", overviewColor: "#63a4ff", strategyColor: COLORS.blue },
};

const state = {
  data: null,
  view: localStorage.getItem("strategy_os_view") || "all",
  lang: localStorage.getItem("strategy_os_lang") || "en",
  lastUpdatedAt: null,
  lenses: JSON.parse(localStorage.getItem("strategy_os_lenses") || '{"grapes":"backtest","citrus":"backtest","equity":"backtest"}'),
  tradeFilters: {
    grapes: { scope: "month", value: "latest" },
    citrus: { scope: "month", value: "latest" },
    equity: { scope: "month", value: "latest" },
  },
  livePrices: {
    socket: null,
    reconnectTimer: null,
    subscribedSymbols: [],
    prices: {},
    pricesMeta: {},
    renderTimer: null,
    connected: false,
    lastTickAt: null,
    heartbeatTimer: null,
    lastRenderedValues: {},
  },
  chartScales: {
    overviewLivePnl: null,
  },
  evolutionSelectedPattern: null,
  evolutionMutationBusyId: null,
  evolutionSimilarCasesById: {},
  evolutionSimilarCasesLoadingId: null,
};

const I18N = {
  en: {
    updated: "Updated",
    heroKicker: "Strategy OS",
    heroHeadline: "One operating system for strategy research, selection, and capital deployment.",
    heroNote: "A firm-level strategy surface for comparing research, translating risk into one capital language, and assigning exposure to the engine that is currently earning it.",
    portfolioOverview: "Portfolio Overview",
    dualBoard: "Dual-Strategy Command Board",
    dualBoardNote: "Two mandates on one normalized capital base, so relative quality, contribution, and allocation fitness stay readable.",
    equityOverlay: "Equity Overlay",
    cumulativeEquity: "Cumulative Equity",
    coreCompare: "Relative Quality",
    grapesSleeves: "Asset Profit Distribution",
    citrusSleeves: "Asset Profit Distribution",
    strategyDetail: "Strategy Detail",
    grapesName: "Cortex Grapes",
    grapesNote: "Trend and structure mandate designed for cleaner compounding through persistent market phases.",
    citrusName: "Cortex Citrus",
    citrusNote: "Cross-asset opportunistic mandate focused on extracting asymmetric dislocations with tighter participation quality.",
    equityName: "Cortex Equity",
    equityNote: "Synthetic Flow PPO mandate for US500 structure, using walk-forward and Monte Carlo validation instead of crypto positioning data.",
    assetOverlay: "Three-Asset Profit Overlay",
    totalPnlCurve: "Daily Total PnL",
    strategyProfile: "Strategy Profile",
    openPositions: "Open Positions",
    assetValidation: "Asset Validation",
    regimePerformance: "Regime Performance",
    monthlyHeatmap: "Monthly Performance & Heatmap",
    tradeExplorer: "Trade Explorer",
    assetCurves: "Asset Curves",
    monthly: "Monthly",
    yearly: "Yearly",
    all: "All",
    allPeriods: "All Periods",
    asset: "Asset",
    trades: "Trades",
    avgPnl: "Avg PnL",
    pf: "PF",
    side: "Side",
    type: "Type",
    entry: "Entry",
    exit: "Exit",
    hold: "Hold",
    pnl: "PnL",
    noOpenPositions: "No open positions right now.",
    entryTime: "Entry Time",
    entryPrice: "Entry Price",
    holdHours: "Hold Duration",
    peakPnl: "Peak PnL",
    currentFilteredTrades: "filtered trades",
    wins: "wins",
    losses: "losses",
    totalPnl: "total pnl",
    profitableMonths: "profitable months",
    losingMonths: "losing months",
    winRate: "win rate",
    bestMonth: "best month",
    backtest: "Backtest",
    live: "Live",
    snapshotNoteBacktest: "Showing research validation and historical results.",
    snapshotNoteLive: "Showing live execution and current strategy ledger.",
    backtestSnapshot: "Backtest Snapshot",
    liveSnapshot: "Live Execution",
    liveSummary: "Live Summary",
    total: "Total",
    realized: "Realized",
    unrealized: "Unrealized",
    riskMetrics: "Risk Metrics",
    equityCurve: "Equity Curve",
    leader: "Leader",
    totalReturnLabel: "Total Return",
    totalTradesLabel: "Total Trades",
    returnLabel: "Return",
    profitFactor: "Profit Factor",
    livePnl: "Live PnL",
    currentOpenPosition: "Current Open Position",
    bestPerformer: "Best Performer",
    worstPerformer: "Worst Performer",
    tradeHistory: "Trade History",
    status: "Status",
    open: "Open",
    closed: "Closed",
    currentPrice: "Current Price",
    entryPx: "Entry Px",
    exitPx: "Exit Px",
    move: "Move",
    active: "Active",
    flat: "Flat",
    tie: "Tie",
    liveMarkUnavailable: "Live mark unavailable. Using static snapshot.",
    liveMarkStale: "Live mark stale. Holding last snapshot.",
    staticSnapshotMode: "Static snapshot mode.",
    markAt: "Mark",
    combinedLivePnl: "Combined Live PnL",
    totalReturnNote: "total return",
    maxDrawdown: "Max Drawdown",
    avgWin: "Avg Win",
    avgLoss: "Avg Loss",
    trendUp: "Uptrend",
    trendDown: "Downtrend",
    rangeChop: "Range-bound",
    transition: "Transition",
    evolutionSectionTitle: "Grapes Evolution",
    evolutionRuntimeTitle: "Runtime Status",
    evolutionBaselineTitle: "Current Baseline",
    evolutionPatternTitle: "Recent Pattern Stats",
    evolutionDecisionTitle: "Decision Board",
    evolutionBridgeTitle: "Bridge Inbox",
    evolutionPipelineTitle: "Pipeline Status",
    evolutionRunCycle: "Run Mutation Cycle",
    evolutionBlockedAt: "Blocked at",
    evolutionPendingClusters: "clusters pending",
    evolutionDiscoveriesTitle: "Discoveries",
    evolutionVpTitle: "Validation / Promotion",
    evolutionExamplesNote: "Examples shown here are limited to <strong>2025-2026</strong> trades only.",
    evolutionBriefTitle: "What Evolution Is Seeing",
    evolutionBriefSummary: "Evolution is useful only if it can separate repeated market problems into different kinds of fixes. Right now this page is meant to show what it is noticing, what it wants to try, and whether that suggestion is mature enough to observe against the current production baseline.",
    evolutionBriefDoing: "What it is doing",
    evolutionBriefFocus: "What to focus on",
    evolutionBriefRead: "How to read this page",
    evolutionBriefReadBody: "Start from the Decision Board. Read the problem, check the example trades from 2025-2026, then decide whether the proposed response is specific enough to be useful.",
    evolutionWorkingTitle: "What It Is Working On",
    evolutionFlowTitle: "Decision Flow",
    evolutionNoResearch: "No active research threads yet.",
    evolutionNoPatternStats: "No pattern stats yet.",
    evolutionNoDecisionCards: "No decision cards yet.",
    evolutionNoBridgeResults: "No imported bridge results yet.",
    evolutionNoDiscoveryDetail: "Select a cluster to inspect the current evidence and proposed direction.",
    evolutionNoDiscoveries: "No discoveries yet.",
    evolutionWhy: "Why",
    evolutionExpected: "Expected impact",
    evolutionExampleTrades: "Example trades",
    evolutionScope: "Scope",
    evolutionAction: "Action",
    evolutionMode: "Mode",
    evolutionStage: "Stage",
    evolutionDecision: "Decision",
    evolutionWhyFlagged: "Why flagged",
    evolutionSamples: "Samples",
    evolutionOutcome: "Outcome",
    evolutionSeverity: "Severity",
    evolutionConfidence: "Confidence",
    evolutionHypothesis: "Hypothesis",
    evolutionRiskNote: "Risk note",
    evolutionProviderModel: "Provider / model",
    evolutionAvgPnl: "Avg PnL",
    evolutionPatternKey: "Pattern",
    evolutionDiscoveryDetailTitle: "Cluster Detail",
    evolutionAccepted: "Accepted",
    evolutionOverfit: "Overfit",
    evolutionObservationFirst: "Observation comes first",
    evolutionWaitingProof: "Most proposals are still waiting for proof",
    evolutionBottleneck: "Current bottleneck",
    evolutionResearchQuality: "research quality",
    evolutionDoingBody: "The engine is grouping repeated failures first, then comparing them against the current production baseline.",
    evolutionFocusBody: "The real question is not whether it found a pattern. The real question is whether different problems lead to different fixes.",
    evolutionObservationBody: "Anything unstable stays in observation first. The goal here is to watch behaviour without touching production logic too early.",
    evolutionWaitingBody: "The engine is finding more patterns than it is validating. That is expected. Discovery is cheap, promotion is not.",
    evolutionBottleneckBody: "The hard part is not finding bad shapes. The hard part is turning similar-looking problems into different, credible fixes.",
    reason: "Reason",
    holdMode: "Hold",
    yes: "YES",
    no: "NO",
    grapesProfileRows: [
      ["Strategy role", "A compounding engine for structured markets", "Designed to stay patient through noise and push harder when market structure becomes clearer and more persistent."],
      ["How it participates", "Selective in clean directional opportunities", "It prefers higher-quality trend structures instead of reacting to every short-term fluctuation."],
      ["How it manages risk", "Protect gains before chasing more upside", "The focus is to retain realized progress and keep drawdowns controlled as the curve compounds."],
      ["Current character", "Stable, selective, and resilient", "Built as a steadier return engine with stronger emphasis on quality, survival, and repeatability."],
    ],
    citrusProfileRows: [
      ["Strategy role", "An opportunistic execution engine", "Designed to respond across assets when dislocations, positioning, or short-term inefficiencies create asymmetric setups."],
      ["How it participates", "Confirms direction, then filters for quality", "It prioritizes opportunities with stronger market support and avoids lower-quality participation in noisy stretches."],
      ["How it manages risk", "Reduce waste before forcing frequency", "The portfolio is shaped to cut low-value entries so capital is recycled into cleaner setups."],
      ["Current character", "Adaptive, selective, and event-aware", "Built to improve participation quality across assets rather than simply increase trading frequency."],
    ],
  },
  zh: {
    updated: "更新于",
    heroKicker: "策略操作系统",
    heroHeadline: "一套用于策略研究、筛选与资金配置的统一操作系统。",
    heroNote: "这是面向管理层与投资视角的策略界面。研究结果在统一资金语言下比较，风险在统一基准下衡量，资本配置持续流向更值得持有的引擎。",
    portfolioOverview: "组合总览",
    dualBoard: "双策略主控板",
    dualBoardNote: "两套不同 mandate 放在统一资金基准上展示，让相对质量、贡献度与配置价值保持清晰可读。",
    equityOverlay: "组合收益曲线",
    cumulativeEquity: "累计权益曲线",
    coreCompare: "相对质量对照",
    grapesSleeves: "资产收益分布",
    citrusSleeves: "资产收益分布",
    strategyDetail: "策略详情",
    grapesName: "Cortex Grapes",
    grapesNote: "偏趋势与结构的 mandate，目标是在更持续的市场阶段中提高复利质量。",
    citrusName: "Cortex Citrus",
    citrusNote: "偏多资产机会捕捉的 mandate，目标是在更快变化的阶段里提高参与质量与配置效率。",
    equityName: "Cortex Equity",
    equityNote: "面向 US500 的 Synthetic Flow PPO 策略，使用 walk-forward 与 Monte Carlo 口径验证，而不是 crypto positioning 数据。",
    assetOverlay: "三资产收益叠图",
    totalPnlCurve: "日度累计收益",
    strategyProfile: "策略轮廓",
    openPositions: "当前未平仓仓位",
    assetValidation: "多资产验证",
    regimePerformance: "阶段表现",
    monthlyHeatmap: "月度表现与热力图",
    tradeExplorer: "交易明细",
    assetCurves: "资产曲线",
    monthly: "月度",
    yearly: "年度",
    all: "全部",
    allPeriods: "全部时期",
    asset: "资产",
    trades: "交易数",
    avgPnl: "平均收益",
    pf: "盈亏比",
    side: "方向",
    type: "类型",
    entry: "入场",
    exit: "出场",
    hold: "持仓",
    pnl: "收益",
    noOpenPositions: "当前没有未平仓仓位。",
    entryTime: "入场时间",
    entryPrice: "入场价格",
    holdHours: "持仓时长",
    peakPnl: "峰值收益",
    currentFilteredTrades: "当前筛选交易",
    wins: "胜",
    losses: "负",
    totalPnl: "累计收益",
    profitableMonths: "盈利月份",
    losingMonths: "亏损月份",
    winRate: "胜率",
    bestMonth: "最佳单月",
    backtest: "回测",
    live: "实盘",
    snapshotNoteBacktest: "当前显示研究验证与历史结果。",
    snapshotNoteLive: "当前显示实盘执行与当前账本。",
    backtestSnapshot: "回测结果",
    liveSnapshot: "实盘执行",
    liveSummary: "实盘摘要",
    total: "总计",
    realized: "已实现",
    unrealized: "未实现",
    riskMetrics: "风险指标",
    equityCurve: "权益曲线",
    leader: "领先策略",
    totalReturnLabel: "总回报",
    totalTradesLabel: "总交易数",
    returnLabel: "回报",
    profitFactor: "盈亏比",
    livePnl: "实盘收益",
    currentOpenPosition: "当前未平仓仓位",
    bestPerformer: "最佳资产",
    worstPerformer: "最弱资产",
    tradeHistory: "交易记录",
    status: "状态",
    open: "未平仓",
    closed: "已平仓",
    currentPrice: "当前价格",
    entryPx: "入场价",
    exitPx: "出场价",
    move: "涨跌幅",
    active: "运行中",
    flat: "空仓",
    tie: "持平",
    liveMarkUnavailable: "实时标记不可用，当前使用静态快照。",
    liveMarkStale: "实时标记已过期，当前保持上一份快照。",
    staticSnapshotMode: "当前为静态快照模式。",
    markAt: "标记于",
    combinedLivePnl: "组合实盘收益",
    totalReturnNote: "总回报",
    maxDrawdown: "最大回撤",
    avgWin: "平均盈利",
    avgLoss: "平均亏损",
    trendUp: "上涨趋势",
    trendDown: "下跌趋势",
    rangeChop: "震荡行情",
    transition: "过渡期",
    evolutionSectionTitle: "Grapes Evolution",
    evolutionRuntimeTitle: "运行状态",
    evolutionBaselineTitle: "当前基线",
    evolutionPatternTitle: "近期模式统计",
    evolutionDecisionTitle: "决策看板",
    evolutionBridgeTitle: "Bridge 收件箱",
    evolutionPipelineTitle: "Pipeline 状态",
    evolutionRunCycle: "运行 Mutation Cycle",
    evolutionBlockedAt: "当前卡点",
    evolutionPendingClusters: "个 clusters 待处理",
    evolutionDiscoveriesTitle: "发现列表",
    evolutionVpTitle: "验证 / 晋升",
    evolutionExamplesNote: "这里展示的例子只取 <strong>2025-2026</strong> 的交易。",
    evolutionBriefTitle: "Evolution 现在在看什么",
    evolutionBriefSummary: "只有当系统能把重复出现的市场问题拆成不同类型的修正方向时，Evolution 才真正有价值。现在这页的作用，是把它看到了什么、想试什么，以及这些建议是否已经成熟到值得进入观察阶段，讲清楚。",
    evolutionBriefDoing: "它现在在做什么",
    evolutionBriefFocus: "现在该看什么",
    evolutionBriefRead: "这页怎么读",
    evolutionBriefReadBody: "先看决策看板，读问题本身，再看对应的 2025-2026 例子，最后判断这个提议是不是足够具体、值得继续观察。",
    evolutionWorkingTitle: "它当前在推进什么",
    evolutionFlowTitle: "决策流程",
    evolutionNoResearch: "当前没有活跃研究线程。",
    evolutionNoPatternStats: "当前没有模式统计。",
    evolutionNoDecisionCards: "当前没有决策条目。",
    evolutionNoBridgeResults: "当前还没有导入的 bridge 结果。",
    evolutionNoDiscoveryDetail: "点一条 cluster，就能看当前证据和建议方向。",
    evolutionNoDiscoveries: "当前没有发现记录。",
    evolutionWhy: "为什么",
    evolutionExpected: "预期影响",
    evolutionExampleTrades: "例子交易",
    evolutionScope: "范围",
    evolutionAction: "动作",
    evolutionMode: "模式",
    evolutionStage: "阶段",
    evolutionDecision: "结论",
    evolutionWhyFlagged: "为什么被标记",
    evolutionSamples: "样本数",
    evolutionOutcome: "结果",
    evolutionSeverity: "严重度",
    evolutionConfidence: "置信度",
    evolutionHypothesis: "假设",
    evolutionRiskNote: "风险提示",
    evolutionProviderModel: "Provider / 模型",
    evolutionAvgPnl: "平均收益",
    evolutionPatternKey: "Pattern",
    evolutionDiscoveryDetailTitle: "Cluster 详情",
    evolutionAccepted: "是否通过",
    evolutionOverfit: "过拟合",
    evolutionObservationFirst: "先进入观察，不急着上线",
    evolutionWaitingProof: "大多数提议还在等证据",
    evolutionBottleneck: "当前瓶颈",
    evolutionResearchQuality: "研究质量",
    evolutionDoingBody: "系统先把重复出现的失败形态归类，再和当前 production 基线对比。",
    evolutionFocusBody: "真正该看的，不是它有没有发现 pattern，而是不同问题最后会不会导向不同的修法。",
    evolutionObservationBody: "只要形态还不稳定，就先进入观察阶段。目的不是立刻改 production，而是先确认行为是不是持续存在。",
    evolutionWaitingBody: "系统发现问题的速度，会比验证问题的速度快。这是正常的。发现很便宜，晋升很贵。",
    evolutionBottleneckBody: "真正困难的不是找到坏形状，而是把看起来相似的问题，拆成不同且可信的修正动作。",
    reason: "原因",
    holdMode: "保留",
    yes: "是",
    no: "否",
    grapesProfileRows: [
      ["策略定位", "面向趋势与结构机会的稳健策略", "这套策略更强调在高质量行情中参与，在不确定阶段减少噪音暴露，让收益曲线尽量平稳向上。"],
      ["如何参与", "偏向清晰、可持续的机会", "系统会在更有延续性的价格结构里建立仓位，而不是追逐每一次短期波动。"],
      ["如何管理", "先保护收益，再控制回撤", "当盈利出现后，系统更注重留住已经到手的利润，并把回撤管理放在优先位置。"],
      ["当前特征", "偏稳健、偏耐心", "更像一套追求长期复利质量的资产引擎。"],
    ],
    citrusProfileRows: [
      ["策略定位", "多资产执行与筛选策略", "这套策略更强调跨资产的一致性，希望在不同币种中维持更整洁的收益结构。"],
      ["如何参与", "只在更健康的机会里提高参与度", "系统会优先选择更有市场支持的机会，减少被假动作和噪音波动反复扫出的情况。"],
      ["如何管理", "降低无效进出对组合的侵蚀", "核心目标不是提高频率，而是让每一次参与都更值得，把组合波动压到更可控的水平。"],
      ["当前特征", "偏质量、偏筛选", "更像一套持续打磨执行质量的资产组合。"],
    ],
  },
};

function t(key) {
  return I18N[state.lang][key] ?? I18N.en[key] ?? key;
}

function getStrategyLabel(strategyKey) {
  return STRATEGY_META[strategyKey]?.label || strategyKey;
}

function getStrategyDisplay(strategyKey) {
  return STRATEGY_META[strategyKey]?.display || strategyKey;
}

const MYT_TIMEZONE = "Asia/Kuala_Lumpur";

function parseUtcDate(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}$/.test(text)) {
    const dt = new Date(`${text}-01T00:00:00Z`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const hasZone = /([zZ]|[+\-]\d{2}:\d{2})$/.test(normalized);
  const dt = new Date(hasZone ? normalized : `${normalized}Z`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

async function triggerEvolutionMutation(discoveryId) {
  const response = await fetch(`${EVOLUTION_API_BASE}/export-discovery/${discoveryId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `export failed (${response.status})`);
  }
  return response.json();
}

async function fetchEvolutionSimilarCases(discoveryId) {
  const response = await fetch(`${EVOLUTION_API_BASE}/similar-cases?discovery_id=${encodeURIComponent(discoveryId)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `similar-cases failed (${response.status})`);
  }
  return response.json();
}

function parseTimestamp(raw) {
  const dt = parseUtcDate(raw);
  return dt ? dt.getTime() : null;
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function fmtUsd(v) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(v || 0)); }
function fmtPct(v, d = 2) { const n = Number(v || 0); return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`; }
function fmtNum(v, d = 2) { return Number(v || 0).toFixed(d); }
function fmtDate(ts) {
  const date = parseUtcDate(ts);
  if (!date) return String(ts || "").slice(0, 16);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MYT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
}
function fmtTradeDate(ts) {
  const date = parseUtcDate(ts);
  if (!date) {
    const text = String(ts || "");
    if (!text || text === "—") return "—";
    return text.slice(5, 16);
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MYT_TIMEZONE,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
}
function fmtTradeMonthDay(ts) {
  const text = String(ts || "");
  if (!text || text === "—") return "—";
  const date = parseUtcDate(text);
  if (!date) return text.slice(5, 16);
  return new Intl.DateTimeFormat(state.lang === "zh" ? "zh-CN" : "en-US", {
    timeZone: MYT_TIMEZONE,
    month: state.lang === "zh" ? "numeric" : "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
function fmtUpdatedAt(ts) {
  const date = parseUtcDate(ts);
  if (!date) return String(ts || "").slice(0, 16);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MYT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
}
function fmtTimeOnly(ts) {
  const date = ts ? (parseUtcDate(ts) || new Date()) : new Date();
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MYT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}
function fmtSignedCompactUsd(v, d = 0) {
  const n = Number(v || 0);
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toFixed(d)}`;
}

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase();
}

function getLiveMarkPrice(symbol, fallbackPrice = 0) {
  const normalized = normalizeSymbol(symbol);
  const live = Number(state.livePrices.prices[normalized]);
  return Number.isFinite(live) && live > 0 ? live : Number(fallbackPrice || 0);
}

function getLiveQuoteAgeMs(symbol) {
  const normalized = normalizeSymbol(symbol);
  const tickTs = Number(state.livePrices.pricesMeta[normalized]?.ts || 0);
  return tickTs > 0 ? (Date.now() - tickTs) : Infinity;
}

function isLiveQuoteStale(symbol) {
  return getLiveQuoteAgeMs(symbol) > 12000;
}

function markActivePosition(position) {
  if (!position) return position;
  const entryPrice = Number(position.entry_price || 0);
  const symbol = position.symbol || `${position.asset || ""}USDT`;
  const currentPrice = getLiveMarkPrice(symbol, position.current_price || entryPrice);
  const directionInt = String(position.direction || "").toUpperCase() === "SHORT" ? -1 : 1;
  const currentPnlPct = entryPrice > 0
    ? (((currentPrice - entryPrice) / entryPrice) * directionInt * 100.0)
    : Number(position.current_pnl_pct || 0);
  const currentPnlUsd = (currentPnlPct / 100.0) * LIVE_FIXED_NOTIONAL_USD;
  return {
    ...position,
    current_price: roundNumber(currentPrice, 4),
    current_pnl_pct: roundNumber(currentPnlPct, 2),
    current_pnl_usd: roundNumber(currentPnlUsd, 2),
    quote_stale: isLiveQuoteStale(symbol),
  };
}

function getMarkedActivePositions(positions = []) {
  return (positions || []).map((position) => markActivePosition(position));
}

function roundNumber(value, digits = 2) {
  const numeric = Number(value || 0);
  return Number(numeric.toFixed(digits));
}

function getLiveFeedStatus() {
  if (state.livePrices.connected) {
    const ageMs = state.livePrices.lastTickAt ? (Date.now() - state.livePrices.lastTickAt) : Infinity;
    if (ageMs <= 12000) return "live";
    return "stale";
  }
  if (state.livePrices.subscribedSymbols.length) return "reconnecting";
  return "idle";
}

function getLiveFeedStatusLabel() {
  const status = getLiveFeedStatus();
  if (status === "live") return "Live";
  if (status === "stale") return "Stale";
  if (status === "reconnecting") return "Reconnecting";
  return "Idle";
}

function getLiveFeedFallbackNote() {
  const status = getLiveFeedStatus();
  if (status === "live") return "";
  if (status === "reconnecting") return t("liveMarkUnavailable");
  if (status === "stale") return t("liveMarkStale");
  return t("staticSnapshotMode");
}

function getStrategyLiveBreakdown(strategyKey, data = state.data) {
  const strategy = data?.strategies?.[strategyKey];
  const baseSummary = strategy?.execution_views?.live?.summary || {};
  const markedPositions = getMarkedActivePositions(strategy?.active_positions || []);
  const unrealizedPnlUsd = markedPositions
    .map((position) => Number(position.current_pnl_usd))
    .filter(Number.isFinite)
    .reduce((sum, value) => sum + value, 0);
  const realizedPnlUsd = Number(baseSummary.net_pnl_usd || 0);
  const totalPnlUsd = realizedPnlUsd + unrealizedPnlUsd;
  return {
    realizedPnlUsd: roundNumber(realizedPnlUsd, 2),
    unrealizedPnlUsd: roundNumber(unrealizedPnlUsd, 2),
    totalPnlUsd: roundNumber(totalPnlUsd, 2),
  };
}

function getValueFlashClass(key, nextValue) {
  const numeric = Number(nextValue);
  if (!Number.isFinite(numeric)) return "";
  const prev = state.livePrices.lastRenderedValues[key];
  state.livePrices.lastRenderedValues[key] = numeric;
  if (!Number.isFinite(prev) || Math.abs(prev - numeric) < 1e-9) return "";
  return numeric > prev ? "flash-up" : "flash-down";
}

function getStrategyLiveSummary(strategyKey, data = state.data) {
  const strategy = data?.strategies?.[strategyKey];
  const baseSummary = { ...(strategy?.execution_views?.live?.summary || {}) };
  if (!strategy) return baseSummary;
  const breakdown = getStrategyLiveBreakdown(strategyKey, data);
  const realizedNet = Number(baseSummary.net_pnl_usd || 0);
  const initialEquity = Number(baseSummary.final_equity || 0) - realizedNet;
  const netPnlUsd = breakdown.totalPnlUsd;
  const finalEquity = Number.isFinite(initialEquity) ? initialEquity + netPnlUsd : Number(baseSummary.final_equity || 0);
  return {
    ...baseSummary,
    net_pnl_usd: roundNumber(netPnlUsd, 2),
    final_equity: roundNumber(finalEquity, 2),
    total_return_pct: initialEquity > 0 ? roundNumber((netPnlUsd / initialEquity) * 100, 2) : Number(baseSummary.total_return_pct || 0),
    unrealized_pnl_usd: breakdown.unrealizedPnlUsd,
    realized_pnl_usd: breakdown.realizedPnlUsd,
  };
}
function fmtBaseCapitalLabel(amount) {
  const value = fmtUsd(amount);
  return state.lang === "zh" ? `统一 ${value} base` : `${value} base capital`;
}

function buildOverviewLiveStats(data) {
  const liveSummaries = OVERVIEW_STRATEGY_KEYS.map((key) => getStrategyLiveSummary(key, data));
  const allTrades = OVERVIEW_STRATEGY_KEYS.flatMap((key) => data.strategies[key]?.execution_views?.live?.all_trades || []);
  const totalPnl = liveSummaries.reduce((sum, row) => sum + Number(row.net_pnl_usd || 0), 0);
  const totalTrades = liveSummaries.reduce((sum, row) => sum + Number(row.trades || 0), 0);
  const wins = allTrades.filter((row) => Number(row.net_pnl_usd || 0) > 0).length;
  const totalInitial = liveSummaries.reduce(
    (sum, row) => sum + (Number(row.final_equity || 0) - Number(row.net_pnl_usd || 0)),
    0
  );
  const totalReturn = totalInitial ? (totalPnl / totalInitial) * 100 : 0;
  const avgPf = liveSummaries.length
    ? (liveSummaries.reduce((sum, row) => sum + Number(row.profit_factor || 0), 0) / liveSummaries.length)
    : 0;
  const combinedSeries = buildTradeEquitySeries(
    OVERVIEW_STRATEGY_KEYS.flatMap((key) =>
      ((data.strategies[key]?.execution_views?.live?.all_trades || []).map((row) => ({ ...row, strategy: getStrategyLabel(key) })))
    ),
    0
  );
  let peak = -Infinity;
  let maxDdPct = 0;
  combinedSeries.forEach((row) => {
    const equity = Number(row.equity || 0);
    peak = Math.max(peak, equity);
    if (peak > 0) {
      maxDdPct = Math.min(maxDdPct, ((equity - peak) / peak) * 100);
    }
  });
  return {
    totalPnl,
    totalTrades,
    totalReturn,
    winRate: totalTrades ? (wins / totalTrades) * 100 : 0,
    avgPf,
    maxDdPct,
  };
}

function getStrategyBestWorst(trades) {
  const stats = computeAssetValidationStats(trades || []).sort((a, b) => Number(b.totalPnl || 0) - Number(a.totalPnl || 0));
  return {
    best: stats[0] || null,
    worst: stats[stats.length - 1] || null,
  };
}

function buildOverviewTradeRows(strategyKey, data) {
  const strategy = data.strategies[strategyKey];
  const active = getMarkedActivePositions(strategy.active_positions || []);
  const trades = [...(strategy.execution_views?.live?.all_trades || [])]
    .sort((a, b) => String(b.exit_ts || "").localeCompare(String(a.exit_ts || "")));
  const openRows = active.map((row) => ({
    asset: row.asset,
    direction: row.direction,
    entry_ts: row.entry_time || row.entry_ts || "—",
    exit_ts: "—",
    size: row.size ?? row.qty ?? "—",
    pnl: Number(row.current_pnl_pct ?? 0),
    pnl_is_pct: true,
    status: "Open",
  }));
  const closedRows = trades.slice(0, 5).map((row) => ({
    asset: row.asset,
    direction: row.direction,
    entry_ts: row.entry_ts,
    exit_ts: row.exit_ts,
    size: row.size ?? row.position_size ?? "—",
    pnl: Number(row.net_pnl_usd || 0),
    pnl_is_pct: false,
    status: "Closed",
  }));
  const rows = [...openRows, ...closedRows].slice(0, 5);
  while (rows.length < 5) {
    rows.push({
      asset: "—",
      direction: "—",
      entry_ts: "—",
      exit_ts: "—",
      size: "—",
      pnl: null,
      pnl_is_pct: false,
      status: "—",
      is_placeholder: true,
    });
  }
  return rows;
}

function setActiveView(view) {
  state.view = view;
  localStorage.setItem("strategy_os_view", view);
  document.querySelectorAll(".switch-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === view));
  const hero = document.getElementById("master-board-hero");
  if (hero) hero.style.display = view === "all" ? "grid" : "none";
  if (state.data) {
    requestAnimationFrame(() => renderCharts(state.data));
  }
}

function getStrategyLensData(strategyKey) {
  const strategy = state.data?.strategies?.[strategyKey];
  if (!strategy) return null;
  const lens = (state.lenses[strategyKey] === "extended" ? "backtest" : state.lenses[strategyKey]) || "backtest";
  return strategy.execution_views?.[lens] || strategy.execution_views?.backtest || null;
}

function computeAssetValidationStats(trades) {
  const grouped = new Map();
  (trades || []).forEach((trade) => {
    const asset = trade.asset;
    if (!asset) return;
    const pnl = Number(trade.net_pnl_usd || 0);
    const row = grouped.get(asset) || { asset, trades: 0, wins: 0, totalPnl: 0, pnlList: [] };
    row.trades += 1;
    row.totalPnl += pnl;
    row.pnlList.push(pnl);
    if (pnl > 0) row.wins += 1;
    grouped.set(asset, row);
  });
  return Array.from(grouped.values()).map((row) => {
    const grossWins = row.pnlList.filter((v) => v > 0).reduce((a, b) => a + b, 0);
    const grossLossesAbs = Math.abs(row.pnlList.filter((v) => v < 0).reduce((a, b) => a + b, 0));
    return {
      asset: row.asset,
      trades: row.trades,
      winRatePct: row.trades ? (row.wins / row.trades) * 100 : 0,
      totalPnl: row.totalPnl,
      avgPnl: row.trades ? row.totalPnl / row.trades : 0,
      profitFactor: grossLossesAbs > 0 ? grossWins / grossLossesAbs : grossWins > 0 ? Infinity : 0,
    };
  }).sort((a, b) => String(a.asset).localeCompare(String(b.asset)));
}

function applyLanguage() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll(".lang-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === state.lang));
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };
  const setPanelTitleFromBody = (bodyId, title) => {
    const body = document.getElementById(bodyId);
    const panel = body?.closest(".panel");
    const heading = panel?.querySelector(".card-head h4");
    if (heading) heading.textContent = title;
  };
  setText('.switch-tab[data-view="all"]', state.lang === "zh" ? "总览" : "Overview");
  setText('.switch-tab[data-view="grapes"]', state.lang === "zh" ? "🍇 Grapes" : "🍇 Grapes");
  setText('.switch-tab[data-view="citrus"]', state.lang === "zh" ? "🍊 Citrus" : "🍊 Citrus");
  setText('.switch-tab[data-view="equity"]', state.lang === "zh" ? "📈 Equity" : "📈 Equity");
  setText('[data-panel="all"] .overview-chart-surface .eyebrow', t("combinedLivePnl"));
  setText('[data-panel="grapes"] .panel-head .eyebrow', t("strategyDetail"));
  setText('[data-panel="grapes"] .panel-head h3', t("grapesName"));
  setText('[data-panel="grapes"] .panel-head .section-note', t("grapesNote"));
  setText('[data-panel="grapes"] .detail-grid .panel:first-child h4', t("assetOverlay"));
  setPanelTitleFromBody("grapes-summary", t("strategyProfile"));
  setPanelTitleFromBody("grapes-active-positions", t("openPositions"));
  setPanelTitleFromBody("grapes-asset-cards-detail", t("assetValidation"));
  setText('[data-panel="grapes"] .strategy-rail .asset-curves-panel .eyebrow', t("assetCurves"));
  setPanelTitleFromBody("grapes-regime", t("regimePerformance"));
  setPanelTitleFromBody("grapes-monthly-summary", t("monthlyHeatmap"));
  setPanelTitleFromBody("grapes-trade-meta", t("tradeExplorer"));
  setText('[data-panel="citrus"] .panel-head .eyebrow', t("strategyDetail"));
  setText('[data-panel="citrus"] .panel-head h3', t("citrusName"));
  setText('[data-panel="citrus"] .panel-head .section-note', t("citrusNote"));
  setText('[data-panel="citrus"] .detail-grid .panel:first-child h4', t("assetOverlay"));
  setPanelTitleFromBody("citrus-summary", t("strategyProfile"));
  setPanelTitleFromBody("citrus-active-positions", t("openPositions"));
  setPanelTitleFromBody("citrus-asset-cards-detail", t("assetValidation"));
  setText('[data-panel="citrus"] .strategy-rail .asset-curves-panel .eyebrow', t("assetCurves"));
  setPanelTitleFromBody("citrus-regime", t("regimePerformance"));
  setPanelTitleFromBody("citrus-monthly-summary", t("monthlyHeatmap"));
  setPanelTitleFromBody("citrus-trade-meta", t("tradeExplorer"));
  setPanelTitleFromBody("equity-summary", t("strategyProfile"));
  setPanelTitleFromBody("equity-active-positions", t("openPositions"));
  setPanelTitleFromBody("equity-asset-cards-detail", t("assetValidation"));
  setPanelTitleFromBody("equity-regime", t("regimePerformance"));
  setPanelTitleFromBody("equity-monthly-summary", t("monthlyHeatmap"));
  setPanelTitleFromBody("equity-trade-meta", t("tradeExplorer"));
  const grapesScope = document.getElementById("grapes-trade-scope");
  const citrusScope = document.getElementById("citrus-trade-scope");
  const equityScope = document.getElementById("equity-trade-scope");
  [grapesScope, citrusScope, equityScope].forEach((select) => {
    if (!select) return;
    select.options[0].text = t("monthly");
    select.options[1].text = t("yearly");
    select.options[2].text = t("all");
  });
  document.querySelectorAll(".subview-tab").forEach((btn) => {
    btn.textContent = t(btn.dataset.lens);
    btn.classList.toggle("active", state.lenses[btn.dataset.strategy] === btn.dataset.lens);
  });
}

function renderHero(data) {
  const updatedMain = document.getElementById("updated-at");
  const updatedHeader = document.getElementById("updated-at-header");
  const updatedValue = fmtUpdatedAt(data.meta.updated_at);
  if (updatedMain) updatedMain.textContent = `${t("updated")} ${updatedValue}`;
  if (updatedHeader) {
    const fallbackNote = getLiveFeedFallbackNote();
    updatedHeader.innerHTML = `
      <span class="updated-stamp-top">
        <span class="live-feed-pill ${getLiveFeedStatus()}">${getLiveFeedStatusLabel()}</span>
        <span class="updated-stamp-label">${t("updated")}</span>
      </span>
      <strong class="updated-stamp-value">${updatedValue}</strong>
      ${fallbackNote ? `<span class="updated-fallback-note">${fallbackNote}</span>` : ""}
    `;
  }
  const target = document.getElementById("hero-status");
  if (!target) return;
  const grapes = data.strategies.grapes;
  const citrus = data.strategies.citrus;
  const stats = buildOverviewLiveStats(data);
  const positions = [
    ...(grapes.active_positions || []).map((row) => ({ ...row, strategy: "Grapes" })),
    ...(citrus.active_positions || []).map((row) => ({ ...row, strategy: "Citrus" })),
  ];
  const positionLabel = positions.length ? positions.map((row) => row.asset).join(" · ") : "Flat";
  target.innerHTML = `
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Positions</span>
      <strong class="overview-metric-value">${positions.length}</strong>
      <span class="overview-metric-sub">${positionLabel}</span>
    </div>
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Total PnL</span>
      <strong class="overview-metric-value ${stats.totalPnl < 0 ? "neg" : "pos"}">${fmtSignedCompactUsd(stats.totalPnl)}</strong>
    </div>
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Total Return</span>
      <strong class="overview-metric-value ${stats.totalReturn < 0 ? "neg" : "pos"}">${fmtPct(stats.totalReturn, 2)}</strong>
    </div>
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Total Trades</span>
      <strong class="overview-metric-value">${stats.totalTrades}</strong>
    </div>
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Win Rate</span>
      <strong class="overview-metric-value">${fmtPct(stats.winRate, 1)}</strong>
    </div>
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Avg PF</span>
      <strong class="overview-metric-value ${Number(stats.avgPf || 0) >= 1 ? "pos" : "neg"}">${fmtNum(stats.avgPf, 2)}</strong>
    </div>
    <div class="overview-metric-cell">
      <span class="overview-topbar-label">Last Update</span>
      <strong class="overview-metric-value">${fmtUpdatedAt(data.meta.updated_at)}</strong>
    </div>
  `;
}

function renderOverviewSummary(data) {
  const target = document.getElementById("overview-summary");
  if (!target) return;
  const strategyRows = OVERVIEW_STRATEGY_KEYS.map((key) => ({
    key,
    live: getStrategyLiveSummary(key, data),
    breakdown: getStrategyLiveBreakdown(key, data),
  }));
  const stats = buildOverviewLiveStats(data);
  const leader = strategyRows
    .map((row) => ({ key: row.key, score: Number(row.live.total_return_pct || 0) }))
    .sort((a, b) => b.score - a.score);
  const leaderKey = leader.length >= 2 && leader[0].score === leader[1].score ? "tie" : (leader[0]?.key || "tie");
  const renderStrategyRow = ({ key, live, breakdown }) => `
    <div class="rail-row strategy ${leaderKey === key ? "is-leader" : ""} ${leaderKey !== "tie" && leaderKey !== key ? "is-muted" : ""}">
      <div class="rail-row-head">
        <span class="rail-row-name">${getStrategyDisplay(key)}</span>
        ${leaderKey === key ? `<span class="leader-badge">${t("leader")}</span>` : ""}
      </div>
      <div class="rail-kpi-grid">
        <div><span>${t("total")}</span><strong class="${Number(live.net_pnl_usd || 0) < 0 ? "neg" : "pos"} ${getValueFlashClass(`${key}-overview-total`, live.net_pnl_usd || 0)}">${fmtUsd(live.net_pnl_usd || 0)}</strong></div>
        <div><span>${t("realized")}</span><strong class="${Number(breakdown.realizedPnlUsd || 0) < 0 ? "neg" : "pos"}">${fmtUsd(breakdown.realizedPnlUsd || 0)}</strong></div>
        <div><span>${t("unrealized")}</span><strong class="${Number(breakdown.unrealizedPnlUsd || 0) < 0 ? "neg" : "pos"} ${getValueFlashClass(`${key}-overview-unrealized`, breakdown.unrealizedPnlUsd || 0)}">${fmtUsd(breakdown.unrealizedPnlUsd || 0)}</strong></div>
        <div><span>${t("returnLabel")}</span><strong class="${Number(live.total_return_pct || 0) < 0 ? "neg" : "pos"}">${fmtPct(live.total_return_pct || 0, 2)}</strong></div>
        <div><span>PF</span><strong>${fmtNum(live.profit_factor || 0, 2)}</strong></div>
        <div><span>${t("trades")}</span><strong>${live.trades || 0}</strong></div>
      </div>
    </div>
  `;
  target.innerHTML = `
    <section class="rail-section summary">
      <div class="rail-title">${t("liveSummary")}</div>
      <div class="rail-summary-line">
        <strong class="decision-total ${stats.totalPnl < 0 ? "neg" : "pos"} ${getValueFlashClass("overview-total-pnl", stats.totalPnl)}">${fmtUsd(stats.totalPnl)}</strong>
        <span class="${stats.totalReturn < 0 ? "neg" : "pos"}">${fmtPct(stats.totalReturn, 2)} ${t("totalReturnNote")}</span>
      </div>
      ${strategyRows.map((row) => renderStrategyRow(row)).join("")}
    </section>
    <section class="rail-section">
      <div class="rail-title">${t("riskMetrics")}</div>
      <div class="rail-table compact">
        <div><span>${t("maxDrawdown")}</span><strong class="neg">${fmtPct(stats.maxDdPct, 1)}</strong></div>
        <div><span>Sharpe</span><strong>${fmtNum(strategyRows.reduce((sum, row) => sum + Number(row.live.sharpe || 0), 0) / Math.max(1, strategyRows.length), 2)}</strong></div>
        <div><span>${t("winRate")}</span><strong class="${Number(stats.winRate || 0) >= 50 ? "pos" : "neg"}">${fmtPct(stats.winRate, 1)}</strong></div>
        <div><span>${t("avgWin")}</span><strong class="pos">${fmtUsd(strategyRows.reduce((sum, row) => sum + Number(row.live.avg_win_usd || 0), 0) / Math.max(1, strategyRows.length))}</strong></div>
        <div><span>${t("avgLoss")}</span><strong class="neg">${fmtUsd(strategyRows.reduce((sum, row) => sum + Number(row.live.avg_loss_usd || 0), 0) / Math.max(1, strategyRows.length))}</strong></div>
        <div><span>${t("leader")}</span><strong>${leaderKey === "tie" ? t("tie") : getStrategyDisplay(leaderKey)}</strong></div>
      </div>
    </section>
    <section class="rail-section">
      <div class="rail-title">
        <span>${t("equityCurve")}</span>
        <div class="chart-legend" id="overview-relative-legend"></div>
      </div>
      <canvas id="overview-relative-canvas" class="chart-canvas mini"></canvas>
    </section>
  `;
}

function renderOverviewStrategyTape(data) {
  const target = document.getElementById("overview-strategy-tape");
  if (!target) return;
  const rows = OVERVIEW_STRATEGY_KEYS.map((key) => {
    const strategy = data.strategies[key] || {};
    const active = getMarkedActivePositions(strategy.active_positions || []);
    const live = getStrategyLiveSummary(key, data);
    return {
      key,
      name: getStrategyDisplay(key),
      status: active.length ? t("active") : t("flat"),
      netPnl: live.net_pnl_usd,
      totalReturn: live.total_return_pct,
      trades: live.trades,
      pf: live.profit_factor,
      winRate: live.win_rate_pct,
      active,
      tradesList: strategy.execution_views?.live?.all_trades || [],
    };
  });
  target.innerHTML = rows.map((row) => {
    const top = getStrategyBestWorst(row.tradesList || []);
    const preview = buildOverviewTradeRows(row.key, data);
    const currentRows = row.active.slice(0, 3);
    return `
        <article class="strategy-terminal-panel ${row.key}">
          <div class="strategy-terminal-head">
            <div>
              <div class="strategy-terminal-name">${row.name}</div>
              <div class="strategy-terminal-role">${STRATEGY_META[row.key]?.role || "Strategy Engine"}</div>
            </div>
          </div>
        <div class="terminal-open-row">
          <span class="strategy-ledger-label">${t("currentOpenPosition")}</span>
          <div class="terminal-open-list">
            ${currentRows.length
              ? currentRows.map((current) => `
                <div class="terminal-open-item">
                  <strong>${current.asset}</strong>
                  <div class="terminal-open-side">
                    <span class="dir-chip ${String(current.direction).toLowerCase()}">${current.direction}</span>
                    <span class="${Number(current.current_pnl_pct || 0) < 0 ? "neg" : "pos"}">${fmtPct(current.current_pnl_pct || 0, 2)}</span>
                  </div>
                </div>
              `).join("")
              : `<div class="terminal-open-item empty"><strong>${t("flat")}</strong><div>—</div></div>`}
          </div>
        </div>
        <div class="terminal-metric-row">
          <div><span>${t("livePnl")}</span><strong class="${Number(row.netPnl) < 0 ? "neg" : "pos"}">${fmtUsd(row.netPnl)}</strong></div>
          <div><span>${t("returnLabel")}</span><strong class="${Number(row.totalReturn || 0) < 0 ? "neg" : "pos"}">${fmtPct(row.totalReturn || 0, 2)}</strong></div>
          <div><span>${t("profitFactor")}</span><strong>${fmtNum(row.pf || 0, 2)}</strong></div>
          <div><span>${t("totalTradesLabel")}</span><strong>${row.trades || 0}</strong></div>
        </div>
        <div class="terminal-performer-row">
          <div>
            <span class="strategy-ledger-label">${t("bestPerformer")}</span>
            <strong>${top.best?.asset || "—"}</strong>
            <div class="pos">${top.best ? fmtSignedCompactUsd(top.best.totalPnl) : "—"}</div>
          </div>
          <div>
            <span class="strategy-ledger-label">${t("worstPerformer")}</span>
            <strong>${top.worst?.asset || "—"}</strong>
            <div class="neg">${top.worst ? fmtSignedCompactUsd(top.worst.totalPnl) : "—"}</div>
          </div>
        </div>
        <div class="terminal-table-wrap">
          <div class="terminal-table-head">
            <span class="strategy-ledger-label">${t("tradeHistory")}</span>
            <span class="terminal-table-count">${row.trades || 0} ${t("trades")}</span>
          </div>
          <table class="overview-trade-table">
            <thead>
              <tr>
                <th>${t("asset")}</th>
                <th>${t("side")}</th>
                <th>${t("entry")}</th>
                <th>${t("exit")}</th>
                <th>${t("pnl")}</th>
                <th>${t("status")}</th>
              </tr>
            </thead>
            <tbody>
              ${preview.map((trade) => `
                <tr>
                  <td data-label="${t("asset")}">${trade.asset || "—"}</td>
                  <td data-label="${t("side")}">${trade.is_placeholder ? "—" : `<span class="dir-chip ${String(trade.direction || "").toLowerCase()}">${trade.direction || "—"}</span>`}</td>
                  <td data-label="${t("entry")}" class="mono">${fmtTradeMonthDay(trade.entry_ts)}</td>
                  <td data-label="${t("exit")}" class="mono">${trade.exit_ts === "—" ? "—" : fmtTradeMonthDay(trade.exit_ts)}</td>
                  <td data-label="${t("pnl")}" class="${trade.pnl == null ? "" : Number(trade.pnl || 0) < 0 ? "neg" : "pos"}">${trade.pnl == null ? "—" : trade.pnl_is_pct ? fmtPct(trade.pnl, 2) : fmtSignedCompactUsd(trade.pnl)}</td>
                  <td data-label="${t("status")}" class="${String(trade.status).toLowerCase() === "closed" ? "closed-status" : ""}">${trade.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </article>
    `;
  }).join("");
}

function renderBoardCards(targetId, rows) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = rows.map((row) => `
    <article class="strategy-card compact">
      <div class="strategy-title">
        <div><h4>${row.title}</h4><p>${row.subtitle || ""}</p></div>
      </div>
      <div class="strategy-main single">
        <div><div class="main-number ${row.negative ? "neg" : row.highlight ? "pos" : ""}">${row.value}</div><div class="kpi-sub">${row.label}</div></div>
      </div>
    </article>`).join("");
}

function renderSnapshotCards(strategyKey, strategyLabel, viewData) {
  const target = document.getElementById(`${strategyKey}-snapshot-cards`);
  const note = document.getElementById(`${strategyKey}-lens-note`);
  if (!target || !viewData) return;
  const lens = (state.lenses[strategyKey] === "extended" ? "backtest" : state.lenses[strategyKey]) || "backtest";
  const s = lens === "live" ? getStrategyLiveSummary(strategyKey) : (viewData.summary || {});
  const breakdown = lens === "live" ? getStrategyLiveBreakdown(strategyKey) : null;
  if (note) note.textContent = "";
  target.innerHTML = `
    <article class="snapshot-card">
      <div class="snapshot-head">
        <span class="snapshot-label rail-title">${t(
          lens === "live" ? "liveSnapshot" : "backtestSnapshot"
        )}</span>
      </div>
      <div class="snapshot-layout">
        <div class="snapshot-primary">
          <div class="snapshot-main decision-total ${lens === "live" ? (Number(s.net_pnl_usd || 0) < 0 ? "neg" : "pos") : "neutral"} ${lens === "live" ? getValueFlashClass(`${strategyKey}-snapshot-total`, s.net_pnl_usd || 0) : ""}">${fmtUsd(s.net_pnl_usd || 0)}</div>
          <div class="snapshot-primary-meta">
            <span class="snapshot-sub decision-subline">${t("pnl")}</span>
            <strong class="${Number(s.total_return_pct || 0) < 0 ? "neg" : "pos"}">${fmtPct(s.total_return_pct || 0)}</strong>
          </div>
        </div>
        <div class="snapshot-metrics rail-kpi-grid">
          ${lens === "live" ? `<div><span>${t("realized")}</span><strong class="${Number(breakdown.realizedPnlUsd || 0) < 0 ? "neg" : "pos"}">${fmtUsd(breakdown.realizedPnlUsd || 0)}</strong></div>` : ""}
          ${lens === "live" ? `<div><span>${t("unrealized")}</span><strong class="${Number(breakdown.unrealizedPnlUsd || 0) < 0 ? "neg" : "pos"} ${getValueFlashClass(`${strategyKey}-snapshot-unrealized`, breakdown.unrealizedPnlUsd || 0)}">${fmtUsd(breakdown.unrealizedPnlUsd || 0)}</strong></div>` : ""}
          <div><span>${t("pf")}</span><strong>${fmtNum(s.profit_factor || 0)}</strong></div>
          <div><span>${t("trades")}</span><strong>${s.trades || 0}</strong></div>
        </div>
      </div>
    </article>
  `;
}

function renderComparison(data) {
  const target = document.getElementById("comparison-table");
  if (!target) return;
  const grapesLive = data.strategies.grapes?.execution_views?.live?.summary || {};
  const citrusLive = data.strategies.citrus?.execution_views?.live?.summary || {};
  const grapesPos = data.strategies.grapes?.active_positions || [];
  const citrusPos = data.strategies.citrus?.active_positions || [];
  const rows = [
    { label: "Live Equity", grapes: fmtUsd(grapesLive.final_equity || 0), citrus: fmtUsd(citrusLive.final_equity || 0), delta: fmtUsd((grapesLive.final_equity || 0) - (citrusLive.final_equity || 0)) },
    { label: "Net PnL", grapes: fmtUsd(grapesLive.net_pnl_usd || 0), citrus: fmtUsd(citrusLive.net_pnl_usd || 0), delta: fmtUsd((grapesLive.net_pnl_usd || 0) - (citrusLive.net_pnl_usd || 0)) },
    { label: "Return", grapes: fmtPct(grapesLive.total_return_pct || 0, 2), citrus: fmtPct(citrusLive.total_return_pct || 0, 2), delta: fmtPct((grapesLive.total_return_pct || 0) - (citrusLive.total_return_pct || 0), 2) },
    { label: "Win Rate", grapes: fmtPct(grapesLive.win_rate_pct || 0, 1), citrus: fmtPct(citrusLive.win_rate_pct || 0, 1), delta: fmtPct((grapesLive.win_rate_pct || 0) - (citrusLive.win_rate_pct || 0), 1) },
    { label: "Open Positions", grapes: `${grapesPos.length}`, citrus: `${citrusPos.length}`, delta: `${grapesPos.length - citrusPos.length}` },
  ];
  target.innerHTML = `
    <div class="comparison-row comparison-head">
      <div class="label">Metric</div>
      <div class="value value-head">Grapes</div>
      <div class="value value-head">Citrus</div>
      <div class="delta value-head">Spread</div>
    </div>
    ${rows.map((row) => `
    <div class="comparison-row">
      <div class="label">${row.label}</div>
      <div class="value">${row.grapes}</div>
      <div class="value">${row.citrus}</div>
      <div class="delta ${String(row.delta || "").startsWith("-") ? "neg" : "pos"}">${row.delta || "—"}</div>
    </div>`).join("")}`;
}

function renderLegend(targetId, items) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = items.map((item) => `
    <span class="legend-item">
      <span class="legend-line" style="background:${item.color}"></span>
      <span>${item.label}</span>
    </span>
  `).join("");
}

function renderGrapesAssets(data) {
  const detailTarget = document.getElementById("grapes-asset-cards-detail");
  const lens = (state.lenses.grapes === "extended" ? "backtest" : state.lenses.grapes) || "backtest";
  const topRows = data.strategies.grapes?.asset_stats || [];
  const detailRows = computeAssetValidationStats(getStrategyLensData("grapes")?.all_trades || []);
  const totalPnlForRow = (row) => row.total_pnl ?? row.totalPnl ?? row.total_pnl_usd_20;
  const tradesForRow = (row) => row.trades ?? 0;
  const winRateForRow = (row) => row.win_rate_pct ?? row.winRatePct ?? 0;
  const renderRows = (rows) => rows.map((row) => `
    <article class="asset-card">
      <div class="rail-row-head">
        <span class="rail-row-name">${row.asset}</span>
        <strong class="asset-inline-pnl ${lens === "live" ? (totalPnlForRow(row) < 0 ? "neg" : "pos") : "neutral"}">${fmtUsd(totalPnlForRow(row))}</strong>
      </div>
      <div class="asset-meta-line">
        <span>${t("trades")} ${tradesForRow(row)}</span>
        <span>${t("winRate")} <strong class="${Number(winRateForRow(row)) >= 50 ? "pos" : "neg"}">${fmtPct(winRateForRow(row), 1)}</strong></span>
      </div>
    </article>`).join("");
  if (detailTarget) detailTarget.innerHTML = renderRows(detailRows.length ? detailRows : topRows);
}

function renderCitrusAssets(data) {
  const detailTarget = document.getElementById("citrus-asset-cards-detail");
  const lens = (state.lenses.citrus === "extended" ? "backtest" : state.lenses.citrus) || "backtest";
  const topRows = data.strategies.citrus?.assets || [];
  const detailRows = computeAssetValidationStats(getStrategyLensData("citrus")?.all_trades || []);
  const totalPnlForRow = (row, useLegacy) => useLegacy ? row.total_pnl_usd_20 : row.totalPnl;
  const avgPnlForRow = (row, useLegacy) => {
    if (!useLegacy) return row.avgPnl;
    const total = Number(row.total_pnl_usd_20 || 0);
    const trades = Number(row.trades || 0);
    return trades ? total / trades : 0;
  };
  const profitFactorForRow = (row, useLegacy) => {
    if (!useLegacy) return row.profitFactor;
    return row.profit_factor ?? row.profitFactor ?? row.sharpe ?? 0;
  };
  const winRateForRow = (row, useLegacy) => useLegacy ? row.win_rate_pct : row.winRatePct;
  const renderRows = (rows, useLegacy = false) => rows.map((row) => `
    <article class="asset-card">
      <div class="rail-row-head">
        <span class="rail-row-name">${row.asset}</span>
        <strong class="asset-inline-pnl ${lens === "live" ? (totalPnlForRow(row, useLegacy) < 0 ? "neg" : "pos") : "neutral"}">${fmtUsd(totalPnlForRow(row, useLegacy))}</strong>
      </div>
      <div class="asset-meta-line">
        <span>${t("trades")} ${row.trades}</span>
        <span>${t("winRate")} <strong class="${Number(winRateForRow(row, useLegacy)) >= 50 ? "pos" : "neg"}">${fmtPct(winRateForRow(row, useLegacy), 1)}</strong></span>
      </div>
    </article>`).join("");
  if (detailTarget) detailTarget.innerHTML = renderRows(detailRows.length ? detailRows : topRows, !detailRows.length);
}

function renderEquityAssets(data) {
  const detailTarget = document.getElementById("equity-asset-cards-detail");
  const lens = (state.lenses.equity === "extended" ? "backtest" : state.lenses.equity) || "backtest";
  const topRows = data.strategies.equity?.assets || [];
  const detailRows = computeAssetValidationStats(getStrategyLensData("equity")?.all_trades || []);
  const renderRows = (rows, useLegacy = false) => rows.map((row) => {
    const totalPnl = useLegacy ? row.total_pnl_usd_20 : row.totalPnl;
    const winRate = useLegacy ? row.win_rate_pct : row.winRatePct;
    return `
    <article class="asset-card">
      <div class="rail-row-head">
        <span class="rail-row-name">${row.asset}</span>
        <strong class="asset-inline-pnl ${lens === "live" ? (Number(totalPnl || 0) < 0 ? "neg" : "pos") : "neutral"}">${fmtUsd(totalPnl || 0)}</strong>
      </div>
      <div class="asset-meta-line">
        <span>${t("trades")} ${row.trades || 0}</span>
        <span>${t("winRate")} <strong class="${Number(winRate || 0) >= 50 ? "pos" : "neg"}">${fmtPct(winRate || 0, 1)}</strong></span>
      </div>
    </article>`;
  }).join("");
  if (detailTarget) detailTarget.innerHTML = renderRows(detailRows.length ? detailRows : topRows, !detailRows.length);
}

function renderActivePositions(targetId, positions) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const markedPositions = getMarkedActivePositions(positions || []);
  if (!markedPositions.length) {
    target.innerHTML = `<article class="position-card empty"><p>${t("noOpenPositions")}</p></article>`;
    return;
  }
  target.innerHTML = markedPositions.map((row) => `
    <article class="position-card">
      <div class="position-head">
        <strong class="rail-row-name">${row.asset}</strong>
        <span class="dir-chip ${String(row.direction).toLowerCase()}">${row.direction}</span>
      </div>
      <div class="rail-kpi-grid compact">
        <div><span>${t("entryPrice")}</span><strong>${fmtNum(row.entry_price, 2)}</strong></div>
        ${row.current_price !== undefined ? `<div><span>Current Price ${row.quote_stale ? '<em class="quote-stale-tag">stale</em>' : ""}</span><strong class="${getValueFlashClass(`${targetId}-${row.symbol}-price`, row.current_price || 0)}">${fmtNum(row.current_price, 2)}</strong></div>` : ""}
        ${row.hold_hours !== undefined ? `<div><span>${t("holdHours")}</span><strong>${row.hold_hours}h</strong></div>` : ""}
        ${row.current_pnl_pct !== undefined ? `<div><span>Current PnL</span><strong class="${Number(row.current_pnl_pct || 0) >= 0 ? "pos" : "neg"} ${getValueFlashClass(`${targetId}-${row.symbol}-pnl`, row.current_pnl_pct || 0)}">${fmtPct(row.current_pnl_pct || 0, 2)}</strong></div>` : ""}
      </div>
    </article>`).join("");
}

function getDisplayedActivePositions(strategyKey, fallbackPositions = []) {
  const lens = state.lenses[strategyKey] || "backtest";
  if (lens === "live") {
    const livePositions = getStrategyLensData(strategyKey)?.active_positions;
    if (Array.isArray(livePositions) && livePositions.length) return livePositions;
  }
  return Array.isArray(fallbackPositions) ? fallbackPositions : [];
}

function renderGrapesSummary(data) {
  const grapes = data.strategies.grapes || {};
  renderSnapshotCards("grapes", "🍇 Grapes", getStrategyLensData("grapes"));
  renderActivePositions("grapes-active-positions", getDisplayedActivePositions("grapes", grapes.active_positions || []));
}

function renderGrapesRegime(data) {
  const detail = getStrategyLensData("grapes")?.regime_snapshot?.regime_detail || [];
  const map = { TREND_UP: t("trendUp"), TREND_DOWN: t("trendDown"), RANGE_CHOP: t("rangeChop"), TRANSITION: t("transition") };
  const target = document.getElementById("grapes-regime");
  if (!target) return;
  target.innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} ${state.lang === "zh" ? "笔" : "trades"} · ${t("winRate")} <strong class="${Number(row.win_rate_pct || 0) >= 50 ? "pos" : "neg"}">${fmtPct(row.win_rate_pct)}</strong> · ${t("totalPnl")} <strong class="${Number(row.total_pnl_usd || 0) < 0 ? "neg" : "pos"}">${fmtUsd(row.total_pnl_usd)}</strong></p>
    </article>`).join("");
}

function renderCitrusSummary(data) {
  const citrus = data.strategies.citrus || {};
  renderSnapshotCards("citrus", "🍊 Citrus", getStrategyLensData("citrus"));
  renderActivePositions("citrus-active-positions", getDisplayedActivePositions("citrus", citrus.active_positions || []));
}

function renderCitrusRegime(data) {
  const detail = getStrategyLensData("citrus")?.regime_snapshot?.regime_detail || [];
  const map = { TREND_UP: t("trendUp"), TREND_DOWN: t("trendDown"), RANGE_CHOP: t("rangeChop"), TRANSITION: t("transition") };
  const target = document.getElementById("citrus-regime");
  if (!target) return;
  target.innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} ${state.lang === "zh" ? "笔" : "trades"} · ${t("winRate")} <strong class="${Number(row.win_rate_pct || 0) >= 50 ? "pos" : "neg"}">${fmtPct(row.win_rate_pct)}</strong> · ${t("totalPnl")} <strong class="${Number(row.total_pnl_usd || 0) < 0 ? "neg" : "pos"}">${fmtUsd(row.total_pnl_usd)}</strong></p>
    </article>`).join("");
}

function renderEquitySummary(data) {
  const equity = data.strategies.equity || {};
  renderSnapshotCards("equity", "📈 Equity", getStrategyLensData("equity"));
  renderActivePositions("equity-active-positions", getDisplayedActivePositions("equity", equity.active_positions || []));
}

function renderEquityRegime(data) {
  const detail = getStrategyLensData("equity")?.regime_snapshot?.regime_detail || [];
  const map = { TREND_UP: t("trendUp"), TREND_DOWN: t("trendDown"), RANGE_CHOP: t("rangeChop"), TRANSITION: t("transition"), MR: "MR", TREND: "TREND" };
  const target = document.getElementById("equity-regime");
  if (!target) return;
  target.innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} ${state.lang === "zh" ? "笔" : "trades"} · ${t("winRate")} <strong class="${Number(row.win_rate_pct || 0) >= 50 ? "pos" : "neg"}">${fmtPct(row.win_rate_pct)}</strong> · ${t("totalPnl")} <strong class="${Number(row.total_pnl_usd || 0) < 0 ? "neg" : "pos"}">${fmtUsd(row.total_pnl_usd)}</strong></p>
    </article>`).join("");
}

function renderEvolutionSummary(data) {
  const evolution = data.strategies.evolution;
  if (!evolution) return;
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  setText("evolution-section-title", t("evolutionSectionTitle"));
  setText("evolution-section-title", "Evolution");
  setText("evolution-runtime-title", "System");
  setText("evolution-decision-title", "Mutations");
  setText("evolution-bridge-title", "Outcome");
  setText("evolution-discoveries-title", "Pending Problems");
  setText("evolution-vp-title", "Validation / Promotion");
  const baseline = evolution.baseline || {};
  const full = baseline.full_backtest || {};
  const oos = baseline.walk_forward_oos || {};
  const mc = baseline.monte_carlo?.bootstrap || {};
  const prettyAsset = (value) => String(value || "").replace("USDT", "").toUpperCase() || "Unknown";
  const humanTag = (tag) => ({
    high_chase: "high-chase",
    low_chase: "low-chase",
    late_trend: "late-trend",
    low_oi: "low OI",
    crowded_longs: "crowded longs",
    crowded_shorts: "crowded shorts",
    tp50_then_be: "TP50 then BE",
    signal_exit_loss: "signal-exit loss",
    trend_follow: "trend-follow",
    mean_reversion: "mean-reversion",
    tiered_entry: "tiered entry",
    core_entry: "core entry",
    long: "long",
    short: "short",
  }[tag] || tag.replace(/_/g, " "));
  const majorIssuePhrase = (tags, discoveryType) => {
    if (state.lang === "zh") {
      if (tags.includes("high_chase")) return "高位追入";
      if (tags.includes("low_chase")) return "低位追空";
      if (tags.includes("late_trend")) return "入场太晚";
      if (tags.includes("low_oi")) return "OI 支撑弱";
      if (tags.includes("crowded_longs")) return "多头过拥挤";
      if (tags.includes("crowded_shorts")) return "空头过拥挤";
      if (discoveryType === "high_variance") return "结果分布太散";
      if (discoveryType === "positive_edge") return "边际优势待确认";
      return "结构异常";
    }
    if (tags.includes("high_chase")) return "chasing highs";
    if (tags.includes("low_chase")) return "chasing lows";
    if (tags.includes("late_trend")) return "late entry";
    if (tags.includes("low_oi")) return "weak OI support";
    if (tags.includes("crowded_longs")) return "crowded longs";
    if (tags.includes("crowded_shorts")) return "crowded shorts";
    if (discoveryType === "high_variance") return "unstable outcomes";
    if (discoveryType === "positive_edge") return "edge under review";
    return "structural issue";
  };
  const parsePatternKey = (patternKey) => {
    const [assetRaw, rawTags = ""] = String(patternKey || "").split(":");
    const tags = rawTags.split(".").filter(Boolean);
    return {
      asset: prettyAsset(assetRaw),
      tags,
    };
  };
  const describePattern = (patternKey) => {
    const { asset, tags } = parsePatternKey(patternKey);
    const side = tags.includes("long") ? "longs" : tags.includes("short") ? "shorts" : "entries";
    const sideHuman = state.lang === "zh"
      ? (tags.includes("long") ? "趋势多单" : tags.includes("short") ? "趋势空单" : "交易簇")
      : (tags.includes("long") ? "trend longs" : tags.includes("short") ? "trend shorts" : "entries");
    const setup = tags.includes("tiered_entry") ? "tiered setup" : tags.includes("core_entry") ? "core setup" : "mixed setup";
    const issueTags = tags.filter((tag) => ["high_chase", "low_chase", "late_trend", "low_oi", "crowded_longs", "crowded_shorts", "signal_exit_loss", "tp50_then_be"].includes(tag));
    const issue = issueTags.length ? issueTags.map(humanTag).join(" + ") : "generic cluster";
    const style = tags.includes("mean_reversion") ? "mean reversion" : tags.includes("trend_follow") ? "trend" : "mixed";
    return {
      asset,
      title: `${asset} ${style} ${side}`,
      sideHuman,
      issue,
      note: `${setup}${issueTags.length ? `, pattern = ${issue}` : ""}`,
      setup,
      style,
      tags,
    };
  };
  const detailIssueLabel = (pattern, discovery) => {
    if (state.lang === "zh") {
      if (String(discovery?.discovery_type || "") === "loss_cluster") return "重复亏损";
      if (String(discovery?.discovery_type || "") === "high_variance") return "入场质量不稳";
      if (String(discovery?.discovery_type || "") === "positive_edge") return "正向结构待确认";
      return pattern.issue || "结构异常";
    }
    if (String(discovery?.discovery_type || "") === "loss_cluster") return "repeated losses";
    if (String(discovery?.discovery_type || "") === "high_variance") return "unstable cluster";
    if (String(discovery?.discovery_type || "") === "positive_edge") return "positive edge";
    return pattern.issue || "cluster";
  };
  const detailHeadline = (pattern, discovery) => {
    const issue = majorIssuePhrase(pattern.tags || [], discovery?.discovery_type);
    if (state.lang === "zh") {
      return `${pattern.asset} ${pattern.sideHuman} — ${issue}`;
    }
    return `${pattern.asset} ${pattern.sideHuman} — ${issue}`;
  };
  const detailProblemBody = (row, pattern, avgPnlValue) => {
    const sampleCount = Number(row.sample_count || 0);
    const avgText = avgPnlValue == null ? "—" : fmtPct(avgPnlValue, 2);
    if (state.lang === "zh") {
      if (row.discovery_type === "loss_cluster") {
        return `${sampleCount} 笔交易在这类结构里一起亏损，平均亏 ${avgText}。方向本身未必错，问题更像是同一种坏入场在反复出现。`;
      }
      if (row.discovery_type === "high_variance") {
        return `${sampleCount} 笔交易落在同一类 setup，但结果分布很散，平均收益 ${avgText}。方向判断不一定错，更像是入场时机和参与质量不稳定。`;
      }
      if (row.discovery_type === "positive_edge") {
        return `${sampleCount} 笔交易在这类结构里偏正向，平均收益 ${avgText}。现在先把它当成候选 edge，看它是否真的能重复。`;
      }
      return `${sampleCount} 笔交易在 ${pattern.issue} 结构里被反复标记，平均收益 ${avgText}。`;
    }
    if (row.discovery_type === "loss_cluster") {
      return `${sampleCount} trades are losing together in this setup, with average pnl ${avgText}. Direction may still be right; the repeated failure looks more like a bad entry shape than random noise.`;
    }
    if (row.discovery_type === "high_variance") {
      return `${sampleCount} trades share the same setup, but outcomes are unstable, with average pnl ${avgText}. The issue looks more like timing and participation quality than pure directional error.`;
    }
    if (row.discovery_type === "positive_edge") {
      return `${sampleCount} trades are leaning positive in this setup, with average pnl ${avgText}. The current job is to confirm whether the edge is repeatable before promoting it.`;
    }
    return `${sampleCount} trades have been flagged around ${pattern.issue}, with average pnl ${avgText}.`;
  };
  const compactPatternKey = (patternKey) => {
    const { asset, tags } = parsePatternKey(patternKey);
    if (!tags.length) return patternKey || "—";
    return `${asset} · ${tags.map(humanTag).join(" · ")}`;
  };
  const discoveryLabel = (value) => ({
    loss_cluster: "LOSING CLUSTER",
    high_variance: "UNSTABLE CLUSTER",
    positive_edge: "POSITIVE EDGE",
  }[value] || value);
  const mutationLabel = (value) => ({
    new_veto: "Add a local veto",
    threshold_adjustment: "Tighten a threshold",
    shadow_rule: "Run a shadow rule",
    observation_only: "Observe only",
  }[value] || value.replace(/_/g, " "));
  const deploymentLabel = (value) => ({
    SHADOW: "Observation",
    PAPER: "Paper",
    LIVE: "Live",
  }[value] || value);
  const queueStatusLabel = (value) => ({
    PROPOSED: "Pending review",
    RESEARCH_REQUIRED: "Need more evidence",
    VALIDATION_PENDING: "Validation running",
    RESEARCH_ACCEPTED: "Evidence confirmed",
    VALIDATED_REJECTED: "Rejected",
    SHADOW_READY: "Ready for observation",
  }[value] || value.replace(/_/g, " ").toLowerCase());
  const validationStatusLabel = (value) => ({
    RESEARCH_ACCEPTED: "Evidence confirmed",
    REJECT_INSUFFICIENT: "Need more evidence",
    VALIDATED_REJECTED: "Rejected",
  }[value] || value.replace(/_/g, " ").toLowerCase());
  const summarizePatternZh = (pattern, sampleCount) => {
    const sampleText = sampleCount ? `样本 ${sampleCount} 笔` : "样本仍少";
    return `${pattern.asset} 这类 ${pattern.style === "trend" ? "趋势" : pattern.style === "mean reversion" ? "均值回归" : "混合"}${pattern.setup === "tiered setup" ? "分层入场" : pattern.setup === "core setup" ? "核心入场" : "入场"}，在 ${pattern.issue} 结构里重复出问题，${sampleText}。`;
  };
  const localizeReviewProblem = (row, review, pattern, sampleCount) => {
    if (state.lang !== "zh") return review.problem_summary || `${pattern.title} keeps showing stress around ${pattern.issue}.`;
    return review.problem_summary ? summarizePatternZh(pattern, sampleCount) : `${pattern.asset} 这类 setup 在 ${pattern.issue} 这里反复出现压力。`;
  };
  const localizeReviewWhy = (row, review, discovery, sampleCount) => {
    if (state.lang !== "zh") {
      let whyLine = review.why_flagged || "Pattern is being tracked, but evidence is still limited.";
      if (discovery?.discovery_type === "loss_cluster") whyLine = review.why_flagged || `This cluster is losing together across ${sampleCount} samples.`;
      else if (discovery?.discovery_type === "high_variance") whyLine = review.why_flagged || `Results are unstable across ${sampleCount} similar trades, so entry quality looks unreliable.`;
      else if (discovery?.discovery_type === "positive_edge") whyLine = review.why_flagged || `This setup keeps outperforming, so the engine wants to observe whether the edge is repeatable.`;
      return whyLine;
    }
    if (discovery?.discovery_type === "loss_cluster") return `这一簇交易在同一种结构里一起亏钱，说明问题更像是可重复的坏形状，不像单笔偶发噪音。`;
    if (discovery?.discovery_type === "high_variance") return `这类交易方向看起来相近，但结果分布很散，说明入场质量不稳定，现在还不能直接当 production 规则上线。`;
    if (discovery?.discovery_type === "positive_edge") return `这类结构目前偏正向，但证据还不够厚，所以先观察，不急着放大。`;
    return `系统已经看到重复问题，但证据还不够厚，先保留在研究队列。`;
  };
  const localizeExpectedImpact = (row, review, pattern) => {
    if (state.lang !== "zh") {
      if (review.expected_impact) return review.expected_impact;
      if (row.mutation_type === "new_veto") return `Reduce tail losses in ${pattern.issue} setups, with some risk of skipping a few valid trend continuations.`;
      if (row.mutation_type === "threshold_adjustment") return `Raise entry quality and cut weaker signals, at the cost of slightly fewer trades.`;
      if (row.mutation_type === "shadow_rule") return `Measure whether this edge is real before changing production behaviour.`;
      return "Minimal effect for now because this stays in observation only.";
    }
    if (row.mutation_type === "new_veto") return `如果以后证据继续变厚，这类提案更像是用一个局部 veto 去削掉左尾，但会有少做一部分正常延续单的代价。`;
    if (row.mutation_type === "threshold_adjustment") return `如果走 threshold 方向，目标是提高入场质量，代价是交易数会更少。`;
    if (row.mutation_type === "shadow_rule") return `现在先旁路观察，不改 production，只验证这个想法是不是真的稳定。`;
    return `短期内不会影响 production，主要作用是继续积累证据。`;
  };
  const verdictLabel = (value) => {
    if (state.lang !== "zh") return value;
    return ({ "Promote Candidate": "可继续推进", "Strong Reject": "暂不接受", "Observe": "继续观察" }[value] || value);
  };
  const discoveryWhy = (row) => {
    if (state.lang === "zh") {
      if (row.discovery_type === "loss_cluster") return `这类结构里有 ${row.sample_count} 笔一起变差，已经不像单笔偶发。`;
      if (row.discovery_type === "high_variance") return `这类结构目前有 ${row.sample_count} 笔，但结果分布太散，还不能直接下结论。`;
      if (row.discovery_type === "positive_edge") return `这类结构目前偏正向，系统想继续观察它是不是稳定 edge。`;
      return `系统在 ${row.sample_count} 笔样本里看到了重复模式。`;
    }
    const type = discoveryLabel(row.discovery_type);
    if (row.discovery_type === "loss_cluster") return `${row.sample_count} samples are losing together in this setup.`;
    if (row.discovery_type === "high_variance") return `${row.sample_count} samples are too unstable, even when direction looks similar.`;
    if (row.discovery_type === "positive_edge") return `${row.sample_count} samples are consistently strong, so the engine wants to observe the edge.`;
    return `${type} found in ${row.sample_count} samples.`;
  };
  const discoveriesByPattern = new Map((evolution.discoveries || []).map((row) => [row.pattern_key, row]));
  const validationsByProposal = new Map((evolution.validations || []).map((row) => [row.proposal_id, row]));
  const promotionsByProposal = new Map((evolution.promotions || []).map((row) => [row.proposal_id, row]));
  const exampleTradeLabel = (trade) => {
    const side = Number(trade.direction || 0) > 0 ? (state.lang === "zh" ? "多" : "long") : Number(trade.direction || 0) < 0 ? (state.lang === "zh" ? "空" : "short") : (state.lang === "zh" ? "平" : "flat");
    const outcome = Number(trade.pnl_pct || 0) > 0 ? (state.lang === "zh" ? "赢" : "win") : Number(trade.pnl_pct || 0) < 0 ? (state.lang === "zh" ? "亏" : "loss") : (state.lang === "zh" ? "平" : "flat");
    const source = trade.source === "live" ? (state.lang === "zh" ? "实盘" : "live") : (state.lang === "zh" ? "回测" : "backtest");
    const ts = String(trade.entry_signal_ts || "").slice(0, 16);
    const symbol = prettyAsset(trade.symbol);
    return `${symbol} ${side} · ${ts} · ${outcome} · ${source}`;
  };
  const exampleTradeSummary = (row) => {
    const samples = Array.isArray(row.example_trades) ? row.example_trades : [];
    if (!samples.length) return state.lang === "zh" ? "当前面板里没有匹配到 2025-2026 的例子交易。" : "No matching 2025-2026 example trades in the current panel.";
    return samples.map(exampleTradeLabel).join(" / ");
  };
  const terminalExamples = (row) => {
    const samples = Array.isArray(row.example_trades) ? row.example_trades : [];
    if (!samples.length) return state.lang === "zh" ? "没有匹配到 2025-2026 交易。" : "No matching 2025-2026 trades.";
    return samples.slice(0, 3).map(exampleTradeLabel).join("  |  ");
  };
  const renderExampleTradesList = (row) => {
    const samples = Array.isArray(row.example_trades) ? row.example_trades : [];
    if (!samples.length) {
      return `<p class="evolution-empty-note">${state.lang === "zh" ? "当前没有匹配到例子交易。" : "No matching example trades."}</p>`;
    }
    return samples.map((trade) => {
      const side = Number(trade.direction || 0) > 0 ? (state.lang === "zh" ? "多" : "LONG") : Number(trade.direction || 0) < 0 ? (state.lang === "zh" ? "空" : "SHORT") : (state.lang === "zh" ? "平" : "FLAT");
      const result = Number(trade.pnl_pct || 0) > 0 ? (state.lang === "zh" ? "赢" : "WIN") : Number(trade.pnl_pct || 0) < 0 ? (state.lang === "zh" ? "亏" : "LOSS") : (state.lang === "zh" ? "平" : "FLAT");
      const pnl = Number(trade.pnl_pct || 0);
      const pnlClass = pnl >= 0 ? "pos" : "neg";
      const source = trade.source === "live" ? (state.lang === "zh" ? "实盘" : "live") : (state.lang === "zh" ? "回测" : "backtest");
      return `
        <div class="evolution-trade-row">
          <div class="evolution-trade-main">
            <strong>${prettyAsset(trade.symbol)} ${side}</strong>
            <span>${String(trade.entry_signal_ts || "").slice(0, 16)}</span>
          </div>
          <div class="evolution-trade-meta">
            <span>${result}</span>
            <strong class="${pnlClass}">${fmtPct(pnl, 2)}</strong>
            <span>${source}</span>
          </div>
        </div>
      `;
    }).join("");
  };
  const renderSimilarCasesList = (payload) => {
    if (!payload) return `<p class="evolution-empty-note">No similar cases loaded yet.</p>`;
    if (payload.error) return `<p class="evolution-empty-note">${payload.error}</p>`;
    const cases = Array.isArray(payload.cases) ? payload.cases : [];
    if (!cases.length) return `<p class="evolution-empty-note">No similar historical cases found.</p>`;
    const tagFrequency = new Map();
    cases.forEach((item) => {
      (Array.isArray(item.pattern_tags) ? item.pattern_tags : []).forEach((tag) => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    });
    const distinctiveCaseSubtitle = (item) => {
      const tags = Array.isArray(item.pattern_tags) ? item.pattern_tags : [];
      const sortedDistinctive = tags
        .map((tag) => ({ tag, count: tagFrequency.get(tag) || 0 }))
        .sort((a, b) => a.count - b.count);
      const chosen = sortedDistinctive.find((row) => row.count < cases.length)?.tag || sortedDistinctive[0]?.tag || null;
      const chosenText = chosen ? humanTag(chosen) : null;
      const pnl = Number(item.pnl_pct || 0);
      if (state.lang === "zh") {
        if (chosen === "high_chase") return pnl < 0 ? "追高入场，结果转亏" : "追高入场，但结果保住";
        if (chosen === "late_trend") return pnl < 0 ? "趋势尾段入场，亏损放大" : "趋势尾段入场，但结果保住";
        if (chosen === "low_oi") return pnl < 0 ? "低 OI 环境下入场" : "低 OI 环境下仍然成立";
        if (chosen === "crowded_longs") return "多头拥挤环境";
        if (chosen === "crowded_shorts") return "空头拥挤环境";
        if (chosen === "tp50_then_be") return "TP50 后回撤到保本";
        if (chosenText) return chosenText;
        return "相似结构案例";
      }
      if (chosen === "high_chase") return pnl < 0 ? "High chase entry that still failed" : "High chase entry that held up";
      if (chosen === "late_trend") return pnl < 0 ? "Late-trend entry that broke down" : "Late-trend entry that still worked";
      if (chosen === "low_oi") return pnl < 0 ? "Late entry under weak OI support" : "Weak OI backdrop but still held";
      if (chosen === "crowded_longs") return "Crowded longs backdrop";
      if (chosen === "crowded_shorts") return "Crowded shorts backdrop";
      if (chosen === "tp50_then_be") return "TP50 then break-even path";
      return chosenText || "Similar structural case";
    };
    const rows = cases.map((item) => {
      const side = Number(item.direction || 0) > 0 ? "LONG" : Number(item.direction || 0) < 0 ? "SHORT" : "FLAT";
      const pnl = Number(item.pnl_pct || 0);
      const pnlClass = pnl >= 0 ? "pos" : "neg";
      const ts = String(item.entry_signal_ts || "").slice(0, 10);
      return `
        <div class="evolution-trade-row evolution-similar-row">
          <div class="evolution-trade-main">
            <strong>${prettyAsset(item.symbol)} ${side} ${ts ? `· ${ts}` : ""}</strong>
            <span>${distinctiveCaseSubtitle(item)}</span>
          </div>
          <div class="evolution-trade-meta">
            <span>${String(item.outcome || "").toUpperCase()}</span>
            <strong class="${pnlClass}">${fmtPct(pnl, 2)}</strong>
          </div>
        </div>
      `;
    }).join("");
    const summary = payload.summary || {};
    const lossCount = Number(summary.loss_count || 0);
    const totalCount = Number(summary.total_count || cases.length);
    const avgPnl = Number(summary.avg_pnl_pct || 0);
    return `
      <div class="evolution-trade-list">${rows}</div>
      <p class="evolution-similar-summary">${lossCount}/${totalCount} similar cases were losses · avg ${fmtPct(avgPnl, 2)}.</p>
    `;
  };
  const renderCaseHistory = (row, payload) => `
    <div class="evolution-case-history">
      <div class="evolution-case-section">
        <div class="evolution-case-label">${state.lang === "zh" ? "相似历史案例" : "Similar Historical Cases"}</div>
        ${renderSimilarCasesList(payload)}
      </div>
      <div class="evolution-case-divider"></div>
      <div class="evolution-case-section">
        <div class="evolution-case-label">${state.lang === "zh" ? "典型案例" : "Observed Examples"}</div>
        <div class="evolution-trade-list">${renderExampleTradesList(row)}</div>
      </div>
    </div>
  `;
  const mutationSummary = (row) => {
    const pattern = describePattern(row.pattern_key);
    const discovery = discoveriesByPattern.get(row.pattern_key);
    const validation = validationsByProposal.get(row.proposal_id);
    const promotion = promotionsByProposal.get(row.proposal_id);
    const review = row.research_review || {};
    const sampleCount = Number(discovery?.sample_count || 0);
    const problem = localizeReviewProblem(row, review, pattern, sampleCount);
    let verdict = review.verdict === "promote_candidate" ? "Promote Candidate" : review.verdict === "strong_reject" ? "Strong Reject" : review.verdict === "observe" ? "Observe" : "Observe";
    if (promotion?.approved && promotion?.target_stage === "SHADOW") verdict = "Promote Candidate";
    else if (validation && !validation.accepted) verdict = "Strong Reject";
    else if (sampleCount >= 10 && discovery?.discovery_type === "loss_cluster") verdict = "Promote Candidate";

    let whyLine = localizeReviewWhy(row, review, discovery, sampleCount);
    if (state.lang !== "zh" && !review.why_flagged && validation?.accepted) {
      whyLine = `${whyLine} Validation says the evidence is good enough to keep watching.`;
    } else if (state.lang !== "zh" && !review.why_flagged && validation && !validation.accepted) {
      whyLine = `${whyLine} Validation did not clear the bar yet.`;
    }

    let expectedImpact = localizeExpectedImpact(row, review, pattern);

    return {
      problem,
      examples: exampleTradeSummary(row),
      verdict: verdictLabel(verdict),
      whyLine,
      expectedImpact,
    };
  };
  const validationSummary = (row) => {
    if (state.lang === "zh") {
      const accepted = row.accepted ? "这一轮验证通过了研究门槛。" : "这一轮验证还没有通过。";
      const prod = row.production_decision === "ACCEPT_PRODUCTION" ? "它已经足够进入下一阶段观察。" : "它还不够进入下一阶段。";
      return `${accepted}${prod} 过拟合风险：${String(row.overfit_risk || "unknown")}。`;
    }
    const accepted = row.accepted ? "The evidence passed research review." : "The evidence did not pass review.";
    const prod = row.production_decision === "ACCEPT_PRODUCTION" ? "It is strong enough to move into observation." : "It is not strong enough for the next stage.";
    return `${accepted} ${prod} Overfit risk ${String(row.overfit_risk || "unknown")}.`;
  };
  const promotionSummary = (row) => {
    if (state.lang === "zh") {
      const stage = row.target_stage === "SHADOW" ? "进入 observation" : `进入 ${String(row.target_stage || "").toLowerCase()}`;
      return row.approved ? `已批准，当前进入${stage}。` : `当前未批准。${row.reason || ""}`.trim();
    }
    const stage = row.target_stage === "SHADOW" ? "moved into observation" : `moved to ${String(row.target_stage || "").toLowerCase()}`;
    return row.approved ? `Approved and ${stage}.` : `Not approved. ${row.reason || ""}`.trim();
  };
  const compactBaselineName = () => {
    const raw = String(baseline.version || baseline.display_name || "").toLowerCase();
    if (!raw) return "Grapes Baseline";
    if (raw.includes("sol052") || raw.includes("sol 0.52/0.50")) return "Grapes V3.3.1";
    if (raw.includes("eth_bucket")) return "Grapes V3.3";
    return "Grapes Baseline";
  };
  const runtime = evolution.runtime || {};
  const decisionRows = (evolution.mutations || []).slice(0, 6);
  const severityRank = { high: 3, medium: 2, low: 1 };
  const discoveryRows = [...(evolution.discoveries || [])]
    .sort((a, b) => {
      const sev = (severityRank[String(b.severity || "").toLowerCase()] || 0) - (severityRank[String(a.severity || "").toLowerCase()] || 0);
      if (sev) return sev;
      const avgA = Number(a.avg_pnl_pct ?? 0);
      const avgB = Number(b.avg_pnl_pct ?? 0);
      if (avgA !== avgB) return avgA - avgB;
      return Number(b.sample_count || 0) - Number(a.sample_count || 0);
    })
    .slice(0, 22);
  const discoveryCount = discoveryRows.length;
  const patternStatsByKey = new Map((evolution.pattern_stats || []).map((row) => [row.pattern_key, row]));
  const bridgeByPattern = new Map(
    (evolution.bridge_results || [])
      .filter((row) => row.pattern_key)
      .map((row) => [row.pattern_key, row]),
  );
  const discoveryGroupCounts = new Map();
  const discoveryOrdinalByPattern = new Map();
  discoveryRows.forEach((row) => {
    const pattern = describePattern(row.pattern_key);
    const groupKey = `${pattern.asset}|${pattern.sideHuman}`;
    const next = (discoveryGroupCounts.get(groupKey) || 0) + 1;
    discoveryGroupCounts.set(groupKey, next);
    discoveryOrdinalByPattern.set(row.pattern_key, next);
  });
  const discoveryDisplayTitle = (row) => {
    const pattern = describePattern(row.pattern_key);
    const issue = majorIssuePhrase(pattern.tags || [], row.discovery_type);
    const groupKey = `${pattern.asset}|${pattern.sideHuman}`;
    const groupCount = discoveryGroupCounts.get(groupKey) || 0;
    const ordinal = discoveryOrdinalByPattern.get(row.pattern_key) || 1;
    const suffix = groupCount > 1 ? ` #${ordinal}` : "";
    return `${pattern.asset} ${pattern.sideHuman}${suffix} — ${issue}`;
  };
  const queueLabel = (row) => String(row.status || "OPEN").toLowerCase();

  const statusBar = document.getElementById("evolution-status-bar");
  if (statusBar) {
    statusBar.innerHTML = `
      <div class="evolution-status-line">
        <span>Grapes Evolution</span>
        <span class="evolution-status-dot">·</span>
        <strong>${compactBaselineName()}</strong>
        <span class="evolution-status-dot">·</span>
        <span>Canonical no-HYPE</span>
        <span class="evolution-status-dot">·</span>
        <span>${fmtTradeDate(runtime.last_activity_at || "—")}</span>
        <span class="evolution-status-gap"></span>
        <span>PF <strong>${fmtNum(full.profit_factor || 0, 2)}</strong></span>
        <span>Sharpe <strong>${fmtNum(full.sharpe || 0, 2)}</strong></span>
        <span>Reflections <strong>${runtime.reflections || 0}</strong></span>
        <span>DB <strong class="${runtime.db_exists ? "pos" : "neg"}">${runtime.db_exists ? "online" : "offline"}</strong></span>
      </div>
    `;
  }

  if (!state.evolutionSelectedPattern || !discoveryRows.some((row) => row.pattern_key === state.evolutionSelectedPattern)) {
    state.evolutionSelectedPattern = discoveryRows[0]?.pattern_key || null;
  }

  const selectedRow = discoveryRows.find((item) => item.pattern_key === state.evolutionSelectedPattern) || discoveryRows[0] || null;
  const otherRows = discoveryRows.filter((row) => row.pattern_key !== selectedRow?.pattern_key).slice(0, 8);

  const discoveryInbox = document.getElementById("evolution-discovery-inbox");
  if (discoveryInbox) {
    discoveryInbox.innerHTML = otherRows.length ? otherRows.map((row) => {
      const avgPnl = row.avg_pnl_pct ?? patternStatsByKey.get(row.pattern_key)?.avg_pnl_pct;
      return `
        <button class="evolution-inbox-row" type="button" data-pattern-key="${row.pattern_key}">
          <div class="evolution-inbox-main">
            <strong>${discoveryDisplayTitle(row)}</strong>
            <span>${discoveryWhy(row)}</span>
          </div>
          <div class="evolution-inbox-metrics">
            <span class="severity-chip severity-${String(row.severity || "").toLowerCase()}">${row.severity}</span>
            <span>N ${row.sample_count}</span>
            <span class="${Number(avgPnl || 0) >= 0 ? "pos" : "neg"}">${avgPnl == null ? "—" : fmtPct(avgPnl, 2)}</span>
            <span>${queueLabel(row)}</span>
          </div>
        </button>
      `;
    }).join("") : `<p class="evolution-empty-note">No other pending clusters.</p>`;
    discoveryInbox.querySelectorAll("[data-pattern-key]").forEach((node) => {
      node.addEventListener("click", () => {
        state.evolutionSelectedPattern = node.getAttribute("data-pattern-key");
        renderEvolutionSummary(data);
      });
    });
  }

  if (!selectedRow) return;
  const relatedMutation = decisionRows.find((item) => item.pattern_key === state.evolutionSelectedPattern);
  const relatedBridge = bridgeByPattern.get(state.evolutionSelectedPattern);
  const relatedPattern = patternStatsByKey.get(state.evolutionSelectedPattern);
  const pattern = describePattern(selectedRow.pattern_key);
  const avgPnlValue = selectedRow.avg_pnl_pct ?? relatedPattern?.avg_pnl_pct;
  const winRateValue = relatedPattern?.win_rate;

  const ensureSimilarCases = () => {
    const similarCases = state.evolutionSimilarCasesById[selectedRow.discovery_id] || null;
    const similarCasesLoading = state.evolutionSimilarCasesLoadingId === selectedRow.discovery_id;
    if (!similarCases && !similarCasesLoading && selectedRow.discovery_id != null) {
      state.evolutionSimilarCasesLoadingId = selectedRow.discovery_id;
      fetchEvolutionSimilarCases(selectedRow.discovery_id)
        .then((payload) => {
          state.evolutionSimilarCasesById[selectedRow.discovery_id] = payload;
        })
        .catch((error) => {
          state.evolutionSimilarCasesById[selectedRow.discovery_id] = {
            error: error.message || String(error),
            cases: [],
            summary: { loss_count: 0, total_count: 0, avg_pnl_pct: 0 },
          };
        })
        .finally(() => {
          if (state.evolutionSimilarCasesLoadingId === selectedRow.discovery_id) {
            state.evolutionSimilarCasesLoadingId = null;
          }
          renderEvolutionSummary(data);
        });
    }
    return { similarCases, similarCasesLoading };
  };
  const { similarCases, similarCasesLoading } = ensureSimilarCases();

  const criticalPanel = document.getElementById("evolution-critical-panel");
  if (criticalPanel) {
    criticalPanel.innerHTML = `
      <div class="evolution-critical-header">
        <div>
          <div class="evolution-critical-kicker">Most Critical · 1 of ${discoveryCount} clusters</div>
          <h2 class="evolution-critical-title">${detailHeadline(pattern, selectedRow)}</h2>
          <p class="evolution-critical-summary">${detailProblemBody(selectedRow, pattern, avgPnlValue)}</p>
        </div>
      </div>
      <div class="evolution-critical-metrics">
        <span>samples <strong>${selectedRow.sample_count}</strong></span>
        <span>avg pnl <strong class="${Number(avgPnlValue || 0) >= 0 ? "pos" : "neg"}">${avgPnlValue == null ? "—" : fmtPct(avgPnlValue, 2)}</strong></span>
        <span>win rate <strong class="${Number(winRateValue || 0) >= 50 ? "pos" : "neg"}">${winRateValue == null ? "—" : fmtPct(winRateValue, 1)}</strong></span>
        <span>severity <strong>${String(selectedRow.severity || "").toUpperCase()}</strong></span>
        <span>mutation <strong>${relatedMutation ? queueStatusLabel(relatedMutation.status) : "pending"}</strong></span>
      </div>
    `;
  }

  const evidencePanel = document.getElementById("evolution-evidence-panel");
  if (evidencePanel) {
    if (similarCasesLoading) {
      evidencePanel.innerHTML = `<p class="evolution-empty-note">Loading similar historical cases...</p>`;
    } else if (similarCases?.error) {
      evidencePanel.innerHTML = `<p class="evolution-empty-note">${similarCases.error}</p>`;
    } else {
      const cases = Array.isArray(similarCases?.cases) ? similarCases.cases : [];
      const summary = similarCases?.summary || {};
      const rows = cases.map((item) => {
        const ts = String(item.entry_signal_ts || "").slice(0, 10);
        const pnl = Number(item.pnl_pct || 0);
        const subtitle = (() => {
          const tags = Array.isArray(item.pattern_tags) ? item.pattern_tags : [];
          const priority = ["low_oi", "high_chase", "late_trend", "crowded_longs", "crowded_shorts", "tp50_then_be"];
          const chosen = priority.find((tag) => tags.includes(tag)) || tags[0] || "similar setup";
          const textMap = {
            high_chase: state.lang === "zh" ? "OI 强但价格在顶部，追高后回撤" : "Strong OI + top-side chase",
            late_trend: state.lang === "zh" ? "高位追入，趋势已接近尾段" : "Late trend entry, move already extended",
            low_oi: state.lang === "zh" ? "OI 偏低，趋势参与力度不足" : "Low OI participation",
            crowded_longs: state.lang === "zh" ? "多头拥挤，结构反转压力大" : "Crowded longs backdrop",
            crowded_shorts: state.lang === "zh" ? "空头拥挤，结构反弹压力大" : "Crowded shorts backdrop",
            tp50_then_be: state.lang === "zh" ? "TP50 后回撤至保本" : "TP50 then break-even",
          };
          return textMap[chosen] || String(chosen).replace(/_/g, " ");
        })();
        const pill = (() => {
          const tags = Array.isArray(item.pattern_tags) ? item.pattern_tags : [];
          if (tags.includes("high_chase") && tags.includes("late_trend")) return "strong-oi + top";
          if (tags.includes("late_trend") && pnl <= -5) return "worst loss";
          if (tags.includes("low_oi")) return "low-oi";
          if (Math.abs(pnl) < 0.5) return "near breakeven";
          return "similar setup";
        })();
        return `
          <div class="evolution-trade-row">
            <div class="evolution-trade-date">${ts}</div>
            <div class="evolution-trade-main">
              <strong>${subtitle}</strong>
            </div>
            <div class="evolution-case-pill">${pill}</div>
            <div class="evolution-trade-meta">
              <strong class="${pnl >= 0 ? "pos" : "neg"}">${fmtPct(pnl, 2)}</strong>
            </div>
          </div>
        `;
      }).join("");
      evidencePanel.innerHTML = `
        <div class="evolution-evidence-header">
          <div class="evolution-evidence-kicker">Historical Evidence — Similar Cases</div>
          <div class="evolution-evidence-summary">${cases.length} found · ${Number(summary.loss_count || 0) === cases.length && cases.length ? "all losses" : "mixed"}</div>
        </div>
        <div class="evolution-evidence-rows">${rows || `<p class="evolution-empty-note">No similar cases found.</p>`}</div>
        <div class="evolution-evidence-footer">
          <strong>${summary.loss_count || 0}/${summary.total_count || cases.length} losses</strong>
          · avg ${fmtPct(Number(summary.avg_pnl_pct || 0), 2)}
          ${cases.length ? ` · worst ${fmtPct(Math.min(...cases.map((row) => Number(row.pnl_pct || 0))), 2)}` : ""}
          · pattern consistent across 18 months
        </div>
      `;
    }
  }

  const nextAction = document.getElementById("evolution-next-action");
  if (nextAction) {
    const pendingClusters = Math.max(0, Number(runtime.discoveries || 0) - Number(runtime.mutations || 0));
    const mutationBusy = state.evolutionMutationBusyId === selectedRow.discovery_id;
    const nextText = relatedMutation
      ? (relatedMutation.hypothesis || "Mutation compiled and ready for validation.")
      : relatedBridge
        ? (relatedBridge.hypothesis || "Gemma result returned and is waiting to be compiled.")
        : "No mutation compiled yet — send this cluster to the Gemma worker to generate a fix proposal.";
    nextAction.innerHTML = `
      <div class="evolution-action-copy">
        <strong>${nextText}</strong>
        <div class="evolution-pipeline-inline">
          <span>Pipeline:</span>
          <span>${runtime.reflections || 0} reflections</span>
          <span class="evolution-pipeline-arrow">→</span>
          <span>${runtime.discoveries || 0} clusters</span>
          <span class="evolution-pipeline-arrow">→</span>
          <span><strong>${runtime.mutations || 0} mutations (blocked)</strong></span>
          <span class="evolution-pipeline-arrow">→</span>
          <span>${runtime.validations || 0} validations</span>
          <span class="evolution-pipeline-arrow">→</span>
          <span>${runtime.promotions || 0} promotions</span>
        </div>
        <span>${pendingClusters} clusters pending</span>
      </div>
      <button class="evolution-run-button" type="button" data-run-mutation="${selectedRow.discovery_id}" ${mutationBusy ? "disabled" : ""}>${mutationBusy ? "Running..." : "Run mutation →"}</button>
    `;
    nextAction.querySelectorAll("[data-run-mutation]").forEach((node) => {
      node.addEventListener("click", async () => {
        const id = Number(node.getAttribute("data-run-mutation"));
        if (!Number.isFinite(id)) return;
        state.evolutionMutationBusyId = id;
        renderEvolutionSummary(data);
        try {
          await triggerEvolutionMutation(id);
          const liveRow = (evolution.discoveries || []).find((item) => Number(item.discovery_id) === id);
          if (liveRow) liveRow.status = "EXPORTED";
        } catch (error) {
          window.alert(`Run Mutation failed: ${error.message || error}`);
        } finally {
          state.evolutionMutationBusyId = null;
          renderEvolutionSummary(data);
        }
      });
    });
  }

}

function tradePeriodValue(trade, scope) {
  if (scope === "year") return String(trade.exit_ts).slice(0, 4);
  if (scope === "month") return String(trade.exit_ts).slice(0, 7);
  return "all";
}

function getFilteredTrades(strategyKey) {
  const trades = getStrategyLensData(strategyKey)?.all_trades || [];
  const filter = state.tradeFilters[strategyKey];
  if (!filter || filter.scope === "all" || filter.value === "all") return trades;
  return trades.filter((trade) => tradePeriodValue(trade, filter.scope) === filter.value);
}

function syncTradeValueOptions(strategyKey) {
  const scopeSelect = document.getElementById(`${strategyKey}-trade-scope`);
  const valueSelect = document.getElementById(`${strategyKey}-trade-value`);
  if (!scopeSelect || !valueSelect || !state.data) return;
  const scope = scopeSelect.value;
  state.tradeFilters[strategyKey].scope = scope;
  const trades = getStrategyLensData(strategyKey)?.all_trades || [];
  const options = scope === "all"
    ? ["all"]
    : [...new Set(trades.map((trade) => tradePeriodValue(trade, scope)))].sort().reverse();
  valueSelect.innerHTML = options
    .map((value) => `<option value="${value}">${value === "all" ? t("allPeriods") : value}</option>`)
    .join("");
  if (state.tradeFilters[strategyKey].value === "latest") {
    state.tradeFilters[strategyKey].value = options[0] || "all";
  }
  if (!options.includes(state.tradeFilters[strategyKey].value)) {
    state.tradeFilters[strategyKey].value = options[0] || "all";
  }
  valueSelect.value = state.tradeFilters[strategyKey].value;
  renderTradeValueTabs(strategyKey, options);
}

function renderTradeScopeTabs(strategyKey) {
  const target = document.getElementById(`${strategyKey}-trade-scope-tabs`);
  const scopeSelect = document.getElementById(`${strategyKey}-trade-scope`);
  if (!target || !scopeSelect) return;
  const current = state.tradeFilters[strategyKey]?.scope || scopeSelect.value || "month";
  const items = [
    { value: "month", label: t("monthly") },
    { value: "year", label: t("yearly") },
    { value: "all", label: t("all") },
  ];
  target.innerHTML = items.map((item) => `
    <button
      class="trade-scope-tab ${current === item.value ? "active" : ""}"
      type="button"
      data-strategy="${strategyKey}"
      data-scope="${item.value}"
    >${item.label}</button>
  `).join("");
}

function renderTradeValueTabs(strategyKey, options = null) {
  const target = document.getElementById(`${strategyKey}-trade-value-tabs`);
  const valueSelect = document.getElementById(`${strategyKey}-trade-value`);
  if (!target || !valueSelect) return;
  const values = options || Array.from(valueSelect.options).map((option) => option.value);
  const current = state.tradeFilters[strategyKey]?.value || valueSelect.value || values[0] || "all";
  target.innerHTML = values.map((value) => `
    <button
      class="trade-value-tab ${current === value ? "active" : ""}"
      type="button"
      data-strategy="${strategyKey}"
      data-value="${value}"
    >${value === "all" ? t("allPeriods") : value}</button>
  `).join("");
}

function drawAxes(ctx, width, height, m, yTicks = [], xTicks = []) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const minY = yTicks[0] ?? 0;
  const maxY = yTicks[yTicks.length - 1] ?? 1;
  const zeroNormalized = (0 - minY) / Math.max(1e-9, maxY - minY);
  const baselineY = zeroNormalized >= 0 && zeroNormalized <= 1
    ? height - m.bottom - zeroNormalized * (height - m.top - m.bottom)
    : height - m.bottom;

  yTicks.forEach((value) => {
    if (Math.abs(value) < 1e-9) return;
    const normalized = (value - minY) / Math.max(1e-9, maxY - minY);
    const y = height - m.bottom - normalized * (height - m.top - m.bottom);
    ctx.beginPath();
    ctx.moveTo(m.left, y);
    ctx.lineTo(width - m.right, y);
    ctx.stroke();
  });

  xTicks.forEach(({ x }) => {
    ctx.beginPath();
    ctx.moveTo(x, m.top);
    ctx.lineTo(x, height - m.bottom);
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath(); ctx.moveTo(m.left, baselineY); ctx.lineTo(width - m.right, baselineY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m.left, m.top); ctx.lineTo(m.left, height - m.bottom); ctx.stroke();
}

function niceNumber(value, round) {
  const exponent = Math.floor(Math.log10(Math.max(Math.abs(value), 1e-9)));
  const fraction = value / (10 ** exponent);
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * (10 ** exponent);
}

function buildNiceScale(values, tickCount = 5, opts = {}) {
  const numeric = (values || []).filter(Number.isFinite);
  if (!numeric.length) {
    return { min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] };
  }

  const rawMin = Math.min(...numeric);
  const rawMax = Math.max(...numeric);
  const includeZero = opts.includeZero === true;

  if (rawMin === rawMax) {
    const pad = Math.max(Math.abs(rawMin) * 0.08, 1);
    const min = rawMin - pad;
    const max = rawMax + pad;
    return buildNiceScale([min, max], tickCount, { includeZero });
  }

  const paddedMin = includeZero ? Math.min(0, rawMin) : rawMin - ((rawMax - rawMin) * 0.08);
  const paddedMax = includeZero ? Math.max(0, rawMax) : rawMax + ((rawMax - rawMin) * 0.08);
  const range = niceNumber(paddedMax - paddedMin, false);
  const step = niceNumber(range / Math.max(1, tickCount - 1), true);
  const min = Math.floor(paddedMin / step) * step;
  const max = Math.ceil(paddedMax / step) * step;
  const ticks = [];
  for (let value = min; value <= max + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return { min, max, ticks };
}

function formatAxisDateLabel(rawTs, spanMs) {
  const date = parseUtcDate(rawTs);
  const text = String(rawTs || "");
  if (!date) {
    if (!text) return "";
    if (/^\d{4}-\d{2}$/.test(text)) return text;
    const datePart = text.slice(0, 10);
    if (spanMs <= 180 * 24 * 3600 * 1000) return datePart.slice(5);
    return datePart.replace(/-/g, ".");
  }
  if (spanMs <= 180 * 24 * 3600 * 1000) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: MYT_TIMEZONE,
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MYT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(date).replace("/", ".").replace("/", ".");
}

function parseSeriesDate(rawTs) {
  return parseUtcDate(rawTs);
}

function getVisibleSeriesStartDate(series) {
  const parsed = series.map((row) => parseSeriesDate(row.ts)).filter(Boolean);
  if (!parsed.length) return null;
  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / (24 * 3600 * 1000)));
  if (spanDays < 365) return first;
  const isYearStartDay = first.getMonth() === 0 && first.getDate() === 1;
  if (isYearStartDay) {
    return new Date(`${first.getFullYear()}-01-01T00:00:00`);
  }
  return new Date(`${first.getFullYear() + 1}-01-01T00:00:00`);
}

function getXPositionForSeriesPoint(series, index, width, m) {
  const xStart = m.left;
  const xEnd = width - m.right;
  if (!series.length) return xStart;
  if (series.length === 1) return xStart;

  const parsed = series.map((row) => parseSeriesDate(row.ts));
  const valid = parsed.filter(Boolean);
  if (!valid.length) {
    return xStart + (index / Math.max(1, series.length - 1)) * (xEnd - xStart);
  }

  const first = getVisibleSeriesStartDate(series) || valid[0];
  const last = valid[valid.length - 1];
  const current = parsed[index] || first;
  const range = Math.max(1, last.getTime() - first.getTime());
  const clamped = Math.max(first.getTime(), current.getTime());
  return xStart + ((clamped - first.getTime()) / range) * (xEnd - xStart);
}

function buildXAxisTicks(series, width, m) {
  if (!series.length) return [];
  const count = series.length;
  const firstTs = parseTimestamp(series[0].ts);
  const lastTs = parseTimestamp(series[count - 1].ts);
  const spanMs = Math.max(1, (lastTs || 0) - (firstTs || 0));
  const desired = count <= 6 ? count : 5;
  const xStart = m.left;
  const xEnd = width - m.right;
  const indexSet = new Set();
  for (let i = 0; i < desired; i += 1) {
    indexSet.add(Math.round((i * (count - 1)) / Math.max(1, desired - 1)));
  }
  return Array.from(indexSet)
    .sort((a, b) => a - b)
    .map((idx) => {
      const point = series[idx];
      const ts = parseTimestamp(point.ts);
      const x = count === 1
        ? (xStart + xEnd) / 2
        : xStart + (((ts - firstTs) / Math.max(1, lastTs - firstTs)) * (xEnd - xStart));
      return {
        x,
        label: formatAxisDateLabel(point.ts, spanMs),
      };
    });
}

function buildCalendarXAxisTicks(series, width, m, monthStep = null) {
  if (!series.length) return [];
  const parsed = series
    .map((point, index) => ({ point, index, date: parseSeriesDate(point.ts) }))
    .filter((row) => !Number.isNaN(row.date.getTime()));
  if (!parsed.length) return buildXAxisTicks(series, width, m);

  const first = getVisibleSeriesStartDate(series) || parsed[0].date;
  const last = parsed[parsed.length - 1].date;
  const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / (24 * 3600 * 1000)));
  const chartW = width - m.left - m.right;

  if (spanDays <= 45) {
    const targetCount = Math.max(2, Math.min(4, Math.floor((width - m.left - m.right) / 140)));
    const indexSet = new Set([0, parsed.length - 1]);
    for (let i = 1; i < targetCount - 1; i += 1) {
      indexSet.add(Math.round((i * (parsed.length - 1)) / Math.max(1, targetCount - 1)));
    }
    return Array.from(indexSet)
      .sort((a, b) => a - b)
      .map((idx) => {
        const row = parsed[idx];
        return {
          x: getXPositionForSeriesPoint(series, row.index, width, m),
          label: String(row.point.ts || "").slice(0, 4),
        };
      });
  }

  const seenYears = new Set();
  const yearTicks = [];
  parsed.forEach((row) => {
    const year = row.date.getFullYear();
    if (row.date.getTime() < first.getTime()) return;
    if (seenYears.has(year)) return;
    seenYears.add(year);
    yearTicks.push({
      x: year === first.getFullYear() ? m.left : getXPositionForSeriesPoint(series, row.index, width, m),
      label: `${year}`,
    });
  });

  return yearTicks;
}

function buildProgressXAxisTicks(series, width, m) {
  if (!series.length) return [];
  const desired = series.length <= 4 ? series.length : 4;
  const indexSet = new Set([0, series.length - 1]);
  for (let i = 1; i < desired - 1; i += 1) {
    indexSet.add(Math.round((i * (series.length - 1)) / Math.max(1, desired - 1)));
  }
  return Array.from(indexSet)
    .sort((a, b) => a - b)
    .map((idx) => ({
      x: m.left + (idx / Math.max(1, series.length - 1)) * (width - m.left - m.right),
      label: String(series[idx]?.ts || "").slice(5, 10),
    }));
}

function buildZeroBasedNiceScale(values, targetTickCount = 5) {
  const numeric = (values || []).filter(Number.isFinite);
  const maxValue = Math.max(0, ...numeric);
  const roughStep = Math.max(1, maxValue / Math.max(1, targetTickCount - 1));
  const step = niceNumber(roughStep, true);
  const max = Math.max(step, Math.ceil(maxValue / step) * step);
  const ticks = [];
  for (let value = 0; value <= max + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return { min: 0, max, ticks };
}

function buildTightProfitScale(values, targetTickCount = 5) {
  const numeric = (values || []).filter(Number.isFinite);
  if (!numeric.length) return { min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] };

  const rawMin = Math.min(...numeric);
  const rawMax = Math.max(...numeric);
  if (rawMin >= 0) return buildZeroBasedNiceScale(numeric, targetTickCount);

  const dominant = Math.max(Math.abs(rawMin), Math.abs(rawMax));
  const step = niceNumber(Math.max(1, dominant) / Math.max(1, targetTickCount - 1), true);
  const min = Math.floor(rawMin / step) * step;
  const max = Math.max(step, Math.ceil(rawMax / step) * step);
  const ticks = [];
  for (let value = min; value <= max + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  if (!ticks.some((value) => Math.abs(value) < 1e-9)) {
    ticks.push(0);
    ticks.sort((a, b) => a - b);
  }
  return { min, max, ticks };
}

function buildSoftDynamicProfitScale(values, memoryKey, targetTickCount = 5) {
  const next = buildTightProfitScale(values, targetTickCount);
  const prev = state.chartScales[memoryKey];
  if (!prev) {
    state.chartScales[memoryKey] = next;
    return next;
  }

  const range = Math.max(1, next.max - next.min);
  const expandThresholdMax = prev.max - range * 0.12;
  const expandThresholdMin = prev.min + range * 0.12;
  const needsExpand = next.max > expandThresholdMax || next.min < expandThresholdMin;

  if (needsExpand) {
    state.chartScales[memoryKey] = next;
    return next;
  }

  const prevRange = Math.max(1, prev.max - prev.min);
  const nextRange = Math.max(1, next.max - next.min);
  const paddedMin = Math.min(0, next.min - nextRange * 0.06);
  const paddedMax = Math.max(0, next.max + nextRange * 0.06);
  const shrinkCandidate = buildTightProfitScale([paddedMin, paddedMax], targetTickCount);
  const blend = 0.18;
  const blended = buildTightProfitScale([
    prev.min + ((shrinkCandidate.min - prev.min) * blend),
    prev.max + ((shrinkCandidate.max - prev.max) * blend),
  ], targetTickCount);

  if ((prevRange - nextRange) / prevRange < 0.08) {
    return prev;
  }

  state.chartScales[memoryKey] = blended;
  return blended;
}

function drawAxisLabels(ctx, width, height, m, min, max, series) {
  ctx.save();
  ctx.fillStyle = COLORS.muted;
  ctx.font = `11px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || "IBM Plex Mono"}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const scale = buildNiceScale([min, max]);
  const xTicks = buildXAxisTicks(series, width, m);
  scale.ticks.forEach((value) => {
    const normalized = (value - scale.min) / Math.max(1e-9, scale.max - scale.min);
    const y = height - m.bottom - normalized * (height - m.top - m.bottom);
    ctx.fillText(fmtUsd(value), m.left - 12, y);
  });
  ctx.textBaseline = "top";
  xTicks.forEach(({ label, x }, index) => {
    ctx.textAlign = index === 0 ? "left" : index === xTicks.length - 1 ? "right" : "center";
    ctx.fillText(label, x, height - m.bottom + 10);
  });
  ctx.restore();
}

function drawFixedAxisLabels(ctx, width, height, m, ticks, series, xTickBuilder = buildXAxisTicks) {
  ctx.save();
  ctx.fillStyle = COLORS.muted;
  ctx.font = `11px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || "IBM Plex Mono"}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const min = ticks[0];
  const max = ticks[ticks.length - 1];
  const xTicks = xTickBuilder(series, width, m);
  ticks.forEach((value) => {
    const normalized = (value - min) / Math.max(1e-9, max - min);
    const y = height - m.bottom - normalized * (height - m.top - m.bottom);
    ctx.fillText(fmtUsd(value), m.left - 12, y);
  });
  ctx.textBaseline = "top";
  xTicks.forEach(({ label, x }, index) => {
    ctx.textAlign = index === 0 ? "left" : index === xTicks.length - 1 ? "right" : "center";
    ctx.fillText(label, x, height - m.bottom + 10);
  });
  ctx.restore();
}

function drawPointMarkers(ctx, points, color) {
  ctx.save();
  ctx.fillStyle = color;
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawLiveTailMarker(ctx, point, color, label) {
  if (!point) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(point.x + 8, point.y);
  ctx.lineTo((ctx.canvas.width / (window.devicePixelRatio || 1)) - 12, point.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.font = `10px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || "IBM Plex Mono"}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, Math.min(point.x + 10, (ctx.canvas.width / (window.devicePixelRatio || 1)) - 72), point.y - 8);
  ctx.restore();
}

function buildSignedPnlSegments(points, values) {
  if (points.length < 2 || points.length !== values.length) return;
  const segments = [];
  let current = [];

  const pushCurrent = (color) => {
    if (current.length >= 2) segments.push({ color, points: current });
    current = [];
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const v1 = Number(values[i] || 0);
    const v2 = Number(values[i + 1] || 0);
    const color1 = v1 < 0 ? COLORS.red : COLORS.green;
    const color2 = v2 < 0 ? COLORS.red : COLORS.green;

    if (!current.length) current.push(p1);

    if (color1 === color2 || v1 === v2) {
      if (segments.length && segments[segments.length - 1].color !== color1 && current.length >= 2) {
        pushCurrent(color1);
        current.push(p1);
      }
      current.push(p2);
      if (i === points.length - 2) pushCurrent(color1);
      continue;
    }

    const ratio = (0 - v1) / (v2 - v1);
    const cross = {
      x: p1.x + ((p2.x - p1.x) * ratio),
      y: p1.y + ((p2.y - p1.y) * ratio),
      baselineY: p1.baselineY,
    };
    current.push(cross);
    pushCurrent(color1);
    current.push(cross, p2);
    if (i === points.length - 2) pushCurrent(color2);
  }

  return segments;
}

function expandStepPoints(points) {
  if (!Array.isArray(points) || points.length < 2) return points || [];
  const stepped = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    stepped.push({
      x: curr.x,
      y: prev.y,
      baselineY: curr.baselineY ?? prev.baselineY,
    });
    stepped.push(curr);
  }
  return stepped;
}

function drawPolyline(ctx, points, color) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSignedPnlAreaAndLine(ctx, points, values, opts = {}) {
  const stepped = opts.stepped === true;
  const linear = opts.linear === true;
  const segments = buildSignedPnlSegments(points, values) || [];
  segments.forEach((segment) => {
    const segmentPoints = stepped ? expandStepPoints(segment.points) : segment.points;
    const baselineY = segment.points[0]?.baselineY ?? points[0]?.baselineY ?? 0;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(segmentPoints[0].x, baselineY);
    segmentPoints.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(segmentPoints[segmentPoints.length - 1].x, baselineY);
    ctx.closePath();
    const area = ctx.createLinearGradient(0, Math.min(...segmentPoints.map((point) => point.y)), 0, Math.max(...segmentPoints.map((point) => point.y)));
    if (segment.color === COLORS.red) {
      area.addColorStop(0, "rgba(224,109,109,0.18)");
      area.addColorStop(1, "rgba(224,109,109,0.46)");
    } else {
      area.addColorStop(0, "rgba(51,209,122,0.18)");
      area.addColorStop(1, "rgba(51,209,122,0.42)");
    }
    ctx.fillStyle = area;
    ctx.fill();
    ctx.restore();
  });

  segments.forEach((segment) => {
    const segmentPoints = stepped ? expandStepPoints(segment.points) : segment.points;
    if (stepped) {
      drawPolyline(ctx, segmentPoints, segment.color);
    } else if (linear) {
      drawPolyline(ctx, segmentPoints, segment.color);
    } else {
      drawSmoothLine(ctx, segmentPoints, segment.color, false);
    }
  });
}

function drawSmoothLine(ctx, points, color, fill = false) {
  if (points.length < 2) return;
  const chartHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
  const baselineY = points[0].baselineY ?? points.reduce((max, point) => Math.max(max, point.y), -Infinity);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width / (window.devicePixelRatio || 1), chartHeight);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length <= 6) {
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const next = points[i];
      const mx = (prev.x + next.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, (prev.y + next.y) / 2);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  } else {
    const tension = 0.12;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = clamp(
        p1.y + (p2.y - p0.y) * tension,
        Math.min(p1.y, p2.y),
        Math.max(p1.y, p2.y)
      );
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = clamp(
        p2.y - (p3.y - p1.y) * tension,
        Math.min(p1.y, p2.y),
        Math.max(p1.y, p2.y)
      );
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }
  ctx.stroke();
  if (fill) {
    const last = points[points.length - 1];
    const first = points[0];
    ctx.lineTo(last.x, baselineY);
    ctx.lineTo(first.x, baselineY);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 34, 0, baselineY);
    grad.addColorStop(0, "rgba(51,209,122,0.18)");
    grad.addColorStop(1, "rgba(51,209,122,0)");
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
}

function toPoints(series, valueKey, width, height, m, minOverride = null, maxOverride = null, baselineValue = 0) {
  const vals = series.map((row) => Number(row[valueKey])).filter(Number.isFinite);
  const scale = buildNiceScale(vals);
  const min = minOverride ?? scale.min;
  const max = maxOverride ?? scale.max;
  const baselineNormalized = (baselineValue - min) / Math.max(1e-9, max - min);
  const baselineY = baselineNormalized >= 0 && baselineNormalized <= 1
    ? height - m.bottom - baselineNormalized * (height - m.top - m.bottom)
    : height - m.bottom;
  return series.map((row) => {
    const x = getXPositionForSeriesPoint(series, series.indexOf(row), width, m);
    const normalized = (Number(row[valueKey]) - min) / Math.max(1e-9, max - min);
    const y = height - m.bottom - normalized * (height - m.top - m.bottom);
    return { x, y, baselineY };
  });
}

function toIndexedPoints(series, valueKey, width, height, m, minOverride = null, maxOverride = null, baselineValue = 0) {
  const vals = series.map((row) => Number(row[valueKey])).filter(Number.isFinite);
  const scale = buildNiceScale(vals);
  const min = minOverride ?? scale.min;
  const max = maxOverride ?? scale.max;
  const baselineNormalized = (baselineValue - min) / Math.max(1e-9, max - min);
  const baselineY = baselineNormalized >= 0 && baselineNormalized <= 1
    ? height - m.bottom - baselineNormalized * (height - m.top - m.bottom)
    : height - m.bottom;
  return series.map((row, index) => {
    const x = m.left + (index / Math.max(1, series.length - 1)) * (width - m.left - m.right);
    const normalized = (Number(row[valueKey]) - min) / Math.max(1e-9, max - min);
    const y = height - m.bottom - normalized * (height - m.top - m.bottom);
    return { x, y, baselineY };
  });
}

function drawDualCurveChart(canvas, leftSeries, leftKey, rightSeries, rightKey, leftColor, rightColor) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const m = { top: 20, right: 28, bottom: 58, left: 92 };
  ctx.clearRect(0, 0, width, height);
  const leftVals = leftSeries.map((row) => Number(row[leftKey])).filter(Number.isFinite);
  const rightVals = rightSeries.map((row) => Number(row[rightKey])).filter(Number.isFinite);
  const leftScale = buildNiceScale(leftVals);
  const rightScale = buildNiceScale(rightVals);
  drawAxes(ctx, width, height, m, leftScale.ticks, buildXAxisTicks(leftSeries, width, m));
  const leftPoints = toPoints(leftSeries, leftKey, width, height, m, leftScale.min, leftScale.max);
  const rightPoints = toPoints(rightSeries, rightKey, width, height, m, rightScale.min, rightScale.max);
  drawSmoothLine(ctx, leftPoints, leftColor, true);
  drawSmoothLine(ctx, rightPoints, rightColor, false);
  drawAxisLabels(ctx, width, height, m, leftScale.min, leftScale.max, leftSeries);
}

function drawOverlayStrategyChart(canvas, data) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const m = { top: 20, right: 28, bottom: 58, left: 92 };
  ctx.clearRect(0, 0, width, height);
  const trades = OVERVIEW_STRATEGY_KEYS.flatMap((key) =>
    ((data.strategies[key].execution_views?.live?.all_trades || []).map((row) => ({ ...row, strategy: getStrategyLabel(key) })))
  ).sort((a, b) => String(a.exit_ts).localeCompare(String(b.exit_ts)));
  const livePositions = OVERVIEW_STRATEGY_KEYS.flatMap((key) => data.strategies[key].active_positions || []);
  const combinedSeries = buildLiveTailSeries(trades, livePositions, 0).map((row) => ({
    ts: row.ts,
    pnl: Number(row.pnl || 0),
    liveTail: Boolean(row.liveTail),
  }));
  if (!combinedSeries.length) return;
  const scale = buildSoftDynamicProfitScale(combinedSeries.map((row) => Number(row.pnl)), "overviewLivePnl", 5);
  const xTicks = buildProgressXAxisTicks(combinedSeries, width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const points = toIndexedPoints(combinedSeries, "pnl", width, height, m, scale.min, scale.max, 0);
  drawSignedPnlAreaAndLine(ctx, points, combinedSeries.map((row) => Number(row.pnl)), { linear: true });
  const lastPoint = points[points.length - 1];
  const lastValue = Number(combinedSeries[combinedSeries.length - 1]?.pnl || 0);
  const lastColor = lastValue < 0 ? COLORS.red : COLORS.green;
  if (lastPoint && combinedSeries[combinedSeries.length - 1]?.liveTail) {
    drawLiveTailMarker(ctx, lastPoint, lastColor, fmtSignedCompactUsd(lastValue));
  } else if (lastPoint) {
    drawPointMarkers(ctx, [lastPoint], lastColor);
  }
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, combinedSeries, () => xTicks);
}

function drawAssetOverlayChart(canvas, assetCurves) {
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const m = { top: 10, right: 14, bottom: 38, left: 68 };
  const entries = Object.entries(assetCurves || {}).filter(([, series]) => Array.isArray(series) && series.length);
  if (!entries.length) return;
  const allVals = entries.flatMap(([, series]) => series.map((row) => Number(row.pnl)).filter(Number.isFinite));
  const scale = buildTightProfitScale(allVals, 5);
  const xTicks = buildCalendarXAxisTicks(entries[0][1], width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const palette = { BTC: COLORS.green, ETH: COLORS.blue, SOL: COLORS.amber };
  entries.forEach(([asset, series], idx) => {
    const points = toPoints(series, "pnl", width, height, m, scale.min, scale.max);
    drawSmoothLine(ctx, points, palette[asset] || COLORS.text, idx === 0);
  });
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, entries[0][1], () => xTicks);
}

function buildDailyPnlSeries(trades) {
  const ordered = [...(trades || [])]
    .filter((trade) => trade?.exit_ts)
    .sort((a, b) => String(a.exit_ts).localeCompare(String(b.exit_ts)));
  if (!ordered.length) return [];

  const grouped = new Map();
  ordered.forEach((trade) => {
    const day = String(trade.exit_ts).slice(0, 10);
    grouped.set(day, (grouped.get(day) || 0) + Number(trade.net_pnl_usd || 0));
  });

  const parseUtcDate = (dayText) => {
    const [year, month, day] = String(dayText).split("-").map((value) => Number(value));
    return new Date(Date.UTC(year, Math.max(0, month - 1), day));
  };
  const formatUtcDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const firstDay = parseUtcDate(ordered[0].exit_ts.slice(0, 10));
  const lastDay = parseUtcDate(ordered[ordered.length - 1].exit_ts.slice(0, 10));
  const rows = [];
  let running = 0;
  const cursor = new Date(firstDay);

  while (cursor <= lastDay) {
    const key = formatUtcDate(cursor);
    running += grouped.get(key) || 0;
    rows.push({ ts: key, pnl: Number(running.toFixed(2)) });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return rows.slice(-180);
}

function buildTradeEquitySeries(trades, baseEquity = 0) {
  const ordered = [...(trades || [])]
    .filter((trade) => trade?.exit_ts)
    .sort((a, b) => String(a.exit_ts).localeCompare(String(b.exit_ts)));
  if (!ordered.length) return [];

  let running = Number(baseEquity || 0);
  return ordered.map((trade, index) => {
    running += Number(trade.net_pnl_usd || 0);
    return {
      ts: String(trade.exit_ts),
      equity: Number(running.toFixed(2)),
      pnl: Number((running - Number(baseEquity || 0)).toFixed(2)),
      tradeIndex: index + 1,
    };
  });
}

function buildLiveTailSeries(trades, positions = [], baseEquity = 0) {
  const baseSeries = buildTradeEquitySeries(trades, baseEquity);
  const markedPositions = getMarkedActivePositions(positions || []);
  const unrealizedPnlUsd = markedPositions
    .map((position) => Number(position.current_pnl_usd))
    .filter(Number.isFinite)
    .reduce((sum, value) => sum + value, 0);

  if (!markedPositions.length) return baseSeries;

  const lastEquity = baseSeries.length
    ? Number(baseSeries[baseSeries.length - 1].equity || 0)
    : Number(baseEquity || 0);
  const liveEquity = roundNumber(lastEquity + unrealizedPnlUsd, 2);
  const livePnl = roundNumber(liveEquity - Number(baseEquity || 0), 2);
  const nowTs = new Date().toISOString().slice(0, 16).replace("T", " ");

  if (!baseSeries.length) {
    return [
      { ts: nowTs, equity: liveEquity, pnl: livePnl, tradeIndex: 0 },
    ];
  }

  return [
    ...baseSeries,
    {
      ts: nowTs,
      equity: liveEquity,
      pnl: livePnl,
      tradeIndex: baseSeries.length + 1,
      liveTail: true,
    },
  ];
}

function drawDailyPnlChart(canvas, trades) {
  const series = buildDailyPnlSeries(trades);
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  if (!series.length) return;
  const m = { top: 20, right: 28, bottom: 58, left: 92 };
  const vals = series.map((row) => Number(row.pnl)).filter(Number.isFinite);
  const scale = buildNiceScale(vals, 6, { includeZero: true });
  const xTicks = buildCalendarXAxisTicks(series, width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const points = toPoints(
    series.map((row) => ({ ts: row.ts, pnl: Number(row.pnl) })),
    "pnl",
    width,
    height,
    m,
    scale.min,
    scale.max
  );
  if (scale.min < 0 && scale.max > 0 && points[0]?.baselineY) {
    ctx.save();
    ctx.strokeStyle = "rgba(231,239,233,0.16)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(m.left, points[0].baselineY);
    ctx.lineTo(width - m.right, points[0].baselineY);
    ctx.stroke();
    ctx.restore();
  }
  drawSignedPnlAreaAndLine(ctx, points, series.map((row) => Number(row.pnl)));
  const lastPoint = points[points.length - 1];
  const lastValue = Number(series[series.length - 1]?.pnl || 0);
  drawPointMarkers(
    ctx,
    points.filter((_, index) => index % 14 === 0).concat(lastPoint ? [lastPoint] : []),
    lastValue < 0 ? COLORS.red : COLORS.green
  );
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, series, () => xTicks);
}

function drawTradeEquityChart(canvas, trades, baseEquity = 0) {
  const series = buildTradeEquitySeries(trades, baseEquity);
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  if (!series.length) return;
  const m = { top: 10, right: 14, bottom: 38, left: 68 };
  const vals = series.map((row) => Number(row.equity)).filter(Number.isFinite);
  const scale = buildNiceScale([...vals, Number(baseEquity || 0)], 6);
  const xTicks = buildProgressXAxisTicks(series, width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const points = toIndexedPoints(
    series.map((row) => ({ ts: row.ts, equity: Number(row.equity) })),
    "equity",
    width,
    height,
    m,
    scale.min,
    scale.max,
    Number(baseEquity || 0)
  );
  if (points[0]?.baselineY) {
    ctx.save();
    ctx.strokeStyle = "rgba(231,239,233,0.16)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(m.left, points[0].baselineY);
    ctx.lineTo(width - m.right, points[0].baselineY);
    ctx.stroke();
    ctx.restore();
  }
  drawSignedPnlAreaAndLine(ctx, points, series.map((row) => Number(row.pnl)));
  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    drawPointMarkers(ctx, [lastPoint], Number(series[series.length - 1]?.pnl || 0) < 0 ? COLORS.red : COLORS.green);
  }
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, series, () => xTicks);
}

function drawLiveTradeEquityChart(canvas, trades, positions, baseEquity = 0) {
  const series = buildLiveTailSeries(trades, positions, baseEquity);
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  if (!series.length) return;
  const m = { top: 10, right: 14, bottom: 38, left: 68 };
  const vals = series.map((row) => Number(row.equity)).filter(Number.isFinite);
  const scale = buildNiceScale([...vals, Number(baseEquity || 0)], 6);
  const xTicks = buildProgressXAxisTicks(series, width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const points = toIndexedPoints(
    series.map((row) => ({ ts: row.ts, equity: Number(row.equity) })),
    "equity",
    width,
    height,
    m,
    scale.min,
    scale.max,
    Number(baseEquity || 0)
  );
  if (points[0]?.baselineY) {
    ctx.save();
    ctx.strokeStyle = "rgba(231,239,233,0.16)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(m.left, points[0].baselineY);
    ctx.lineTo(width - m.right, points[0].baselineY);
    ctx.stroke();
    ctx.restore();
  }
  drawSignedPnlAreaAndLine(ctx, points, series.map((row) => Number(row.pnl)), { linear: true });
  const lastPoint = points[points.length - 1];
  const lastValue = Number(series[series.length - 1]?.pnl || 0);
  const lastColor = lastValue < 0 ? COLORS.red : COLORS.green;
  if (lastPoint && series[series.length - 1]?.liveTail) {
    drawLiveTailMarker(ctx, lastPoint, lastColor, fmtSignedCompactUsd(lastValue));
  } else if (lastPoint) {
    drawPointMarkers(ctx, [lastPoint], lastColor);
  }
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, series, () => xTicks);
}

function drawPortfolioPnlChart(canvas, portfolioCurve = [], trades = []) {
  const series = Array.isArray(portfolioCurve) && portfolioCurve.length >= 2
    ? (() => {
      const base = Number(portfolioCurve[0]?.equity || 0);
      return portfolioCurve.map((row) => ({
        ts: row.ts,
        pnl: Number((Number(row.equity || 0) - base).toFixed(2)),
      }));
    })()
    : buildTradeEquitySeries(trades, 0).map((row) => ({
      ts: row.ts,
      pnl: Number(row.pnl || 0),
    }));
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  if (!series.length) return;
  const m = { top: 20, right: 28, bottom: 58, left: 92 };
  const scale = buildNiceScale(series.map((row) => Number(row.pnl)).filter(Number.isFinite), 6, { includeZero: true });
  const xTicks = buildCalendarXAxisTicks(series, width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const points = toPoints(series, "pnl", width, height, m, scale.min, scale.max, 0);
  if (scale.min < 0 && scale.max > 0 && points[0]?.baselineY) {
    ctx.save();
    ctx.strokeStyle = "rgba(231,239,233,0.16)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(m.left, points[0].baselineY);
    ctx.lineTo(width - m.right, points[0].baselineY);
    ctx.stroke();
    ctx.restore();
  }
  drawSignedPnlAreaAndLine(ctx, points, series.map((row) => Number(row.pnl)));
  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    drawPointMarkers(ctx, [lastPoint], Number(series[series.length - 1]?.pnl || 0) < 0 ? COLORS.red : COLORS.green);
  }
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, series, () => xTicks);
}

function drawGrapesChart(canvas, data) {
  const lens = state.lenses.grapes || "backtest";
  const view = getStrategyLensData("grapes");
  if (lens === "live") {
    drawLiveTradeEquityChart(
      canvas,
      view?.all_trades || [],
      data.strategies.grapes?.active_positions || [],
      view?.summary?.initial_equity || 0
    );
    return "single";
  }
  drawPortfolioPnlChart(canvas, view?.portfolio_curve || [], view?.all_trades || []);
  return "single";
}

function drawCitrusAssetReturns(canvas, data) {
  const lens = state.lenses.citrus || "backtest";
  const view = getStrategyLensData("citrus");
  if (lens === "live") {
    drawLiveTradeEquityChart(
      canvas,
      view?.all_trades || [],
      data.strategies.citrus?.active_positions || [],
      view?.summary?.initial_equity || 0
    );
    return "single";
  }
  drawPortfolioPnlChart(canvas, view?.portfolio_curve || [], view?.all_trades || []);
  return "single";
}

function drawEquityAssetReturns(canvas, data) {
  const lens = state.lenses.equity || "backtest";
  const view = getStrategyLensData("equity");
  if (lens === "live") {
    drawLiveTradeEquityChart(
      canvas,
      view?.all_trades || [],
      data.strategies.equity?.active_positions || [],
      view?.summary?.initial_equity || 0
    );
    return "single";
  }
  drawPortfolioPnlChart(canvas, view?.portfolio_curve || [], view?.all_trades || []);
  return "single";
}

function drawStrategyAssetMiniChart(canvas, strategyKey, data) {
  const view = getStrategyLensData(strategyKey);
  const assetCurves = view?.asset_curves || data.strategies[strategyKey]?.asset_curves || {};
  drawAssetOverlayChart(canvas, assetCurves);
}

function drawOverviewRelativeChart(canvas, data) {
  const toRelativeCurve = (strategyKey, fallbackTrades = []) => {
    const liveView = data.strategies[strategyKey]?.execution_views?.live || {};
    const portfolio = liveView.portfolio_curve || [];
    if (portfolio.length >= 2) {
      const base = Number(portfolio[0]?.equity || 0);
      return portfolio.map((row) => ({
        ts: row.ts,
        pnl: Number((Number(row.equity || 0) - base).toFixed(2)),
      }));
    }
    return buildTradeEquitySeries(fallbackTrades, 0).map((row) => ({ ts: row.ts, pnl: Number(row.pnl || 0) }));
  };

  const seriesByStrategy = Object.fromEntries(
    OVERVIEW_STRATEGY_KEYS.map((key) => [key, toRelativeCurve(key, data.strategies[key]?.execution_views?.live?.all_trades || [])])
  );
  const combined = OVERVIEW_STRATEGY_KEYS.flatMap((key) => seriesByStrategy[key].map((row) => Number(row.pnl))).filter(Number.isFinite);
  if (!combined.length) return;

  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const m = { top: 12, right: 10, bottom: 28, left: 44 };
  const scale = buildNiceScale([...combined, 0], 5, { includeZero: true });
  const maxLen = Math.max(...OVERVIEW_STRATEGY_KEYS.map((key) => seriesByStrategy[key].length));
  const tickSeries = Array.from({ length: Math.max(2, maxLen) }, (_, index) => ({
    ts: OVERVIEW_STRATEGY_KEYS.map((key) => seriesByStrategy[key][index]?.ts).find(Boolean) || "",
    pnl: 0,
  }));
  const xTicks = buildProgressXAxisTicks(tickSeries, width, m).filter((_, idx, arr) => idx === 0 || idx === arr.length - 1 || idx === Math.floor(arr.length / 2));
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);

  const pointsByStrategy = Object.fromEntries(
    OVERVIEW_STRATEGY_KEYS.map((key) => [key, toIndexedPoints(seriesByStrategy[key], "pnl", width, height, m, scale.min, scale.max, 0)])
  );

  const baselinePoints = OVERVIEW_STRATEGY_KEYS.map((key) => pointsByStrategy[key][0]).find(Boolean);
  if (baselinePoints?.baselineY) {
    ctx.save();
    ctx.strokeStyle = "rgba(231,239,233,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.left, baselinePoints.baselineY);
    ctx.lineTo(width - m.right, baselinePoints.baselineY);
    ctx.stroke();
    ctx.restore();
  }

  OVERVIEW_STRATEGY_KEYS.forEach((key) => {
    drawSmoothLine(ctx, pointsByStrategy[key], STRATEGY_META[key].overviewColor, false);
  });
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks.slice(0, 3), tickSeries, () => xTicks);
}

function renderTradeMeta(targetId, trades) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const wins = trades.filter((trade) => Number(trade.net_pnl_usd) > 0).length;
  const losses = trades.filter((trade) => Number(trade.net_pnl_usd) <= 0).length;
  const total = trades.reduce((sum, trade) => sum + Number(trade.net_pnl_usd || 0), 0);
  target.innerHTML = `
    <span><strong>${trades.length}</strong> ${t("currentFilteredTrades")}</span>
    <span><strong class="pos">${wins}</strong> ${t("wins")}</span>
    <span><strong class="neg">${losses}</strong> ${t("losses")}</span>
    <span><strong class="${Number(total) < 0 ? "neg" : "pos"}">${fmtUsd(total)}</strong> ${t("totalPnl")}</span>
  `;
}

function renderTradeTable(targetId, trades, includeType = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const ordered = [...trades].sort((a, b) => String(b.exit_ts).localeCompare(String(a.exit_ts)));
  target.innerHTML = ordered.map((trade) => {
    const pnl = Number(trade.net_pnl_usd || 0);
    const dir = String(trade.direction || "").toUpperCase();
    const isLong = dir === "LONG";
    const isShort = dir === "SHORT";
    const sideLabel = isLong ? "Long" : isShort ? "Short" : "—";
    const sideClass = isLong ? "pos" : isShort ? "neg" : "";
    const entryPx = Number(trade.entry_price || 0);
    const exitPx = Number(trade.exit_price || 0);
    const movePct = entryPx > 0
      ? (((exitPx - entryPx) / entryPx) * (isShort ? -100 : 100))
      : 0;
    return `
      <tr>
        <td class="mono">${trade.asset}</td>
        <td class="mono ${sideClass}">${sideLabel}</td>
        <td class="mono">${fmtTradeDate(trade.entry_ts)}</td>
        <td class="mono">${fmtTradeDate(trade.exit_ts)}</td>
        <td class="mono">${fmtNum(trade.entry_price, 2)}</td>
        <td class="mono">${fmtNum(trade.exit_price, 2)}</td>
        <td class="mono">${trade.hold_hours}h</td>
        <td class="mono ${pnl >= 0 ? "pos" : "neg"}">${fmtUsd(pnl)}</td>
        <td class="mono ${movePct >= 0 ? "pos" : "neg"}">${fmtPct(movePct, 2)}</td>
      </tr>`;
  }).join("");
}

function renderTradeCards(targetId, trades, includeType = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const ordered = [...trades].sort((a, b) => String(b.exit_ts).localeCompare(String(a.exit_ts)));
  target.innerHTML = ordered.map((trade) => {
    const pnl = Number(trade.net_pnl_usd || 0);
    const dir = String(trade.direction || "").toUpperCase();
    const isLong = dir === "LONG";
    const isShort = dir === "SHORT";
    const sideLabel = isLong ? "Long" : isShort ? "Short" : "—";
    const sideClass = isLong ? "pos" : isShort ? "neg" : "";
    const status = trade.exit_ts ? t("closed") : t("open");
    const exitLabel = trade.exit_ts ? fmtTradeDate(trade.exit_ts) : "—";
    return `
      <article class="trade-card overview-mobile-trade">
        <div class="trade-card-head">
          <strong>${trade.asset}</strong>
          <span class="dir-chip ${String(sideLabel).toLowerCase()} ${sideClass}">${sideLabel}</span>
        </div>
        <div class="trade-mobile-grid">
          <div class="trade-mobile-row">
            <span>${t("entry")}</span>
            <strong class="mono">${fmtTradeMonthDay(trade.entry_ts)}</strong>
          </div>
          <div class="trade-mobile-row">
            <span>${t("exit")}</span>
            <strong class="mono">${exitLabel === "—" ? "—" : fmtTradeMonthDay(trade.exit_ts)}</strong>
          </div>
          <div class="trade-mobile-row">
            <span>${t("pnl")}</span>
            <strong class="${pnl >= 0 ? "pos" : "neg"}">${fmtUsd(pnl)}</strong>
          </div>
          <div class="trade-mobile-row">
            <span>${t("status")}</span>
            <strong class="${status === t("closed") ? "closed-status" : ""}">${status}</strong>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderTradeSection(strategyKey, includeType = false) {
  const trades = getFilteredTrades(strategyKey);
  renderTradeMeta(`${strategyKey}-trade-meta`, trades);
  renderTradeTable(`${strategyKey}-trade-table`, trades, includeType);
  renderTradeCards(`${strategyKey}-trade-cards`, trades, includeType);
}

function drawMonthlyHeatmap(canvas, monthlyHeatmap) {
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const years = monthlyHeatmap || [];
  if (!years.length) return;
  const mobile = width <= 420;
  const pad = mobile
    ? { top: 12, right: 8, bottom: 22, left: 30 }
    : { top: 16, right: 12, bottom: 28, left: 42 };
  const rows = years.length;
  const cols = 12;
  const cellW = (width - pad.left - pad.right) / cols;
  const cellH = (height - pad.top - pad.bottom) / rows;
  const all = years.flatMap((row) => row.months || []);
  const maxAbs = Math.max(...all.map((m) => Math.abs(Number(m.return_pct || 0))), 1);
  const months = mobile
    ? ["J","F","M","A","M","J","J","A","S","O","N","D"]
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--mono") || "IBM Plex Mono";
  const baseFont = mobile ? 9 : 11;
  const subFont = mobile ? 7 : 10;

  ctx.font = `${baseFont}px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  years.forEach((yearRow, r) => {
    const y = pad.top + r * cellH;
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = "right";
    ctx.fillText(mobile ? String(yearRow.year).slice(2) : String(yearRow.year), pad.left - (mobile ? 6 : 10), y + cellH / 2);
    ctx.textAlign = "center";
    const map = new Map((yearRow.months || []).map((m) => [Number(m.month), m]));
    for (let month = 1; month <= 12; month += 1) {
      const x = pad.left + (month - 1) * cellW;
      const data = map.get(month);
      const v = data ? Number(data.return_pct || 0) : 0;
      const alpha = Math.min(1, Math.abs(v) / maxAbs);
      ctx.fillStyle = v > 0 ? `rgba(51,209,122,${0.12 + alpha * 0.38})` : v < 0 ? `rgba(224,109,109,${0.12 + alpha * 0.38})` : "rgba(255,255,255,0.03)";
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
      if (data) {
        ctx.fillStyle = COLORS.text;
        ctx.fillText(`${v > 0 ? "+" : ""}${v.toFixed(0)}%`, x + cellW / 2, y + cellH / 2 - (mobile ? 0 : 8));
        if (!mobile) {
          ctx.fillStyle = COLORS.muted;
          ctx.font = `${subFont}px ${mono}`;
          ctx.fillText(fmtUsd(data.net_pnl), x + cellW / 2, y + cellH / 2 + 8);
          ctx.font = `${baseFont}px ${mono}`;
        }
      }
    }
  });

  ctx.fillStyle = COLORS.muted;
  years[years.length - 1] && months.forEach((label, i) => {
    if (mobile && i % 2 === 1) return;
    const x = pad.left + i * cellW + cellW / 2;
    ctx.fillText(label, x, height - 12);
  });
}

function renderMonthlySummary(targetId, monthlySummary, winRate) {
  const target = document.getElementById(targetId);
  if (!target || !monthlySummary) return;
  target.innerHTML = `
    <span><strong class="pos">${monthlySummary.profitable_months}</strong> ${t("profitableMonths")}</span>
    <span><strong class="neg">${monthlySummary.losing_months}</strong> ${t("losingMonths")}</span>
    <span><strong class="${Number(winRate || 0) >= 50 ? "pos" : "neg"}">${fmtPct(winRate, 1)}</strong> ${t("winRate")}</span>
    <span><strong>${monthlySummary.best_month?.label || "—"}</strong> ${t("bestMonth")}</span>
  `;
}

function renderCharts(data) {
  const overview = document.getElementById("overlay-overview-canvas");
  if (overview && overview.offsetParent !== null) {
    drawOverlayStrategyChart(overview, data);
    const legend = document.getElementById("overview-legend");
    if (legend) legend.innerHTML = "";
  }

  const overviewRelative = document.getElementById("overview-relative-canvas");
  if (overviewRelative && overviewRelative.offsetParent !== null) {
    drawOverviewRelativeChart(overviewRelative, data);
    renderLegend("overview-relative-legend", OVERVIEW_STRATEGY_KEYS.map((key) => ({ label: getStrategyLabel(key), color: STRATEGY_META[key].overviewColor })));
  }

  const grapesDetail = document.getElementById("grapes-detail-canvas");
  if (grapesDetail && grapesDetail.offsetParent !== null) {
    const mode = drawGrapesChart(grapesDetail, data);
    const title = document.querySelector('[data-panel="grapes"] .detail-grid .panel:first-child h4');
    if (title) title.textContent = mode === "single" ? t("cumulativeEquity") : t("assetOverlay");
    const grapesLegend = mode === "single"
      ? [{ label: t("cumulativeEquity"), color: COLORS.green }]
      : [
        { label: "BTC", color: COLORS.green },
        { label: "ETH", color: COLORS.blue },
        { label: "SOL", color: COLORS.amber },
      ];
    if ((state.lenses.grapes || "backtest") === "live") {
      grapesLegend.push({ label: `${t("markAt")} ${fmtTimeOnly(state.livePrices.lastTickAt)}`, color: COLORS.muted });
    }
    renderLegend("grapes-legend", grapesLegend);
  }

  const citrusDetail = document.getElementById("citrus-return-canvas");
  if (citrusDetail && citrusDetail.offsetParent !== null) {
    const mode = drawCitrusAssetReturns(citrusDetail, data);
    const title = document.querySelector('[data-panel="citrus"] .detail-grid .panel:first-child h4');
    if (title) title.textContent = mode === "single" ? t("cumulativeEquity") : t("assetOverlay");
    const citrusLegend = mode === "single"
      ? [{ label: t("cumulativeEquity"), color: COLORS.green }]
      : [
        { label: "BTC", color: COLORS.green },
        { label: "ETH", color: COLORS.blue },
        { label: "SOL", color: COLORS.amber },
      ];
  if ((state.lenses.citrus || "backtest") === "live") {
      citrusLegend.push({ label: `${t("markAt")} ${fmtTimeOnly(state.livePrices.lastTickAt)}`, color: COLORS.muted });
    }
    renderLegend("citrus-legend", citrusLegend);
  }

  const equityDetail = document.getElementById("equity-return-canvas");
  if (equityDetail && equityDetail.offsetParent !== null) {
    const mode = drawEquityAssetReturns(equityDetail, data);
    const equityLegend = mode === "single"
      ? [{ label: t("cumulativeEquity"), color: STRATEGY_META.equity.strategyColor }]
      : [{ label: "US500", color: STRATEGY_META.equity.strategyColor }];
    if ((state.lenses.equity || "backtest") === "live") {
      equityLegend.push({ label: `${t("markAt")} ${fmtTimeOnly(state.livePrices.lastTickAt)}`, color: COLORS.muted });
    }
    renderLegend("equity-legend", equityLegend);
  }

  const grapesHeatmap = document.getElementById("grapes-heatmap-canvas");
  if (grapesHeatmap && grapesHeatmap.offsetParent !== null) drawMonthlyHeatmap(grapesHeatmap, getStrategyLensData("grapes")?.monthly_heatmap || data.strategies.grapes?.monthly_heatmap);

  const grapesMini = document.getElementById("grapes-asset-curves-canvas");
  if (grapesMini && grapesMini.offsetParent !== null) {
    drawStrategyAssetMiniChart(grapesMini, "grapes", data);
    renderLegend("grapes-asset-curves-legend", [
      { label: "BTC", color: COLORS.green },
      { label: "ETH", color: COLORS.blue },
      { label: "SOL", color: COLORS.amber },
    ]);
  }

  const citrusHeatmap = document.getElementById("citrus-heatmap-canvas");
  if (citrusHeatmap && citrusHeatmap.offsetParent !== null) drawMonthlyHeatmap(citrusHeatmap, getStrategyLensData("citrus")?.monthly_heatmap || data.strategies.citrus?.monthly_heatmap);

  const citrusMini = document.getElementById("citrus-asset-curves-canvas");
  if (citrusMini && citrusMini.offsetParent !== null) {
    drawStrategyAssetMiniChart(citrusMini, "citrus", data);
    renderLegend("citrus-asset-curves-legend", [
      { label: "BTC", color: COLORS.green },
      { label: "ETH", color: COLORS.blue },
      { label: "SOL", color: COLORS.amber },
    ]);
  }

  const equityHeatmap = document.getElementById("equity-heatmap-canvas");
  if (equityHeatmap && equityHeatmap.offsetParent !== null) drawMonthlyHeatmap(equityHeatmap, getStrategyLensData("equity")?.monthly_heatmap || data.strategies.equity?.monthly_heatmap);

  const equityMini = document.getElementById("equity-asset-curves-canvas");
  if (equityMini && equityMini.offsetParent !== null) {
    drawStrategyAssetMiniChart(equityMini, "equity", data);
    renderLegend("equity-asset-curves-legend", [
      { label: "US500", color: STRATEGY_META.equity.strategyColor },
    ]);
  }
}

function bindSwitches() {
  document.querySelectorAll(".switch-tab").forEach((btn) => {
    btn.addEventListener("click", () => setActiveView(btn.dataset.view));
  });
}

function bindLanguageSwitch() {
  document.querySelectorAll(".lang-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      localStorage.setItem("strategy_os_lang", state.lang);
      applyLanguage();
      if (state.data) render(state.data);
    });
  });
}

function bindTradeFilters() {
  STRATEGY_KEYS.forEach((strategyKey) => {
    const scopeSelect = document.getElementById(`${strategyKey}-trade-scope`);
    const valueSelect = document.getElementById(`${strategyKey}-trade-value`);
    const scopeTabs = document.getElementById(`${strategyKey}-trade-scope-tabs`);
    const valueTabs = document.getElementById(`${strategyKey}-trade-value-tabs`);
    if (!scopeSelect || !valueSelect) return;
    scopeSelect.addEventListener("change", () => {
      syncTradeValueOptions(strategyKey);
      renderTradeScopeTabs(strategyKey);
      renderTradeSection(strategyKey, strategyKey === "grapes");
    });
    scopeTabs?.addEventListener("click", (event) => {
      const btn = event.target.closest(".trade-scope-tab");
      if (!btn) return;
      scopeSelect.value = btn.dataset.scope;
      syncTradeValueOptions(strategyKey);
      renderTradeScopeTabs(strategyKey);
      renderTradeSection(strategyKey, strategyKey === "grapes");
    });
    valueSelect.addEventListener("change", () => {
      state.tradeFilters[strategyKey].value = valueSelect.value;
      renderTradeValueTabs(strategyKey);
      renderTradeSection(strategyKey, strategyKey === "grapes");
    });
    valueTabs?.addEventListener("click", (event) => {
      const btn = event.target.closest(".trade-value-tab");
      if (!btn) return;
      valueSelect.value = btn.dataset.value;
      state.tradeFilters[strategyKey].value = btn.dataset.value;
      renderTradeValueTabs(strategyKey);
      renderTradeSection(strategyKey, strategyKey === "grapes");
    });
  });
}

function bindLensSwitches() {
  document.querySelectorAll(".subview-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { strategy, lens } = btn.dataset;
      state.lenses[strategy] = lens === "extended" ? "backtest" : lens;
      localStorage.setItem("strategy_os_lenses", JSON.stringify(state.lenses));
      document.querySelectorAll(`.subview-tab[data-strategy="${strategy}"]`).forEach((el) => {
        el.classList.toggle("active", el.dataset.lens === state.lenses[strategy]);
      });
      if (state.data) {
        syncTradeValueOptions(strategy);
        render(state.data);
      }
    });
  });
}

function render(data) {
  applyLanguage();
  renderHero(data);
  renderOverviewSummary(data);
  renderOverviewStrategyTape(data);
  renderGrapesAssets(data);
  renderCitrusAssets(data);
  renderEquityAssets(data);
  renderGrapesSummary(data);
  renderGrapesRegime(data);
  renderCitrusSummary(data);
  renderCitrusRegime(data);
  renderEquitySummary(data);
  renderEquityRegime(data);
  renderEvolutionSummary(data);
  const grapesLens = getStrategyLensData("grapes");
  const citrusLens = getStrategyLensData("citrus");
  const equityLens = getStrategyLensData("equity");
  renderMonthlySummary("grapes-monthly-summary", grapesLens?.monthly_summary, grapesLens?.summary?.win_rate_pct || 0);
  renderMonthlySummary("citrus-monthly-summary", citrusLens?.monthly_summary, citrusLens?.summary?.win_rate_pct || 0);
  renderMonthlySummary("equity-monthly-summary", equityLens?.monthly_summary, equityLens?.summary?.win_rate_pct || 0);
  syncTradeValueOptions("grapes");
  syncTradeValueOptions("citrus");
  syncTradeValueOptions("equity");
  renderTradeScopeTabs("grapes");
  renderTradeScopeTabs("citrus");
  renderTradeScopeTabs("equity");
  renderTradeValueTabs("grapes");
  renderTradeValueTabs("citrus");
  renderTradeValueTabs("equity");
  renderTradeSection("grapes", true);
  renderTradeSection("citrus", false);
  renderTradeSection("equity", false);
  renderCharts(data);
}

function getLiveOpenSymbols(data = state.data) {
  if (!data?.strategies) return [];
  const symbols = STRATEGY_KEYS.flatMap((key) =>
    (data.strategies[key]?.active_positions || []).map((row) => normalizeSymbol(row.symbol || `${row.asset || ""}USDT`))
  ).filter(Boolean);
  return Array.from(new Set(symbols)).sort();
}

function scheduleLiveMarkRender() {
  if (!state.data || state.livePrices.renderTimer) return;
  state.livePrices.renderTimer = window.setTimeout(() => {
    state.livePrices.renderTimer = null;
    renderHero(state.data);
    renderOverviewSummary(state.data);
    renderOverviewStrategyTape(state.data);
    renderGrapesSummary(state.data);
    renderCitrusSummary(state.data);
    renderEquitySummary(state.data);
    const overviewCanvas = document.getElementById("overlay-overview-canvas");
    if (overviewCanvas && overviewCanvas.offsetParent !== null) drawOverlayStrategyChart(overviewCanvas, state.data);
    const overviewRelative = document.getElementById("overview-relative-canvas");
    if (overviewRelative && overviewRelative.offsetParent !== null) {
      drawOverviewRelativeChart(overviewRelative, state.data);
      renderLegend("overview-relative-legend", OVERVIEW_STRATEGY_KEYS.map((key) => ({ label: getStrategyLabel(key), color: STRATEGY_META[key].overviewColor })));
    }
    if (state.view === "grapes") {
      const grapesCanvas = document.getElementById("grapes-detail-canvas");
      if (grapesCanvas && grapesCanvas.offsetParent !== null && (state.lenses.grapes || "backtest") === "live") {
        drawGrapesChart(grapesCanvas, state.data);
      }
    }
    if (state.view === "citrus") {
      const citrusCanvas = document.getElementById("citrus-return-canvas");
      if (citrusCanvas && citrusCanvas.offsetParent !== null && (state.lenses.citrus || "backtest") === "live") {
        drawCitrusAssetReturns(citrusCanvas, state.data);
      }
    }
    if (state.view === "equity") {
      const equityCanvas = document.getElementById("equity-return-canvas");
      if (equityCanvas && equityCanvas.offsetParent !== null && (state.lenses.equity || "backtest") === "live") {
        drawEquityAssetReturns(equityCanvas, state.data);
      }
    }
  }, 120);
}

function closeLivePriceSocket() {
  if (state.livePrices.reconnectTimer) {
    window.clearTimeout(state.livePrices.reconnectTimer);
    state.livePrices.reconnectTimer = null;
  }
  if (state.livePrices.socket) {
    state.livePrices.socket.onopen = null;
    state.livePrices.socket.onmessage = null;
    state.livePrices.socket.onerror = null;
    state.livePrices.socket.onclose = null;
    state.livePrices.socket.close();
    state.livePrices.socket = null;
  }
}

function connectLivePriceSocket() {
  const symbols = getLiveOpenSymbols();
  const currentKey = state.livePrices.subscribedSymbols.join(",");
  const nextKey = symbols.join(",");
  if (currentKey === nextKey && state.livePrices.socket) return;

  closeLivePriceSocket();
  state.livePrices.subscribedSymbols = symbols;

  if (!symbols.length) {
    state.livePrices.prices = {};
    scheduleLiveMarkRender();
    return;
  }

  const streamPath = symbols.map((symbol) => `${symbol.toLowerCase()}@miniTicker`).join("/");
  const socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streamPath}`);
  state.livePrices.socket = socket;

  socket.onopen = () => {
    state.livePrices.connected = true;
    scheduleLiveMarkRender();
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const data = payload?.data || payload;
      const symbol = normalizeSymbol(data?.s);
      const mark = Number(data?.c);
      if (!symbol || !Number.isFinite(mark) || mark <= 0) return;
      state.livePrices.prices[symbol] = mark;
      state.livePrices.pricesMeta[symbol] = { ts: Date.now() };
      state.livePrices.lastTickAt = Date.now();
      scheduleLiveMarkRender();
    } catch (error) {
      console.warn("strategy os live price parse failed", error);
    }
  };

  socket.onerror = () => {
    state.livePrices.connected = false;
    socket.close();
  };

  socket.onclose = () => {
    if (state.livePrices.socket !== socket) return;
    state.livePrices.socket = null;
    state.livePrices.connected = false;
    if (state.livePrices.reconnectTimer) window.clearTimeout(state.livePrices.reconnectTimer);
    state.livePrices.reconnectTimer = window.setTimeout(() => {
      state.livePrices.reconnectTimer = null;
      connectLivePriceSocket();
    }, 3000);
  };
}

async function init() {
  const res = await fetch(DATA_URL, { cache: "no-store" });
  const raw = await res.json();
  state.data = raw;
  state.lastUpdatedAt = raw.meta.updated_at;
  Object.keys(state.lenses).forEach((strategyKey) => {
    if (state.lenses[strategyKey] === "extended") state.lenses[strategyKey] = "backtest";
  });
  localStorage.setItem("strategy_os_lenses", JSON.stringify(state.lenses));
  bindSwitches();
  bindLanguageSwitch();
  bindLensSwitches();
  bindTradeFilters();
  render(raw);
  connectLivePriceSocket();
  setActiveView(state.view);
  window.addEventListener("resize", () => render(state.data));
  startAutoRefresh();
}

async function refreshDataSilently() {
  const url = `${DATA_URL}?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  const raw = await res.json();
  if (!state.lastUpdatedAt || raw.meta.updated_at !== state.lastUpdatedAt) {
    state.data = raw;
    state.lastUpdatedAt = raw.meta.updated_at;
    render(raw);
    connectLivePriceSocket();
  }
}

function startAutoRefresh() {
  window.setInterval(() => {
    refreshDataSilently().catch((err) => console.warn("strategy os refresh failed", err));
  }, 30000);
  if (!state.livePrices.heartbeatTimer) {
    state.livePrices.heartbeatTimer = window.setInterval(() => {
      renderHero(state.data || { meta: { updated_at: state.lastUpdatedAt || "—" } });
    }, 2000);
  }
}

init().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<div style="padding:32px;color:#fff;font-family:Inter,sans-serif">Strategy OS data load failed: ${err.message}</div>`;
});
