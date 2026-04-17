const DATA_URL = "./data/dashboard_data.json";

const COLORS = {
  bg: "#08131d",
  grid: "rgba(147, 172, 197, 0.12)",
  text: "#edf4f8",
  muted: "#8ea0b3",
  accent: "#f0b45c",
  bull: "#29c08b",
  bear: "#ff7262",
  ema144: "#f5c97a",
  ema169: "#7cc7ff",
  be: "#66c6ff",
  cash: "#7e90a4",
  replay: "#d98fff",
  purple: "#d18dff",
};

const stateStyles = {
  CASH: { fill: "rgba(126, 144, 164, 0.18)", stroke: COLORS.cash, chip: "cash" },
  LONG: { fill: "rgba(41, 192, 139, 0.22)", stroke: COLORS.bull, chip: "long" },
  SHORT: { fill: "rgba(255, 114, 98, 0.22)", stroke: COLORS.bear, chip: "short" },
  LONG_ACTIVE: { fill: "rgba(41, 192, 139, 0.22)", stroke: COLORS.bull, chip: "long" },
  SHORT_ACTIVE: { fill: "rgba(255, 114, 98, 0.22)", stroke: COLORS.bear, chip: "short" },
  TP50_LOCKED: { fill: "rgba(240, 180, 92, 0.22)", stroke: COLORS.accent, chip: "be" },
  BE_ARMED: { fill: "rgba(102, 198, 255, 0.22)", stroke: COLORS.be, chip: "be" },
};

const zLineStyles = [
  { key: "z_price", label: "Z Price", color: "#f0b45c" },
  { key: "z_oi", label: "Z OI", color: "#57c7ff" },
  { key: "z_ls", label: "Z LS", color: "#d18dff" },
];

