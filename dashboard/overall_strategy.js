const DATA_URL = "./data/overall_strategy_run.json?v=20260524-product-13";
const FD_RETURN = 8.03;
const SP500_RETURN = 56.1;
const SP500_YEARLY = { 2022: -19.4, 2023: 24.2, 2024: 23.3, 2025: 16.4, 2026: 6.8 };
const REGIMES = {
  2022: { en: "Bear", zh: "熊市", tone: "#176f80" },
  2023: { en: "Mixed / recovery", zh: "震荡 / 修复", tone: "#b88935" },
  2024: { en: "Bull", zh: "牛市", tone: "#006b4f" },
  2025: { en: "Mixed / rotation", zh: "震荡 / 轮动", tone: "#b88935" },
  2026: { en: "Mixed YTD", zh: "震荡 YTD", tone: "#b88935" },
};

const COLORS = {
  green: "#006b4f",
  teal: "#176f80",
  gold: "#b88935",
  red: "#a44e45",
  ink: "#10211b",
  muted: "#6c756f",
  line: "#ded8cd",
  paper: "#f5f3ee",
};

let DATA = null;
let lang = "en";
let mobileIndex = 0;

const $ = (id) => document.getElementById(id);
const fmtPct = (value, digits = 2) => `${Number(value).toFixed(digits)}%`;
const fmtMultiple = (roi) => `${(1 + Number(roi) / 100).toFixed(2)}x`;

function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = value;
}

function tNode(node) {
  return node.dataset[lang] || node.dataset.en || node.textContent;
}

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh" : "en";
  document.querySelectorAll("[data-en]").forEach((node) => {
    node.textContent = tNode(node);
  });
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
  updateMobileSlides(false);
}

function resizeCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function clear(canvas) {
  const state = resizeCanvas(canvas);
  if (!state) return null;
  state.ctx.clearRect(0, 0, state.w, state.h);
  return state;
}

function monthlyStats() {
  const rows = DATA.monthly_returns || [];
  const positives = rows.filter((row) => row.return_pct > 0).length;
  const avg = rows.reduce((sum, row) => sum + row.return_pct, 0) / rows.length;
  return { positives, count: rows.length, positiveRate: positives / rows.length * 100, avg };
}

function annualReturns() {
  const grouped = new Map();
  for (const row of DATA.monthly_returns || []) {
    const year = row.month.slice(0, 4);
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year).push(row.return_pct);
  }
  return Array.from(grouped, ([year, values]) => ({
    year,
    return_pct: (values.reduce((acc, value) => acc * (1 + value / 100), 1) - 1) * 100,
  }));
}

function drawLabel(ctx, text, x, y, color = COLORS.ink, size = 13, weight = 760) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText(text, x, y);
}

function drawThesisMap() {
  const canvas = $("thesis-map");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  if (w < 520) {
    const rows = [
      ["Trend", COLORS.green],
      ["Liquidity", COLORS.teal],
      ["Positioning", COLORS.gold],
      ["Volatility", COLORS.green],
      ["Crowd behavior", COLORS.teal],
    ];
    rows.forEach(([label, color], i) => {
      const y = 26 + i * 48;
      roundRect(ctx, 18, y, w - 36, 34, 999);
      ctx.fillStyle = color;
      ctx.fill();
      drawLabel(ctx, label, 34, y + 22, "#fff", 12, 760);
    });
    roundRect(ctx, 42, h - 58, w - 84, 48, 2);
    ctx.fillStyle = COLORS.ink;
    ctx.fill();
    drawLabel(ctx, "Multi-regime capital platform", 58, h - 29, "#fff", 12, 760);
    return;
  }
  const cx = w / 2;
  const cy = h / 2 + 14;
  const nodes = [
    ["Trend", -170, -120, COLORS.green],
    ["Liquidity", 170, -120, COLORS.teal],
    ["Positioning", -205, 88, COLORS.gold],
    ["Volatility", 205, 88, COLORS.green],
    ["Crowd behavior", 0, 152, COLORS.teal],
  ];
  ctx.strokeStyle = "rgba(16,33,27,.12)";
  ctx.lineWidth = 1;
  for (const [, dx, dy] of nodes) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();
  }
  roundRect(ctx, cx - 108, cy - 48, 216, 96, 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  drawLabel(ctx, "Multi-Regime", cx - 63, cy - 7, "#f7f4ec", 17, 780);
  drawLabel(ctx, "Capital Platform", cx - 72, cy + 20, "rgba(247,244,236,.7)", 12, 680);
  for (const [label, dx, dy, color] of nodes) {
    roundRect(ctx, cx + dx - 74, cy + dy - 23, 148, 46, 999);
    ctx.fillStyle = color;
    ctx.fill();
    drawLabel(ctx, label, cx + dx - ctx.measureText(label).width / 2, cy + dy + 5, "#fff", 13, 760);
  }
}

