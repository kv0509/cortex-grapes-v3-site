const DATA_URL = "./data/strategy_os.json";

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

const state = {
  data: null,
  view: localStorage.getItem("strategy_os_view") || "all",
  lang: localStorage.getItem("strategy_os_lang") || "en",
  lastUpdatedAt: null,
  lenses: JSON.parse(localStorage.getItem("strategy_os_lenses") || '{"grapes":"backtest","citrus":"backtest"}'),
  tradeFilters: {
    grapes: { scope: "month", value: "latest" },
    citrus: { scope: "month", value: "latest" },
  },
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
    coreCompare: "Relative Quality",
    grapesSleeves: "Asset Profit Distribution",
    citrusSleeves: "Asset Profit Distribution",
    strategyDetail: "Strategy Detail",
    grapesName: "Cortex Grapes",
    grapesNote: "Trend and structure mandate designed for cleaner compounding through persistent market phases.",
    citrusName: "Cortex Citrus",
    citrusNote: "Cross-asset opportunistic mandate focused on extracting asymmetric dislocations with tighter participation quality.",
    assetOverlay: "Three-Asset Profit Overlay",
    totalPnlCurve: "Daily Total PnL",
    strategyProfile: "Strategy Profile",
    openPositions: "Open Positions",
    assetValidation: "Asset Validation",
    regimePerformance: "Regime Performance",
    monthlyHeatmap: "Monthly Performance & Heatmap",
    tradeExplorer: "Trade Explorer",
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
    trendUp: "Uptrend",
    trendDown: "Downtrend",
    rangeChop: "Range-bound",
    transition: "Transition",
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
    coreCompare: "相对质量对照",
    grapesSleeves: "资产收益分布",
    citrusSleeves: "资产收益分布",
    strategyDetail: "策略详情",
    grapesName: "Cortex Grapes",
    grapesNote: "偏趋势与结构的 mandate，目标是在更持续的市场阶段中提高复利质量。",
    citrusName: "Cortex Citrus",
    citrusNote: "偏多资产机会捕捉的 mandate，目标是在更快变化的阶段里提高参与质量与配置效率。",
    assetOverlay: "三资产收益叠图",
    totalPnlCurve: "日度累计收益",
    strategyProfile: "策略轮廓",
    openPositions: "当前未平仓仓位",
    assetValidation: "多资产验证",
    regimePerformance: "阶段表现",
    monthlyHeatmap: "月度表现与热力图",
    tradeExplorer: "交易明细",
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
    trendUp: "上涨趋势",
    trendDown: "下跌趋势",
    rangeChop: "震荡行情",
    transition: "过渡期",
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

function parseTimestamp(raw) {
  const dt = new Date(String(raw).replace(" ", "T"));
  return Number.isNaN(dt.getTime()) ? null : dt.getTime();
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
function fmtDate(ts) { return String(ts || "").slice(0, 16); }
function fmtUpdatedAt(ts) { return String(ts || "").slice(0, 16); }
function fmtBaseCapitalLabel(amount) {
  const value = fmtUsd(amount);
  return state.lang === "zh" ? `统一 ${value} base` : `${value} base capital`;
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
  setText('#master-board-hero .hero-kicker-mark', t("heroKicker"));
  setText('#master-board-hero h2', t("heroHeadline"));
  setText('#master-board-hero .hero-note', t("heroNote"));
  setText('[data-panel="all"] .panel-head .eyebrow', t("portfolioOverview"));
  setText('[data-panel="all"] .panel-head h3', t("dualBoard"));
  setText('[data-panel="all"] .panel-head .section-note', t("dualBoardNote"));
  setText('[data-panel="all"] .comparison-wrap .comparison-card:first-child h4', t("equityOverlay"));
  setText('[data-panel="all"] .comparison-wrap .comparison-card:last-child h4', t("coreCompare"));
  setText('[data-panel="all"] .sleeve-grid .panel:first-child h4', t("grapesSleeves"));
  setText('[data-panel="all"] .sleeve-grid .panel:last-child h4', t("citrusSleeves"));
  setText('[data-panel="grapes"] .panel-head .eyebrow', t("strategyDetail"));
  setText('[data-panel="grapes"] .panel-head h3', t("grapesName"));
  setText('[data-panel="grapes"] .panel-head .section-note', t("grapesNote"));
  setText('[data-panel="grapes"] .detail-grid .panel:first-child h4', t("assetOverlay"));
  setPanelTitleFromBody("grapes-summary", t("strategyProfile"));
  setPanelTitleFromBody("grapes-active-positions", t("openPositions"));
  setPanelTitleFromBody("grapes-asset-cards-detail", t("assetValidation"));
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
  setPanelTitleFromBody("citrus-regime", t("regimePerformance"));
  setPanelTitleFromBody("citrus-monthly-summary", t("monthlyHeatmap"));
  setPanelTitleFromBody("citrus-trade-meta", t("tradeExplorer"));
  const grapesScope = document.getElementById("grapes-trade-scope");
  const citrusScope = document.getElementById("citrus-trade-scope");
  [grapesScope, citrusScope].forEach((select) => {
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
  document.getElementById("updated-at").textContent = `${t("updated")} ${fmtUpdatedAt(data.meta.updated_at)}`;
  const target = document.getElementById("hero-status");
  const grapes = data.strategies.grapes;
  const citrus = data.strategies.citrus;
  target.innerHTML = `
    <article class="hero-stat">
      <div class="hero-stat-label">${state.lang === "zh" ? "Strategy Spread" : "Strategy Spread"}</div>
      <div class="hero-stat-value">${fmtPct(grapes.summary.total_return_pct)} / ${fmtPct(citrus.portfolio.total_return_pct_on_base)}</div>
      <div class="hero-stat-sub"><strong>🍇 Grapes — ${state.lang === "zh" ? "复利型引擎" : "Compounding Engine"}</strong><br/>${state.lang === "zh" ? "偏向更持续的结构行情，目标是稳定累积净值质量。" : "Built to stay with clearer structure and compound through cleaner trend conditions."}<br/><br/><strong>🍊 Citrus — ${state.lang === "zh" ? "机会型引擎" : "Opportunistic Engine"}</strong><br/>${state.lang === "zh" ? "偏向短中期错配机会，目标是提高参与质量与配置效率。" : "Built to exploit cross-asset dislocations and improve participation quality."}</div>
    </article>
    <article class="hero-stat">
      <div class="hero-stat-label">${state.lang === "zh" ? "Unified Basis" : "Unified Basis"}</div>
      <div class="hero-stat-value">${fmtUsd(2000)}</div>
      <div class="hero-stat-sub">${state.lang === "zh"
        ? "所有表现统一归一到同一资金基准。没有杠杆幻觉，没有仓位偏置，只有可比较的策略质量。"
        : "Every metric is normalized onto the same capital basis. No leverage illusion. No sizing bias. Pure strategy quality, comparable at a glance."}</div>
    </article>
    <article class="hero-stat">
      <div class="hero-stat-label">${state.lang === "zh" ? "Always Current" : "Always Current"}</div>
      <div class="hero-stat-value">${fmtUsd(grapes.summary.final_equity)} / ${fmtUsd(citrus.portfolio.final_equity)}</div>
      <div class="hero-stat-sub">${state.lang === "zh"
        ? `当前资金状态直接展示策略最新运行结果。仓位、PnL、资本占用会继续变化，这不是静态宣传页。`
        : `Current capital state is tied to the latest running snapshot. Positions change, PnL evolves, and capital reallocates. This is a live strategy website, not a frozen report.`}</div>
    </article>
  `;
}

function renderStrategyCards(data) {
  const grapes = data.strategies.grapes;
  const citrus = data.strategies.citrus;
  document.getElementById("strategy-grid").innerHTML = `
    <article class="strategy-card strategy-card-grapes">
      <div class="strategy-title">
        <div><h4>🍇 Cortex Grapes</h4><p>${state.lang === "zh" ? "趋势与结构交易引擎，目标是在更可持续的行情里稳步积累净值质量。" : "Trend and structure engine built to compound through cleaner, more persistent market phases."}</p></div>
        <span class="strategy-role">${state.lang === "zh" ? "Compounding Mandate" : "Compounding Mandate"}</span>
      </div>
      <div class="strategy-main">
        <div><div class="main-number" style="color:${COLORS.green}">${fmtPct(grapes.summary.total_return_pct)}</div><div class="kpi-sub">Total Return</div></div>
        <div><div class="main-number">${fmtUsd(grapes.summary.final_equity)}</div><div class="kpi-sub">Final Equity</div></div>
      </div>
      <div class="mini-metrics">
        <div class="mini-metric"><span>Net PnL</span><strong>${fmtUsd(grapes.summary.net_pnl_usd)}</strong></div>
        <div class="mini-metric"><span>Profit Factor</span><strong>${fmtNum(grapes.summary.profit_factor || 0)}</strong></div>
        <div class="mini-metric"><span>Trades</span><strong>${grapes.summary.trade_count}</strong></div>
        <div class="mini-metric"><span>Win Rate</span><strong>${fmtPct(grapes.summary.win_rate_pct, 1)}</strong></div>
      </div>
    </article>
    <article class="strategy-card strategy-card-citrus">
      <div class="strategy-title">
        <div><h4>🍊 Cortex Citrus</h4><p>${state.lang === "zh" ? "多资产错配机会引擎，目标是在更快的市场变化中提升参与质量与资本效率。" : "Cross-asset dislocation engine built to capture faster opportunity windows with tighter execution discipline."}</p></div>
        <span class="strategy-role">${state.lang === "zh" ? "Adaptive Mandate" : "Adaptive Mandate"}</span>
      </div>
      <div class="strategy-main">
        <div><div class="main-number" style="color:${COLORS.green}">${fmtPct(citrus.portfolio.total_return_pct_on_base)}</div><div class="kpi-sub">Total Return</div></div>
        <div><div class="main-number">${fmtUsd(citrus.portfolio.final_equity)}</div><div class="kpi-sub">Final Equity</div></div>
      </div>
      <div class="mini-metrics">
        <div class="mini-metric"><span>Net PnL</span><strong>${fmtUsd(citrus.portfolio.net_pnl_usd)}</strong></div>
        <div class="mini-metric"><span>Profit Factor</span><strong>${fmtNum(citrus.portfolio.profit_factor)}</strong></div>
        <div class="mini-metric"><span>Trades</span><strong>${citrus.portfolio.trades}</strong></div>
        <div class="mini-metric"><span>Win Rate</span><strong>${fmtPct(citrus.portfolio.win_rate_pct, 1)}</strong></div>
      </div>
    </article>`;
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
        <div><div class="main-number ${row.negative ? "neg" : ""}" style="${row.negative ? `color:${COLORS.red}` : row.highlight ? `color:${COLORS.green}` : ""}">${row.value}</div><div class="kpi-sub">${row.label}</div></div>
      </div>
    </article>`).join("");
}

function renderSnapshotCards(strategyKey, strategyLabel, viewData) {
  const target = document.getElementById(`${strategyKey}-snapshot-cards`);
  const note = document.getElementById(`${strategyKey}-lens-note`);
  if (!target || !viewData) return;
  const lens = (state.lenses[strategyKey] === "extended" ? "backtest" : state.lenses[strategyKey]) || "backtest";
  const s = viewData.summary || {};
  if (note) {
    const noteKey = lens === "live" ? "snapshotNoteLive" : "snapshotNoteBacktest";
    note.textContent = t(noteKey);
  }
  target.innerHTML = `
    <article class="snapshot-card">
      <div class="snapshot-head">
        <span class="snapshot-label">${t(
          lens === "live" ? "liveSnapshot" : "backtestSnapshot"
        )}</span>
        <strong>${strategyLabel}</strong>
      </div>
      <div class="snapshot-main">${fmtUsd(s.final_equity || 0)}</div>
      <div class="snapshot-sub">Final Equity</div>
      <div class="snapshot-metrics">
        <div><span>Total Return</span><strong>${fmtPct(s.total_return_pct || 0)}</strong></div>
        <div><span>Net PnL</span><strong>${fmtUsd(s.net_pnl_usd || 0)}</strong></div>
        <div><span>Profit Factor</span><strong>${fmtNum(s.profit_factor || 0)}</strong></div>
        <div><span>Trades</span><strong>${s.trades || 0}</strong></div>
      </div>
    </article>
  `;
}

function renderComparison(data) {
  document.getElementById("comparison-table").innerHTML = `
    <div class="comparison-row comparison-head">
      <div class="label">Metric</div>
      <div class="value value-head">Grapes</div>
      <div class="value value-head">Citrus</div>
    </div>
    ${data.comparison_rows.map((row) => `
    <div class="comparison-row">
      <div class="label">${row.label}</div>
      <div class="value">${row.grapes}</div>
      <div class="value">${row.citrus}</div>
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
  const target = document.getElementById("grapes-asset-cards");
  const detailTarget = document.getElementById("grapes-asset-cards-detail");
  const topRows = data.strategies.grapes.asset_stats || [];
  const detailRows = computeAssetValidationStats(getStrategyLensData("grapes")?.all_trades || []);
  const totalPnlForRow = (row) => row.total_pnl ?? row.totalPnl ?? row.total_pnl_usd_20;
  const avgPnlForRow = (row) => row.avg_pnl ?? row.avgPnl ?? row.avg_pnl_usd_20;
  const renderRows = (rows) => rows.map((row) => `
    <article class="asset-card">
      <h5>${row.asset}</h5>
      <div class="headline ${totalPnlForRow(row) < 0 ? "red" : ""}">${fmtUsd(totalPnlForRow(row))}</div>
      <div class="asset-stat-grid">
        <div class="asset-stat"><span>${t("trades")}</span><strong>${row.trades}</strong></div>
        <div class="asset-stat"><span>${t("winRate")}</span><strong>${fmtPct(row.win_rate_pct ?? row.winRatePct, 2)}</strong></div>
        <div class="asset-stat"><span>${t("pf")}</span><strong>${Number.isFinite(row.profit_factor ?? row.profitFactor) ? fmtNum(row.profit_factor ?? row.profitFactor, 2) : "∞"}</strong></div>
        <div class="asset-stat"><span>${t("avgPnl")}</span><strong>${fmtUsd(avgPnlForRow(row))}</strong></div>
      </div>
    </article>`).join("");
  target.innerHTML = renderRows(topRows);
  if (detailTarget) detailTarget.innerHTML = renderRows(detailRows.length ? detailRows : topRows);
}

function renderCitrusAssets(data) {
  const target = document.getElementById("citrus-asset-cards");
  const detailTarget = document.getElementById("citrus-asset-cards-detail");
  const topRows = data.strategies.citrus.assets || [];
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
      <h5>${row.asset}</h5>
      <div class="headline ${totalPnlForRow(row, useLegacy) < 0 ? "red" : ""}">${fmtUsd(totalPnlForRow(row, useLegacy))}</div>
      <div class="asset-stat-grid">
        <div class="asset-stat"><span>${t("trades")}</span><strong>${row.trades}</strong></div>
        <div class="asset-stat"><span>${t("winRate")}</span><strong>${fmtPct(winRateForRow(row, useLegacy), 2)}</strong></div>
        <div class="asset-stat"><span>${t("pf")}</span><strong>${Number.isFinite(profitFactorForRow(row, useLegacy)) ? fmtNum(profitFactorForRow(row, useLegacy), 2) : "∞"}</strong></div>
        <div class="asset-stat"><span>${t("avgPnl")}</span><strong>${fmtUsd(avgPnlForRow(row, useLegacy))}</strong></div>
      </div>
    </article>`).join("");
  target.innerHTML = renderRows(topRows, true);
  if (detailTarget) detailTarget.innerHTML = renderRows(detailRows.length ? detailRows : topRows, !detailRows.length);
}

function renderActivePositions(targetId, positions) {
  const target = document.getElementById(targetId);
  if (!target) return;
  if (!positions || !positions.length) {
    target.innerHTML = `<article class="position-card empty"><p>${t("noOpenPositions")}</p></article>`;
    return;
  }
  target.innerHTML = positions.map((row) => `
    <article class="position-card">
      <div class="position-head">
        <strong>${row.asset}</strong>
        <span class="dir-chip ${String(row.direction).toLowerCase()}">${row.direction}</span>
      </div>
      <div class="position-grid-inner">
        <div><span>${t("entryTime")}</span><strong>${fmtDate(row.entry_ts)}</strong></div>
        <div><span>${t("entryPrice")}</span><strong>${fmtNum(row.entry_price, 2)}</strong></div>
        ${row.current_price !== undefined ? `<div><span>Current Price</span><strong>${fmtNum(row.current_price, 2)}</strong></div>` : ""}
        ${row.hold_hours !== undefined ? `<div><span>${t("holdHours")}</span><strong>${row.hold_hours}h</strong></div>` : ""}
        ${row.current_pnl_pct !== undefined ? `<div><span>Current PnL</span><strong class="${Number(row.current_pnl_pct || 0) >= 0 ? "pos" : "neg"}">${fmtPct(row.current_pnl_pct || 0, 2)}</strong></div>` : ""}
        <div><span>${t("peakPnl")}</span><strong class="${Number(row.peak_pnl_pct || 0) >= 0 ? "pos" : "neg"}">${fmtPct(row.peak_pnl_pct || 0, 2)}</strong></div>
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
  const grapes = data.strategies.grapes;
  const rows = [...I18N[state.lang].grapesProfileRows];
  rows[3][2] = state.lang === "zh"
    ? `当前组合 ${fmtPct(grapes.summary.total_return_pct)}，PF ${fmtNum(grapes.summary.profit_factor || 0)}，更像一套追求长期复利质量的资产引擎。`
    : `Current return ${fmtPct(grapes.summary.total_return_pct)} with PF ${fmtNum(grapes.summary.profit_factor || 0)}. The engine leans toward cleaner compounding rather than forced activity.`;
  document.getElementById("grapes-summary").innerHTML = rows.map(([label, value, note]) => `
    <div class="stack-row narrative">
      <div class="stack-copy">
        <span class="label">${label}</span>
        <strong class="stack-title">${value}</strong>
        <p class="stack-note">${note}</p>
      </div>
    </div>`).join("");
  renderBoardCards("grapes-board-cards", [
    { title: "Final Equity", value: fmtUsd(grapes.summary.final_equity), label: fmtBaseCapitalLabel(grapes.summary.initial_equity || 0), highlight: false },
    { title: "Total Return", value: fmtPct(grapes.summary.total_return_pct), label: state.lang === "zh" ? "组合总回报" : "Total portfolio return", highlight: true },
    { title: "Max DD", value: fmtPct(grapes.summary.max_drawdown_pct), label: state.lang === "zh" ? "最大回撤" : "Maximum drawdown", negative: true },
    { title: "Sharpe", value: fmtNum(grapes.summary.sharpe), label: state.lang === "zh" ? "风险调整后收益" : "Risk-adjusted return" },
  ]);
  renderSnapshotCards("grapes", "🍇 Grapes", getStrategyLensData("grapes"));
  renderActivePositions("grapes-active-positions", getDisplayedActivePositions("grapes", grapes.active_positions || []));
}

function renderGrapesRegime(data) {
  const detail = getStrategyLensData("grapes")?.regime_snapshot?.regime_detail || [];
  const map = { TREND_UP: t("trendUp"), TREND_DOWN: t("trendDown"), RANGE_CHOP: t("rangeChop"), TRANSITION: t("transition") };
  document.getElementById("grapes-regime").innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} ${state.lang === "zh" ? "笔" : "trades"} · ${t("winRate")} ${fmtPct(row.win_rate_pct)} · ${t("totalPnl")} ${fmtUsd(row.total_pnl_usd)}</p>
    </article>`).join("");
}

function renderCitrusSummary(data) {
  const p = data.strategies.citrus.portfolio;
  const rows = [...I18N[state.lang].citrusProfileRows];
  rows[3][2] = state.lang === "zh"
    ? `当前组合 ${fmtPct(p.total_return_pct_on_base)}，Sharpe ${fmtNum(p.sharpe || 0)}，胜率 ${fmtPct(p.win_rate_pct, 1)}，更像一套持续打磨执行质量的资产组合。`
    : `Current return ${fmtPct(p.total_return_pct_on_base)} with Sharpe ${fmtNum(p.sharpe || 0)} and win rate ${fmtPct(p.win_rate_pct, 1)}. The focus stays on cleaner participation and adaptive opportunity capture.`;
  document.getElementById("citrus-summary").innerHTML = rows.map(([label, value, note]) => `
    <div class="stack-row narrative">
      <div class="stack-copy">
        <span class="label">${label}</span>
        <strong class="stack-title">${value}</strong>
        <p class="stack-note">${note}</p>
      </div>
    </div>`).join("");
  renderBoardCards("citrus-board-cards", [
    { title: "Final Equity", value: fmtUsd(p.final_equity), label: fmtBaseCapitalLabel(data.strategies.citrus.normalization?.synthetic_base_equity_usd || 0) },
    { title: "Total Return", value: fmtPct(p.total_return_pct_on_base), label: state.lang === "zh" ? "组合总回报" : "Total portfolio return", highlight: true },
    { title: "Max DD", value: fmtPct(p.max_dd_pct || 0), label: state.lang === "zh" ? "最大回撤" : "Maximum drawdown", negative: true },
    { title: "Sharpe", value: fmtNum(p.sharpe || 0), label: state.lang === "zh" ? "风险调整后收益" : "Risk-adjusted return" },
  ]);
  renderSnapshotCards("citrus", "🍊 Citrus", getStrategyLensData("citrus"));
  renderActivePositions("citrus-active-positions", getDisplayedActivePositions("citrus", data.strategies.citrus.active_positions || []));
}

function renderCitrusRegime(data) {
  const detail = getStrategyLensData("citrus")?.regime_snapshot?.regime_detail || [];
  const map = { TREND_UP: t("trendUp"), TREND_DOWN: t("trendDown"), RANGE_CHOP: t("rangeChop"), TRANSITION: t("transition") };
  const target = document.getElementById("citrus-regime");
  if (!target) return;
  target.innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} ${state.lang === "zh" ? "笔" : "trades"} · ${t("winRate")} ${fmtPct(row.win_rate_pct)} · ${t("totalPnl")} ${fmtUsd(row.total_pnl_usd)}</p>
    </article>`).join("");
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
  const text = String(rawTs || "");
  if (!text) return "";
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  const datePart = text.slice(0, 10);
  if (spanMs <= 180 * 24 * 3600 * 1000) return datePart.slice(5);
  return datePart.replace(/-/g, ".");
}

function parseSeriesDate(rawTs) {
  const text = String(rawTs || "");
  if (!text) return null;
  const normalized = text.length === 7 ? `${text}-01T00:00:00` : text.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getVisibleSeriesStartDate(series) {
  const parsed = series.map((row) => parseSeriesDate(row.ts)).filter(Boolean);
  if (!parsed.length) return null;
  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / (24 * 3600 * 1000)));
  if (spanDays < 365) return first;
  const startOfYear = new Date(`${first.getFullYear()}-01-01T00:00:00`);
  return first.getTime() > startOfYear.getTime()
    ? new Date(`${first.getFullYear() + 1}-01-01T00:00:00`)
    : startOfYear;
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

function drawSignedPnlAreaAndLine(ctx, points, values) {
  const segments = buildSignedPnlSegments(points, values) || [];
  segments.forEach((segment) => {
    const baselineY = segment.points[0]?.baselineY ?? points[0]?.baselineY ?? 0;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(segment.points[0].x, baselineY);
    segment.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(segment.points[segment.points.length - 1].x, baselineY);
    ctx.closePath();
    const area = ctx.createLinearGradient(0, Math.min(...segment.points.map((point) => point.y)), 0, Math.max(...segment.points.map((point) => point.y)));
    if (segment.color === COLORS.red) {
      area.addColorStop(0, "rgba(224,109,109,0.10)");
      area.addColorStop(1, "rgba(224,109,109,0.28)");
    } else {
      area.addColorStop(0, "rgba(51,209,122,0.26)");
      area.addColorStop(1, "rgba(51,209,122,0.06)");
    }
    ctx.fillStyle = area;
    ctx.fill();
    ctx.restore();
  });

  segments.forEach((segment) => drawSmoothLine(ctx, segment.points, segment.color, false));
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

function toPoints(series, valueKey, width, height, m, minOverride = null, maxOverride = null) {
  const vals = series.map((row) => Number(row[valueKey])).filter(Number.isFinite);
  const scale = buildNiceScale(vals);
  const min = minOverride ?? scale.min;
  const max = maxOverride ?? scale.max;
  const zeroNormalized = (0 - min) / Math.max(1e-9, max - min);
  const baselineY = zeroNormalized >= 0 && zeroNormalized <= 1
    ? height - m.bottom - zeroNormalized * (height - m.top - m.bottom)
    : height - m.bottom;
  return series.map((row) => {
    const x = getXPositionForSeriesPoint(series, series.indexOf(row), width, m);
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
  const grapesSeries = data.strategies.grapes.equity_curve || [];
  const citrusSeries = data.strategies.citrus.portfolio_curve || [];
  if (!grapesSeries.length || !citrusSeries.length) return;
  const grapesBase = Number(grapesSeries[0]?.equity || 0);
  const citrusBase = Number(citrusSeries[0]?.equity || 0);
  const grapesPnl = grapesSeries.map((row) => ({ ts: row.ts, pnl: Math.max(0, Number(row.equity || 0) - grapesBase) }));
  const citrusPnl = citrusSeries.map((row) => ({ ts: row.ts, pnl: Math.max(0, Number(row.equity || 0) - citrusBase) }));
  const scale = buildZeroBasedNiceScale([
    ...grapesPnl.map((row) => Number(row.pnl)),
    ...citrusPnl.map((row) => Number(row.pnl)),
  ]);
  const xTicks = buildCalendarXAxisTicks(grapesPnl, width, m);
  drawAxes(ctx, width, height, m, scale.ticks, xTicks);
  const grapesPoints = toPoints(grapesPnl, "pnl", width, height, m, scale.min, scale.max);
  const citrusPoints = toPoints(citrusPnl, "pnl", width, height, m, scale.min, scale.max);
  drawSmoothLine(ctx, grapesPoints, COLORS.green, true);
  drawSmoothLine(ctx, citrusPoints, COLORS.blue, false);
  drawFixedAxisLabels(ctx, width, height, m, scale.ticks, grapesPnl, () => xTicks);
}

function drawAssetOverlayChart(canvas, assetCurves) {
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const m = { top: 20, right: 28, bottom: 58, left: 92 };
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

function drawGrapesChart(canvas, data) {
  const lens = state.lenses.grapes || "backtest";
  const view = getStrategyLensData("grapes");
  if (lens === "live") {
    drawDailyPnlChart(canvas, view?.all_trades || []);
    return "single";
  }
  drawAssetOverlayChart(canvas, view?.asset_curves || data.strategies.grapes.asset_curves || {});
  return "overlay";
}

function drawCitrusAssetReturns(canvas, data) {
  const lens = state.lenses.citrus || "backtest";
  const view = getStrategyLensData("citrus");
  if (lens === "live") {
    drawDailyPnlChart(canvas, view?.all_trades || []);
    return "single";
  }
  drawAssetOverlayChart(canvas, view?.asset_curves || data.strategies.citrus.asset_curves || {});
  return "overlay";
}

function renderTradeMeta(targetId, trades) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const wins = trades.filter((trade) => Number(trade.net_pnl_usd) > 0).length;
  const losses = trades.filter((trade) => Number(trade.net_pnl_usd) <= 0).length;
  const total = trades.reduce((sum, trade) => sum + Number(trade.net_pnl_usd || 0), 0);
  target.innerHTML = `
    <span><strong>${trades.length}</strong> ${t("currentFilteredTrades")}</span>
    <span><strong>${wins}</strong> ${t("wins")}</span>
    <span><strong>${losses}</strong> ${t("losses")}</span>
    <span><strong>${fmtUsd(total)}</strong> ${t("totalPnl")}</span>
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
        <td class="mono">${trade.entry_ts}</td>
        <td class="mono">${trade.exit_ts}</td>
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
    const entryPx = Number(trade.entry_price || 0);
    const exitPx = Number(trade.exit_price || 0);
    const movePct = entryPx > 0
      ? (((exitPx - entryPx) / entryPx) * (isShort ? -100 : 100))
      : 0;
    return `
      <article class="trade-card">
        <div class="trade-card-head">
          <div class="trade-card-title">
            <strong>${trade.asset}</strong>
            <span class="dir-chip ${String(sideLabel).toLowerCase()} ${sideClass}">${sideLabel}</span>
          </div>
          <strong class="${pnl >= 0 ? "pos" : "neg"}">${fmtUsd(pnl)}</strong>
        </div>
        <div class="trade-card-meta">
          <div><span>${t("holdHours")}</span><strong>${trade.hold_hours}h</strong></div>
          <div><span>${t("entry")}</span><strong class="mono">${trade.entry_ts}</strong></div>
          <div><span>${t("exit")}</span><strong class="mono">${trade.exit_ts}</strong></div>
          <div><span>Entry Px</span><strong class="mono">${fmtNum(trade.entry_price, 2)}</strong></div>
          <div><span>Exit Px</span><strong class="mono">${fmtNum(trade.exit_price, 2)}</strong></div>
          <div><span>${t("side")}</span><strong class="${sideClass}">${sideLabel}</strong></div>
          <div><span>Move</span><strong class="${movePct >= 0 ? "pos" : "neg"}">${fmtPct(movePct, 2)}</strong></div>
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
  const pad = { top: 16, right: 12, bottom: 28, left: 42 };
  const rows = years.length;
  const cols = 12;
  const cellW = (width - pad.left - pad.right) / cols;
  const cellH = (height - pad.top - pad.bottom) / rows;
  const all = years.flatMap((row) => row.months || []);
  const maxAbs = Math.max(...all.map((m) => Math.abs(Number(m.return_pct || 0))), 1);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  ctx.font = `11px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || 'IBM Plex Mono'}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  years.forEach((yearRow, r) => {
    const y = pad.top + r * cellH;
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = "right";
    ctx.fillText(String(yearRow.year), pad.left - 10, y + cellH / 2);
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
        ctx.fillText(`${v > 0 ? "+" : ""}${v.toFixed(0)}%`, x + cellW / 2, y + cellH / 2 - 8);
        ctx.fillStyle = COLORS.muted;
        ctx.font = `10px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || 'IBM Plex Mono'}`;
        ctx.fillText(fmtUsd(data.net_pnl), x + cellW / 2, y + cellH / 2 + 8);
        ctx.font = `11px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || 'IBM Plex Mono'}`;
      }
    }
  });

  ctx.fillStyle = COLORS.muted;
  years[years.length - 1] && months.forEach((label, i) => {
    const x = pad.left + i * cellW + cellW / 2;
    ctx.fillText(label, x, height - 12);
  });
}

function renderMonthlySummary(targetId, monthlySummary, winRate) {
  const target = document.getElementById(targetId);
  if (!target || !monthlySummary) return;
  target.innerHTML = `
    <span><strong>${monthlySummary.profitable_months}</strong> ${t("profitableMonths")}</span>
    <span><strong>${monthlySummary.losing_months}</strong> ${t("losingMonths")}</span>
    <span><strong>${fmtPct(winRate, 1)}</strong> ${t("winRate")}</span>
    <span><strong>${monthlySummary.best_month?.label || "—"}</strong> ${t("bestMonth")}</span>
  `;
}

function renderCharts(data) {
  const overview = document.getElementById("overlay-overview-canvas");
  if (overview && overview.offsetParent !== null) {
    drawOverlayStrategyChart(overview, data);
    renderLegend("overview-legend", [
      { label: "Grapes", color: COLORS.green },
      { label: "Citrus", color: COLORS.blue },
    ]);
  }

  const grapesDetail = document.getElementById("grapes-detail-canvas");
  if (grapesDetail && grapesDetail.offsetParent !== null) {
    const mode = drawGrapesChart(grapesDetail, data);
    const title = document.querySelector('[data-panel="grapes"] .detail-grid .panel:first-child h4');
    if (title) title.textContent = mode === "single" ? t("totalPnlCurve") : t("assetOverlay");
    renderLegend("grapes-legend", mode === "single"
      ? [{ label: "Total PnL", color: COLORS.green }]
      : [
        { label: "BTC", color: COLORS.green },
        { label: "ETH", color: COLORS.blue },
        { label: "SOL", color: COLORS.amber },
      ]);
  }

  const citrusDetail = document.getElementById("citrus-return-canvas");
  if (citrusDetail && citrusDetail.offsetParent !== null) {
    const mode = drawCitrusAssetReturns(citrusDetail, data);
    const title = document.querySelector('[data-panel="citrus"] .detail-grid .panel:first-child h4');
    if (title) title.textContent = mode === "single" ? t("totalPnlCurve") : t("assetOverlay");
    renderLegend("citrus-legend", mode === "single"
      ? [{ label: "Total PnL", color: COLORS.green }]
      : [
        { label: "BTC", color: COLORS.green },
        { label: "ETH", color: COLORS.blue },
        { label: "SOL", color: COLORS.amber },
      ]);
  }

  const grapesHeatmap = document.getElementById("grapes-heatmap-canvas");
  if (grapesHeatmap && grapesHeatmap.offsetParent !== null) drawMonthlyHeatmap(grapesHeatmap, getStrategyLensData("grapes")?.monthly_heatmap || data.strategies.grapes.monthly_heatmap);

  const citrusHeatmap = document.getElementById("citrus-heatmap-canvas");
  if (citrusHeatmap && citrusHeatmap.offsetParent !== null) drawMonthlyHeatmap(citrusHeatmap, getStrategyLensData("citrus")?.monthly_heatmap || data.strategies.citrus.monthly_heatmap);
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
  ["grapes", "citrus"].forEach((strategyKey) => {
    const scopeSelect = document.getElementById(`${strategyKey}-trade-scope`);
    const valueSelect = document.getElementById(`${strategyKey}-trade-value`);
    if (!scopeSelect || !valueSelect) return;
    scopeSelect.addEventListener("change", () => {
      syncTradeValueOptions(strategyKey);
      renderTradeSection(strategyKey, strategyKey === "grapes");
    });
    valueSelect.addEventListener("change", () => {
      state.tradeFilters[strategyKey].value = valueSelect.value;
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
  renderStrategyCards(data);
  renderComparison(data);
  renderGrapesAssets(data);
  renderCitrusAssets(data);
  renderGrapesSummary(data);
  renderGrapesRegime(data);
  renderCitrusSummary(data);
  renderCitrusRegime(data);
  const grapesLens = getStrategyLensData("grapes");
  const citrusLens = getStrategyLensData("citrus");
  renderMonthlySummary("grapes-monthly-summary", grapesLens?.monthly_summary, grapesLens?.summary?.win_rate_pct || 0);
  renderMonthlySummary("citrus-monthly-summary", citrusLens?.monthly_summary, citrusLens?.summary?.win_rate_pct || 0);
  syncTradeValueOptions("grapes");
  syncTradeValueOptions("citrus");
  renderTradeSection("grapes", true);
  renderTradeSection("citrus", false);
  renderCharts(data);
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
  }
}

function startAutoRefresh() {
  window.setInterval(() => {
    refreshDataSilently().catch((err) => console.warn("strategy os refresh failed", err));
  }, 30000);
}

init().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<div style="padding:32px;color:#fff;font-family:Inter,sans-serif">Strategy OS data load failed: ${err.message}</div>`;
});