const overlayDefaults = {
  backtest: true,
  replay: true,
  ema: true,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function uniq(values) {
  return [...new Set(values)];
}

function parseTimestamp(raw) {
  if (!raw) {
    return null;
  }
  const normalized = raw.replace(" ", "T");
  const trimmed = normalized.includes(".") ? normalized.slice(0, 23) : normalized;
  const parsed = new Date(trimmed);
  const time = parsed.getTime();
  return Number.isNaN(time) ? null : time;
}

function formatTimestamp(raw) {
  const time = typeof raw === "number" ? raw : parseTimestamp(raw);
  if (time == null) {
    return "--";
  }
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatter.format(new Date(time));
}

function formatAxisTimestamp(raw) {
  const time = typeof raw === "number" ? raw : parseTimestamp(raw);
  if (time == null) {
    return "--";
  }
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
  });
  return formatter.format(new Date(time)).replace(" ", " ");
}

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatPrice(value) {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }
  const magnitude = Math.abs(value);
  const digits = magnitude >= 1000 ? 2 : magnitude >= 100 ? 2 : magnitude >= 1 ? 3 : 5;
  return formatNumber(value, digits);
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }
  return `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;
}

function formatCompactInteger(value) {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

function hasRealVolume(candles) {
  return candles.some((candle) => (candle.volume || 0) > 0);
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function stateLabel(state) {
  if (!state) {
    return "CASH";
  }
  return state.replaceAll("_", " ");
}

function findSegmentState(segments, index) {
  return segments.find((segment) => index >= segment.start_index && index <= segment.end_index) || null;
}

function tradeDistance(trade, index) {
  const start = trade.entry_index ?? trade.open_index;
  const end = trade.exit_index ?? trade.close_index;
  if (start == null || end == null) {
    return Number.POSITIVE_INFINITY;
  }
  if (index >= start && index <= end) {
    return 0;
  }
  return Math.min(Math.abs(index - start), Math.abs(index - end));
}

function findTradeContext(trades, index, proximity = 6) {
  return trades
    .filter((trade) => trade.mapped)
    .map((trade) => ({ trade, distance: tradeDistance(trade, index) }))
    .filter((item) => item.distance <= proximity)
    .sort((left, right) => left.distance - right.distance)
    .map((item) => item.trade)[0] || null;
}

function eventsOnCandle(events, index, controls) {
  return events
    .filter((event) => {
      if (event.layer === "backtest" && !controls.backtest) {
        return false;
      }
      if (event.layer === "replay" && !controls.replay) {
        return false;
      }
      return event.index === index;
    })
    .sort((left, right) => {
      const leftMs = left.ms ?? 0;
      const rightMs = right.ms ?? 0;
      return leftMs - rightMs;
    });
}

function createMetricRows(container, rows) {
  container.innerHTML = "";
  for (const row of rows) {
    const element = document.createElement("div");
    element.className = "metric-row";
    const label = document.createElement("span");
    label.className = "metric-label";
    label.textContent = row.label;
    const value = document.createElement("span");
    value.className = "metric-value";
    value.innerHTML = row.value;
    element.append(label, value);
    container.append(element);
  }
}

function renderEmpty(container, text) {
  container.innerHTML = `<div class="empty-copy">${text}</div>`;
}

function buildRuntimeAsset(asset) {
  if (asset.runtime) {
    return asset.runtime;
  }

  const candles = asset.candles.map((candle, index) => ({
    ...candle,
    index,
    ms: parseTimestamp(candle.ts),
  }));

  const backtestMarkers = asset.backtest.markers.map((marker) => ({
    ...marker,
    layer: "backtest",
    ms: parseTimestamp(marker.ts),
  }));

  const replayMarkers = asset.replay.markers.map((marker) => ({
    ...marker,
    layer: "replay",
    ms: parseTimestamp(marker.ts),
  }));

  const markers = [...backtestMarkers, ...replayMarkers].sort((left, right) => {
    const leftMs = left.ms ?? 0;
    const rightMs = right.ms ?? 0;
    return leftMs - rightMs;
  });

  asset.runtime = {
    candles,
    markers,
    timestamps: candles.map((candle) => candle.ms),
    lastCandle: candles[candles.length - 1] || null,
  };
  return asset.runtime;
}

class TradingCanvas {
  constructor({ canvas, overviewCanvas, onSelectionChange }) {
    this.canvas = canvas;
    this.overviewCanvas = overviewCanvas;
    this.onSelectionChange = onSelectionChange;
    this.asset = null;
    this.runtime = null;
    this.controls = { ...overlayDefaults };
    this.visibleCount = 180;
    this.viewStart = 0;
    this.crosshairIndex = null;
    this.hoverPoint = null;
    this.drag = null;

    this.bindEvents();
    const resizeObserver = new ResizeObserver(() => this.draw());
    resizeObserver.observe(this.canvas);
    resizeObserver.observe(this.overviewCanvas);
    this.resizeObserver = resizeObserver;
  }

  setAsset(asset, controls) {
    this.asset = asset;
    this.runtime = buildRuntimeAsset(asset);
    this.controls = { ...controls };
    const total = this.runtime.candles.length;
    this.visibleCount = clamp(Math.min(180, total), 36, Math.max(36, total));
    this.viewStart = Math.max(0, total - this.visibleCount);
    this.crosshairIndex = total > 0 ? total - 1 : null;
    this.draw();
  }

  updateControls(controls) {
    this.controls = { ...controls };
    this.draw();
  }

  visibleRange() {
    const total = this.runtime?.candles.length ?? 0;
    const count = clamp(Math.round(this.visibleCount), 1, Math.max(1, total));
    const maxStart = Math.max(0, total - count);
    const start = clamp(Math.round(this.viewStart), 0, maxStart);
    const end = Math.min(total, start + count);
    return { start, end, count };
  }

  bindEvents() {
    this.canvas.addEventListener("pointerdown", (event) => {
      if (!this.runtime) {
        return;
      }
      const point = canvasPoint(event, this.canvas);
      const { barWidth } = this.calculateGeometry();
      this.drag = {
        mode: "pan",
        pointerId: event.pointerId,
        startX: point.x,
        originStart: this.viewStart,
        barWidth,
      };
      this.canvas.setPointerCapture(event.pointerId);
    });

    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.runtime) {
        return;
      }
      const point = canvasPoint(event, this.canvas);
      if (this.drag?.mode === "pan") {
        const deltaX = point.x - this.drag.startX;
        const deltaBars = deltaX / Math.max(this.drag.barWidth, 0.1);
        this.viewStart = this.drag.originStart - deltaBars;
        this.draw();
        return;
      }

      this.hoverPoint = point;
      this.crosshairIndex = this.indexFromX(point.x);
      this.draw();
    });

    this.canvas.addEventListener("pointerleave", () => {
      if (this.drag) {
        return;
      }
      this.hoverPoint = null;
      if (this.runtime?.candles.length) {
        this.crosshairIndex = this.runtime.candles.length - 1;
      }
      this.draw();
    });

    this.canvas.addEventListener("pointerup", (event) => {
      if (this.drag) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
      this.drag = null;
      this.draw();
    });

    this.canvas.addEventListener(
      "wheel",
      (event) => {
        if (!this.runtime) {
          return;
        }
        event.preventDefault();
        const point = canvasPoint(event, this.canvas);
        const hoveredIndex = this.indexFromX(point.x);
        const range = this.visibleRange();
        const relative = (hoveredIndex - range.start) / Math.max(range.count - 1, 1);
        const zoomFactor = event.deltaY > 0 ? 1.14 : 0.86;
        const nextCount = clamp(
          Math.round(this.visibleCount * zoomFactor),
          36,
          Math.max(36, this.runtime.candles.length)
        );
        const nextStart = hoveredIndex - relative * nextCount;
        this.visibleCount = nextCount;
        this.viewStart = nextStart;
        this.draw();
      },
      { passive: false }
    );

    this.overviewCanvas.addEventListener("pointerdown", (event) => {
      if (!this.runtime) {
        return;
      }
      const point = canvasPoint(event, this.overviewCanvas);
      this.drag = {
        mode: "overview",
        pointerId: event.pointerId,
      };
      this.overviewCanvas.setPointerCapture(event.pointerId);
      this.panOverviewTo(point.x);
    });

    this.overviewCanvas.addEventListener("pointermove", (event) => {
      if (this.drag?.mode !== "overview") {
        return;
      }
      const point = canvasPoint(event, this.overviewCanvas);
      this.panOverviewTo(point.x);
    });

    this.overviewCanvas.addEventListener("pointerup", (event) => {
      if (this.drag?.mode === "overview") {
        this.overviewCanvas.releasePointerCapture(event.pointerId);
      }
      this.drag = null;
    });
  }

  panOverviewTo(x) {
    const rect = this.overviewCanvas.getBoundingClientRect();
    const ratio = clamp(x / rect.width, 0, 1);
    const total = this.runtime.candles.length;
    this.viewStart = ratio * total - this.visibleCount / 2;
    this.draw();
  }

  calculateGeometry() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 12, right: 72, bottom: 28, left: 12 };
    const plotWidth = width - padding.left - padding.right;
    const mainHeight = height * 0.62;
    const volumeHeight = height * 0.12;
    const indicatorHeight = height * 0.14;
    const stateHeight = height * 0.08;
    const gap = 8;

    const mainTop = padding.top;
    const volumeTop = mainTop + mainHeight + gap;
    const indicatorTop = volumeTop + volumeHeight + gap;
    const stateTop = indicatorTop + indicatorHeight + gap;

    const { start, end, count } = this.visibleRange();
    const barWidth = plotWidth / Math.max(count, 1);

    return {
      width,
      height,
      padding,
      plotWidth,
      mainPanel: { top: mainTop, height: mainHeight },
      volumePanel: { top: volumeTop, height: volumeHeight },
      indicatorPanel: { top: indicatorTop, height: indicatorHeight },
      statePanel: { top: stateTop, height: stateHeight },
      range: { start, end, count },
      barWidth,
    };
  }

  indexFromX(x) {
    const geometry = this.calculateGeometry();
    const { start, count } = geometry.range;
    const local = clamp(
      Math.round((x - geometry.padding.left) / Math.max(geometry.barWidth, 0.1)),
      0,
      Math.max(0, count - 1)
    );
    return clamp(start + local, 0, this.runtime.candles.length - 1);
  }

  xForIndex(index, geometry) {
    return (
      geometry.padding.left +
      (index - geometry.range.start + 0.5) * geometry.barWidth
    );
  }

  draw() {
    if (!this.asset || !this.runtime) {
      return;
    }

    const { ctx, width, height } = resizeCanvas(this.canvas);
    const geometry = this.calculateGeometry();
    const { start, end } = geometry.range;
    const visibleCandles = this.runtime.candles.slice(start, end);
    const visibleMarkers = this.runtime.markers.filter((marker) => {
      if (marker.index == null || marker.index < start || marker.index >= end) {
        return false;
      }
      if (marker.layer === "backtest" && !this.controls.backtest) {
        return false;
      }
      if (marker.layer === "replay" && !this.controls.replay) {
        return false;
      }
      return true;
    });

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    if (!visibleCandles.length) {
      return;
    }

    const crosshairIndex =
      this.crosshairIndex == null
        ? this.runtime.candles.length - 1
        : clamp(this.crosshairIndex, start, end - 1);
    const selectedCandle = this.runtime.candles[crosshairIndex];

    const priceValues = visibleCandles.flatMap((candle) => [
      candle.low,
      candle.high,
      this.controls.ema ? candle.ema144 : null,
      this.controls.ema ? candle.ema169 : null,
    ]);
    for (const marker of visibleMarkers) {
      if (marker.price != null) {
        priceValues.push(marker.price);
      }
    }

    const validPriceValues = priceValues.filter((value) => value != null);
    const priceMin = Math.min(...validPriceValues);
    const priceMax = Math.max(...validPriceValues);
    const pricePadding = (priceMax - priceMin || priceMax * 0.01 || 1) * 0.08;
    const priceScale = {
      min: priceMin - pricePadding,
      max: priceMax + pricePadding,
    };

    const volumeValues = visibleCandles.map((candle) => candle.volume || 0);
    const volumeMax = Math.max(...volumeValues, 1);
    const useRealVolume = hasRealVolume(visibleCandles);
    const flowValues = visibleCandles
      .map((candle) => candle.oi_delta)
      .filter((value) => value != null);
    const flowAbsMax = Math.max(...flowValues.map((value) => Math.abs(value)), 1);

    const zValues = visibleCandles.flatMap((candle) =>
      zLineStyles.map((line) => candle[line.key]).filter((value) => value != null)
    );
    const zMin = Math.min(...zValues, -2.25);
    const zMax = Math.max(...zValues, 2.25);
    const zScale = {
      min: Math.min(-2.2, zMin - 0.3),
      max: Math.max(2.2, zMax + 0.3),
    };

    this.drawGrid(ctx, geometry, priceScale, volumeMax, zScale);
    this.drawPricePanel(ctx, geometry, visibleCandles, visibleMarkers, priceScale);
    this.drawLiquidityPanel(ctx, geometry, visibleCandles, {
      useRealVolume,
      volumeMax,
      flowAbsMax,
    });
    this.drawIndicatorPanel(ctx, geometry, visibleCandles, zScale);
    this.drawStatePanel(ctx, geometry);
    this.drawAxisLabels(ctx, geometry, visibleCandles, priceScale, {
      useRealVolume,
      volumeMax,
      flowAbsMax,
    }, zScale);
    this.drawCrosshair(ctx, geometry, selectedCandle, crosshairIndex, priceScale, zScale);
    this.drawOverview();

    this.onSelectionChange({
      asset: this.asset,
      candle: selectedCandle,
      index: crosshairIndex,
      activeBacktestTrade: this.controls.backtest
        ? findTradeContext(this.asset.backtest.trades, crosshairIndex)
        : null,
      activeReplayTrade: this.controls.replay
        ? findTradeContext(this.asset.replay.lifecycles, crosshairIndex)
        : null,
      candleEvents: eventsOnCandle(this.runtime.markers, crosshairIndex, this.controls),
      backtestState: findSegmentState(this.asset.backtest.states, crosshairIndex),
      replayState: findSegmentState(this.asset.replay.states, crosshairIndex),
    });
  }

  drawGrid(ctx, geometry, priceScale, volumeMax, zScale) {
    const panels = [
      geometry.mainPanel,
      geometry.volumePanel,
      geometry.indicatorPanel,
      geometry.statePanel,
    ];

    ctx.save();
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (const panel of panels) {
      for (let i = 0; i <= 5; i += 1) {
        const y = panel.top + (panel.height * i) / 5;
        ctx.beginPath();
        ctx.moveTo(geometry.padding.left, y);
        ctx.lineTo(geometry.padding.left + geometry.plotWidth, y);
        ctx.stroke();
      }
    }

    for (let i = 0; i <= 8; i += 1) {
      const x = geometry.padding.left + (geometry.plotWidth * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x, geometry.mainPanel.top);
      ctx.lineTo(x, geometry.statePanel.top + geometry.statePanel.height);
      ctx.stroke();
    }

    ctx.restore();

    this.lastScales = { priceScale, volumeMax, zScale };
  }

  yForPrice(value, panel, scale) {
    const ratio = (scale.max - value) / Math.max(scale.max - scale.min, 1e-6);
    return panel.top + ratio * panel.height;
  }

  drawPricePanel(ctx, geometry, visibleCandles, visibleMarkers, priceScale) {
    const panel = geometry.mainPanel;
    const barWidth = geometry.barWidth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(geometry.padding.left, panel.top, geometry.plotWidth, panel.height);
    ctx.clip();

    if (this.controls.ema) {
      [
        { key: "ema144", color: COLORS.ema144 },
        { key: "ema169", color: COLORS.ema169 },
      ].forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.4;
        visibleCandles.forEach((candle, localIndex) => {
          if (candle[line.key] == null) {
            return;
          }
          const x = this.xForIndex(geometry.range.start + localIndex, geometry);
          const y = this.yForPrice(candle[line.key], panel, priceScale);
          if (localIndex === 0 || visibleCandles[localIndex - 1][line.key] == null) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });
    }

    for (let localIndex = 0; localIndex < visibleCandles.length; localIndex += 1) {
      const candle = visibleCandles[localIndex];
      const globalIndex = geometry.range.start + localIndex;
      const x = this.xForIndex(globalIndex, geometry);
      const openY = this.yForPrice(candle.open, panel, priceScale);
      const closeY = this.yForPrice(candle.close, panel, priceScale);
      const highY = this.yForPrice(candle.high, panel, priceScale);
      const lowY = this.yForPrice(candle.low, panel, priceScale);
      const bullish = candle.close >= candle.open;
      const color = bullish ? COLORS.bull : COLORS.bear;
      const bodyWidth = Math.max(2, barWidth * 0.68);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.2, Math.abs(closeY - openY));
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    }

    const labelTracker = [];
    const showMarkerLabels = geometry.range.count <= 96;
    for (const marker of visibleMarkers) {
      if (marker.price == null || marker.index == null) {
        continue;
      }
      const x = this.xForIndex(marker.index, geometry);
      const y = this.yForPrice(marker.price, panel, priceScale);
      this.drawMarker(ctx, marker, x, y);

      if (!showMarkerLabels) {
        continue;
      }
      const tooClose = labelTracker.some((value) => Math.abs(value - x) < 44);
      if (!tooClose) {
        labelTracker.push(x);
        ctx.fillStyle = "rgba(7, 14, 22, 0.82)";
        ctx.fillRect(x + 8, y - 18, 92, 18);
        ctx.fillStyle = COLORS.text;
        ctx.font = "11px Avenir Next";
        ctx.fillText(marker.label, x + 12, y - 5);
      }
    }

    ctx.restore();
  }

  drawMarker(ctx, marker, x, y) {
    const direction = (marker.direction || "").toUpperCase();
    const longLike = direction.includes("LONG");
    let color = COLORS.accent;
    if (marker.kind?.includes("entry")) {
      color = longLike ? COLORS.bull : COLORS.bear;
    } else if (marker.kind?.includes("exit")) {
      color = "#ffcf88";
    } else if (marker.kind === "set_be_stop") {
      color = COLORS.be;
    } else if (marker.kind === "be_market_exit") {
      color = COLORS.be;
    } else if (marker.kind?.includes("tp50")) {
      color = COLORS.accent;
    }

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;

    if (marker.kind === "backtest_entry") {
      const size = 7;
      ctx.beginPath();
      if (longLike) {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
      } else {
        ctx.moveTo(x, y + size);
        ctx.lineTo(x - size, y - size);
        ctx.lineTo(x + size, y - size);
      }
      ctx.closePath();
      ctx.fill();
    } else if (marker.kind === "backtest_exit") {
      ctx.beginPath();
      ctx.arc(x, y, 5.2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (marker.kind === "set_be_stop") {
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (marker.kind === "be_market_exit") {
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 5);
      ctx.lineTo(x + 5, y + 5);
      ctx.moveTo(x + 5, y - 5);
      ctx.lineTo(x - 5, y + 5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y - 7);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x, y + 7);
      ctx.lineTo(x - 7, y);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawLiquidityPanel(ctx, geometry, visibleCandles, panelInfo) {
    const panel = geometry.volumePanel;
    const barWidth = Math.max(1.5, geometry.barWidth * 0.72);
    const { useRealVolume, volumeMax, flowAbsMax } = panelInfo;

    ctx.save();
    ctx.beginPath();
    ctx.rect(geometry.padding.left, panel.top, geometry.plotWidth, panel.height);
    ctx.clip();

    if (useRealVolume) {
      visibleCandles.forEach((candle, localIndex) => {
        const x = this.xForIndex(geometry.range.start + localIndex, geometry);
        const value = candle.volume || 0;
        const height = (value / volumeMax) * panel.height;
        const y = panel.top + panel.height - height;
        const bullish = candle.close >= candle.open;
        ctx.fillStyle = bullish ? "rgba(41, 192, 139, 0.55)" : "rgba(255, 114, 98, 0.55)";
        ctx.fillRect(x - barWidth / 2, y, barWidth, height);
      });
    } else {
      const midY = panel.top + panel.height / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(geometry.padding.left, midY);
      ctx.lineTo(geometry.padding.left + geometry.plotWidth, midY);
      ctx.stroke();

      visibleCandles.forEach((candle, localIndex) => {
        const delta = candle.oi_delta || 0;
        const x = this.xForIndex(geometry.range.start + localIndex, geometry);
        const height = (Math.abs(delta) / flowAbsMax) * (panel.height / 2 - 4);
        const y = delta >= 0 ? midY - height : midY;
        ctx.fillStyle = delta >= 0 ? "rgba(124, 199, 255, 0.62)" : "rgba(255, 114, 98, 0.52)";
        ctx.fillRect(x - barWidth / 2, y, barWidth, Math.max(1, height));
      });
    }

    ctx.restore();
  }

  drawIndicatorPanel(ctx, geometry, visibleCandles, zScale) {
    const panel = geometry.indicatorPanel;

    ctx.save();
    ctx.beginPath();
    ctx.rect(geometry.padding.left, panel.top, geometry.plotWidth, panel.height);
    ctx.clip();

    for (const band of this.asset.thresholds.z_score_bands || []) {
      const y = this.yForPrice(band, panel, zScale);
      ctx.strokeStyle = band === 0 ? "rgba(240, 180, 92, 0.26)" : "rgba(255, 255, 255, 0.09)";
      ctx.setLineDash(band === 0 ? [] : [4, 6]);
      ctx.beginPath();
      ctx.moveTo(geometry.padding.left, y);
      ctx.lineTo(geometry.padding.left + geometry.plotWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const line of zLineStyles) {
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1.35;
      visibleCandles.forEach((candle, localIndex) => {
        const value = candle[line.key];
        if (value == null) {
          return;
        }
        const x = this.xForIndex(geometry.range.start + localIndex, geometry);
        const y = this.yForPrice(value, panel, zScale);
        if (localIndex === 0 || visibleCandles[localIndex - 1][line.key] == null) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  drawStatePanel(ctx, geometry) {
    const panel = geometry.statePanel;
    const rows = [
      { label: "Backtest", segments: this.controls.backtest ? this.asset.backtest.states : [] },
      { label: "Replay", segments: this.controls.replay ? this.asset.replay.states : [] },
    ];

    ctx.save();
    ctx.beginPath();
    ctx.rect(geometry.padding.left, panel.top, geometry.plotWidth, panel.height);
    ctx.clip();

    rows.forEach((row, rowIndex) => {
      const rowTop = panel.top + rowIndex * (panel.height / rows.length);
      const rowHeight = panel.height / rows.length - 6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fillRect(geometry.padding.left, rowTop, geometry.plotWidth, rowHeight);

      for (const segment of row.segments) {
        const visibleStart = Math.max(segment.start_index, geometry.range.start);
        const visibleEnd = Math.min(segment.end_index, geometry.range.end - 1);
        if (visibleStart > visibleEnd) {
          continue;
        }
        const startX = this.xForIndex(visibleStart, geometry) - geometry.barWidth / 2;
        const endX = this.xForIndex(visibleEnd, geometry) + geometry.barWidth / 2;
        const style = stateStyles[segment.state] || stateStyles.CASH;
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = 1;
        ctx.fillRect(startX, rowTop + 5, endX - startX, rowHeight - 10);
        ctx.strokeRect(startX, rowTop + 5, endX - startX, rowHeight - 10);
      }

      ctx.fillStyle = COLORS.muted;
      ctx.font = "12px Avenir Next";
      ctx.fillText(row.label, geometry.padding.left + 8, rowTop + 15);
    });

    ctx.restore();
  }

  drawAxisLabels(ctx, geometry, visibleCandles, priceScale, panelInfo, zScale) {
    const { useRealVolume, volumeMax, flowAbsMax } = panelInfo;
    ctx.save();
    ctx.fillStyle = COLORS.muted;
    ctx.font = "11px Avenir Next";
    ctx.textAlign = "right";

    for (let i = 0; i <= 5; i += 1) {
      const ratio = i / 5;
      const price = priceScale.max - ratio * (priceScale.max - priceScale.min);
      const y = geometry.mainPanel.top + geometry.mainPanel.height * ratio + 4;
      ctx.fillText(formatPrice(price), geometry.width - 10, y);
    }

    for (let i = 0; i <= 2; i += 1) {
      const ratio = i / 2;
      const value = useRealVolume
        ? volumeMax - ratio * volumeMax
        : flowAbsMax - ratio * (flowAbsMax * 2);
      const y = geometry.volumePanel.top + geometry.volumePanel.height * ratio + 4;
      ctx.fillText(formatCompactInteger(value), geometry.width - 10, y);
    }

    for (let i = 0; i <= 4; i += 1) {
      const ratio = i / 4;
      const value = zScale.max - ratio * (zScale.max - zScale.min);
      const y = geometry.indicatorPanel.top + geometry.indicatorPanel.height * ratio + 4;
      ctx.fillText(formatNumber(value, 2), geometry.width - 10, y);
    }

    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i += 1) {
      const index = Math.round(
        geometry.range.start + ((geometry.range.end - geometry.range.start - 1) * i) / 4
      );
      const candle = this.runtime.candles[index];
      if (!candle) {
        continue;
      }
      const x = this.xForIndex(index, geometry);
      ctx.fillText(
        formatAxisTimestamp(candle.ms),
        x,
        geometry.statePanel.top + geometry.statePanel.height + 18
      );
    }

    ctx.restore();
  }

  drawCrosshair(ctx, geometry, candle, index, priceScale, zScale) {
    if (!candle) {
      return;
    }
    const x = this.xForIndex(index, geometry);
    const y = this.yForPrice(candle.close, geometry.mainPanel, priceScale);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(x, geometry.mainPanel.top);
    ctx.lineTo(x, geometry.statePanel.top + geometry.statePanel.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(geometry.padding.left, y);
    ctx.lineTo(geometry.padding.left + geometry.plotWidth, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(7, 14, 22, 0.92)";
    ctx.fillRect(geometry.width - 74, y - 10, 64, 20);
    ctx.fillStyle = COLORS.text;
    ctx.font = "11px Avenir Next";
    ctx.fillText(formatPrice(candle.close), geometry.width - 42, y + 4);

    const indicatorY = this.yForPrice(candle.z_price ?? 0, geometry.indicatorPanel, zScale);
    ctx.fillStyle = "rgba(7, 14, 22, 0.92)";
    ctx.fillRect(x - 54, geometry.statePanel.top + geometry.statePanel.height + 2, 108, 18);
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText(formatTimestamp(candle.ms), x, geometry.statePanel.top + geometry.statePanel.height + 15);
    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(x, y, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0b45c";
    ctx.beginPath();
    ctx.arc(x, indicatorY, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawOverview() {
    const { ctx, width, height } = resizeCanvas(this.overviewCanvas);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(8, 15, 24, 0.95)";
    ctx.fillRect(0, 0, width, height);

    if (!this.runtime?.candles.length) {
      return;
    }

    const candles = this.runtime.candles;
    const closeValues = candles.map((candle) => candle.close).filter((value) => value != null);
    const minValue = Math.min(...closeValues);
    const maxValue = Math.max(...closeValues);
    const padding = 8;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(240, 180, 92, 0.8)";
    ctx.lineWidth = 1.2;
    candles.forEach((candle, index) => {
      const x = padding + (index / Math.max(candles.length - 1, 1)) * (width - padding * 2);
      const y =
        padding +
        ((maxValue - candle.close) / Math.max(maxValue - minValue, 1e-6)) * (height - padding * 2);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    const { start, end } = this.visibleRange();
    const startX = padding + (start / Math.max(candles.length, 1)) * (width - padding * 2);
    const endX = padding + (end / Math.max(candles.length, 1)) * (width - padding * 2);
    ctx.fillStyle = "rgba(240, 180, 92, 0.18)";
    ctx.strokeStyle = "rgba(240, 180, 92, 0.8)";
    ctx.lineWidth = 1.2;
    ctx.fillRect(startX, 6, endX - startX, height - 12);
    ctx.strokeRect(startX, 6, endX - startX, height - 12);
  }
}

class DashboardApp {
  constructor(payload) {
    this.payload = payload;
    this.assets = payload.assets;
    this.activeAsset = Object.keys(this.assets)[0];
    this.controls = { ...overlayDefaults };
    this.activeInspectorTab = "snapshot";

    this.refs = {
      assetTabs: document.getElementById("asset-tabs"),
      overlayControls: document.getElementById("overlay-controls"),
      inspectorTabs: document.getElementById("inspector-tabs"),
      inspectorPanes: [...document.querySelectorAll(".inspector-pane")],
      summaryGrid: document.getElementById("summary-grid"),
      chartTitle: document.getElementById("chart-title"),
      rangeLabel: document.getElementById("range-label"),
      coverageLabel: document.getElementById("coverage-label"),
      chartHud: document.getElementById("chart-hud"),
      chartGuide: document.getElementById("chart-guide"),
      warningStrip: document.getElementById("warning-strip"),
      cursorMetrics: document.getElementById("cursor-metrics"),
      stateMetrics: document.getElementById("state-metrics"),
      eventList: document.getElementById("event-list"),
      coverageMetrics: document.getElementById("coverage-metrics"),
    };

    this.chart = new TradingCanvas({
      canvas: document.getElementById("chart-canvas"),
      overviewCanvas: document.getElementById("overview-canvas"),
      onSelectionChange: (selection) => this.renderInspector(selection),
    });

    this.renderAssetTabs();
    this.bindControlEvents();
    this.setInspectorTab(this.activeInspectorTab);
    this.setAsset(this.activeAsset);
  }

  renderAssetTabs() {
    this.refs.assetTabs.innerHTML = "";
    Object.keys(this.assets).forEach((assetKey) => {
      const button = document.createElement("button");
      button.textContent = assetKey;
      button.className = assetKey === this.activeAsset ? "active" : "";
      button.addEventListener("click", () => this.setAsset(assetKey));
      this.refs.assetTabs.append(button);
    });
  }

  bindControlEvents() {
    this.refs.overlayControls.querySelectorAll("[data-control]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.control;
        this.controls[key] = !this.controls[key];
        button.classList.toggle("active", this.controls[key]);
        this.chart.updateControls(this.controls);
      });
    });

    this.refs.inspectorTabs.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        this.setInspectorTab(button.dataset.tab);
      });
    });
  }

  setInspectorTab(tab) {
    this.activeInspectorTab = tab;
    this.refs.inspectorTabs.querySelectorAll("[data-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    this.refs.inspectorPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.dataset.pane === tab);
    });
  }

  setAsset(assetKey) {
    this.activeAsset = assetKey;
    this.renderAssetTabs();
    const asset = this.assets[assetKey];
    this.chart.setAsset(asset, this.controls);
    this.renderSummary(asset);
    this.renderCoverage(asset);
    this.renderWarnings(asset);
  }

  renderSummary(asset) {
    const runtime = buildRuntimeAsset(asset);
    const last = runtime.lastCandle;
    const backtestSummary = asset.backtest.summary;
    const replaySummary = asset.replay.summary;
    this.refs.summaryGrid.innerHTML = "";

    const summaryCards = [
      {
        tone: "market",
        title: "Last Close",
        value: formatPrice(last?.close),
        detail: `EMA144 ${formatPrice(last?.ema144)} | EMA169 ${formatPrice(last?.ema169)}`,
      },
      {
        tone: "backtest",
        title: "Backtest Map",
        value: `${backtestSummary.mapped}/${backtestSummary.total}`,
        detail: `${backtestSummary.unmapped} unmatched to candle range`,
      },
      {
        tone: "replay",
        title: "Replay Coverage",
        value: `${replaySummary.actions.mapped}/${replaySummary.actions.total}`,
        detail: `${replaySummary.actions.unmapped} out of coverage`,
      },
      {
        tone: "signal",
        title: "Signal Stack",
        value: `${formatNumber(last?.z_price, 2)} / ${formatNumber(last?.z_oi, 2)} / ${formatNumber(last?.z_ls, 2)}`,
        detail: "Z Price / Z OI / Z LS",
      },
    ];

    for (const card of summaryCards) {
      const element = document.createElement("div");
      element.className = `summary-card tone-${card.tone}`;
      element.innerHTML = `
        <div class="title">${card.title}</div>
        <div class="value">${card.value}</div>
        <div class="detail">${card.detail}</div>
      `;
      this.refs.summaryGrid.append(element);
    }

    this.refs.chartTitle.textContent = `${asset.symbol} Backtest + Replay`;
    this.refs.rangeLabel.textContent = `${asset.coverage.candle_count} candles`;
    this.refs.coverageLabel.textContent = `${asset.coverage.candle_start} → ${asset.coverage.candle_end}`;
    this.renderChartChrome(asset, last);
  }

  renderCoverage(asset) {
    const runtime = buildRuntimeAsset(asset);
    const liquiditySource = hasRealVolume(runtime.candles) ? "Real Volume" : "OI Delta Proxy";
    createMetricRows(this.refs.coverageMetrics, [
      { label: "Candle Range", value: `${asset.coverage.candle_start}<br>${asset.coverage.candle_end}` },
      { label: "Liquidity Pane", value: liquiditySource },
      {
        label: "Backtest Mapping",
        value: `${asset.backtest.summary.mapped}/${asset.backtest.summary.total}`,
      },
      {
        label: "Replay Actions",
        value: `${asset.replay.summary.actions.mapped}/${asset.replay.summary.actions.total}`,
      },
      {
        label: "Replay Lifecycles",
        value: `${asset.replay.summary.lifecycles.mapped}/${asset.replay.summary.lifecycles.total}`,
      },
      { label: "Warnings", value: `${asset.warnings.length}` },
    ]);
  }

  renderWarnings(asset) {
    const warnings = uniq(asset.warnings);
    if (!warnings.length) {
      this.refs.warningStrip.classList.remove("visible");
      this.refs.warningStrip.textContent = "";
      return;
    }
    const preview = warnings.slice(0, 2);
    const extra = warnings.length - preview.length;
    this.refs.warningStrip.textContent =
      extra > 0 ? `${preview.join(" | ")} | +${extra} more warnings` : preview.join(" | ");
    this.refs.warningStrip.classList.add("visible");
  }

  renderInspector(selection) {
    const {
      candle,
      asset,
      index,
      activeBacktestTrade,
      activeReplayTrade,
      candleEvents,
      backtestState,
      replayState,
    } = selection;
    if (!candle) {
      return;
    }
    const runtime = buildRuntimeAsset(asset);
    const useRealVolume = hasRealVolume(runtime.candles);
    this.renderChartChrome(asset, candle);

    createMetricRows(this.refs.cursorMetrics, [
      { label: "Timestamp", value: formatTimestamp(candle.ms) },
      { label: "Open", value: formatPrice(candle.open) },
      { label: "High", value: formatPrice(candle.high) },
      { label: "Low", value: formatPrice(candle.low) },
      { label: "Close", value: formatPrice(candle.close) },
      {
        label: useRealVolume ? "Volume" : "OI Delta",
        value: useRealVolume
          ? formatCompactInteger(candle.volume || 0)
          : formatCompactInteger(candle.oi_delta || 0),
      },
      { label: "EMA144", value: formatPrice(candle.ema144) },
      { label: "EMA169", value: formatPrice(candle.ema169) },
      { label: "Z Price", value: formatNumber(candle.z_price, 2) },
      { label: "Z OI", value: formatNumber(candle.z_oi, 2) },
      { label: "Z LS", value: formatNumber(candle.z_ls, 2) },
      { label: "OI", value: formatCompactInteger(candle.sum_open_interest) },
      { label: "LS Ratio", value: formatNumber(candle.count_long_short_ratio, 3) },
    ]);

    const backtestChip = this.stateChip(backtestState?.state || "CASH");
    const replayChip = this.stateChip(replayState?.state || "CASH");
    createMetricRows(this.refs.stateMetrics, [
      { label: "Backtest Lane", value: backtestChip },
      { label: "Replay Lane", value: replayChip },
      {
        label: "Backtest Window",
        value: backtestState
          ? `${backtestState.start_ts}<br>${backtestState.end_ts}`
          : "--",
      },
      {
        label: "Replay Window",
        value: replayState ? `${replayState.start_ts}<br>${replayState.end_ts}` : "--",
      },
      {
        label: "Momentum",
        value: `${formatNumber(candle.price_trend, 2)} / ${formatNumber(candle.vol_cluster, 2)}`,
      },
      {
        label: "ATR",
        value: `${formatPrice(candle.atr)} | ratio ${formatNumber(candle.atr_ratio, 2)}`,
      },
    ]);

    this.renderEventContext({
      asset,
      index,
      activeBacktestTrade,
      activeReplayTrade,
      candleEvents,
    });

    this.renderCoverage(asset);
    this.renderWarnings(asset);
  }

  renderEventContext({ asset, index, activeBacktestTrade, activeReplayTrade, candleEvents }) {
    const blocks = [];
    if (activeBacktestTrade) {
      blocks.push(this.renderTradeContextCard("Backtest Trade", "BACKTEST", activeBacktestTrade, index));
    }
    if (activeReplayTrade) {
      blocks.push(this.renderReplayContextCard("Replay Lifecycle", "REPLAY", activeReplayTrade, index));
    }
    if (candleEvents.length) {
      blocks.push(this.renderCandleEventsCard(candleEvents));
    }

    if (!blocks.length) {
      renderEmpty(this.refs.eventList, "No direct backtest or replay event is attached to this candle.");
      return;
    }
    this.refs.eventList.innerHTML = blocks.join("");
  }

  renderTradeContextCard(title, tag, trade, index) {
    const phase = index < trade.entry_index
      ? "Before entry"
      : index > trade.exit_index
        ? "After exit"
        : "Inside trade";
    return `
      <div class="event-row">
        <div class="event-head">
          <div class="event-title-wrap">
            <span class="event-kicker">${tag}</span>
            <span class="event-kind">${title}</span>
          </div>
          <span class="event-phase">${phase}</span>
        </div>
        <div class="event-grid">
          <div class="event-stat">
            <span class="event-stat-label">Direction</span>
            <span class="event-stat-value">${trade.direction || "--"} | ${trade.type || "--"}</span>
          </div>
          <div class="event-stat">
            <span class="event-stat-label">Outcome</span>
            <span class="event-stat-value">${formatPercent(trade.pnl_pct)} | ${formatPrice(trade.pnl_usd)} USD</span>
          </div>
          <div class="event-stat">
            <span class="event-stat-label">Entry</span>
            <span class="event-stat-value">${formatTimestamp(trade.entry_ts)}<br>@ ${formatPrice(trade.entry_price)}</span>
          </div>
          <div class="event-stat">
            <span class="event-stat-label">Exit</span>
            <span class="event-stat-value">${formatTimestamp(trade.exit_ts)}<br>@ ${formatPrice(trade.exit_price)}</span>
          </div>
        </div>
        <div class="event-body">
          ${trade.tiered ? "Tiered execution path enabled." : "Single exit path."}
        </div>
      </div>
    `;
  }

  renderReplayContextCard(title, tag, trade, index) {
    const phase = index < trade.open_index
      ? "Before open"
      : index > trade.close_index
        ? "After close"
        : "In replay";
    return `
      <div class="event-row">
        <div class="event-head">
          <div class="event-title-wrap">
            <span class="event-kicker">${tag}</span>
            <span class="event-kind">${title}</span>
          </div>
          <span class="event-phase">${phase}</span>
        </div>
        <div class="event-grid">
          <div class="event-stat">
            <span class="event-stat-label">Direction</span>
            <span class="event-stat-value">${trade.direction || "--"}</span>
          </div>
          <div class="event-stat">
            <span class="event-stat-label">Close Reason</span>
            <span class="event-stat-value">${trade.close_reason || "--"}</span>
          </div>
          <div class="event-stat">
            <span class="event-stat-label">Open</span>
            <span class="event-stat-value">${trade.open_ts}<br>@ ${formatPrice(trade.open_price)}</span>
          </div>
          <div class="event-stat">
            <span class="event-stat-label">Close</span>
            <span class="event-stat-value">${trade.close_ts || "--"}<br>@ ${formatPrice(trade.close_price)}</span>
          </div>
        </div>
        <div class="event-body">
          TP50: ${trade.tp50_ts || "--"}<br>
          Break-even armed: ${trade.be_set_ts || "--"}
        </div>
      </div>
    `;
  }

  renderCandleEventsCard(events) {
    const body = events
      .map(
        (event) => `
          <div class="event-stat">
            <span class="event-stat-label">${event.layer.toUpperCase()} | ${event.label}</span>
            <span class="event-stat-value">${this.describeEvent(event)}</span>
          </div>
        `
      )
      .join("");
    return `
      <div class="event-row">
        <div class="event-head">
          <div class="event-title-wrap">
            <span class="event-kicker">TIMELINE</span>
            <span class="event-kind">Events On This Candle</span>
          </div>
          <span class="event-phase">${events.length} Event${events.length > 1 ? "s" : ""}</span>
        </div>
        <div class="event-grid">${body}</div>
      </div>
    `;
  }

  renderChartChrome(asset, candle) {
    if (!candle) {
      this.refs.chartHud.innerHTML = "";
      this.refs.chartGuide.innerHTML = "";
      return;
    }

    const runtime = buildRuntimeAsset(asset);
    const liquiditySource = hasRealVolume(runtime.candles) ? "Volume" : "OI Delta";

    const hudItems = [
      { label: "Close", value: formatPrice(candle.close) },
      { label: "EMA144", value: formatPrice(candle.ema144) },
      { label: "EMA169", value: formatPrice(candle.ema169) },
      { label: "Z Price", value: formatNumber(candle.z_price, 2) },
      { label: "Z OI", value: formatNumber(candle.z_oi, 2) },
      { label: "Z LS", value: formatNumber(candle.z_ls, 2) },
      { label: liquiditySource, value: hasRealVolume(runtime.candles) ? formatCompactInteger(candle.volume || 0) : formatCompactInteger(candle.oi_delta || 0) },
      { label: "Cursor", value: formatTimestamp(candle.ms) },
    ];

    this.refs.chartHud.innerHTML = hudItems
      .map(
        (item) => `
          <span class="hud-pill">
            <span class="hud-label">${item.label}</span>
            <span class="hud-value">${item.value}</span>
          </span>
        `
      )
      .join("");

    this.refs.chartGuide.innerHTML = `
      <span class="guide-chip price"><span class="guide-dot" style="background:${COLORS.text};opacity:.65"></span>Price Tape</span>
      ${this.controls.ema ? `<span class="guide-chip ema144"><span class="guide-line"></span>EMA144</span><span class="guide-chip ema169"><span class="guide-line"></span>EMA169</span>` : ""}
      <span class="guide-chip flow"><span class="guide-dot" style="background:${hasRealVolume(runtime.candles) ? COLORS.bull : COLORS.be}"></span>${liquiditySource} Pane</span>
      <span class="guide-chip zprice"><span class="guide-dot" style="background:${zLineStyles[0].color}"></span>Z Price</span>
      <span class="guide-chip zoi"><span class="guide-dot" style="background:${zLineStyles[1].color}"></span>Z OI</span>
      <span class="guide-chip zls"><span class="guide-dot" style="background:${zLineStyles[2].color}"></span>Z LS</span>
      <span class="guide-chip backtest"><span class="guide-dot" style="background:${COLORS.bull}"></span>Backtest State</span>
      <span class="guide-chip replay"><span class="guide-dot" style="background:${COLORS.purple || "#d18dff"}"></span>Replay State</span>
    `;
  }

  stateChip(state) {
    const normalized = state.toUpperCase();
    const style = stateStyles[normalized] || stateStyles.CASH;
    return `<span class="state-chip ${style.chip}">${stateLabel(normalized)}</span>`;
  }

  describeEvent(event) {
    const parts = [
      formatTimestamp(event.ts),
      `price ${formatPrice(event.price)}`,
      `candle #${event.index}`,
    ];

    if (event.layer === "backtest") {
      if (event.direction) {
        parts.push(event.direction);
      }
      if (event.trade_type) {
        parts.push(event.trade_type);
      }
      if (event.pnl_pct != null) {
        parts.push(`PnL ${formatPercent(event.pnl_pct)}`);
      }
      if (event.tiered) {
        parts.push("Tiered");
      }
    }

    if (event.layer === "replay" && event.close_reason && event.close_reason !== "N/A") {
      parts.push(event.close_reason);
    }

    return parts.join(" | ");
  }
}

async function main() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    new DashboardApp(payload);
  } catch (error) {
    const warning = document.getElementById("warning-strip");
    warning.textContent = `Failed to load dashboard data: ${error.message}`;
    warning.classList.add("visible");
  }
}

main();
