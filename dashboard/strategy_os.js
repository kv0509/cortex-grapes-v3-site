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
    heroNote: "Two engines do not sit side by side. They compete for capital. Money does not listen to stories. It flows toward the stronger engine. NTS Alpha Lab turns strategies into a system with one capital basis, one risk language, and one execution standard.",
    dualBoard: "Dual-Strategy Command Board",
    equityOverlay: "🍇 / 🍊 Equity Overlay",
    coreCompare: "Core Metrics Side by Side",
    grapesSleeves: "🍇 Asset Profit Distribution",
    citrusSleeves: "🍊 Asset Profit Distribution",
    assetOverlay: "Three-Asset Profit Overlay",
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
    extended: "Extended",
    live: "Live",
    snapshotNoteBacktest: "Showing research validation and historical results.",
    snapshotNoteExtended: "Showing validated backtest with post-backtest live extension appended.",
    snapshotNoteLive: "Showing live execution and current strategy ledger.",
    backtestSnapshot: "Backtest Snapshot",
    extendedSnapshot: "Backtest + Live Extension",
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
    heroNote: "两套策略不是并列展示，而是在竞争资本配置权。资金不会听故事，只会流向更强的那一边。NTS Alpha Lab 把策略变成一个统一资金口径、统一风险语言、统一执行标准的系统。",
    dualBoard: "双策略主控板",
    equityOverlay: "🍇 / 🍊 组合收益曲线",
    coreCompare: "核心指标对照",
    grapesSleeves: "🍇 资产收益分布",
    citrusSleeves: "🍊 资产收益分布",
    assetOverlay: "三资产收益叠图",
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
    extended: "延伸",
    live: "实盘",
    snapshotNoteBacktest: "当前显示研究验证与历史结果。",
    snapshotNoteExtended: "当前显示回测结果，并追加回测结束后的实盘延伸。",
    snapshotNoteLive: "当前显示实盘执行与当前账本。",
    backtestSnapshot: "回测结果",
    extendedSnapshot: "回测 + 实盘延伸",
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
  const lens = state.lenses[strategyKey] || "backtest";
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
  setText('.switch-tab[data-view="all"]', state.lang === "zh" ? "总览" : "Overview");
  setText('#master-board-hero .hero-note', t("heroNote"));
  setText('[data-panel="all"] .panel-head h3', t("dualBoard"));
  setText('[data-panel="all"] .comparison-wrap .comparison-card:first-child h4', t("equityOverlay"));
  setText('[data-panel="all"] .comparison-wrap .comparison-card:last-child h4', t("coreCompare"));
  setText('[data-panel="all"] .sleeve-grid .panel:first-child h4', t("grapesSleeves"));
  setText('[data-panel="all"] .sleeve-grid .panel:last-child h4', t("citrusSleeves"));
  setText('[data-panel="grapes"] .detail-grid .panel:first-child h4', t("assetOverlay"));
  setText('[data-panel="grapes"] .detail-grid .panel:last-child h4', t("strategyProfile"));
  setText('[data-panel="grapes"] .panel.subsection:nth-of-type(2) h4', t("openPositions"));
  setText('[data-panel="grapes"] .panel.subsection:nth-of-type(3) h4', t("assetValidation"));
  setText('[data-panel="grapes"] .panel.subsection:nth-of-type(4) h4', t("regimePerformance"));
  setText('[data-panel="grapes"] .panel.subsection:nth-of-type(5) h4', t("monthlyHeatmap"));
  setText('[data-panel="grapes"] .panel.subsection:nth-of-type(6) h4', t("tradeExplorer"));
  setText('[data-panel="citrus"] .detail-grid .panel:first-child h4', t("assetOverlay"));
  setText('[data-panel="citrus"] .detail-grid .panel:last-child h4', t("strategyProfile"));
  setText('[data-panel="citrus"] .panel.subsection:nth-of-type(2) h4', t("openPositions"));
  setText('[data-panel="citrus"] .panel.subsection:nth-of-type(3) h4', t("assetValidation"));
  setText('[data-panel="citrus"] .panel.subsection:nth-of-type(4) h4', t("regimePerformance"));
  setText('[data-panel="citrus"] .panel.subsection:nth-of-type(5) h4', t("monthlyHeatmap"));
  setText('[data-panel="citrus"] .panel.subsection:nth-of-type(6) h4', t("tradeExplorer"));
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
      <div class="hero-stat-label">Two Engines</div>
      <div class="hero-stat-value">${fmtPct(grapes.summary.total_return_pct)} / ${fmtPct(citrus.portfolio.total_return_pct_on_base)}</div>
      <div class="hero-stat-sub"><strong>🍇 Grapes — The Compounding Engine</strong><br/>Built to survive regimes and extract structured trend alpha.<br/><br/><strong>🍊 Citrus — The Opportunistic Engine</strong><br/>Built to exploit dislocations, flow imbalances, and short-term inefficiencies.<br/><br/>One compounds. One adapts. Together, they capture what single strategies miss.</div>
    </article>
    <article class="hero-stat">
      <div class="hero-stat-label">Unified Basis</div>
      <div class="hero-stat-value">${fmtUsd(2000)}</div>
      <div class="hero-stat-sub">Every metric normalized.<br/>No leverage tricks. No sizing bias.<br/><br/>Pure strategy performance, comparable at a glance.</div>
    </article>
    <article class="hero-stat">
      <div class="hero-stat-label">Always Current</div>
      <div class="hero-stat-value">${fmtUsd(grapes.summary.final_equity)} / ${fmtUsd(citrus.portfolio.final_equity)}</div>
      <div class="hero-stat-sub">Live Capital State — ${fmtUsd(grapes.summary.final_equity)} / ${fmtUsd(citrus.portfolio.final_equity)}<br/><br/>No static reports. No outdated snapshots.<br/><br/>Positions update. PnL evolves. Capital shifts.<br/><br/>What you see is what is running — now.</div>
    </article>
  `;
}

function renderStrategyCards(data) {
  const grapes = data.strategies.grapes;
  const citrus = data.strategies.citrus;
  document.getElementById("strategy-grid").innerHTML = `
    <article class="strategy-card">
      <div class="strategy-title">
        <div><h4>🍇 Cortex Grapes</h4><p>${state.lang === "zh" ? "趋势与均值回归并行，强调趋势段的质量和风控后的留存收益。" : "Built to compound through structure, survive regime shifts, and keep capital working in cleaner trend conditions."}</p></div>
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
    <article class="strategy-card">
      <div class="strategy-title">
        <div><h4>🍊 Cortex Citrus</h4><p>${state.lang === "zh" ? "多资产执行组合，核心目标是减少假动作里的低质量进出，让收益结构更干净。" : "Built to capture faster dislocations across assets and improve execution quality where shorter-term opportunities appear."}</p></div>
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
  const lens = state.lenses[strategyKey] || "backtest";
  const s = viewData.summary || {};
  if (note) {
    const noteKey = lens === "live"
      ? "snapshotNoteLive"
      : lens === "extended"
        ? "snapshotNoteExtended"
        : "snapshotNoteBacktest";
    note.textContent = t(noteKey);
  }
  target.innerHTML = `
    <article class="snapshot-card">
      <div class="snapshot-head">
        <span class="snapshot-label">${t(
          lens === "live"
            ? "liveSnapshot"
            : lens === "extended"
              ? "extendedSnapshot"
              : "backtestSnapshot"
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
  const renderRows = (rows) => rows.map((row) => `
    <article class="asset-card">
      <h5>${row.asset}</h5>
      <div class="headline ${(row.total_pnl ?? row.totalPnl) < 0 ? "red" : ""}">${fmtUsd(row.total_pnl ?? row.totalPnl)}</div>
      <div class="asset-stat-grid">
        <div class="asset-stat"><span>Trades</span><strong>${row.trades}</strong></div>
        <div class="asset-stat"><span>Win Rate</span><strong>${fmtPct(row.win_rate_pct ?? row.winRatePct, 2)}</strong></div>
        <div class="asset-stat"><span>PF</span><strong>${Number.isFinite(row.profit_factor ?? row.profitFactor) ? fmtNum(row.profit_factor ?? row.profitFactor) : "∞"}</strong></div>
        <div class="asset-stat"><span>Avg PnL</span><strong>${fmtUsd(row.avg_pnl ?? row.avgPnl)}</strong></div>
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
  const renderRows = (rows, useLegacy = false) => rows.map((row) => `
    <article class="asset-card">
      <h5>${row.asset}</h5>
      <div class="headline ${(useLegacy ? row.total_pnl_usd_20 : row.totalPnl) < 0 ? "red" : ""}">${fmtUsd(useLegacy ? row.total_pnl_usd_20 : row.totalPnl)}</div>
      <div class="asset-stat-grid">
        <div class="asset-stat"><span>Trades</span><strong>${row.trades}</strong></div>
        <div class="asset-stat"><span>Win Rate</span><strong>${fmtPct(useLegacy ? row.win_rate_pct : row.winRatePct, useLegacy ? 1 : 2)}</strong></div>
        <div class="asset-stat"><span>PF</span><strong>${useLegacy ? fmtNum(row.sharpe ?? 0, 3) : (Number.isFinite(row.profitFactor) ? fmtNum(row.profitFactor) : "∞")}</strong></div>
        <div class="asset-stat"><span>${useLegacy ? "ROI" : "Avg PnL"}</span><strong>${useLegacy ? fmtPct(row.total_return_pct, 2) : fmtUsd(row.avgPnl)}</strong></div>
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
        <div><span>${t("entryPrice")}</span><strong>${fmtNum(row.entry_price, 4)}</strong></div>
        ${row.hold_hours !== undefined ? `<div><span>${t("holdHours")}</span><strong>${row.hold_hours}h</strong></div>` : ""}
        <div><span>${t("peakPnl")}</span><strong class="${Number(row.peak_pnl_pct || 0) >= 0 ? "pos" : "neg"}">${fmtPct(row.peak_pnl_pct || 0, 2)}</strong></div>
      </div>
    </article>`).join("");
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
  renderActivePositions("grapes-active-positions", grapes.active_positions || []);
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
  renderActivePositions("citrus-active-positions", data.strategies.citrus.active_positions || []);
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

