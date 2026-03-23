const DATA_URL = "./data/joint_backtest_overview.json";

const COLORS = {
  ink: "#121922",
  muted: "#6f7883",
  grid: "rgba(18, 25, 34, 0.08)",
  line: "rgba(18, 25, 34, 0.14)",
  positive: "#17925d",
  negative: "#cb4b55",
  neutral: "#8a929c",
  equity: "#121922",
  btc: "#2f6ea3",
  eth: "#cf4a52",
  sol: "#17925d",
};

const state = {
  data: null,
  animationsPlayed: false,
  mobileChartMode: "both",
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
    family = '"Avenir Next", "Segoe UI", sans-serif',
  } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function linePath(ctx, points, scales) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = scales.x(point.ts);
    const y = scales.y(point.value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
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
    if (node.dataset.bind === "best_month_label") {
      node.style.color = COLORS.positive;
    }
  });
}

function renderMobileMonthStack(data) {
  const container = document.getElementById("mobile-month-stack");
  if (!container) return;

  const monthlyByYear = new Map();
  data.monthlyReturns.forEach((row) => {
    if (!monthlyByYear.has(row.year)) monthlyByYear.set(row.year, []);
    monthlyByYear.get(row.year).push(row);
  });

  container.innerHTML = [...monthlyByYear.entries()]
    .map(([year, rows]) => {
      const cards = rows
        .sort((a, b) => a.month - b.month)
        .map((row) => {
          const positive = Number(row.pnl_usd || 0) >= 0;
          return `
            <div class="mobile-month-card">
              <div class="mobile-month-head">
                <span class="mobile-month-label">${String(row.month).padStart(2, "0")} 月</span>
                <strong class="mobile-month-return" style="color:${positive ? COLORS.positive : COLORS.negative}">${formatPercent(row.return_pct, 0)}</strong>
              </div>
              <strong class="mobile-month-pnl" style="color:${positive ? COLORS.positive : COLORS.negative}">${formatCurrency(row.pnl_usd, 0)}</strong>
            </div>
          `;
        })
        .join("");

      return `
        <section class="mobile-year-block">
          <div class="mobile-year-title">${year}</div>
          <div class="mobile-month-grid">${cards}</div>
        </section>
      `;
    })
    .join("");
}