function drawFailureChart() {
  const canvas = $("failure-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const x = 42;
  const y = 70;
  const bw = (w - 120) / 3;
  const rows = [
    ["Single engine", 86, COLORS.red],
    ["Generic indicators", 68, COLORS.gold],
    ["Multi-engine platform", 24, COLORS.green],
  ];
  drawLabel(ctx, "Failure dependence index", x, 32, COLORS.muted, 13, 720);
  rows.forEach(([label, value, color], i) => {
    const bh = (h - 140) * (value / 100);
    const bx = x + i * bw;
    ctx.fillStyle = "rgba(16,33,27,.06)";
    ctx.fillRect(bx, y, bw * .58, h - 140);
    roundRect(ctx, bx, y + (h - 140 - bh), bw * .58, bh, 4);
    ctx.fillStyle = color;
    ctx.fill();
    drawLabel(ctx, `${value}`, bx + 8, y + (h - 148 - bh), COLORS.ink, 20, 820);
    drawLabel(ctx, label, bx, h - 34, COLORS.muted, 13, 700);
  });
}

function drawDataAdvantageChart() {
  const canvas = $("data-advantage-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const compact = w < 520;
  if (compact) {
    const rows = [
      ["Price label", "Late"],
      ["Indicator stack", "Reactive"],
      ["Data analysis", "Context"],
      ["Portfolio review", "Evidence"],
    ];
    rows.forEach(([label, value], i) => {
      const y = 24 + i * 54;
      roundRect(ctx, 18, y, w - 36, 38, 2);
      ctx.fillStyle = i < 2 ? "rgba(184,137,53,.16)" : "rgba(0,107,79,.14)";
      ctx.fill();
      ctx.strokeStyle = i < 2 ? "rgba(184,137,53,.32)" : "rgba(0,107,79,.28)";
      ctx.stroke();
      drawLabel(ctx, label, 32, y + 24, COLORS.ink, 12, 780);
      drawLabel(ctx, value, w - 98, y + 24, i < 2 ? COLORS.gold : COLORS.green, 12, 820);
    });
    return;
  }
  const left = 48;
  const top = 70;
  const colW = (w - 120) / 2;
  const rows = [
    ["Indicator label", "Price cross", "MACD / RSI", "Single confirmation"],
    ["Data analysis", "Regime context", "Liquidity / positioning", "Portfolio evidence"],
  ];
  rows.forEach(([title, one, two, three], i) => {
    const x = left + i * (colW + 24);
    roundRect(ctx, x, top, colW, h - 130, 2);
    ctx.fillStyle = i === 0 ? "rgba(184,137,53,.10)" : "rgba(0,107,79,.10)";
    ctx.fill();
    ctx.strokeStyle = i === 0 ? "rgba(184,137,53,.28)" : "rgba(0,107,79,.28)";
    ctx.stroke();
    drawLabel(ctx, title, x + 28, top + 44, i === 0 ? COLORS.gold : COLORS.green, 22, 840);
    [one, two, three].forEach((text, j) => {
      const y = top + 96 + j * 62;
      ctx.strokeStyle = "rgba(16,33,27,.12)";
      ctx.beginPath();
      ctx.moveTo(x + 28, y - 24);
      ctx.lineTo(x + colW - 28, y - 24);
      ctx.stroke();
      drawLabel(ctx, text, x + 28, y, COLORS.ink, 16, 760);
    });
  });
  drawLabel(ctx, "The advantage is context before confirmation.", left, h - 36, COLORS.muted, 14, 720);
}

function drawValidationStackChart() {
  const canvas = $("validation-stack-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const layers = [
    ["Research hypothesis", COLORS.ink],
    ["Historical validation", COLORS.green],
    ["Stability checks", COLORS.teal],
    ["Execution stress", COLORS.gold],
    ["Live reconciliation", COLORS.green],
  ];
  const left = 40;
  const top = 46;
  const height = 58;
  layers.forEach(([label, color], i) => {
    const width = w - 80 - i * 34;
    const x = left + i * 17;
    const y = top + i * (height + 14);
    roundRect(ctx, x, y, width, height, 2);
    ctx.fillStyle = i === 0 ? "rgba(16,33,27,.96)" : color;
    ctx.fill();
    drawLabel(ctx, label, x + 22, y + 36, "#fff", 15, 760);
  });
  drawLabel(ctx, "Validation stack", left, h - 30, COLORS.muted, 13, 720);
}

function drawGovernanceChart() {
  const canvas = $("governance-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const steps = ["Data", "Signal", "RL Review", "Veto", "Execution", "Monitoring"];
  if (w < 520) {
    const cols = 2;
    const gap = 12;
    const bw = (w - 48 - gap) / cols;
    steps.forEach((step, i) => {
      const x = 24 + (i % cols) * (bw + gap);
      const y = 20 + Math.floor(i / cols) * 64;
      roundRect(ctx, x, y, bw, 48, 2);
      ctx.fillStyle = i === 3 ? COLORS.gold : i > 3 ? COLORS.teal : COLORS.green;
      ctx.fill();
      drawLabel(ctx, step, x + 11, y + 29, "#fff", 11, 780);
    });
    drawLabel(ctx, "Only qualified decisions reach execution.", 24, h - 30, COLORS.muted, 12, 700);
    return;
  }
  const gap = 16;
  const bw = (w - 72 - gap * (steps.length - 1)) / steps.length;
  const y = h / 2 - 36;
  steps.forEach((step, i) => {
    const x = 36 + i * (bw + gap);
    roundRect(ctx, x, y, bw, 72, 3);
    ctx.fillStyle = i === 3 ? COLORS.gold : i > 3 ? COLORS.teal : COLORS.green;
    ctx.fill();
    drawLabel(ctx, step, x + 14, y + 42, "#fff", 13, 780);
    if (i < steps.length - 1) {
      ctx.strokeStyle = "rgba(16,33,27,.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + bw, y + 36);
      ctx.lineTo(x + bw + gap, y + 36);
      ctx.stroke();
    }
  });
  drawLabel(ctx, "Only qualified decisions reach capital exposure", 36, y + 116, COLORS.muted, 14, 700);
}

function drawConstructionChart() {
  const canvas = $("construction-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const rows = DATA.strategy_returns || [];
  const cx = w / 2;
  const cy = h / 2;
  rows.forEach((row, i) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / rows.length;
    const r = 150 + (i % 2) * 36;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.strokeStyle = "rgba(16,33,27,.11)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    roundRect(ctx, x - 55, y - 22, 110, 44, 999);
    ctx.fillStyle = i < 3 ? COLORS.green : i < 5 ? COLORS.teal : COLORS.gold;
    ctx.fill();
    drawLabel(ctx, row.strategy, x - ctx.measureText(row.strategy).width / 2, y + 5, "#fff", 12, 760);
  });
  roundRect(ctx, cx - 78, cy - 42, 156, 84, 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  drawLabel(ctx, "Portfolio", cx - 34, cy - 4, "#fff", 16, 800);
  drawLabel(ctx, "one allocation profile", cx - 55, cy + 20, "rgba(255,255,255,.64)", 11, 650);
}

function drawEquityChart() {
  const canvas = $("equity-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const rows = DATA.equity_curve || [];
  if (!rows.length) return;
  const base = rows[0].equity;
  const vals = rows.map((row) => (row.equity / base - 1) * 100);
  const min = Math.min(0, ...vals);
  const max = Math.max(...vals);
  const pad = { l: 50, r: 24, t: 28, b: 46 };
  const sx = (i) => pad.l + i / (vals.length - 1) * (w - pad.l - pad.r);
  const sy = (v) => pad.t + (max - v) / (max - min || 1) * (h - pad.t - pad.b);
  ctx.strokeStyle = "rgba(16,33,27,.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = pad.t + i * (h - pad.t - pad.b) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
  }
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = sx(i);
    const y = sy(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  drawLabel(ctx, "ROI curve, indexed to 0%", pad.l, h - 16, COLORS.muted, 12, 700);
  drawLabel(ctx, fmtPct(vals.at(-1), 2), w - 170, sy(vals.at(-1)) - 14, COLORS.green, 24, 860);
}

function drawBenchmarkChart() {
  const canvas = $("benchmark-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const total = DATA.portfolio.validated_combo_return_pct;
  const rows = [
    ["NTS Alpha Labs", total, COLORS.green],
    ["S&P 500", SP500_RETURN, COLORS.teal],
    ["Malaysia FD", FD_RETURN, COLORS.gold],
  ];
  const max = total;
  const x = 190;
  const top = 90;
  const barW = w - x - 92;
  rows.forEach(([label, value, color], i) => {
    const y = top + i * 92;
    drawLabel(ctx, label, 38, y + 18, COLORS.ink, 17, 820);
    roundRect(ctx, x, y, barW, 28, 999);
    ctx.fillStyle = "rgba(16,33,27,.08)";
    ctx.fill();
    roundRect(ctx, x, y, Math.max(18, barW * value / max), 28, 999);
    ctx.fillStyle = color;
    ctx.fill();
    drawLabel(ctx, fmtPct(value, value === total ? 2 : 1), x + Math.max(18, barW * value / max) + 16, y + 21, color, 18, 820);
  });
  drawLabel(ctx, `ROI multiple over S&P 500: ${(total / SP500_RETURN).toFixed(1)}x`, x, h - 48, COLORS.muted, 15, 760);
}

function drawAnnualRegimeChart() {
  const canvas = $("annual-regime-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const rows = annualReturns();
  const max = Math.max(...rows.map((row) => row.return_pct));
  const pad = { l: 48, r: 26, t: 44, b: 78 };
  const slot = (w - pad.l - pad.r) / rows.length;
  rows.forEach((row, i) => {
    const regime = REGIMES[row.year] || REGIMES[2026];
    const bh = (h - pad.t - pad.b) * row.return_pct / max;
    const x = pad.l + i * slot + slot * .24;
    const y = h - pad.b - bh;
    roundRect(ctx, x, y, slot * .52, bh, 6);
    ctx.fillStyle = regime.tone;
    ctx.fill();
    drawLabel(ctx, fmtPct(row.return_pct, 0), x + 4, y - 12, COLORS.ink, 15, 820);
    drawLabel(ctx, row.year === "2026" ? "2026 YTD" : row.year, x, h - 46, COLORS.muted, 13, 760);
    roundRect(ctx, x - 10, h - 30, slot * .52 + 20, 22, 999);
    ctx.fillStyle = regime.tone;
    ctx.fill();
    drawLabel(ctx, regime[lang], x, h - 14, "#fff", 10, 760);
  });
}

function drawRegimeExplainerChart() {
  const canvas = $("regime-explainer-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const compact = w < 520;
  const rows = [
    { label: lang === "zh" ? "熊市" : "Bear", color: COLORS.teal, points: [28, 18, 24, 22, 30], mode: lang === "zh" ? "更选择性" : "Selective" },
    { label: lang === "zh" ? "牛市" : "Bull", color: COLORS.green, points: [22, 36, 48, 58, 72], mode: lang === "zh" ? "更积极" : "Expansion" },
    { label: lang === "zh" ? "震荡市" : "Mixed", color: COLORS.gold, points: [26, 34, 25, 40, 32], mode: lang === "zh" ? "轮动贡献" : "Rotation" },
  ];
  if (compact) {
    rows.forEach((row, i) => {
      const y = 28 + i * 76;
      drawLabel(ctx, row.label, 18, y + 15, COLORS.ink, 14, 820);
      const x = 86;
      const bw = w - 126;
      row.points.forEach((p, j) => {
        const px = x + j * (bw / (row.points.length - 1));
        const py = y + 42 - p * .32;
        ctx.beginPath();
        if (j === 0) ctx.moveTo(px, py);
      });
      ctx.strokeStyle = row.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      row.points.forEach((p, j) => {
        const px = x + j * (bw / (row.points.length - 1));
        const py = y + 48 - p * .32;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      drawLabel(ctx, row.mode, w - 88, y + 18, row.color, 11, 760);
    });
    return;
  }
  const chartX = 44;
  const chartY = 58;
  const chartW = w - 88;
  const bandH = (h - 126) / rows.length;
  rows.forEach((row, i) => {
    const y = chartY + i * bandH;
    ctx.fillStyle = i % 2 ? "rgba(16,33,27,.035)" : "rgba(16,33,27,.02)";
    ctx.fillRect(chartX, y, chartW, bandH - 14);
    drawLabel(ctx, row.label, chartX + 18, y + 34, COLORS.ink, 18, 820);
    drawLabel(ctx, row.mode, chartX + 18, y + 58, row.color, 12, 780);
    const x0 = chartX + 170;
    const lineW = chartW - 210;
    ctx.strokeStyle = row.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    row.points.forEach((p, j) => {
      const px = x0 + j * (lineW / (row.points.length - 1));
      const py = y + bandH - 36 - p * .55;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  });
  drawLabel(ctx, "Return rhythm changes with market structure; the portfolio adapts by engine participation.", chartX, h - 28, COLORS.muted, 14, 720);
}

function drawMonthlyDistribution() {
  const canvas = $("monthly-distribution-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const bins = [-5, 0, 2, 4, 6, 8, 10, 99];
  const labels = ["<0", "0-2", "2-4", "4-6", "6-8", "8-10", "10+"];
  const counts = new Array(labels.length).fill(0);
  DATA.monthly_returns.forEach((row) => {
    const idx = bins.findIndex((b, i) => row.return_pct >= b && row.return_pct < bins[i + 1]);
    if (idx >= 0) counts[idx] += 1;
  });
  const max = Math.max(...counts, 1);
  const pad = { l: 36, r: 16, t: 30, b: 42 };
  const slot = (w - pad.l - pad.r) / counts.length;
  counts.forEach((count, i) => {
    const bh = (h - pad.t - pad.b) * count / max;
    const x = pad.l + i * slot + slot * .18;
    const y = h - pad.b - bh;
    roundRect(ctx, x, y, slot * .58, bh, 5);
    ctx.fillStyle = i === 0 ? COLORS.red : i < 3 ? COLORS.gold : COLORS.green;
    ctx.fill();
    drawLabel(ctx, labels[i], x, h - 16, COLORS.muted, 11, 700);
  });
  drawLabel(ctx, "Monthly ROI distribution", pad.l, 18, COLORS.muted, 12, 720);
}

function drawContributionWheel() {
  const canvas = $("contribution-wheel");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const rows = DATA.strategy_contribution || [];
  const total = rows.reduce((sum, row) => sum + row.contribution_pct, 0);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * .32;
  let start = -Math.PI / 2;
  rows.forEach((row, i) => {
    const end = start + Math.PI * 2 * row.contribution_pct / total;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = i < 2 ? COLORS.green : i < 4 ? COLORS.teal : COLORS.gold;
    ctx.globalAlpha = 1 - i * .035;
    ctx.fill();
    start = end;
  });
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * .5, 0, Math.PI * 2);
  ctx.fillStyle = "#fffdfa";
  ctx.fill();
  drawLabel(ctx, "Contribution", cx - 44, cy - 4, COLORS.ink, 14, 800);
  drawLabel(ctx, "breadth", cx - 23, cy + 18, COLORS.muted, 12, 700);
}

function drawStrategyRoiChart() {
  const canvas = $("strategy-roi-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const rows = [...DATA.strategy_returns].sort((a, b) => b.return_pct - a.return_pct);
  const max = Math.max(...rows.map((row) => row.return_pct));
  const x = 120;
  const rowH = Math.min(42, (h - 58) / rows.length);
  rows.forEach((row, i) => {
    const y = 34 + i * rowH;
    drawLabel(ctx, row.strategy, 12, y + 16, COLORS.ink, 12, 760);
    roundRect(ctx, x, y, w - x - 72, 14, 999);
    ctx.fillStyle = "rgba(16,33,27,.08)";
    ctx.fill();
    roundRect(ctx, x, y, (w - x - 72) * row.return_pct / max, 14, 999);
    ctx.fillStyle = i < 2 ? COLORS.green : i < 4 ? COLORS.teal : COLORS.gold;
    ctx.fill();
    drawLabel(ctx, fmtPct(row.return_pct, 1), w - 62, y + 13, i < 2 ? COLORS.green : COLORS.gold, 11, 760);
  });
}

function drawCapacityChart() {
  const canvas = $("capacity-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const stages = [
    ["Liquidity profile", "Where the market can absorb execution"],
    ["Execution constraints", "How orders should be sized and paced"],
    ["Slippage model", "What return survives real trading"],
    ["Scaling assumptions", "How allocation can increase responsibly"],
  ];
  if (w < 520) {
    const cols = 2;
    const gap = 10;
    const bw = (w - 42 - gap) / cols;
    stages.forEach(([title, copy], i) => {
      const x = 16 + (i % cols) * (bw + gap);
      const y = 22 + Math.floor(i / cols) * 118;
      roundRect(ctx, x, y, bw, 98, 2);
      ctx.fillStyle = i % 2 ? "rgba(23,111,128,.10)" : "rgba(0,107,79,.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(16,33,27,.12)";
      ctx.stroke();
      drawLabel(ctx, `0${i + 1}`, x + 10, y + 22, COLORS.green, 10, 820);
      wrapText(ctx, title, x + 10, y + 48, bw - 20, 14, COLORS.ink, 12);
      wrapText(ctx, copy, x + 10, y + 76, bw - 20, 12, COLORS.muted, 9);
    });
    return;
  }
  const bw = (w - 96) / stages.length;
  stages.forEach(([title, copy], i) => {
    const x = 40 + i * bw;
    const y = 110 + i * 22;
    roundRect(ctx, x, y, bw - 18, 160, 2);
    ctx.fillStyle = i % 2 ? "rgba(23,111,128,.10)" : "rgba(0,107,79,.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(16,33,27,.12)";
    ctx.stroke();
    drawLabel(ctx, `0${i + 1}`, x + 18, y + 34, COLORS.green, 12, 820);
    drawLabel(ctx, title, x + 18, y + 70, COLORS.ink, 17, 820);
    wrapText(ctx, copy, x + 18, y + 104, bw - 56, 15, COLORS.muted, 13);
  });
}

function drawOsChart() {
  const canvas = $("os-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const steps = ["Data", "Signal", "Decision", "Execution", "Risk", "Monitoring"];
  if (w < 520) {
    const cols = 2;
    const gap = 10;
    const bw = (w - 42 - gap) / cols;
    steps.forEach((step, i) => {
      const x = 16 + (i % cols) * (bw + gap);
      const y = 28 + Math.floor(i / cols) * 62;
      roundRect(ctx, x, y, bw, 44, 2);
      ctx.fillStyle = i === 4 ? COLORS.gold : i >= 3 ? COLORS.teal : COLORS.green;
      ctx.fill();
      drawLabel(ctx, step, x + 10, y + 27, "#fff", 11, 800);
    });
    return;
  }
  const x0 = 52;
  const y = h / 2 - 42;
  const gap = 12;
  const bw = (w - x0 * 2 - gap * (steps.length - 1)) / steps.length;
  steps.forEach((step, i) => {
    const x = x0 + i * (bw + gap);
    roundRect(ctx, x, y, bw, 84, 2);
    ctx.fillStyle = i === 4 ? COLORS.gold : i >= 3 ? COLORS.teal : COLORS.green;
    ctx.fill();
    drawLabel(ctx, step, x + 14, y + 48, "#fff", 14, 800);
  });
}

function drawMarketExpansionChart() {
  const canvas = $("market-expansion-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const rows = [
    ["Crypto", "First proof point", COLORS.green],
    ["FX", "Liquid macro layer", COLORS.teal],
    ["Indices", "Broader beta context", COLORS.gold],
    ["Commodities", "Cycle and liquidity layer", COLORS.teal],
  ];
  if (w < 520) {
    const cols = 2;
    const gap = 10;
    const bw = (w - 42 - gap) / cols;
    rows.forEach(([title, copy, color], i) => {
      const x = 16 + (i % cols) * (bw + gap);
      const y = 24 + Math.floor(i / cols) * 86;
      roundRect(ctx, x, y, bw, 66, 2);
      ctx.fillStyle = color;
      ctx.fill();
      drawLabel(ctx, title, x + 10, y + 29, "#fff", 14, 820);
      wrapText(ctx, copy, x + 10, y + 49, bw - 20, 12, "rgba(255,255,255,.74)", 9);
    });
    roundRect(ctx, 32, h - 62, w - 64, 44, 2);
    ctx.fillStyle = COLORS.ink;
    ctx.fill();
    drawLabel(ctx, "Market-agnostic system layer", 48, h - 35, "#fff", 12, 780);
    return;
  }
  const cx = w / 2;
  const cy = h / 2;
  rows.forEach(([title, copy, color], i) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / rows.length;
    const x = cx + Math.cos(angle) * 230;
    const y = cy + Math.sin(angle) * 150;
    ctx.strokeStyle = "rgba(16,33,27,.12)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    roundRect(ctx, x - 92, y - 42, 184, 84, 2);
    ctx.fillStyle = color;
    ctx.fill();
    drawLabel(ctx, title, x - 52, y - 6, "#fff", 18, 820);
    drawLabel(ctx, copy, x - 70, y + 20, "rgba(255,255,255,.72)", 11, 650);
  });
  roundRect(ctx, cx - 96, cy - 42, 192, 84, 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  drawLabel(ctx, "Market-agnostic", cx - 65, cy - 2, "#fff", 15, 820);
  drawLabel(ctx, "system layer", cx - 39, cy + 21, "rgba(255,255,255,.68)", 12, 650);
}

function drawScaleTimelineChart() {
  const canvas = $("scale-timeline-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const stages = [
    ["Proof", "Validated ROI and monthly behavior"],
    ["Product", "Portfolio, governance, reporting"],
    ["Platform", "More engines and liquid markets"],
    ["Institution", "Repeatable allocation process"],
  ];
  if (w < 520) {
    stages.forEach(([title, copy], i) => {
      const y = 24 + i * 58;
      ctx.beginPath();
      ctx.arc(28, y + 12, 9, 0, Math.PI * 2);
      ctx.fillStyle = i < 2 ? COLORS.green : i === 2 ? COLORS.teal : COLORS.gold;
      ctx.fill();
      if (i < stages.length - 1) {
        ctx.strokeStyle = "rgba(16,33,27,.16)";
        ctx.beginPath();
        ctx.moveTo(28, y + 22);
        ctx.lineTo(28, y + 58);
        ctx.stroke();
      }
      drawLabel(ctx, title, 52, y + 15, COLORS.ink, 14, 820);
      wrapText(ctx, copy, 52, y + 35, w - 70, 13, COLORS.muted, 10);
    });
    return;
  }
  const y = h / 2;
  ctx.strokeStyle = "rgba(16,33,27,.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, y);
  ctx.lineTo(w - 70, y);
  ctx.stroke();
  stages.forEach(([title, copy], i) => {
    const x = 70 + i * (w - 140) / (stages.length - 1);
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fillStyle = i < 2 ? COLORS.green : i === 2 ? COLORS.teal : COLORS.gold;
    ctx.fill();
    drawLabel(ctx, title, x - 38, y - 52, COLORS.ink, 19, 820);
    wrapText(ctx, copy, x - 70, y + 45, 140, 15, COLORS.muted, 12);
  });
}

function drawPath100mChart() {
  const canvas = $("path-100m-chart");
  const state = clear(canvas);
  if (!state) return;
  const { ctx, w, h } = state;
  const compact = w < 520;
  const pts = [
    [compact ? 0.10 : 0.06, 0.78, "Proof", "Proof"],
    [0.28, 0.62, "Reporting", "Reporting"],
    [0.52, 0.43, "Market coverage", "Coverage"],
    [0.76, 0.25, "Institutional process", "Process"],
    [compact ? 0.90 : 0.94, 0.14, "100M conversation", "100M"],
  ];
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const x = px * w;
    const y = py * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  pts.forEach(([px, py, label, shortLabel], i) => {
    const x = px * w;
    const y = py * h;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = i === pts.length - 1 ? COLORS.gold : COLORS.green;
    ctx.fill();
    const text = compact ? shortLabel : label;
    const labelWidth = ctx.measureText(text).width || 70;
    const labelX = Math.max(8, Math.min(x - 48, w - labelWidth - 8));
    drawLabel(ctx, text, labelX, y - 18, COLORS.ink, compact ? 12 : 13, 760);
  });
  const footer = compact
    ? "Performance, governance and capacity mature together."
    : "Capital scales when performance, governance and capacity mature together.";
  wrapText(ctx, footer, compact ? 24 : 40, h - 48, w - (compact ? 48 : 80), compact ? 16 : 18, COLORS.muted, compact ? 12 : 14);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, color, size) {
  ctx.fillStyle = color;
  ctx.font = `650 ${size}px -apple-system, BlinkMacSystemFont, sans-serif`;
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function renderHeatmap() {
  const node = $("monthly-heatmap");
  if (!node) return;
  const heat = DATA.monthly_heatmap;
  const labels = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  let html = labels.map((label) => `<div class="heat-label">${label}</div>`).join("");
  heat.years.forEach((year, rowIndex) => {
    html += `<div class="heat-label">${year}</div>`;
    heat.months.forEach((month, colIndex) => {
      const value = heat.matrix[rowIndex][colIndex];
      const color = value == null
        ? "#e8e4dc"
        : value >= 0
          ? `rgba(0,107,79,${0.28 + Math.min(0.62, value / Math.max(1, heat.max_value) * .62)})`
          : `rgba(164,78,69,${0.28 + Math.min(0.62, Math.abs(value) / Math.max(1, Math.abs(heat.min_value)) * .62)})`;
      html += `<div class="heat-cell" style="background:${color}" title="${year}-${month}">${value == null ? "" : value.toFixed(1)}</div>`;
    });
  });
  node.innerHTML = html;
}

function drawAllCharts() {
  drawThesisMap();
  drawDataAdvantageChart();
  drawFailureChart();
  drawValidationStackChart();
  drawGovernanceChart();
  drawConstructionChart();
  drawEquityChart();
  drawBenchmarkChart();
  drawAnnualRegimeChart();
  drawRegimeExplainerChart();
  drawMonthlyDistribution();
  drawContributionWheel();
  drawStrategyRoiChart();
  drawCapacityChart();
  drawOsChart();
  drawMarketExpansionChart();
  drawScaleTimelineChart();
  drawPath100mChart();
}

function fillMetrics() {
  const p = DATA.portfolio;
  const stats = monthlyStats();
  setText("total-roi", fmtPct(p.validated_combo_return_pct, 2));
  setText("report-roi", fmtPct(p.validated_combo_return_pct, 2));
  setText("report-positive", fmtPct(stats.positiveRate, 0));
  setText("report-engines", String(DATA.headline.engine_count));
  setText("report-recent", fmtPct(p.independent_combo_return_pct, 2));
  setText("close-roi", fmtPct(p.validated_combo_return_pct, 2));
}

function isMobile() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function visibleCharts() {
  if (!isMobile()) {
    drawAllCharts();
    return;
  }
  const active = document.querySelector(".slide-page.is-active");
  if (!active) return;
  if (active.querySelector("#thesis-map")) drawThesisMap();
  if (active.querySelector("#data-advantage-chart")) drawDataAdvantageChart();
  if (active.querySelector("#failure-chart")) drawFailureChart();
  if (active.querySelector("#validation-stack-chart")) drawValidationStackChart();
  if (active.querySelector("#governance-chart")) drawGovernanceChart();
  if (active.querySelector("#construction-chart")) drawConstructionChart();
  if (active.querySelector("#equity-chart")) drawEquityChart();
  if (active.querySelector("#benchmark-chart")) drawBenchmarkChart();
  if (active.querySelector("#annual-regime-chart")) drawAnnualRegimeChart();
  if (active.querySelector("#regime-explainer-chart")) drawRegimeExplainerChart();
  if (active.querySelector("#monthly-distribution-chart")) drawMonthlyDistribution();
  if (active.querySelector("#contribution-wheel")) drawContributionWheel();
  if (active.querySelector("#strategy-roi-chart")) drawStrategyRoiChart();
  if (active.querySelector("#capacity-chart")) drawCapacityChart();
  if (active.querySelector("#os-chart")) drawOsChart();
  if (active.querySelector("#market-expansion-chart")) drawMarketExpansionChart();
  if (active.querySelector("#scale-timeline-chart")) drawScaleTimelineChart();
  if (active.querySelector("#path-100m-chart")) drawPath100mChart();
}

function updateMobileSlides(redraw = true) {
  const slides = Array.from(document.querySelectorAll(".slide-page"));
  const prev = $("mobile-prev");
  const next = $("mobile-next");
  const count = $("mobile-slide-count");
  if (!slides.length || !prev || !next || !count) return;
  if (!isMobile()) {
    slides.forEach((slide) => slide.classList.remove("is-active"));
    count.textContent = `1 / ${slides.length}`;
    return;
  }
  mobileIndex = Math.max(0, Math.min(mobileIndex, slides.length - 1));
  slides.forEach((slide, index) => slide.classList.toggle("is-active", index === mobileIndex));
  count.textContent = `${mobileIndex + 1} / ${slides.length}`;
  prev.disabled = mobileIndex === 0;
  next.disabled = mobileIndex === slides.length - 1;
  prev.textContent = lang === "zh" ? "上一页" : "Prev";
  next.textContent = lang === "zh" ? "下一页" : "Next";
  if (redraw) visibleCharts();
}

function moveSlide(delta) {
  mobileIndex += delta;
  updateMobileSlides(true);
}

async function init() {
  const response = await fetch(DATA_URL);
  DATA = await response.json();
  applyLanguage();
  fillMetrics();
  renderHeatmap();
  updateMobileSlides(true);
  visibleCharts();
}

document.querySelectorAll(".lang-btn").forEach((button) => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    applyLanguage();
    fillMetrics();
    visibleCharts();
  });
});

$("mobile-prev")?.addEventListener("click", () => moveSlide(-1));
$("mobile-next")?.addEventListener("click", () => moveSlide(1));

window.addEventListener("resize", () => {
  updateMobileSlides(false);
  visibleCharts();
});

init().catch((error) => {
  console.error("Failed to render investor deck", error);
});