function drawAxes(ctx, width, height, m) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const chartW = width - m.left - m.right;
  const chartH = height - m.top - m.bottom;
  for (let i = 0; i < 5; i += 1) {
    const y = m.top + chartH * (i / 4);
    ctx.beginPath(); ctx.moveTo(m.left, y); ctx.lineTo(width - m.right, y); ctx.stroke();
  }
  for (let i = 0; i < 4; i += 1) {
    const x = m.left + chartW * (i / 3);
    ctx.beginPath(); ctx.moveTo(x, m.top); ctx.lineTo(x, height - m.bottom); ctx.stroke();
  }
}

function drawAxisLabels(ctx, width, height, m, min, max, series) {
  ctx.save();
  ctx.fillStyle = COLORS.muted;
  ctx.font = `11px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || "IBM Plex Mono"}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 5; i += 1) {
    const y = m.top + (height - m.top - m.bottom) * (i / 4);
    const value = max - ((max - min) * (i / 4));
    ctx.fillText(fmtUsd(value), m.left - 8, y);
  }
  const rawLabels = [series[0]?.ts, series[Math.floor(series.length / 2)]?.ts, series[series.length - 1]?.ts].filter(Boolean);
  const xs = [m.left, (m.left + width - m.right) / 2, width - m.right];
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  rawLabels.forEach((label, idx) => {
    ctx.fillText(String(label).slice(0, 7).replace("-", "."), xs[idx], height - m.bottom + 6);
  });
  ctx.restore();
}

function drawSmoothLine(ctx, points, color, fill = false) {
  if (points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width / (window.devicePixelRatio || 1), ctx.canvas.height / (window.devicePixelRatio || 1));
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length <= 6) {
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  } else {
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) * 0.12;
      const cp1y = p1.y + (p2.y - p0.y) * 0.12;
      const cp2x = p2.x - (p3.x - p1.x) * 0.12;
      const cp2y = p2.y - (p3.y - p1.y) * 0.12;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }
  ctx.stroke();
  if (fill) {
    const last = points[points.length - 1];
    const first = points[0];
    const bottom = ctx.canvas.height / (window.devicePixelRatio || 1) - 28;
    ctx.lineTo(last.x, bottom);
    ctx.lineTo(first.x, bottom);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 34, 0, bottom);
    grad.addColorStop(0, "rgba(51,209,122,0.18)");
    grad.addColorStop(1, "rgba(51,209,122,0)");
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
}

function toPoints(series, valueKey, width, height, m, minOverride = null, maxOverride = null) {
  const vals = series.map((row) => Number(row[valueKey])).filter(Number.isFinite);
  const min = minOverride ?? Math.min(...vals);
  const max = maxOverride ?? Math.max(...vals);
  const start = parseTimestamp(series[0].ts);
  const end = parseTimestamp(series[series.length - 1].ts);
  const range = Math.max(1, end - start);
  return series.map((row) => {
    const ts = parseTimestamp(row.ts);
    const x = m.left + ((ts - start) / range) * (width - m.left - m.right);
    const normalized = (Number(row[valueKey]) - min) / Math.max(1e-9, max - min);
    const y = height - m.bottom - normalized * (height - m.top - m.bottom);
    return { x, y };
  });
}

function drawDualCurveChart(canvas, leftSeries, leftKey, rightSeries, rightKey, leftColor, rightColor) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const m = { top: 24, right: 32, bottom: 42, left: 68 };
  ctx.clearRect(0, 0, width, height);
  const leftVals = leftSeries.map((row) => Number(row[leftKey])).filter(Number.isFinite);
  const rightVals = rightSeries.map((row) => Number(row[rightKey])).filter(Number.isFinite);
  const leftMin = Math.min(...leftVals);
  const leftMax = Math.max(...leftVals);
  const rightMin = Math.min(...rightVals);
  const rightMax = Math.max(...rightVals);
  drawAxes(ctx, width, height, m);
  const leftPoints = toPoints(leftSeries, leftKey, width, height, m, leftMin, leftMax);
  const rightPoints = toPoints(rightSeries, rightKey, width, height, m, rightMin, rightMax);
  drawSmoothLine(ctx, leftPoints, leftColor, true);
  drawSmoothLine(ctx, rightPoints, rightColor, false);
  drawAxisLabels(ctx, width, height, m, leftMin, leftMax, leftSeries);
}

function drawOverlayStrategyChart(canvas, data) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const m = { top: 24, right: 32, bottom: 42, left: 68 };
  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, width, height, m);
  const grapesSeries = data.strategies.grapes.equity_curve || [];
  const citrusSeries = data.strategies.citrus.portfolio_curve || [];
  if (!grapesSeries.length || !citrusSeries.length) return;
  const vals = [
    ...grapesSeries.map((row) => Number(row.equity)).filter(Number.isFinite),
    ...citrusSeries.map((row) => Number(row.equity)).filter(Number.isFinite),
  ];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const grapesPoints = toPoints(grapesSeries, "equity", width, height, m, min, max);
  const citrusPoints = toPoints(citrusSeries, "equity", width, height, m, min, max);
  drawSmoothLine(ctx, grapesPoints, COLORS.green, true);
  drawSmoothLine(ctx, citrusPoints, COLORS.blue, false);
  drawAxisLabels(ctx, width, height, m, min, max, grapesSeries);
}

function drawAssetOverlayChart(canvas, assetCurves) {
  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const m = { top: 24, right: 42, bottom: 50, left: 78 };
  const entries = Object.entries(assetCurves || {}).filter(([, series]) => Array.isArray(series) && series.length);
  if (!entries.length) return;
  const allVals = entries.flatMap(([, series]) => series.map((row) => Number(row.pnl)).filter(Number.isFinite));
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  drawAxes(ctx, width, height, m);
  const palette = { BTC: COLORS.green, ETH: COLORS.blue, SOL: COLORS.amber };
  entries.forEach(([asset, series], idx) => {
    const points = toPoints(series, "pnl", width, height, m, min, max);
    drawSmoothLine(ctx, points, palette[asset] || COLORS.text, idx === 0);
  });
  drawAxisLabels(ctx, width, height, m, min, max, entries[0][1]);
}

function drawGrapesChart(canvas, data) {
  drawAssetOverlayChart(canvas, getStrategyLensData("grapes")?.asset_curves || data.strategies.grapes.asset_curves || {});
}

function drawCitrusAssetReturns(canvas, data) {
  drawAssetOverlayChart(canvas, getStrategyLensData("citrus")?.asset_curves || data.strategies.citrus.asset_curves || {});
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
    return `
      <tr>
        <td class="mono">${trade.asset}</td>
        <td class="mono ${sideClass}">${sideLabel}</td>
        <td class="mono">${trade.entry_ts}</td>
        <td class="mono">${trade.exit_ts}</td>
        <td class="mono">${fmtNum(trade.entry_price, 4)}</td>
        <td class="mono">${fmtNum(trade.exit_price, 4)}</td>
        <td class="mono">${trade.hold_hours}h</td>
        <td class="mono ${pnl >= 0 ? "pos" : "neg"}">${fmtUsd(pnl)}</td>
        <td class="mono ${pnl >= 0 ? "pos" : "neg"}">${fmtPct(trade.roi_pct_on_margin, 2)}</td>
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
          <div><span>Entry Px</span><strong class="mono">${fmtNum(trade.entry_price, 4)}</strong></div>
          <div><span>Exit Px</span><strong class="mono">${fmtNum(trade.exit_price, 4)}</strong></div>
          <div><span>${t("side")}</span><strong class="${sideClass}">${sideLabel}</strong></div>
          <div><span>ROI</span><strong class="${pnl >= 0 ? "pos" : "neg"}">${fmtPct(trade.roi_pct_on_margin, 2)}</strong></div>
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
    drawGrapesChart(grapesDetail, data);
    renderLegend("grapes-legend", [
      { label: "BTC", color: COLORS.green },
      { label: "ETH", color: COLORS.blue },
      { label: "SOL", color: COLORS.amber },
    ]);
  }

  const citrusDetail = document.getElementById("citrus-return-canvas");
  if (citrusDetail && citrusDetail.offsetParent !== null) {
    drawCitrusAssetReturns(citrusDetail, data);
    renderLegend("citrus-legend", [
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
      state.lenses[strategy] = lens;
      localStorage.setItem("strategy_os_lenses", JSON.stringify(state.lenses));
      document.querySelectorAll(`.subview-tab[data-strategy="${strategy}"]`).forEach((el) => {
        el.classList.toggle("active", el.dataset.lens === lens);
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