function renderAssetCards(data) {
  const container = document.getElementById("asset-card-grid");
  const assetColors = { BTC: COLORS.btc, ETH: COLORS.eth, SOL: COLORS.sol };
  container.innerHTML = data.assetStats
    .map(
      (asset) => `
        <article class="asset-card">
          <div class="asset-card-head">
            <h4>${asset.asset}</h4>
            <strong style="color:${toneColor(asset.total_pnl)}">${formatCurrency(asset.total_pnl, 0)}</strong>
          </div>
          <canvas class="asset-mini-canvas" id="asset-canvas-${asset.asset}"></canvas>
          <div class="asset-stats">
            <div class="asset-stat">
              <span>累计收益</span>
              <strong style="color:${toneColor(asset.total_pnl)}">${formatCurrency(asset.total_pnl, 0)}</strong>
            </div>
            <div class="asset-stat">
              <span>胜率</span>
              <strong>${formatPercent(asset.win_rate_pct)}</strong>
            </div>
            <div class="asset-stat">
              <span>交易次数</span>
              <strong>${asset.trades}</strong>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  data.assetStats.forEach((asset) => {
    drawMiniAssetChart(
      document.getElementById(`asset-canvas-${asset.asset}`),
      (data.assetPrices || {})[asset.asset] || [],
      assetColors[asset.asset]
    );
  });
}

function drawHeroCurve(canvas, equityCurve, progress = 1) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const left = 10;
  const right = width - 10;
  const top = 20;
  const bottom = height - 20;
  const [min, max] = seriesExtent(equityCurve, "equity");
  const points = slicePoints(
    equityCurve.map((row) => ({ ts: row.ts, value: row.equity })),
    progress
  );

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = COLORS.equity;
  ctx.lineWidth = 3;
  linePath(ctx, points, {
    x: (ts) => scaleX(ts, equityCurve[0].ts, equityCurve.at(-1).ts, left, right),
    y: (value) => scaleY(value, min, max, top, bottom),
  });
  ctx.stroke();
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

  drawTimeSeriesWithMarkers(equityCanvas, equity, COLORS.equity, markers, progress, {
    leftLabelFormatter: (value) => formatCompactCurrency(value),
  });
  drawTimeSeriesWithMarkers(btcCanvas, btc, COLORS.btc, markers, progress, {
    leftLabelFormatter: (value) => formatCompactCurrency(value),
    compact: true,
  });

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  if (isMobile) {
    equityCanvas.style.display = state.mobileChartMode === "btc" ? "none" : "block";
    btcCanvas.style.display = state.mobileChartMode === "equity" ? "none" : "block";
  } else {
    equityCanvas.style.display = "block";
    btcCanvas.style.display = "block";
  }
}

function drawTimeSeriesWithMarkers(canvas, series, stroke, markers, progress, options = {}) {
  const { ctx, width, height } = resizeCanvas(canvas);
  const left = 58;
  const right = width - 24;
  const top = 18;
  const bottom = height - 32;
  const [min, max] = seriesExtent(series, "value");
  const points = slicePoints(series, progress);
  const minTs = series[0].ts;
  const maxTs = series.at(-1).ts;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < 4; i += 1) {
    const value = min + ((max - min) * i) / 3;
    const y = scaleY(value, min, max, top, bottom);
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    drawText(ctx, options.leftLabelFormatter ? options.leftLabelFormatter(value) : formatNumber(value, 2), left - 10, y, {
      align: "right",
      baseline: "middle",
      size: options.compact ? 10 : 11,
    });
  }

  markers.forEach((marker) => {
    const x = scaleX(marker.ts, minTs, maxTs, left, right);
    ctx.strokeStyle = COLORS.line;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    drawText(ctx, marker.label, x, top - 4, {
      align: "center",
      baseline: "bottom",
      size: 10,
      color: COLORS.muted,
    });
  });

  ctx.strokeStyle = stroke;
  ctx.lineWidth = options.compact ? 2 : 2.4;
  linePath(ctx, points, {
    x: (ts) => scaleX(ts, minTs, maxTs, left, right),
    y: (value) => scaleY(value, min, max, top, bottom),
  });
  ctx.stroke();

  const tickIndices = [0, Math.floor(series.length / 3), Math.floor((series.length * 2) / 3), series.length - 1];
  tickIndices.forEach((idx) => {
    const point = series[idx];
    const x = scaleX(point.ts, minTs, maxTs, left, right);
    drawText(ctx, formatDate(point.ts), x, bottom + 18, {
      align: "center",
      size: 11,
      color: COLORS.muted,
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

  years.forEach((year, rowIdx) => {
    const y = top + rowIdx * cellH;
    drawText(ctx, year, left - 12, y + cellH / 2, {
      align: "right",
      baseline: "middle",
      size: 11,
    });

    let annualPnl = 0;
    for (let monthIdx = 0; monthIdx < 12; monthIdx += 1) {
      const x = left + monthIdx * cellW;
      const row = monthly.get(`${year}-${String(monthIdx + 1).padStart(2, "0")}`);
      if (row) annualPnl += Number(row.pnl_usd || 0);
      const absValue = Math.abs(Number(row?.return_pct || 0));
      const alpha = row ? 0.08 + (absValue / maxAbs) * 0.26 : 0.02;
      ctx.fillStyle = !row
        ? "rgba(18, 25, 34, 0.03)"
        : Number(row.return_pct) >= 0
          ? `rgba(23, 146, 93, ${alpha})`
          : `rgba(203, 75, 85, ${alpha})`;
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

      if (row) {
        drawText(ctx, formatPercent(row.return_pct, 0), x + cellW / 2, y + cellH / 2 - 7, {
          align: "center",
          baseline: "middle",
          size: 11,
          weight: 700,
          color: Number(row.return_pct) >= 0 ? COLORS.positive : COLORS.negative,
        });
        drawText(ctx, formatCurrency(row.pnl_usd, 0), x + cellW / 2, y + cellH / 2 + 10, {
          align: "center",
          baseline: "middle",
          size: 10,
          color: Number(row.return_pct) >= 0 ? COLORS.positive : COLORS.negative,
        });
      }
    }

    const annualX = left + 12 * cellW;
    ctx.fillStyle = annualPnl >= 0 ? "rgba(23, 146, 93, 0.14)" : "rgba(203, 75, 85, 0.14)";
    ctx.fillRect(annualX + 1, y + 1, cellW - 2, cellH - 2);
    drawText(ctx, formatCurrency(annualPnl, 0), annualX + cellW / 2, y + cellH / 2, {
      align: "center",
      baseline: "middle",
      size: 10,
      weight: 700,
      color: annualPnl >= 0 ? COLORS.positive : COLORS.negative,
    });
  });

  monthNames.forEach((name, index) => {
    drawText(ctx, name, left + index * cellW + cellW / 2, bottom + 16, {
      align: "center",
      size: 11,
    });
  });
  drawText(ctx, "年汇总", left + 12 * cellW + cellW / 2, bottom + 16, {
    align: "center",
    size: 11,
  });
}

function drawMiniAssetChart(canvas, series, stroke) {
  if (!canvas || !series.length) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const left = 8;
  const right = width - 8;
  const top = 12;
  const bottom = height - 12;
  const [min, max] = seriesExtent(series, "close");

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(18, 25, 34, 0.06)";
  for (let i = 0; i < 3; i += 1) {
    const y = top + ((bottom - top) * i) / 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  linePath(
    ctx,
    series.map((row) => ({ ts: row.ts, value: row.close })),
    {
      x: (ts) => scaleX(ts, series[0].ts, series.at(-1).ts, left, right),
      y: (value) => scaleY(value, min, max, top, bottom),
    }
  );
  ctx.stroke();
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
  renderMobileMonthStack(data);
  renderAssetCards(data);
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

function setupReveal(data) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains("hero-section")) {
          playAnimations(data);
        }
      });
    },
    { threshold: 0.3 }
  );
  const hero = document.querySelector(".hero-section");
  if (hero) observer.observe(hero);
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }
  state.data = preprocess(await response.json());
  setupMobileChartTabs();
  renderStatic(state.data);
  setupReveal(state.data);
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
