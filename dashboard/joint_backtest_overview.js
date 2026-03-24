const DATA_URL = "./data/joint_backtest_overview.json";

const COLORS = {
  ink: "#141210",
  muted: "#8a8070",
  grid: "rgba(160, 120, 64, 0.08)",
  line: "rgba(160, 120, 64, 0.18)",
  positive: "#2d6b4a",
  negative: "#8b2020",
  neutral: "#b0a898",
  equity: "#2d6b4a",
  btc: "#3b82f6",
  eth: "#8b2020",
  sol: "#2d6b4a",
  paper: "#f5f0e8",
  paper2: "#ede8df",
  paper3: "#e4ddd2",
};

const state = {
  data: null,
  animationsPlayed: false,
  mobileChartMode: "both",
  mobileAsset: "BTC",
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

function formatCurrency(value, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatPercent(value, digits = 2) {
  const n = Number(value || 0);
  return `${n >= 0 ? "+" : "-"}${Math.abs(n).toFixed(digits)}%`;
}

function formatNumber(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

function formatDate(ts) {
  const dt = new Date(ts);
  return dt.toLocaleDateString("zh-CN", { year: "numeric", month: "short" });
}

function toneColor(value) {
  return Number(value || 0) >= 0 ? COLORS.positive : COLORS.negative;
}

function preprocess(raw) {
  return {
    ...raw,
    equityCurve: raw.equity_curve.map((row) => ({
      ts: parseTimestamp(row.ts),
      equity: Number(row.equity || 0),
      drawdown: Number(row.drawdown_pct || 0),
    })),
    btcPrice: raw.btc_price.map((row) => ({
      ts: parseTimestamp(row.ts),
      close: Number(row.close || 0),
    })),
    assetPrices: Object.fromEntries(
      Object.entries(raw.asset_prices || {}).map(([asset, rows]) => [
        asset,
        rows.map((row) => ({
          ts: parseTimestamp(row.ts),
          close: Number(row.close || 0),
        })),
      ])
    ),
    assetCurves: Object.fromEntries(
      Object.entries(raw.asset_curves || {}).map(([asset, rows]) => [
        asset,
        rows.map((row) => ({
          ts: parseTimestamp(row.ts),
          pnl: Number(row.pnl || 0),
        })),
      ])
    ),
    monthlyReturns: raw.monthly_returns || [],
    monthlySummary: raw.monthly_summary || {},
    assetStats: raw.asset_stats || [],
  };
}

function seriesExtent(series, key) {
  const values = series.map((item) => Number(item[key])).filter((v) => Number.isFinite(v));
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    const pad = Math.abs(min || 1) * 0.05;
    min -= pad;
    max += pad;
  }
  return [min, max];
}

function scaleX(ts, minTs, maxTs, left, right) {
  return left + ((ts - minTs) / Math.max(1, maxTs - minTs)) * (right - left);
}

function scaleY(value, min, max, top, bottom) {
  return bottom - ((value - min) / Math.max(1e-9, max - min)) * (bottom - top);
}

function drawText(ctx, text, x, y, options = {}) {
  const {
    size = 12,
    weight = 500,
    color = COLORS.muted,
    align = "left",
    baseline = "alphabetic",
    family = '"Montserrat", sans-serif',
  } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function linePath(ctx, points, scales, smooth = true) {
  if (!points.length) return;
  const coords = points.map((point) => ({
    x: scales.x(point.ts),
    y: scales.y(point.value),
  }));

  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);

  if (!smooth || coords.length < 3) {
    coords.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    return;
  }

  const tension = 0.12;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p0 = coords[i - 1] || coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 6;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 6;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 6;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

function slicePoints(points, progress) {
  const count = Math.max(2, Math.floor(points.length * progress));
  return points.slice(0, count);
}

function animateNumber(el, target, format) {
  const duration = 1100;
  const start = performance.now();
  const from = 0;

  function render(now) {
    const ratio = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - ratio) ** 3;
    const current = from + (target - from) * eased;
    if (format === "percent") {
      el.textContent = formatPercent(current);
    } else if (format === "number") {
      el.textContent = formatNumber(current, 2);
    } else {
      el.textContent = formatCurrency(current, 0);
    }
    if (ratio < 1) requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function setupHero(data) {
  document.querySelector('[data-animate-number="total_return_pct"]').style.color = COLORS.positive;
  const monthCount = String(data.monthlyReturns.filter((row) => row.return_pct != null).length);
  document.querySelectorAll('[data-bind="monthly_count"]').forEach((node) => {
    node.textContent = monthCount;
  });
  document.querySelectorAll('[data-bind="hero_equity"]').forEach((node) => {
    node.textContent = formatCurrency(data.summary.final_equity, 0);
  });
}

function renderMetricTexts(data) {
  const totalMonths = data.monthlyReturns.filter((row) => row.return_pct != null).length;
  document.getElementById("heatmap-title").textContent = `每月收益一览，${totalMonths} 个月连续数据`;

  const profitable = data.monthlySummary.profitable_months || 0;
  const losing = data.monthlySummary.losing_months || 0;
  const monthlyHitRate = profitable + losing > 0 ? (profitable / (profitable + losing)) * 100 : 0;

  const binds = {
    profitable_months: String(profitable),
    losing_months: String(losing),
    monthly_hit_rate: formatPercent(monthlyHitRate),
    best_month_label: data.monthlySummary.best_month?.label || "—",
  };

  document.querySelectorAll("[data-bind]").forEach((node) => {
    node.textContent = binds[node.dataset.bind] ?? "—";
  });
}

function renderLogicProof(data) {
  const details = data.regime_snapshot?.regime_detail || [];
  const regimeLabelMap = {
    TREND_UP: "上涨趋势行情",
    TREND_DOWN: "下跌趋势行情",
    RANGE_CHOP: "震荡行情",
    TRANSITION: "过渡行情",
  };
  const trendBest = details.reduce((best, row) => {
    const avg = Number(row.total_pnl_usd || 0) / Math.max(1, Number(row.trades || 0));
    if (!best || avg > best.avg) {
      return { label: regimeLabelMap[row.regime_proxy] || "趋势阶段", total: row.total_pnl_usd, avg };
    }
    return best;
  }, null);
  const trendUp = details.find((row) => row.regime_proxy === "TREND_UP");

  const binds = {
    logic_trend_label: trendBest?.label || "趋势阶段",
    logic_trend_pnl: trendBest ? formatCurrency(trendBest.total, 0) : "—",
    logic_trend_avg: trendBest ? formatCurrency(trendBest.avg, 0) : "—",
    logic_up_win: trendUp ? formatPercent(trendUp.win_rate_pct) : "—",
  };

  Object.entries(binds).forEach(([key, value]) => {
    document.querySelectorAll(`[data-bind="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  });
}

function renderMobileMonthStack(data) {
  const container = document.getElementById("mobile-month-stack");
  if (!container) return;

  const ordered = [...data.monthlyReturns].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  const recentRows = ordered.slice(0, 12).reverse();
  const historyRows = ordered.slice(12);
  const monthlyByYear = new Map();
  historyRows.forEach((row) => {
    if (!monthlyByYear.has(row.year)) monthlyByYear.set(row.year, []);
    monthlyByYear.get(row.year).push(row);
  });

  const renderCards = (rows) =>
    rows
      .map((row) => {
        const positive = Number(row.pnl_usd || 0) >= 0;
        return `
          <div class="mobile-month-card ${positive ? "mobile-month-card-positive" : "mobile-month-card-negative"}">
            <div class="mobile-month-head">
              <span class="mobile-month-label">${row.year}-${String(row.month).padStart(2, "0")}</span>
              <strong class="mobile-month-return">${formatPercent(row.return_pct, 0)}</strong>
            </div>
            <strong class="mobile-month-pnl">${formatCurrency(row.pnl_usd, 0)}</strong>
          </div>
        `;
      })
      .join("");

  const historyBlocks = [...monthlyByYear.entries()]
    .map(([year, rows]) => {
      const orderedRows = rows.sort((a, b) => a.month - b.month);
      const annualPnl = orderedRows.reduce((sum, row) => sum + Number(row.pnl_usd || 0), 0);
      const positiveMonths = orderedRows.filter((row) => Number(row.pnl_usd || 0) >= 0).length;
      return `
        <section class="mobile-year-block">
          <div class="mobile-year-header">
            <div>
              <div class="mobile-year-title">${year}</div>
              <div class="mobile-year-meta">${positiveMonths}/${orderedRows.length} 个月盈利</div>
            </div>
            <strong class="mobile-year-pnl" style="color:${annualPnl >= 0 ? COLORS.positive : COLORS.negative}">
              ${formatCurrency(annualPnl, 0)}
            </strong>
          </div>
          <div class="mobile-month-grid">${renderCards(orderedRows)}</div>
        </section>
      `;
    })
    .join("");

  const html = `
    <section class="mobile-year-block mobile-recent-block">
      <div class="mobile-year-header">
        <div>
          <div class="mobile-year-title">最近 12 个月</div>
          <div class="mobile-year-meta">手机端优先展示最近一年的月度表现</div>
        </div>
      </div>
      <div class="mobile-month-grid">${renderCards(recentRows)}</div>
    </section>
    <details class="mobile-history-disclosure">
      <summary>查看完整历史</summary>
      <div class="mobile-history-stack">${historyBlocks}</div>
    </details>
  `;
  if (container) container.innerHTML = html;
}

function renderAssetCards(data) {
  const focusCopy = document.getElementById("asset-focus-copy");
  const focusCanvas = document.getElementById("asset-focus-canvas");
  const insightList = document.getElementById("asset-insight-list");
  if (!focusCopy || !focusCanvas || !insightList) return;

  const stats = data.assetStats || [];
  const selected = stats.find((asset) => asset.asset === state.mobileAsset) || stats[0];
  if (!selected) return;

  const avgPnl = Number(selected.total_pnl || 0) / Math.max(1, Number(selected.trades || 0));
  const assetSeries = data.assetCurves?.[selected.asset] || [];
  drawMiniAssetChart(focusCanvas, assetSeries, COLORS[selected.asset.toLowerCase()] || COLORS.equity, "pnl");

  const focusHtml = `
    <div class="asset-focus-header">
      <div>
        <div class="asset-focus-label">${selected.asset}</div>
        <div class="asset-focus-value">${formatCurrency(selected.total_pnl || 0, 0)}</div>
      </div>
      <div class="asset-focus-meta">该资产累计实现</div>
    </div>
    <div class="asset-focus-metrics">
      <div class="asset-focus-metric">
        <span>胜率</span>
        <strong>${formatPercent(selected.win_rate_pct || 0)}</strong>
      </div>
      <div class="asset-focus-metric">
        <span>交易次数</span>
        <strong>${selected.trades}</strong>
      </div>
      <div class="asset-focus-metric">
        <span>平均每笔</span>
        <strong>${formatCurrency(avgPnl, 0)}</strong>
      </div>
      <div class="asset-focus-metric">
        <span>盈亏比</span>
        <strong>${formatNumber(selected.profit_factor || 0, 2)}</strong>
      </div>
    </div>
  `;
  if (focusCopy) focusCopy.innerHTML = focusHtml;

  const sortedByPnl = [...stats].sort((a, b) => Number(b.total_pnl || 0) - Number(a.total_pnl || 0));
  const highestWin = [...stats].sort((a, b) => Number(b.win_rate_pct || 0) - Number(a.win_rate_pct || 0))[0];
  const mostSelective = [...stats].sort((a, b) => Number(a.trades || 0) - Number(b.trades || 0))[0];

  const calcAvgPnl = (asset) => Number(asset.total_pnl || 0) / Math.max(1, Number(asset.trades || 0));
  const used = new Set();
  const insights = [];

  const pushInsight = (asset, textBuilder) => {
    if (!asset || used.has(asset.asset)) return;
    used.add(asset.asset);
    insights.push(`
      <article class="asset-insight">
        <h5>${asset.asset}</h5>
        <p>${textBuilder(asset)}</p>
      </article>
    `);
  };

  pushInsight(sortedByPnl[0], (asset) => `累计收益最高，当前样本实现 ${formatCurrency(asset.total_pnl || 0, 0)}，说明这套逻辑在该资产上的总贡献最强。`);
  pushInsight(highestWin, (asset) => `胜率最高，达到 ${formatPercent(asset.win_rate_pct || 0)}，说明该资产的波动节奏与策略信号更匹配。`);
  pushInsight(mostSelective, (asset) => `交易次数最少，仅 ${asset.trades} 笔，但平均每笔达到 ${formatCurrency(calcAvgPnl(asset), 0)}。这说明每个资产的盈利结构并不一样。`);

  if (insightList) insightList.innerHTML = insights.join("");
}

function drawHeroCurve(canvas, equityCurve, progress = 1) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const left = 4;
  const right = width - 4;
  const top = 16;
  const bottom = height - 14;
  const [min, max] = seriesExtent(equityCurve, "equity");
  const points = slicePoints(
    equityCurve.map((row) => ({ ts: row.ts, value: row.equity })),
    progress
  );
  const minTs = equityCurve[0].ts;
  const maxTs = equityCurve.at(-1).ts;
  const xScale = (ts) => scaleX(ts, minTs, maxTs, left, right);
  const yScale = (value) => scaleY(value, min, max, top, bottom);

  ctx.clearRect(0, 0, width, height);
  const fillGradient = ctx.createLinearGradient(0, top, 0, bottom);
  fillGradient.addColorStop(0, "rgba(45, 107, 74, 0.28)");
  fillGradient.addColorStop(0.55, "rgba(45, 107, 74, 0.1)");
  fillGradient.addColorStop(1, "rgba(45, 107, 74, 0)");

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = xScale(point.ts);
    const y = yScale(point.value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (points.length) {
    const last = points.at(-1);
    const first = points[0];
    ctx.lineTo(xScale(last.ts), bottom);
    ctx.lineTo(xScale(first.ts), bottom);
    ctx.closePath();
    ctx.fillStyle = fillGradient;
    ctx.fill();
  }

  ctx.strokeStyle = COLORS.equity;
  ctx.lineWidth = 3.1;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  linePath(ctx, points, { x: xScale, y: yScale });
  ctx.stroke();

  const lastPoint = points.at(-1);
  if (lastPoint) {
    const x = xScale(lastPoint.ts);
    const y = yScale(lastPoint.value);
    ctx.beginPath();
    ctx.fillStyle = COLORS.equity;
    ctx.arc(x, y, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(45, 107, 74, 0.22)";
    ctx.lineWidth = 7;
    ctx.arc(x, y, 8.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function findMarkerPoints(data) {
  const startTs = parseTimestamp(data.summary.start_ts);
  const maxDdPoint = [...data.equityCurve].sort((a, b) => a.drawdown - b.drawdown)[0];
  const bestMonthLabel = data.monthlySummary.best_month?.label;
  const bestMonthPoint = bestMonthLabel
    ? data.equityCurve.find((point) => formatDate(point.ts).replace("年", "-").replace("月", "").includes(bestMonthLabel.slice(0, 7)))
    : null;

  return [
    { label: "策略启动", ts: startTs },
    { label: "最大回撤", ts: maxDdPoint?.ts || startTs },
    { label: "最佳单月", ts: bestMonthPoint?.ts || data.equityCurve.at(-1)?.ts || startTs },
  ];
}

function drawPerformanceCharts(data, progress = 1) {
  const equityCanvas = document.getElementById("performance-equity-canvas");
  const btcCanvas = document.getElementById("performance-btc-canvas");
  const equity = data.equityCurve.map((row) => ({ ts: row.ts, value: row.equity }));
  const btc = data.btcPrice.map((row) => ({ ts: row.ts, value: row.close }));
  const markers = findMarkerPoints(data);
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const equityStroke = COLORS.equity;

  if (isMobile) {
    const showEquity = state.mobileChartMode !== "btc";
    const showBtc = state.mobileChartMode !== "equity";
    equityCanvas.style.display = showEquity ? "block" : "none";
    btcCanvas.style.display = showBtc ? "block" : "none";

    if (showEquity) {
      drawTimeSeriesWithMarkers(equityCanvas, equity, equityStroke, markers, progress, {
        leftLabelFormatter: (value) => formatCompactCurrency(value),
        kind: "equity",
      });
    }

    if (showBtc) {
      drawTimeSeriesWithMarkers(btcCanvas, btc, COLORS.btc, markers, progress, {
        leftLabelFormatter: (value) => formatCompactCurrency(value),
        compact: true,
        kind: "btc",
      });
    }

    return;
  }

  equityCanvas.style.display = "block";
  btcCanvas.style.display = "block";

  drawTimeSeriesWithMarkers(equityCanvas, equity, equityStroke, markers, progress, {
    leftLabelFormatter: (value) => formatCompactCurrency(value),
    kind: "equity",
  });
  drawTimeSeriesWithMarkers(btcCanvas, btc, COLORS.btc, markers, progress, {
    leftLabelFormatter: (value) => formatCompactCurrency(value),
    compact: true,
    kind: "btc",
  });
}

function drawTimeSeriesWithMarkers(canvas, series, stroke, markers, progress, options = {}) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const left = 58;
  const right = width - 24;
  const top = 20;
  const bottom = height - 36;
  const [min, max] = seriesExtent(series, "value");
  const points = slicePoints(series, progress);
  const minTs = series[0].ts;
  const maxTs = series.at(-1).ts;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, width, height);

  const gridCount = isMobile ? 3 : 4;
  for (let i = 0; i < gridCount; i += 1) {
    const value = min + ((max - min) * i) / Math.max(1, gridCount - 1);
    const y = scaleY(value, min, max, top, bottom);
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    drawText(ctx, options.leftLabelFormatter ? options.leftLabelFormatter(value) : formatNumber(value, 2), left - 10, y, {
      align: "right",
      baseline: "middle",
      size: isMobile ? 9 : options.compact ? 10 : 11,
      family: '"DM Mono", monospace',
    });
  }

  const activeMarkers = isMobile ? [markers[1]] : markers;
  activeMarkers.forEach((marker) => {
    const x = scaleX(marker.ts, minTs, maxTs, left, right);
    ctx.strokeStyle = COLORS.line;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    drawText(ctx, marker.label, x, top - 4, {
      align: "center",
      baseline: "bottom",
      size: isMobile ? 9 : 10,
      color: COLORS.muted,
      family: '"DM Mono", monospace',
    });
  });

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = options.compact ? 2 : 2.4;
  linePath(ctx, points, {
    x: (ts) => scaleX(ts, minTs, maxTs, left, right),
    y: (value) => scaleY(value, min, max, top, bottom),
  });
  ctx.stroke();
  ctx.restore();

  const tickIndices = isMobile
    ? [0, Math.floor(series.length / 2), series.length - 1]
    : [0, Math.floor(series.length / 3), Math.floor((series.length * 2) / 3), series.length - 1];
  tickIndices.forEach((idx) => {
    const point = series[idx];
    const x = scaleX(point.ts, minTs, maxTs, left, right);
    drawText(ctx, formatDate(point.ts), x, bottom + 18, {
      align: "center",
      size: isMobile ? 10 : 11,
      color: COLORS.muted,
      family: '"DM Mono", monospace',
    });
  });
}

function drawHeatmap(canvas, data) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const monthly = new Map(data.monthlyReturns.map((row) => [`${row.year}-${String(row.month).padStart(2, "0")}`, row]));
  const years = [...new Set(data.monthlyReturns.map((row) => row.year))];
  const left = 54;
  const top = 18;
  const right = width - 16;
  const bottom = height - 24;
  const cols = 13;
  const cellW = (right - left) / cols;
  const cellH = (bottom - top) / Math.max(1, years.length);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const values = data.monthlyReturns.map((row) => Math.abs(Number(row.return_pct || 0)));
  const maxAbs = Math.max(1, ...values);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, width, height);

  years.forEach((year, rowIdx) => {
    const y = top + rowIdx * cellH;
    drawText(ctx, year, left - 12, y + cellH / 2, {
      align: "right",
      baseline: "middle",
      size: 11,
      family: '"DM Mono", monospace',
    });

    let annualPnl = 0;
    for (let monthIdx = 0; monthIdx < 12; monthIdx += 1) {
      const x = left + monthIdx * cellW;
      const row = monthly.get(`${year}-${String(monthIdx + 1).padStart(2, "0")}`);
      if (row) annualPnl += Number(row.pnl_usd || 0);
      const absValue = Math.abs(Number(row?.return_pct || 0));
      const alpha = row ? 0.08 + (absValue / maxAbs) * 0.26 : 0.02;
      ctx.fillStyle = !row
        ? "rgba(160, 120, 64, 0.04)"
        : Number(row.return_pct) >= 0
          ? `rgba(45, 107, 74, ${alpha})`
          : `rgba(139, 32, 32, ${alpha})`;
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

      if (row) {
        drawText(ctx, formatPercent(row.return_pct, 0), x + cellW / 2, y + cellH / 2 - 7, {
          align: "center",
          baseline: "middle",
          size: 11,
          weight: 700,
          color: Number(row.return_pct) >= 0 ? COLORS.positive : COLORS.negative,
          family: '"DM Mono", monospace',
        });
        drawText(ctx, formatCurrency(row.pnl_usd, 0), x + cellW / 2, y + cellH / 2 + 10, {
          align: "center",
          baseline: "middle",
          size: 10,
          color: Number(row.return_pct) >= 0 ? COLORS.positive : COLORS.negative,
          family: '"DM Mono", monospace',
        });
      }
    }

    const annualX = left + 12 * cellW;
    ctx.fillStyle = annualPnl >= 0 ? "rgba(45, 107, 74, 0.12)" : "rgba(139, 32, 32, 0.12)";
    ctx.fillRect(annualX + 1, y + 1, cellW - 2, cellH - 2);
    drawText(ctx, formatCurrency(annualPnl, 0), annualX + cellW / 2, y + cellH / 2, {
      align: "center",
      baseline: "middle",
      size: 10,
      weight: 700,
      color: annualPnl >= 0 ? COLORS.positive : COLORS.negative,
      family: '"DM Mono", monospace',
    });
  });

  monthNames.forEach((name, index) => {
    drawText(ctx, name, left + index * cellW + cellW / 2, bottom + 16, {
      align: "center",
      size: 11,
      family: '"DM Mono", monospace',
    });
  });
  drawText(ctx, "年汇总", left + 12 * cellW + cellW / 2, bottom + 16, {
    align: "center",
    size: 11,
    family: '"DM Mono", monospace',
  });
}

function drawMiniAssetChart(canvas, series, stroke, key = "close") {
  if (!canvas || !series.length) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const left = 10;
  const right = width - 10;
  const top = 14;
  const bottom = height - 14;
  const [min, max] = seriesExtent(series, key);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(160, 120, 64, 0.08)";
  for (let i = 0; i < 3; i += 1) {
    const y = top + ((bottom - top) * i) / 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.2;
  linePath(
    ctx,
    series.map((row) => ({ ts: row.ts, value: row[key] })),
    {
      x: (ts) => scaleX(ts, series[0].ts, series.at(-1).ts, left, right),
      y: (value) => scaleY(value, min, max, top, bottom),
    }
  );
  ctx.stroke();
  ctx.restore();
}

function drawHeroParticles(canvas, tick = 0) {
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const particles = 18;
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles; i += 1) {
    const seed = i * 37.17;
    const x = (Math.sin(seed + tick * 0.00035) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed * 0.78 + tick * 0.00022) * 0.5 + 0.5) * height;
    const radius = i % 4 === 0 ? 1.8 : 1.2;
    const alpha = 0.08 + ((i % 5) / 5) * 0.12;
    ctx.beginPath();
    ctx.fillStyle = `rgba(45, 107, 74, ${alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function playAnimations(data) {
  if (state.animationsPlayed) return;
  state.animationsPlayed = true;
  document.querySelectorAll("[data-animate-number]").forEach((node) => {
    const key = node.dataset.animateNumber;
    const format = node.dataset.format;
    let target = 0;
    if (key === "total_return_pct") target = data.summary.total_return_pct;
    else if (key === "annualized_return_pct") target = data.summary.annualized_return_pct;
    else if (key === "max_drawdown_pct") target = data.summary.max_drawdown_pct;
    else if (key === "sharpe") target = data.summary.sharpe;
    animateNumber(node, target, format);
  });

  const heroCanvas = document.getElementById("hero-equity-canvas");
  const start = performance.now();
  const duration = 1300;

  function render(now) {
    const ratio = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - ratio) ** 3;
    drawHeroCurve(heroCanvas, data.equityCurve, eased);
    drawPerformanceCharts(data, eased);
    if (ratio < 1) requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function renderStatic(data) {
  setupHero(data);
  renderMetricTexts(data);
  renderLogicProof(data);
  renderMobileMonthStack(data);
  renderAssetCards(data);
  drawHeroParticles(document.getElementById("hero-particles-canvas"), performance.now());
  drawHeroCurve(document.getElementById("hero-equity-canvas"), data.equityCurve, 1);
  drawPerformanceCharts(data, 1);
  drawHeatmap(document.getElementById("heatmap-canvas"), data);
}

function setupMobileChartTabs() {
  document.querySelectorAll(".mobile-chart-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.mobileChartMode = button.dataset.chart;
      document.querySelectorAll(".mobile-chart-tab").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });
      if (state.data) {
        drawPerformanceCharts(state.data, 1);
      }
    });
  });
}

function setupMobileAssetTabs() {
  document.querySelectorAll(".asset-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.mobileAsset = button.dataset.asset;
      document.querySelectorAll(".asset-tab").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });
      if (state.data) {
        renderAssetCards(state.data);
      }
    });
  });
}

function setupMobileNav() {
  const toggle = document.getElementById("mobile-nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupLogicAccordions() {
  document.querySelectorAll(".logic-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const article = button.closest(".logic-accordion");
      const expanded = article.classList.contains("is-open");
      document.querySelectorAll(".logic-accordion").forEach((item) => {
        item.classList.remove("is-open");
        const toggle = item.querySelector(".logic-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
      if (!expanded) {
        article.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function setupHeroParticlesLoop() {
  const canvas = document.getElementById("hero-particles-canvas");
  if (!canvas) return;
  function render(now) {
    drawHeroParticles(canvas, now);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function setupReveal(data) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains("hero-section")) {
          playAnimations(data);
        }
        if (entry.target.tagName === "SECTION" && !entry.target.classList.contains("hero-section")) {
          entry.target.classList.add("section-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.22 }
  );
  const hero = document.querySelector(".hero-section");
  if (hero) observer.observe(hero);
  document.querySelectorAll("main > section:not(.hero-section)").forEach((section) => {
    observer.observe(section);
  });
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }
  state.data = preprocess(await response.json());
  setupMobileNav();
  setupMobileChartTabs();
  setupMobileAssetTabs();
  setupLogicAccordions();
  renderStatic(state.data);
  setupReveal(state.data);
  setupHeroParticlesLoop();
  window.addEventListener("resize", () => {
    if (!state.data) return;
    renderStatic(state.data);
    drawHeroCurve(document.getElementById("hero-equity-canvas"), state.data.equityCurve, 1);
    drawPerformanceCharts(state.data, 1);
  });
}

init().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<div style="padding:40px;font:16px sans-serif;color:#cb4b55;">页面数据载入失败：${error.message}</div>`;
});
