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
  view: "all",
  lastUpdatedAt: null,
  tradeFilters: {
    grapes: { scope: "month", value: "latest" },
    citrus: { scope: "month", value: "latest" },
  },
};

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

function setActiveView(view) {
  state.view = view;
  document.querySelectorAll(".switch-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === view));
  const hero = document.getElementById("master-board-hero");
  if (hero) hero.style.display = view === "all" ? "grid" : "none";
  if (state.data) {
    requestAnimationFrame(() => renderCharts(state.data));
  }
}

function renderHero(data) {
  document.getElementById("updated-at").textContent = `Updated ${String(data.meta.updated_at).slice(0, 16)}`;
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
        <div><h4>🍇 Cortex Grapes</h4><p>趋势与均值回归并行，强调趋势段的质量和风控后的留存收益。</p></div>
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
        <div><h4>🍊 Cortex Citrus</h4><p>多资产执行组合，核心目标是减少假动作里的低质量进出，让收益结构更干净。</p></div>
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
  const markup = data.strategies.grapes.asset_stats.map((row) => `
    <article class="asset-card">
      <h5>${row.asset}</h5>
      <div class="headline ${row.total_pnl < 0 ? "red" : ""}">${fmtUsd(row.total_pnl)}</div>
      <div class="asset-stat-grid">
        <div class="asset-stat"><span>Trades</span><strong>${row.trades}</strong></div>
        <div class="asset-stat"><span>Win Rate</span><strong>${fmtPct(row.win_rate_pct, 2)}</strong></div>
        <div class="asset-stat"><span>PF</span><strong>${fmtNum(row.profit_factor)}</strong></div>
        <div class="asset-stat"><span>Avg PnL</span><strong>${fmtUsd(row.avg_pnl)}</strong></div>
      </div>
    </article>`).join("");
  target.innerHTML = markup;
  if (detailTarget) detailTarget.innerHTML = markup;
}

function renderCitrusAssets(data) {
  const target = document.getElementById("citrus-asset-cards");
  const detailTarget = document.getElementById("citrus-asset-cards-detail");
  const markup = data.strategies.citrus.assets.map((row) => `
    <article class="asset-card">
      <h5>${row.asset}</h5>
      <div class="headline ${row.total_pnl_usd_20 < 0 ? "red" : ""}">${fmtUsd(row.total_pnl_usd_20)}</div>
      <div class="asset-stat-grid">
        <div class="asset-stat"><span>Trades</span><strong>${row.trades}</strong></div>
        <div class="asset-stat"><span>Win Rate</span><strong>${fmtPct(row.win_rate_pct, 1)}</strong></div>
        <div class="asset-stat"><span>Sharpe</span><strong>${fmtNum(row.sharpe, 3)}</strong></div>
        <div class="asset-stat"><span>ROI</span><strong>${fmtPct(row.total_return_pct, 2)}</strong></div>
      </div>
    </article>`).join("");
  target.innerHTML = markup;
  if (detailTarget) detailTarget.innerHTML = markup;
}

function renderActivePositions(targetId, positions) {
  const target = document.getElementById(targetId);
  if (!target) return;
  if (!positions || !positions.length) {
    target.innerHTML = `<article class="position-card empty"><p>当前没有未平仓仓位。</p></article>`;
    return;
  }
  target.innerHTML = positions.map((row) => `
    <article class="position-card">
      <div class="position-head">
        <strong>${row.asset}</strong>
        <span class="dir-chip ${String(row.direction).toLowerCase()}">${row.direction}</span>
      </div>
      <div class="position-grid-inner">
        <div><span>入场时间</span><strong>${fmtDate(row.entry_ts)}</strong></div>
        <div><span>入场价格</span><strong>${fmtNum(row.entry_price, 4)}</strong></div>
        ${row.hold_hours !== undefined ? `<div><span>持仓时长</span><strong>${row.hold_hours}h</strong></div>` : ""}
        ${row.position_size !== undefined ? `<div><span>仓位规模</span><strong>${fmtNum(row.position_size, 4)}</strong></div>` : ""}
        ${row.remaining_size !== undefined ? `<div><span>剩余规模</span><strong>${fmtNum(row.remaining_size, 6)}</strong></div>` : ""}
        <div><span>峰值收益</span><strong class="${Number(row.peak_pnl_pct || 0) >= 0 ? "pos" : "neg"}">${fmtPct(row.peak_pnl_pct || 0, 2)}</strong></div>
      </div>
    </article>`).join("");
}

function renderGrapesSummary(data) {
  const grapes = data.strategies.grapes;
  const rows = [
    ["策略定位", "面向趋势与结构机会的稳健策略", "这套策略更强调在高质量行情中参与，在不确定阶段减少噪音暴露，让收益曲线尽量平稳向上。"],
    ["如何参与", "偏向清晰、可持续的机会", "系统会在更有延续性的价格结构里建立仓位，而不是追逐每一次短期波动。"],
    ["如何管理", "先保护收益，再控制回撤", "当盈利出现后，系统更注重留住已经到手的利润，并把回撤管理放在优先位置。"],
    ["当前特征", "偏稳健、偏耐心", `当前组合 ${fmtPct(grapes.summary.total_return_pct)}，PF ${fmtNum(grapes.summary.profit_factor || 0)}，更像一套追求长期复利质量的资产引擎。`],
  ];
  document.getElementById("grapes-summary").innerHTML = rows.map(([label, value, note]) => `
    <div class="stack-row narrative">
      <div class="stack-copy">
        <span class="label">${label}</span>
        <strong class="stack-title">${value}</strong>
        <p class="stack-note">${note}</p>
      </div>
    </div>`).join("");
  renderBoardCards("grapes-board-cards", [
    { title: "Final Equity", value: fmtUsd(grapes.summary.final_equity), label: "统一 1500 base", highlight: false },
    { title: "Total Return", value: fmtPct(grapes.summary.total_return_pct), label: "组合总回报", highlight: true },
    { title: "Max DD", value: fmtPct(grapes.summary.max_drawdown_pct), label: "最大回撤", negative: true },
    { title: "Sharpe", value: fmtNum(grapes.summary.sharpe), label: "风险调整后收益" },
  ]);
  renderActivePositions("grapes-active-positions", grapes.active_positions || []);
}

function renderGrapesRegime(data) {
  const detail = data.strategies.grapes.regime_snapshot.regime_detail || [];
  const map = { TREND_UP: "上涨趋势", TREND_DOWN: "下跌趋势", RANGE_CHOP: "震荡行情", TRANSITION: "过渡期" };
  document.getElementById("grapes-regime").innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} 笔 · 胜率 ${fmtPct(row.win_rate_pct)} · 累计 ${fmtUsd(row.total_pnl_usd)}</p>
    </article>`).join("");
}

function renderCitrusSummary(data) {
  const p = data.strategies.citrus.portfolio;
  const rows = [
    ["策略定位", "多资产执行与筛选策略", "这套策略更强调跨资产的一致性，希望在不同币种中维持更整洁的收益结构，而不是单押某一类机会。"],
    ["如何参与", "只在更健康的机会里提高参与度", "系统会优先选择更有市场支持的机会，减少被假动作和噪音波动反复扫出的情况。"],
    ["如何管理", "降低无效进出对组合的侵蚀", "核心目标不是提高频率，而是让每一次参与都更值得，把组合波动压到更可控的水平。"],
    ["当前特征", "偏质量、偏筛选", `当前组合 ${fmtPct(p.total_return_pct_on_base)}，Sharpe ${fmtNum(p.sharpe || 0)}，胜率 ${fmtPct(p.win_rate_pct, 1)}，更像一套持续打磨执行质量的资产组合。`],
  ];
  document.getElementById("citrus-summary").innerHTML = rows.map(([label, value, note]) => `
    <div class="stack-row narrative">
      <div class="stack-copy">
        <span class="label">${label}</span>
        <strong class="stack-title">${value}</strong>
        <p class="stack-note">${note}</p>
      </div>
    </div>`).join("");
  renderBoardCards("citrus-board-cards", [
    { title: "Final Equity", value: fmtUsd(p.final_equity), label: "统一 1500 base" },
    { title: "Total Return", value: fmtPct(p.total_return_pct_on_base), label: "组合总回报", highlight: true },
    { title: "Max DD", value: fmtPct(p.max_dd_pct || 0), label: "最大回撤", negative: true },
    { title: "Sharpe", value: fmtNum(p.sharpe || 0), label: "风险调整后收益" },
  ]);
  renderActivePositions("citrus-active-positions", data.strategies.citrus.active_positions || []);
}

function renderCitrusRegime(data) {
  const detail = data.strategies.citrus.regime_snapshot?.regime_detail || [];
  const map = { TREND_UP: "上涨趋势", TREND_DOWN: "下跌趋势", RANGE_CHOP: "震荡行情", TRANSITION: "过渡期" };
  const target = document.getElementById("citrus-regime");
  if (!target) return;
  target.innerHTML = detail.map((row) => `
    <article class="regime-card">
      <h5>${map[row.regime_proxy] || row.regime_proxy}</h5>
      <p>${row.trades} 笔 · 胜率 ${fmtPct(row.win_rate_pct)} · 累计 ${fmtUsd(row.total_pnl_usd)}</p>
    </article>`).join("");
}

function tradePeriodValue(trade, scope) {
  if (scope === "year") return String(trade.exit_ts).slice(0, 4);
  if (scope === "month") return String(trade.exit_ts).slice(0, 7);
  return "all";
}

function getFilteredTrades(strategyKey) {
  const trades = state.data.strategies[strategyKey].all_trades || [];
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
  const trades = state.data.strategies[strategyKey].all_trades || [];
  const options = scope === "all"
    ? ["all"]
    : [...new Set(trades.map((trade) => tradePeriodValue(trade, scope)))].sort().reverse();
  valueSelect.innerHTML = options
    .map((value) => `<option value="${value}">${value === "all" ? "全部时期" : value}</option>`)
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
  return series.map((row) => {
    const ts = parseTimestamp(row.ts);
    const x = m.left + ((ts - start) / Math.max(1, end - start)) * (width - m.left - m.right);
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
  const m = { top: 24, right: 32, bottom: 42, left: 68 };
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
  drawAssetOverlayChart(canvas, data.strategies.grapes.asset_curves || {});
}

function drawCitrusAssetReturns(canvas, data) {
  drawAssetOverlayChart(canvas, data.strategies.citrus.asset_curves || {});
}

function renderTradeMeta(targetId, trades) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const wins = trades.filter((trade) => Number(trade.net_pnl_usd) > 0).length;
  const losses = trades.filter((trade) => Number(trade.net_pnl_usd) <= 0).length;
  const total = trades.reduce((sum, trade) => sum + Number(trade.net_pnl_usd || 0), 0);
  target.innerHTML = `
    <span><strong>${trades.length}</strong> 当前筛选交易</span>
    <span><strong>${wins}</strong> 胜</span>
    <span><strong>${losses}</strong> 负</span>
    <span><strong>${fmtUsd(total)}</strong> 累计收益</span>
  `;
}

function renderTradeTable(targetId, trades, includeType = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const ordered = [...trades].sort((a, b) => String(b.exit_ts).localeCompare(String(a.exit_ts)));
  target.innerHTML = ordered.map((trade) => {
    const pnl = Number(trade.net_pnl_usd || 0);
    const isLong = String(trade.direction).toUpperCase() === "LONG" || String(trade.direction).toLowerCase() === "long";
    return `
      <tr>
        <td class="mono">${trade.asset}</td>
        <td class="mono ${isLong ? "pos" : "neg"}">${isLong ? "Long" : "Short"}</td>
        ${includeType ? `<td class="mono">${trade.type || "Trend"}</td>` : ""}
        <td class="mono">${trade.entry_ts}</td>
        <td class="mono">${trade.exit_ts}</td>
        <td class="mono">${trade.hold_hours}h</td>
        <td class="mono ${pnl >= 0 ? "pos" : "neg"}">${fmtUsd(pnl)}</td>
        <td class="mono ${pnl >= 0 ? "pos" : "neg"}">${fmtPct(trade.roi_pct_on_margin, 2)}</td>
      </tr>`;
  }).join("");
}

function renderTradeSection(strategyKey, includeType = false) {
  const trades = getFilteredTrades(strategyKey);
  renderTradeMeta(`${strategyKey}-trade-meta`, trades);
  renderTradeTable(`${strategyKey}-trade-table`, trades, includeType);
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
    <span><strong>${monthlySummary.profitable_months}</strong> 盈利月份</span>
    <span><strong>${monthlySummary.losing_months}</strong> 亏损月份</span>
    <span><strong>${fmtPct(winRate, 1)}</strong> 胜率</span>
    <span><strong>${monthlySummary.best_month?.label || "—"}</strong> 最佳单月</span>
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
  if (grapesHeatmap && grapesHeatmap.offsetParent !== null) drawMonthlyHeatmap(grapesHeatmap, data.strategies.grapes.monthly_heatmap);

  const citrusHeatmap = document.getElementById("citrus-heatmap-canvas");
  if (citrusHeatmap && citrusHeatmap.offsetParent !== null) drawMonthlyHeatmap(citrusHeatmap, data.strategies.citrus.monthly_heatmap);
}

function bindSwitches() {
  document.querySelectorAll(".switch-tab").forEach((btn) => {
    btn.addEventListener("click", () => setActiveView(btn.dataset.view));
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

function render(data) {
  renderHero(data);
  renderStrategyCards(data);
  renderComparison(data);
  renderGrapesAssets(data);
  renderCitrusAssets(data);
  renderGrapesSummary(data);
  renderGrapesRegime(data);
  renderCitrusSummary(data);
  renderCitrusRegime(data);
  renderMonthlySummary("grapes-monthly-summary", data.strategies.grapes.monthly_summary, data.strategies.grapes.summary.win_rate_pct);
  renderMonthlySummary("citrus-monthly-summary", data.strategies.citrus.monthly_summary, data.strategies.citrus.portfolio.win_rate_pct);
  syncTradeValueOptions("grapes");
  syncTradeValueOptions("citrus");
  renderTradeSection("grapes", true);
  renderTradeSection("citrus", false);
  renderCharts(data);
}

async function init() {
  const res = await fetch(DATA_URL);
  const raw = await res.json();
  state.data = raw;
  state.lastUpdatedAt = raw.meta.updated_at;
  bindSwitches();
  bindTradeFilters();
  render(raw);
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
