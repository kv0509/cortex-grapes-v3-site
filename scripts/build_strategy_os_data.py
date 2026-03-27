from __future__ import annotations

import json
import os
import re
import sqlite3
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DASHBOARD_DIR = ROOT / "dashboard"
DATA_DIR = DASHBOARD_DIR / "data"
GRAPES_JSON = DATA_DIR / "joint_backtest_overview.json"
GRAPES_BT_RANGE_SUMMARY_CSV = ROOT / "Reports" / "experiments" / "btc_range_sync_walk_forward_suite" / "full_portfolio_summary.csv"
GRAPES_BT_RANGE_ASSET_CSV = ROOT / "Reports" / "experiments" / "btc_range_sync_walk_forward_suite" / "full_by_asset_summary.csv"
CITRUS_REPORT = ROOT.parent / "citrus" / "Docs" / "Citrus_4H_Portfolio_Report_20260309.md"
CITRUS_ROOT = ROOT.parent / "citrus"
CITRUS_REPORTS = CITRUS_ROOT / "Reports"
OUTPUT_JSON = DATA_DIR / "strategy_os.json"
FIXED_MARGIN_USD = 20.0
LEVERAGE = 100.0
FIXED_NOTIONAL_USD = FIXED_MARGIN_USD * LEVERAGE
GRAPES_BASE_EQUITY_USD = 6000.0
CITRUS_BASE_EQUITY_USD = 6000.0
GRAPES_LIVE_DB = ROOT / "Live" / "db" / "grapes_model_v1.db"
CITRUS_LIVE_DB = ROOT.parent / "citrus" / "Live" / "citrus_live.db"
TP_PCT_BY_SYMBOL = {
    "BTCUSDT": 0.035,
    "ETHUSDT": 0.06,
    "SOLUSDT": 0.06,
}

# Historical Telegram-only Grapes close notifications that were user-backfilled
# but never materialized into the canonical live ledger. We keep overrides very
# narrow and keyed by exact symbol/exit tuple so they only affect known legacy
# gaps in website reconstruction.
GRAPES_TELEGRAM_FALLBACK_OVERRIDES = {
    ("ETHUSDT", "2026-03-01 00:00:00", 1895.02): {
        "direction": "SHORT",
    },
    ("SOLUSDT", "2026-03-01 00:00:00", 80.63): {
        "direction": "SHORT",
    },
}


def to_float(raw: str) -> float:
    return float(raw.replace(",", "").replace("$", "").replace("%", "").replace("x", "").strip())


def extract_metric(block: str, label: str) -> float:
    match = re.search(rf"- {re.escape(label)}:\s*`([^`]+)`", block)
    if not match:
        raise ValueError(f"Missing metric: {label}")
    return to_float(match.group(1))


def extract_text(block: str, start_label: str) -> str:
    match = re.search(rf"- {re.escape(start_label)}:\s*`([^`]+)`", block)
    return match.group(1).strip() if match else "—"


def section(text: str, marker: str, next_marker: str | None) -> str:
    start = text.index(marker)
    end = text.index(next_marker, start) if next_marker and next_marker in text[start + 1 :] else len(text)
    return text[start:end]


def parse_citrus_report(path: Path) -> Dict[str, Any]:
    text = path.read_text()
    btc_block = section(text, "## 1. BTCUSDT", "## 2. ETHUSDT")
    eth_block = section(text, "## 2. ETHUSDT", "## 3. SOLUSDT")
    sol_block = section(text, "## 3. SOLUSDT", "## 4. Portfolio-Level View")
    portfolio_block = section(text, "## 4. Portfolio-Level View", "## 5. Previous vs Current")

    assets: List[Dict[str, Any]] = []
    for symbol, block in [("BTC", btc_block), ("ETH", eth_block), ("SOL", sol_block)]:
        assessment_lines = re.findall(r"Assessment:\n((?:- .+\n?)+)", block)
        assessment = []
        if assessment_lines:
            assessment = [line[2:].strip() for line in assessment_lines[0].strip().splitlines()]
        assets.append(
            {
                "asset": symbol,
                "total_return_pct": extract_metric(block, "Total Return"),
                "sharpe": extract_metric(block, "Sharpe"),
                "max_drawdown_pct": -abs(extract_metric(block, "Max Drawdown")),
                "profit_factor": extract_metric(block, "Profit Factor"),
                "trades": int(extract_metric(block, "Trades")),
                "win_rate_pct": extract_metric(block, "Win Rate"),
                "avg_hold_bars": extract_metric(block, "Avg Hold"),
                "oos_return_pct": extract_metric(block, "OOS Return"),
                "oos_sharpe": extract_metric(block, "OOS Sharpe"),
                "assessment": assessment,
            }
        )

    winners_match = re.search(r"- Winners:\s*`(\d+)`\s*\(`([^`]+)`\)", portfolio_block)
    losers_match = re.search(r"- Losers:\s*`(\d+)`\s*\(`([^`]+)`\)", portfolio_block)
    long_match = re.search(r"- Long:\s*`(\d+)` trades \| Net `\$([^`]+)` \| WR `([^`]+)`", portfolio_block)
    short_match = re.search(r"- Short:\s*`(\d+)` trades \| Net `\$([^`]+)` \| WR `([^`]+)`", portfolio_block)
    interpretation_lines = re.findall(r"Portfolio interpretation:\n((?:- .+\n?)+)", portfolio_block)
    interpretation = []
    if interpretation_lines:
        interpretation = [line[2:].strip() for line in interpretation_lines[0].strip().splitlines()]

    return {
        "name": "Cortex Citrus",
        "status": "RESEARCH STACK",
        "report_date": "2026-03-09",
        "source": str(path.relative_to(ROOT.parent)),
        "portfolio": {
            "net_pnl_usd": extract_metric(portfolio_block, "Net PnL"),
            "gross_pnl_usd": extract_metric(portfolio_block, "Gross PnL"),
            "profit_factor": extract_metric(portfolio_block, "Profit Factor"),
            "trades": int(extract_metric(portfolio_block, "Total Trades")),
            "winners": int(winners_match.group(1)) if winners_match else 0,
            "winners_pct": to_float(winners_match.group(2)) if winners_match else 0.0,
            "losers": int(losers_match.group(1)) if losers_match else 0,
            "losers_pct": to_float(losers_match.group(2)) if losers_match else 0.0,
            "avg_win_usd": extract_metric(portfolio_block, "Avg Win"),
            "avg_loss_usd": -abs(extract_metric(portfolio_block, "Avg Loss")),
            "long_trades": int(long_match.group(1)) if long_match else 0,
            "long_net_usd": to_float(long_match.group(2)) if long_match else 0.0,
            "long_wr_pct": to_float(long_match.group(3)) if long_match else 0.0,
            "short_trades": int(short_match.group(1)) if short_match else 0,
            "short_net_usd": to_float(short_match.group(2)) if short_match else 0.0,
            "short_wr_pct": to_float(short_match.group(3)) if short_match else 0.0,
            "max_win_streak": int(extract_metric(portfolio_block, "Max Win Streak")),
            "max_loss_streak": int(extract_metric(portfolio_block, "Max Loss Streak")),
            "interpretation": interpretation,
        },
        "assets": assets,
    }


def latest_file(pattern: str) -> Path | None:
    files = sorted(CITRUS_REPORTS.glob(pattern))
    return files[-1] if files else None


def load_grapes_range_sync_summary() -> Dict[str, float] | None:
    if not GRAPES_BT_RANGE_SUMMARY_CSV.exists():
        return None
    df = pd.read_csv(GRAPES_BT_RANGE_SUMMARY_CSV)
    row = df[df["version"] == "btc_range_sync_gate"]
    if row.empty:
        return None
    record = row.iloc[0]
    return {
        "trades": int(record["trades"]),
        "win_rate_pct": float(record["win_rate_pct"]),
        "net_pnl_usd": float(record["total_pnl_usd"]),
        "profit_factor": float(record["profit_factor"]),
        "sharpe": float(record["sharpe"]),
    }


def load_grapes_range_sync_asset_stats() -> List[Dict[str, Any]] | None:
    if not GRAPES_BT_RANGE_ASSET_CSV.exists():
        return None
    df = pd.read_csv(GRAPES_BT_RANGE_ASSET_CSV)
    rows = df[
        (df["version"] == "btc_range_sync_gate")
        & (df["scope"] == "FULL")
        & (df["asset"].isin(["BTC", "ETH", "SOL"]))
    ].copy()
    if rows.empty:
        return None
    rows["asset"] = pd.Categorical(rows["asset"], categories=["BTC", "ETH", "SOL"], ordered=True)
    rows = rows.sort_values("asset")
    return [
        {
            "asset": str(row["asset"]),
            "trades": int(row["trades"]),
            "win_rate_pct": round(float(row["win_rate_pct"]), 2),
            "total_pnl": round(float(row["total_pnl_usd"]), 2),
            "avg_pnl": round(float(row["avg_pnl_usd"]), 2),
            "profit_factor": round(float(row["profit_factor"]), 2),
        }
        for _, row in rows.iterrows()
    ]


def load_grapes_range_sync_backtest_payload(start_ts: str) -> Dict[str, Any] | None:
    os.environ.setdefault("MPLCONFIGDIR", "/tmp/mplcache")
    Path(os.environ["MPLCONFIGDIR"]).mkdir(parents=True, exist_ok=True)
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    if str(ROOT / "Core") not in sys.path:
        sys.path.insert(0, str(ROOT / "Core"))
    try:
        import backtest_true as bt  # noqa: E402
        import scripts.run_backtest_true_walk_forward_suite as base_suite  # noqa: E402
        import scripts.run_btc_range_sync_walk_forward_suite as range_suite  # noqa: E402
    except Exception:
        return None

    try:
        data_dict = base_suite.load_data()
        ensemble = bt.FlexibleEnsemble.load(str(Path(bt.MODEL_DIR) / "production_ensemble"))
        version = next(v for v in range_suite.VERSIONS if v.slug == "btc_range_sync_gate")
        trades, _equity_df, _ = range_suite.run_sequential_version(data_dict, ensemble, version)
        trades_df = base_suite.trade_records_to_df(trades)
        if trades_df.empty:
            return None
        trades_df = trades_df[trades_df["asset"].isin(["BTC", "ETH", "SOL"])].copy()
        if trades_df.empty:
            return None

        if "side" in trades_df.columns:
            trades_df["direction"] = trades_df["side"].astype(str)
            trades_df = trades_df.drop(columns=["side"])
        trades_df = trades_df.rename(columns={"net_pnl_usd": "scaled_net_pnl_usd"}).copy()
        trades_df["direction"] = trades_df["direction"].astype(str)
        trades_df["hold_hours"] = (
            (
                pd.to_datetime(trades_df["exit_time"], errors="coerce")
                - pd.to_datetime(trades_df["entry_time"], errors="coerce")
            ).dt.total_seconds()
            / 3600.0
        ).round(1)

        regime_segments = load_regime_segments()
        backtest_view = _execution_view_from_trades(
            trades_df,
            start_ts=start_ts,
            base_equity_usd=GRAPES_BASE_EQUITY_USD,
            include_type=True,
            regime_segments=regime_segments,
        )

        asset_rows: List[Dict[str, Any]] = []
        asset_curves: Dict[str, List[Dict[str, Any]]] = {}
        for asset, group in trades_df.groupby("asset", sort=False):
            row, curve = _asset_payload_from_trades(
                str(asset),
                group.sort_values("exit_time").reset_index(drop=True),
                start_ts,
                GRAPES_BASE_EQUITY_USD,
            )
            asset_rows.append(row)
            asset_curves[str(asset)] = curve
        order = {"BTC": 0, "ETH": 1, "SOL": 2}
        asset_rows = sorted(asset_rows, key=lambda row: order.get(str(row["asset"]), 99))

        gross_win = float(trades_df.loc[trades_df["scaled_net_pnl_usd"] > 0, "scaled_net_pnl_usd"].sum())
        gross_loss = abs(float(trades_df.loc[trades_df["scaled_net_pnl_usd"] <= 0, "scaled_net_pnl_usd"].sum()))
        candidate_final_equity = GRAPES_BASE_EQUITY_USD + float(trades_df["scaled_net_pnl_usd"].sum())
        candidate_total_return_pct = (float(trades_df["scaled_net_pnl_usd"].sum()) / GRAPES_BASE_EQUITY_USD) * 100.0

        return {
            "summary": {
                "initial_equity": GRAPES_BASE_EQUITY_USD,
                "final_equity": round(candidate_final_equity, 2),
                "net_pnl_usd": round(float(trades_df["scaled_net_pnl_usd"].sum()), 2),
                "total_return_pct": round(candidate_total_return_pct, 2),
                "annualized_return_pct": round((((candidate_final_equity / GRAPES_BASE_EQUITY_USD) ** (1.0 / max(((pd.to_datetime(trades_df["exit_time"].max()) - pd.to_datetime(start_ts)).total_seconds() / (365.25 * 24 * 3600)), 1e-9))) - 1.0) * 100.0, 2),
                "max_drawdown_pct": backtest_view["summary"]["max_dd_pct"],
                "sharpe": _estimate_sharpe_from_monthly(backtest_view["monthly_breakdown"]),
                "profit_factor": round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2),
                "trade_count": int(len(trades_df)),
                "win_rate_pct": round(float((trades_df["scaled_net_pnl_usd"] > 0).mean() * 100.0), 1),
                "start_ts": start_ts,
                "end_ts": str(pd.to_datetime(trades_df["exit_time"], errors="coerce").max())[:19],
            },
            "equity_curve": backtest_view["portfolio_curve"],
            "asset_stats": asset_rows,
            "asset_curves": asset_curves,
            "monthly_summary": backtest_view["monthly_summary"],
            "monthly_breakdown": backtest_view["monthly_breakdown"],
            "monthly_heatmap": backtest_view["monthly_heatmap"],
            "regime_snapshot": backtest_view["regime_snapshot"],
            "all_trades": backtest_view["all_trades"],
            "execution_view": backtest_view,
        }
    except Exception:
        return None


def parse_summary_txt(path: Path) -> Dict[str, Any]:
    data: Dict[str, Any] = {}
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.endswith(":") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip()
    return data


def build_curve_from_trades(trades: pd.DataFrame, start_ts: str, base_equity_usd: float) -> List[Dict[str, Any]]:
    running = base_equity_usd
    rows = [{"ts": start_ts, "equity": round(running, 2)}]
    for _, row in trades.sort_values("exit_time").iterrows():
        running += float(row["scaled_net_pnl_usd"])
        rows.append({"ts": str(row["exit_time"]), "equity": round(running, 2)})
    return rows


def build_asset_curve_from_trades(trades: pd.DataFrame, start_ts: str) -> List[Dict[str, Any]]:
    running = 0.0
    rows = [{"ts": start_ts, "pnl": 0.0}]
    for _, row in trades.sort_values("exit_time").iterrows():
        running += float(row["scaled_net_pnl_usd"])
        rows.append({"ts": str(row["exit_time"]), "pnl": round(running, 2)})
    return rows


def build_monthly_breakdown(trades: pd.DataFrame, base_equity_usd: float) -> Dict[str, Any]:
    if trades.empty:
        return {
            "monthly_summary": {
                "profitable_months": 0,
                "losing_months": 0,
                "best_month": {"label": "—", "pnl_usd": 0.0, "return_pct": 0.0},
                "worst_month": {"label": "—", "pnl_usd": 0.0, "return_pct": 0.0},
            },
            "monthly_breakdown": [],
            "monthly_heatmap": [],
        }

    work = trades.copy()
    work["month_label"] = work["exit_time"].astype(str).str.slice(0, 7)
    work["year"] = work["month_label"].str.slice(0, 4).astype(int)
    work["month"] = work["month_label"].str.slice(5, 7).astype(int)

    monthly = []
    month_start_equity = base_equity_usd
    for label, group in work.groupby("month_label", sort=True):
        net = float(group["scaled_net_pnl_usd"].sum())
        month_end_equity = month_start_equity + net
        return_pct = ((month_end_equity / month_start_equity) - 1.0) * 100 if month_start_equity else 0.0
        monthly.append(
            {
                "label": label,
                "year": int(group["year"].iloc[0]),
                "month": int(group["month"].iloc[0]),
                "trade_count": int(len(group)),
                "wins": int((group["scaled_net_pnl_usd"] > 0).sum()),
                "losses": int((group["scaled_net_pnl_usd"] <= 0).sum()),
                "net_pnl": round(net, 2),
                "return_pct": round(return_pct, 2),
            }
        )
        month_start_equity = month_end_equity

    profitable = [row for row in monthly if row["net_pnl"] > 0]
    losing = [row for row in monthly if row["net_pnl"] < 0]
    best = max(monthly, key=lambda row: row["net_pnl"])
    worst = min(monthly, key=lambda row: row["net_pnl"])
    heatmap = [{"year": year, "months": [row for row in monthly if row["year"] == year]} for year in sorted({row["year"] for row in monthly})]

    return {
        "monthly_summary": {
            "profitable_months": len(profitable),
            "losing_months": len(losing),
            "best_month": {"label": best["label"], "pnl_usd": best["net_pnl"], "return_pct": best["return_pct"]},
            "worst_month": {"label": worst["label"], "pnl_usd": worst["net_pnl"], "return_pct": worst["return_pct"]},
        },
        "monthly_breakdown": monthly,
        "monthly_heatmap": heatmap,
    }


def format_dt_cell(raw: Any) -> str:
    text = str(raw)
    return text[:16] if len(text) >= 16 else text


def normalize_grapes_ts(raw: Any) -> str:
    return (
        str(raw or "")
        .replace("T", " ")
        .split(".", 1)[0]
        .strip()
    )


def flatten_grapes_trades(monthly_breakdown: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for month in monthly_breakdown:
        for trade in month.get("trades", []):
            entry_ts = str(trade.get("entry_ts", ""))
            exit_ts = str(trade.get("exit_ts", ""))
            net_pnl = float(trade.get("net_pnl", 0.0))
            rows.append(
                {
                    "asset": trade.get("asset", "—"),
                    "direction": trade.get("direction", "—"),
                    "type": trade.get("type", "—"),
                    "entry_ts": format_dt_cell(entry_ts),
                    "exit_ts": format_dt_cell(exit_ts),
                    "hold_hours": round(
                        (
                            pd.to_datetime(exit_ts) - pd.to_datetime(entry_ts)
                        ).total_seconds()
                        / 3600.0,
                        1,
                    )
                    if entry_ts and exit_ts
                    else 0.0,
                    "entry_price": round(float(trade.get("entry_price", 0.0)), 4),
                    "exit_price": round(float(trade.get("exit_price", 0.0)), 4),
                    "net_pnl_usd": round(net_pnl, 2),
                    "roi_pct_on_margin": round((net_pnl / FIXED_MARGIN_USD) * 100.0, 2),
                }
            )
    return rows


def _safe_query_rows(db_path: Path, query: str) -> List[sqlite3.Row]:
    if not db_path.exists():
        return []
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        return conn.execute(query).fetchall()
    finally:
        conn.close()


def load_grapes_active_positions() -> List[Dict[str, Any]]:
    latest_prices = load_grapes_latest_prices()
    ready_cycle_raw = load_grapes_ready_cycle()
    ready_cycle_dt = pd.to_datetime(ready_cycle_raw, errors="coerce") if ready_cycle_raw else pd.NaT
    rows = _safe_query_rows(
        GRAPES_LIVE_DB,
        """
        SELECT symbol, direction, entry_price, entry_time, position_size, peak_pnl_pct,
               realized_pnl_pct, is_tiered, hard_tp_done, breakeven_armed
        FROM active_positions
        """,
    )
    payload: List[Dict[str, Any]] = []
    for row in rows:
        entry_ts_raw = normalize_grapes_ts(row["entry_time"])
        entry_dt = pd.to_datetime(entry_ts_raw, errors="coerce")
        entry_price = float(row["entry_price"] or 0.0)
        direction_int = 1 if int(row["direction"] or 0) > 0 else -1
        current_price = float(latest_prices.get(str(row["symbol"]), entry_price))
        current_pnl_pct = (((current_price - entry_price) / entry_price) * direction_int * 100.0) if entry_price > 0 else 0.0
        hold_hours = 0.0
        if pd.notna(entry_dt) and pd.notna(ready_cycle_dt):
            hold_hours = round(((ready_cycle_dt - entry_dt).total_seconds() / 3600.0), 1)
        payload.append(
            {
                "asset": str(row["symbol"]).replace("USDT", ""),
                "symbol": row["symbol"],
                "direction": "LONG" if direction_int > 0 else "SHORT",
                "entry_price": round(entry_price, 4),
                "current_price": round(current_price, 4),
                "current_pnl_pct": round(current_pnl_pct, 2),
                "entry_ts": entry_ts_raw[:16],
                "hold_hours": hold_hours,
                "position_size": round(float(row["position_size"] or 0.0), 4),
                "peak_pnl_pct": round(float(row["peak_pnl_pct"] or 0.0) * 100.0, 2),
                "realized_pnl_pct": round(float(row["realized_pnl_pct"] or 0.0) * 100.0, 2),
                "tiered": bool(int(row["is_tiered"] or 0)),
                "hard_tp_done": bool(int(row["hard_tp_done"] or 0)),
                "breakeven_armed": bool(int(row["breakeven_armed"] or 0)),
            }
        )
    return payload


def load_citrus_active_positions() -> List[Dict[str, Any]]:
    latest_prices = load_citrus_latest_prices()
    rows = _safe_query_rows(
        CITRUS_LIVE_DB,
        """
        SELECT symbol, direction, entry_price, entry_dt, bars_held, remaining_size,
               original_size, partial_taken, be_armed, peak_pnl, entry_liq_imbalance,
               entry_z_price, capital
        FROM active_positions
        """,
    )
    payload: List[Dict[str, Any]] = []
    for row in rows:
        entry_price = float(row["entry_price"] or 0.0)
        direction_int = 1 if int(row["direction"] or 0) > 0 else -1
        current_price = float(latest_prices.get(str(row["symbol"]), entry_price))
        current_pnl_pct = (((current_price - entry_price) / entry_price) * direction_int * 100.0) if entry_price > 0 else 0.0
        payload.append(
            {
                "asset": str(row["symbol"]).replace("USDT", ""),
                "symbol": row["symbol"],
                "direction": "LONG" if direction_int > 0 else "SHORT",
                "entry_price": round(entry_price, 4),
                "current_price": round(current_price, 4),
                "current_pnl_pct": round(current_pnl_pct, 2),
                "entry_ts": str(row["entry_dt"])[:16],
                "hold_hours": round(float(row["bars_held"] or 0.0) * 4.0, 1),
                "remaining_size": round(float(row["remaining_size"] or 0.0), 6),
                "original_size": round(float(row["original_size"] or 0.0), 6),
                "partial_taken": bool(int(row["partial_taken"] or 0)),
                "breakeven_armed": bool(int(row["be_armed"] or 0)),
                "peak_pnl_pct": round(float(row["peak_pnl"] or 0.0) * 100.0, 2),
                "entry_liq_imbalance": round(float(row["entry_liq_imbalance"] or 0.0), 3),
                "entry_z_price": round(float(row["entry_z_price"] or 0.0), 3),
                "capital": round(float(row["capital"] or 0.0), 2),
            }
        )
    return payload


def load_citrus_live_trades_df() -> pd.DataFrame:
    if not CITRUS_LIVE_DB.exists():
        return pd.DataFrame()
    conn = sqlite3.connect(CITRUS_LIVE_DB)
    try:
        df = pd.read_sql_query(
            """
            SELECT symbol, direction, entry_time, exit_time, entry_price, exit_price,
                   bars_held, net_pnl, pnl_pct, exit_reason
            FROM trades
            WHERE exit_time IS NOT NULL AND TRIM(exit_time) <> ''
            ORDER BY exit_time ASC, symbol ASC
            """,
            conn,
        )
    finally:
        conn.close()

    if df.empty:
        return df

    df["asset"] = df["symbol"].astype(str).str.replace("USDT", "", regex=False)
    df["scaled_net_pnl_usd"] = df["net_pnl"].astype(float)
    df["entry_dt"] = pd.to_datetime(df["entry_time"])
    df["exit_dt"] = pd.to_datetime(df["exit_time"])
    df["hold_hours"] = (df["bars_held"].astype(float) * 4.0).round(1)
    return df


def load_grapes_price_frames() -> Dict[str, pd.DataFrame]:
    frames: Dict[str, pd.DataFrame] = {}
    for symbol in TP_PCT_BY_SYMBOL:
        asset = symbol.replace("USDT", "")
        path = ROOT / "Data" / f"{asset}v1.csv"
        if not path.exists():
            continue
        frame = pd.read_csv(path)
        ts_col = "dt" if "dt" in frame.columns else "timestamp"
        frame = frame.rename(columns={ts_col: "ts"})
        frame["ts"] = pd.to_datetime(frame["ts"])
        frame["high"] = frame["high"].astype(float)
        frame["low"] = frame["low"].astype(float)
        frame["close"] = frame["close"].astype(float)
        frames[symbol] = frame[["ts", "high", "low", "close"]].sort_values("ts").reset_index(drop=True)
    return frames


def load_grapes_latest_prices() -> Dict[str, float]:
    latest: Dict[str, float] = {}
    for symbol, frame in load_grapes_price_frames().items():
        if frame.empty:
            continue
        latest[symbol] = float(frame["close"].iloc[-1])
    return latest


def load_citrus_latest_prices() -> Dict[str, float]:
    rows = _safe_query_rows(
        CITRUS_LIVE_DB,
        """
        SELECT symbol, close, dt, created_at
        FROM signal_snapshots
        ORDER BY dt DESC, created_at DESC
        """,
    )
    latest: Dict[str, float] = {}
    for row in rows:
        symbol = str(row["symbol"])
        if symbol in latest:
            continue
        latest[symbol] = float(row["close"] or 0.0)
    return latest


def build_grapes_history_segments(conn: sqlite3.Connection) -> Dict[str, List[Dict[str, Any]]]:
    segments: Dict[str, List[Dict[str, Any]]] = {}
    for symbol in TP_PCT_BY_SYMBOL:
        df = pd.read_sql_query(
            """
            SELECT timestamp, direction, is_tiered, entry_price, ref_price
            FROM signal_probs_history
            WHERE symbol = ?
            ORDER BY timestamp ASC
            """,
            conn,
            params=(symbol,),
        )
        if df.empty:
            segments[symbol] = []
            continue
        symbol_segments: List[Dict[str, Any]] = []
        current: Optional[Dict[str, Any]] = None
        prev_direction = 0
        for _, row in df.iterrows():
            ts = normalize_grapes_ts(row["timestamp"])
            direction = int(row["direction"] or 0)
            if direction != 0 and prev_direction == 0:
                current = {
                    "symbol": symbol,
                    "entry_ts": ts,
                    "direction": direction,
                    "is_tiered": bool(int(row["is_tiered"] or 0)),
                    "entry_price": float(row["entry_price"] or 0.0),
                }
            if direction == 0 and prev_direction != 0 and current is not None:
                current["close_ts"] = ts
                current["close_price"] = float(row["ref_price"] or 0.0)
                symbol_segments.append(current)
                current = None
            prev_direction = direction
        segments[symbol] = symbol_segments
    return segments


def infer_grapes_tp_hit_ts(
    price_frames: Dict[str, pd.DataFrame],
    symbol: str,
    entry_ts: str,
    close_ts: str,
    direction: int,
    tp_price: float,
) -> Optional[str]:
    frame = price_frames.get(symbol)
    if frame is None or frame.empty:
        return None
    entry_dt = pd.to_datetime(entry_ts)
    close_dt = pd.to_datetime(close_ts)
    window = frame[(frame["ts"] > entry_dt) & (frame["ts"] <= close_dt)]
    if window.empty:
        return None
    if direction > 0:
        hit = window[window["high"] >= tp_price]
    else:
        hit = window[window["low"] <= tp_price]
    if hit.empty:
        return None
    return hit.iloc[0]["ts"].strftime("%Y-%m-%d %H:%M:%S")


def compute_grapes_effective_close(
    symbol: str,
    entry_price: float,
    exit_price: float,
    direction: int,
    close_reason: str,
    tp_hit_ts: Optional[str],
    partial_ratio: float = 0.5,
) -> Dict[str, Any]:
    tp_pct = TP_PCT_BY_SYMBOL[symbol]
    tp_price = entry_price * (1.0 + tp_pct * direction)
    close_component = ((exit_price - entry_price) / entry_price) * direction
    if tp_hit_ts is None:
        total_pnl_pct = close_component
        effective_exit_price = exit_price
        resolved_reason = close_reason or "signal_exit"
    elif "breakeven stop after TP50" in close_reason:
        total_pnl_pct = tp_pct * partial_ratio
        effective_exit_price = tp_price * partial_ratio + entry_price * (1.0 - partial_ratio)
        resolved_reason = "breakeven stop after TP50"
    else:
        total_pnl_pct = tp_pct * partial_ratio + close_component * (1.0 - partial_ratio)
        effective_exit_price = tp_price * partial_ratio + exit_price * (1.0 - partial_ratio)
        resolved_reason = close_reason or "manual_close_after_tp50_inferred"
    return {
        "tp_pct": tp_pct,
        "tp_price": tp_price,
        "tp_hit_ts": tp_hit_ts,
        "total_pnl_pct": total_pnl_pct,
        "effective_exit_price": effective_exit_price,
        "resolved_close_reason": resolved_reason,
    }


def match_grapes_segment(
    segments: Dict[str, List[Dict[str, Any]]],
    symbol: str,
    signal_ts: str,
    exit_price: float,
    pnl_pct: float,
) -> Optional[Dict[str, Any]]:
    candidates = segments.get(symbol, [])
    if not candidates:
        return None
    if signal_ts:
        exact = [seg for seg in candidates if seg["close_ts"] == signal_ts]
        if exact:
            return exact[0]
    price_match = [
        seg for seg in candidates
        if abs(float(seg["close_price"]) - exit_price) <= max(1e-6, abs(exit_price) * 0.0005)
    ]
    if len(price_match) == 1:
        return price_match[0]
    scored: List[tuple[float, Dict[str, Any]]] = []
    for seg in candidates:
        entry_price = float(seg["entry_price"] or 0.0)
        if entry_price <= 0:
            continue
        close_component = ((exit_price - entry_price) / entry_price) * int(seg["direction"])
        score = abs(close_component - pnl_pct)
        if signal_ts:
            try:
                score += abs((pd.to_datetime(seg["close_ts"]) - pd.to_datetime(signal_ts)).total_seconds()) / 3600.0
            except Exception:
                pass
        scored.append((score, seg))
    if not scored:
        return None
    scored.sort(key=lambda item: item[0])
    return scored[0][1] if scored[0][0] <= 0.03 else None


def load_grapes_live_trades_df() -> pd.DataFrame:
    if not GRAPES_LIVE_DB.exists():
        return pd.DataFrame()
    conn = sqlite3.connect(GRAPES_LIVE_DB)
    try:
        history_segments = build_grapes_history_segments(conn)
        df = pd.read_sql_query(
            """
            SELECT symbol, direction, entry_price, exit_price, pnl, timestamp, entry_ts, is_tiered, close_reason
            FROM trades
            WHERE timestamp IS NOT NULL AND TRIM(timestamp) <> ''
            ORDER BY timestamp ASC, symbol ASC
            """,
            conn,
        )
        price_frames = load_grapes_price_frames()
        lifecycle_df = pd.read_sql_query(
            """
            SELECT backfill_id, symbol, direction, entry_ts, close_ts, entry_price, close_price,
                   effective_exit_price, tp_price, tp_hit_ts, partial_ratio, total_pnl_pct, close_reason
            FROM trade_lifecycle_summary
            ORDER BY close_ts ASC
            """,
            conn,
        )
        telegram_df = pd.read_sql_query(
            """
            SELECT symbol, trade_id, signal_ts, created_at, message_text, response_json
            FROM telegram_notifications
            WHERE message_type = 'trade'
              AND event_type = 'CLOSE_SIGNALLED'
              AND message_text LIKE '%[CLOSE %]%'
            ORDER BY created_at ASC
            """,
            conn,
        )
    finally:
        conn.close()

    if df.empty:
        base = pd.DataFrame()
    else:
        df["asset"] = df["symbol"].astype(str).str.replace("USDT", "", regex=False)
        df["entry_ts"] = df["entry_ts"].apply(normalize_grapes_ts)
        df["timestamp"] = df["timestamp"].apply(normalize_grapes_ts)
        df["entry_dt"] = pd.to_datetime(df["entry_ts"], errors="coerce")
        df["exit_dt"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df = df.dropna(subset=["entry_dt", "exit_dt"]).copy()
        df["entry_time"] = df["entry_dt"].dt.strftime("%Y-%m-%d %H:%M:%S")
        df["exit_time"] = df["exit_dt"].dt.strftime("%Y-%m-%d %H:%M:%S")
        df["hold_hours"] = ((df["exit_dt"] - df["entry_dt"]).dt.total_seconds() / 3600.0).round(1)
        df["scaled_net_pnl_usd"] = df["pnl"].astype(float) * FIXED_NOTIONAL_USD
        df["pnl_pct"] = df["pnl"].astype(float)
        base = df

    if telegram_df.empty:
        return base

    lifecycle_keys = set()
    if not lifecycle_df.empty:
        for _, row in lifecycle_df.iterrows():
            lifecycle_keys.add((str(row["symbol"]), normalize_grapes_ts(row["close_ts"]), round(float(row["close_price"] or 0.0), 4)))
    existing_segment_keys = set()
    if not base.empty:
        for _, row in base.iterrows():
            existing_segment_keys.add(
                (
                    str(row["symbol"]),
                    normalize_grapes_ts(row["entry_time"]),
                    normalize_grapes_ts(row["exit_time"]),
                )
            )

    telegram_rows: List[Dict[str, Any]] = []
    for _, row in telegram_df.iterrows():
        text = str(row["message_text"] or "")
        symbol = str(row["symbol"] or "")
        if not symbol:
            continue
        type_match = re.search(r"\[CLOSE\s+([A-Z]+)\]\s+([A-Z]+USDT)", text)
        exit_match = re.search(r"Exit Price:\s*\$([0-9,]+(?:\.[0-9]+)?)", text)
        pnl_match = re.search(r"PnL:\s*([+-]?[0-9]+(?:\.[0-9]+)?)%", text)
        if not type_match or not exit_match or not pnl_match:
            continue
        payload = {}
        try:
            payload = json.loads(str(row["response_json"] or "{}"))
        except Exception:
            payload = {}
        signal_ts = normalize_grapes_ts(str(row["signal_ts"] or "").strip())
        created_ts = normalize_grapes_ts(str(row["created_at"] or "").strip())
        exit_ts = signal_ts or created_ts
        exit_dt = pd.to_datetime(exit_ts, errors="coerce")
        if pd.isna(exit_dt):
            continue
        exit_price = float(str(exit_match.group(1)).replace(",", ""))
        pnl_pct = float(pnl_match.group(1)) / 100.0
        close_reason = str(payload.get("reason") or "").strip() or "telegram_backfill"
        confidence = 0
        if str(row.get("trade_id") or "").strip():
            confidence += 3
        if signal_ts:
            confidence += 2
        if "exact_price_match" in str(payload.get("time_inference") or ""):
            confidence += 2
        elif "replay_report_match" in str(payload.get("time_inference") or ""):
            confidence += 1
        if close_reason != "telegram_backfill":
            confidence += 1
        telegram_rows.append(
            {
                "row": row,
                "symbol": symbol,
                "text": text,
                "payload": payload,
                "signal_ts": signal_ts,
                "created_ts": created_ts,
                "exit_ts": exit_ts,
                "exit_dt": exit_dt,
                "exit_price": exit_price,
                "pnl_pct": pnl_pct,
                "close_reason": close_reason,
                "type_match": type_match,
                "confidence": confidence,
            }
        )

    telegram_rows.sort(key=lambda item: (-item["confidence"], item["exit_ts"], item["symbol"]))

    used_segment_keys = set(existing_segment_keys)
    synthetic_rows = []
    for item in telegram_rows:
        row = item["row"]
        symbol = item["symbol"]
        signal_ts = item["signal_ts"]
        exit_ts = item["exit_ts"]
        exit_dt = item["exit_dt"]
        exit_price = item["exit_price"]
        pnl_pct = item["pnl_pct"]
        close_reason = item["close_reason"]
        type_match = item["type_match"]
        segment = match_grapes_segment(history_segments, symbol, signal_ts, exit_price, pnl_pct)
        if segment is not None:
            lifecycle_key = (symbol, segment["close_ts"], round(float(segment["close_price"]), 4))
            if lifecycle_key in lifecycle_keys:
                continue
            segment_key = (symbol, segment["entry_ts"], segment["close_ts"])
            if segment_key in used_segment_keys:
                continue
            tp_hit_ts = infer_grapes_tp_hit_ts(
                price_frames=price_frames,
                symbol=symbol,
                entry_ts=segment["entry_ts"],
                close_ts=segment["close_ts"],
                direction=int(segment["direction"]),
                tp_price=float(segment["entry_price"]) * (1.0 + TP_PCT_BY_SYMBOL[symbol] * int(segment["direction"])),
            )
            effective = compute_grapes_effective_close(
                symbol=symbol,
                entry_price=float(segment["entry_price"]),
                exit_price=exit_price,
                direction=int(segment["direction"]),
                close_reason=close_reason,
                tp_hit_ts=tp_hit_ts,
            )
            entry_ts = segment["entry_ts"]
            entry_dt = pd.to_datetime(entry_ts, errors="coerce")
            direction_label = "LONG" if int(segment["direction"]) > 0 else "SHORT"
            hold_hours = round(((exit_dt - entry_dt).total_seconds() / 3600.0), 1) if pd.notna(entry_dt) else 0.0
            realized_pct = float(effective["total_pnl_pct"])
            effective_exit_price = float(effective["effective_exit_price"])
            resolved_reason = str(effective["resolved_close_reason"])
            tiered_flag = int(bool(segment["is_tiered"]))
            exit_ts = segment["close_ts"]
            exit_dt = pd.to_datetime(exit_ts, errors="coerce")
            used_segment_keys.add(segment_key)
        else:
            entry_ts = exit_ts
            override_key = (symbol, str(exit_ts), round(float(exit_price), 2))
            override = GRAPES_TELEGRAM_FALLBACK_OVERRIDES.get(override_key, {})
            direction_label = str(override.get("direction") or "UNKNOWN")
            hold_hours = 0.0
            realized_pct = pnl_pct
            effective_exit_price = exit_price
            resolved_reason = close_reason
            tiered_flag = 1 if type_match.group(1) == "TIERED" else 0
        synthetic_rows.append(
            {
                "symbol": symbol,
                "asset": symbol.replace("USDT", ""),
                "direction": direction_label,
                "entry_price": float(segment["entry_price"]) if segment is not None else exit_price,
                "exit_price": effective_exit_price,
                "pnl": realized_pct,
                "entry_ts": entry_ts,
                "timestamp": exit_ts,
                "entry_time": entry_ts,
                "exit_time": exit_ts,
                "entry_dt": entry_dt if segment is not None else exit_dt,
                "exit_dt": exit_dt,
                "hold_hours": hold_hours,
                "scaled_net_pnl_usd": realized_pct * FIXED_NOTIONAL_USD,
                "pnl_pct": realized_pct,
                "is_tiered": tiered_flag,
                "close_reason": resolved_reason,
                "source": "telegram_backfill",
            }
        )

    if not synthetic_rows:
        return base

    synthetic = pd.DataFrame(synthetic_rows)
    if base.empty:
        return synthetic.sort_values("exit_time").reset_index(drop=True)

    existing_keys = {
        (
            str(r["symbol"]),
            str(r["exit_time"])[:16],
            round(float(r["exit_price"]), 4),
        )
        for _, r in base.iterrows()
    }
    add_rows = []
    for _, r in synthetic.iterrows():
        key = (
            str(r["symbol"]),
            str(r["exit_time"])[:16],
            round(float(r["exit_price"]), 4),
        )
        if key not in existing_keys:
            add_rows.append(r.to_dict())
    if not add_rows:
        return base.sort_values("exit_time").reset_index(drop=True)
    merged = pd.concat([base, pd.DataFrame(add_rows)], ignore_index=True)
    return merged.sort_values("exit_time").reset_index(drop=True)


def load_regime_segments() -> List[Dict[str, Any]]:
    raw = json.loads(GRAPES_JSON.read_text())
    return [
        {
            "state": str(seg["state"]),
            "start_dt": pd.to_datetime(seg["start_ts"]),
            "end_dt": pd.to_datetime(seg["end_ts"]),
        }
        for seg in raw.get("regime_segments", [])
    ]


def load_grapes_ready_cycle() -> str:
    rows = _safe_query_rows(
        GRAPES_LIVE_DB,
        """
        SELECT DISTINCT timestamp
        FROM signal_probs
        WHERE timestamp IS NOT NULL AND TRIM(timestamp) <> ''
        ORDER BY timestamp DESC
        LIMIT 1
        """,
    )
    if not rows:
        return ""
    return str(rows[0]["timestamp"]).strip()


def regime_for_timestamp(ts: str, segments: List[Dict[str, Any]]) -> str:
    t = pd.to_datetime(ts)
    for seg in segments:
        if seg["start_dt"] <= t <= seg["end_dt"]:
            return str(seg["state"])
    return "TRANSITION"


def summarize_regimes_for_trades(trades: pd.DataFrame, segments: List[Dict[str, Any]]) -> Dict[str, Any]:
    if trades.empty:
        return {"regime_detail": []}
    work = trades.copy()
    work["regime_proxy"] = work["entry_time"].astype(str).apply(lambda ts: regime_for_timestamp(ts, segments))
    rows: List[Dict[str, Any]] = []
    for regime, group in work.groupby("regime_proxy", sort=False):
        pnl = group["scaled_net_pnl_usd"].astype(float)
        wins = pnl[pnl > 0]
        losses = pnl[pnl <= 0]
        gross_win = float(wins.sum())
        gross_loss = abs(float(losses.sum()))
        rows.append(
            {
                "regime_proxy": regime,
                "trades": int(len(group)),
                "win_rate_pct": round(float((pnl > 0).mean() * 100.0), 2) if len(group) else 0.0,
                "total_pnl_usd": round(float(pnl.sum()), 2),
                "avg_pnl_usd": round(float(pnl.mean()), 2) if len(group) else 0.0,
                "profit_factor": round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2),
            }
        )
    order = {"TREND_UP": 0, "TREND_DOWN": 1, "RANGE_CHOP": 2, "TRANSITION": 3}
    rows.sort(key=lambda row: order.get(row["regime_proxy"], 99))
    return {"regime_detail": rows}


def build_citrus_from_backtest() -> Dict[str, Any] | None:
    symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
    start_ts = "2022-01-01 04:00:00"
    asset_rows = []
    all_trades = []
    asset_curves: Dict[str, List[Dict[str, Any]]] = {}

    for symbol in symbols:
        trades_file = latest_file(f"trades_{symbol}_*.csv")
        summary_file = latest_file(f"summary_{symbol}_*.txt")
        if not trades_file or not summary_file:
            return None

        summary = parse_summary_txt(summary_file)
        trades_df = pd.read_csv(trades_file)
        trades_df["symbol"] = symbol
        trades_df["asset"] = symbol.replace("USDT", "")
        trades_df["scaled_net_pnl_usd"] = trades_df["pnl_pct"].astype(float) * FIXED_NOTIONAL_USD
        all_trades.append(trades_df)

        asset_rows.append(
            {
                "asset": symbol.replace("USDT", ""),
                "total_return_pct": float(summary.get("total_return_pct", 0.0)),
                "sharpe": float(summary.get("sharpe", 0.0)),
                "max_drawdown_pct": float(summary.get("max_dd_pct", 0.0)),
                "profit_factor": float(summary.get("profit_factor", 0.0)),
                "trades": int(float(summary.get("n_trades", 0))),
                "win_rate_pct": float(summary.get("win_rate_pct", 0.0)),
                "avg_hold_bars": float(summary.get("avg_hold_bars", 0.0)),
                "avg_pnl_usd_20": round(float(trades_df["scaled_net_pnl_usd"].mean()) if len(trades_df) else 0.0, 2),
                "total_pnl_usd_20": round(float(trades_df["scaled_net_pnl_usd"].sum()), 2),
            }
        )
        asset_curves[symbol.replace("USDT", "")] = build_asset_curve_from_trades(trades_df, start_ts)

    trades = pd.concat(all_trades, ignore_index=True).sort_values("exit_time").reset_index(drop=True)
    trades["entry_dt"] = pd.to_datetime(trades["entry_time"])
    trades["exit_dt"] = pd.to_datetime(trades["exit_time"])
    trades["hold_hours"] = ((trades["exit_dt"] - trades["entry_dt"]).dt.total_seconds() / 3600.0).round(1)
    portfolio_curve = build_curve_from_trades(trades, start_ts, CITRUS_BASE_EQUITY_USD)
    monthly = build_monthly_breakdown(trades, CITRUS_BASE_EQUITY_USD)
    active_positions = load_citrus_active_positions()
    regime_snapshot = summarize_regimes_for_trades(trades, load_regime_segments())
    portfolio_sharpe = _estimate_sharpe_from_monthly(monthly["monthly_breakdown"])
    portfolio_sharpe = _estimate_sharpe_from_monthly(monthly["monthly_breakdown"])

    winners = trades[trades["scaled_net_pnl_usd"] > 0]
    losers = trades[trades["scaled_net_pnl_usd"] <= 0]
    longs = trades[trades["direction"] == "LONG"]
    shorts = trades[trades["direction"] == "SHORT"]

    return {
        "name": "Cortex Citrus",
        "status": "BACKTEST TRUE / 20U NORMALIZED",
        "report_date": str(trades["exit_time"].iloc[-1]) if len(trades) else start_ts,
        "source": "live backtest outputs",
        "normalization": {
            "fixed_margin_usd": FIXED_MARGIN_USD,
            "leverage": LEVERAGE,
            "fixed_notional_usd": FIXED_NOTIONAL_USD,
            "synthetic_base_equity_usd": CITRUS_BASE_EQUITY_USD,
        },
        "portfolio": {
            "net_pnl_usd": round(float(trades["scaled_net_pnl_usd"].sum()), 2),
            "gross_pnl_usd": round(float(trades["scaled_net_pnl_usd"].sum()), 2),
            "profit_factor": round(float(winners["scaled_net_pnl_usd"].sum() / abs(losers["scaled_net_pnl_usd"].sum())) if len(losers) else 0.0, 2),
            "trades": int(len(trades)),
            "winners": int(len(winners)),
            "winners_pct": round(float((len(winners) / len(trades)) * 100), 1) if len(trades) else 0.0,
            "losers": int(len(losers)),
            "losers_pct": round(float((len(losers) / len(trades)) * 100), 1) if len(trades) else 0.0,
            "avg_win_usd": round(float(winners["scaled_net_pnl_usd"].mean()) if len(winners) else 0.0, 2),
            "avg_loss_usd": round(float(losers["scaled_net_pnl_usd"].mean()) if len(losers) else 0.0, 2),
            "long_trades": int(len(longs)),
            "long_net_usd": round(float(longs["scaled_net_pnl_usd"].sum()) if len(longs) else 0.0, 2),
            "long_wr_pct": round(float(((longs["scaled_net_pnl_usd"] > 0).sum() / len(longs)) * 100), 1) if len(longs) else 0.0,
            "short_trades": int(len(shorts)),
            "short_net_usd": round(float(shorts["scaled_net_pnl_usd"].sum()) if len(shorts) else 0.0, 2),
            "short_wr_pct": round(float(((shorts["scaled_net_pnl_usd"] > 0).sum() / len(shorts)) * 100), 1) if len(shorts) else 0.0,
            "max_win_streak": int((trades["scaled_net_pnl_usd"] > 0).astype(int).groupby((trades["scaled_net_pnl_usd"] <= 0).cumsum()).sum().max()),
            "max_loss_streak": int((trades["scaled_net_pnl_usd"] <= 0).astype(int).groupby((trades["scaled_net_pnl_usd"] > 0).cumsum()).sum().max()),
            "total_return_pct_on_base": round((float(trades["scaled_net_pnl_usd"].sum()) / CITRUS_BASE_EQUITY_USD) * 100, 2),
            "win_rate_pct": round(float((len(winners) / len(trades)) * 100), 1) if len(trades) else 0.0,
            "max_dd_pct": round(max_dd, 2),
            "final_equity": round(CITRUS_BASE_EQUITY_USD + float(trades["scaled_net_pnl_usd"].sum()), 2),
            "sharpe": portfolio_sharpe,
        },
        "assets": asset_rows,
        "portfolio_curve": portfolio_curve,
        "asset_curves": asset_curves,
        "monthly_summary": monthly["monthly_summary"],
        "monthly_breakdown": monthly["monthly_breakdown"],
        "monthly_heatmap": monthly["monthly_heatmap"],
        "regime_snapshot": regime_snapshot,
        "active_positions": active_positions,
        "all_trades": trades[
            [
                "asset",
                "direction",
                "entry_time",
                "exit_time",
                "hold_hours",
                "entry_price",
                "exit_price",
                "scaled_net_pnl_usd",
            ]
        ]
        .rename(
            columns={
                "entry_time": "entry_ts",
                "exit_time": "exit_ts",
                "scaled_net_pnl_usd": "net_pnl_usd",
            }
        )
        .assign(
            roi_pct_on_margin=lambda df: ((df["net_pnl_usd"] / FIXED_MARGIN_USD) * 100.0).round(2),
            entry_ts=lambda df: df["entry_ts"].astype(str).str.slice(0, 16),
            exit_ts=lambda df: df["exit_ts"].astype(str).str.slice(0, 16),
            net_pnl_usd=lambda df: df["net_pnl_usd"].round(2),
            entry_price=lambda df: df["entry_price"].round(4),
            exit_price=lambda df: df["exit_price"].round(4),
        )
        .to_dict(orient="records"),
        "trades_preview": trades[["asset", "direction", "entry_time", "exit_time", "scaled_net_pnl_usd"]].head(20).to_dict(orient="records"),
    }


def _compute_trade_streak(series: pd.Series, positive: bool) -> int:
    flags = (series > 0) if positive else (series <= 0)
    if flags.empty:
        return 0
    groups = (~flags).cumsum()
    return int(flags.astype(int).groupby(groups).sum().max())


def _estimate_sharpe_from_trades(trades_df: pd.DataFrame) -> float:
    if trades_df.empty:
        return 0.0
    pnl = trades_df["scaled_net_pnl_usd"].astype(float)
    if pnl.std() == 0:
        return 0.0
    return round(float((pnl.mean() / (pnl.std() + 1e-9)) * (len(pnl) ** 0.5)), 3)


def _estimate_sharpe_from_monthly(monthly_rows: List[Dict[str, Any]]) -> float:
    if len(monthly_rows) < 2:
        return 0.0
    returns = pd.Series([float(row.get("return_pct", 0.0)) / 100.0 for row in monthly_rows], dtype=float)
    std = float(returns.std(ddof=1))
    if std == 0:
        return 0.0
    return round(float((returns.mean() / std) * (12.0 ** 0.5)), 3)


def _asset_payload_from_trades(
    asset: str,
    trades_df: pd.DataFrame,
    start_ts: str,
    base_equity_usd: float,
) -> tuple[Dict[str, Any], List[Dict[str, Any]]]:
    pnl = trades_df["scaled_net_pnl_usd"].astype(float)
    wins = trades_df[pnl > 0]
    losses = trades_df[pnl <= 0]
    gross_win = float(wins["scaled_net_pnl_usd"].sum())
    gross_loss = abs(float(losses["scaled_net_pnl_usd"].sum()))
    equity = base_equity_usd + pnl.cumsum()
    max_dd = float(((equity - equity.cummax()) / equity.cummax()).min() * 100.0) if len(equity) else 0.0
    if "bars_held" in trades_df.columns:
        avg_hold_bars = round(float(trades_df["bars_held"].astype(float).mean()) if len(trades_df) else 0.0, 1)
    elif "hold_hours" in trades_df.columns:
        avg_hold_bars = round(float((trades_df["hold_hours"].astype(float) / 4.0).mean()) if len(trades_df) else 0.0, 1)
    else:
        avg_hold_bars = 0.0
    row = {
        "asset": asset,
        "total_return_pct": round((float(pnl.sum()) / base_equity_usd) * 100.0, 2),
        "sharpe": _estimate_sharpe_from_trades(trades_df),
        "max_drawdown_pct": round(max_dd, 2),
        "profit_factor": round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2),
        "trades": int(len(trades_df)),
        "win_rate_pct": round(float((pnl > 0).mean() * 100.0) if len(pnl) else 0.0, 1),
        "avg_hold_bars": avg_hold_bars,
        "avg_pnl_usd_20": round(float(pnl.mean()) if len(trades_df) else 0.0, 2),
        "total_pnl_usd_20": round(float(pnl.sum()), 2),
    }
    return row, build_asset_curve_from_trades(trades_df, start_ts)


def _trades_df_to_records(trades: pd.DataFrame, include_type: bool = False) -> List[Dict[str, Any]]:
    if trades.empty:
        return []
    base = (
        trades[
            [
                "asset",
                "direction",
                "entry_time",
                "exit_time",
                "hold_hours",
                "entry_price",
                "exit_price",
                "scaled_net_pnl_usd",
            ]
        ]
        .rename(
            columns={
                "entry_time": "entry_ts",
                "exit_time": "exit_ts",
                "scaled_net_pnl_usd": "net_pnl_usd",
            }
        )
        .assign(
            roi_pct_on_margin=lambda df: ((df["net_pnl_usd"] / FIXED_MARGIN_USD) * 100.0).round(2),
            entry_ts=lambda df: df["entry_ts"].astype(str).str.slice(0, 16),
            exit_ts=lambda df: df["exit_ts"].astype(str).str.slice(0, 16),
            net_pnl_usd=lambda df: df["net_pnl_usd"].astype(float).round(2),
            entry_price=lambda df: df["entry_price"].astype(float).round(4),
            exit_price=lambda df: df["exit_price"].astype(float).round(4),
        )
    )
    if include_type:
        trade_type = trades["is_tiered"].apply(lambda value: "Tiered" if int(value or 0) else "Trend")
        base = base.assign(type=trade_type.values)
        ordered_cols = ["asset", "direction", "type", "entry_ts", "exit_ts", "hold_hours", "entry_price", "exit_price", "net_pnl_usd", "roi_pct_on_margin"]
        base = base[ordered_cols]
    return base.to_dict(orient="records")


def _execution_view_from_trades(
    trades: pd.DataFrame,
    *,
    start_ts: str,
    base_equity_usd: float,
    include_type: bool = False,
    regime_segments: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    if trades.empty:
        return {
            "summary": {
                "final_equity": base_equity_usd,
                "net_pnl_usd": 0.0,
                "total_return_pct": 0.0,
                "profit_factor": 0.0,
                "trades": 0,
                "win_rate_pct": 0.0,
                "avg_win_usd": 0.0,
                "avg_loss_usd": 0.0,
                "sharpe": 0.0,
                "max_dd_pct": 0.0,
            },
            "portfolio_curve": [{"ts": start_ts, "equity": base_equity_usd}],
            "monthly_summary": {
                "profitable_months": 0,
                "losing_months": 0,
                "best_month": {"label": "—", "pnl_usd": 0.0, "return_pct": 0.0},
                "worst_month": {"label": "—", "pnl_usd": 0.0, "return_pct": 0.0},
            },
            "monthly_breakdown": [],
            "monthly_heatmap": [],
            "regime_snapshot": {"regime_detail": []},
            "all_trades": [],
        }

    work = trades.sort_values("exit_time").reset_index(drop=True).copy()
    pnl = work["scaled_net_pnl_usd"].astype(float)
    wins = work[pnl > 0]
    losses = work[pnl <= 0]
    gross_win = float(wins["scaled_net_pnl_usd"].sum())
    gross_loss = abs(float(losses["scaled_net_pnl_usd"].sum()))
    net = float(pnl.sum())
    equity = base_equity_usd + pnl.cumsum()
    max_dd = float(((equity - equity.cummax()) / equity.cummax()).min() * 100.0) if len(equity) else 0.0
    monthly = build_monthly_breakdown(work, base_equity_usd)
    regime_snapshot = summarize_regimes_for_trades(work, regime_segments or [])
    asset_curves: Dict[str, List[Dict[str, Any]]] = {}
    for asset, group in work.groupby("asset", sort=False):
        asset_curves[str(asset)] = build_asset_curve_from_trades(group.sort_values("exit_time").reset_index(drop=True), start_ts)
    return {
        "summary": {
            "final_equity": round(base_equity_usd + net, 2),
            "net_pnl_usd": round(net, 2),
            "total_return_pct": round((net / base_equity_usd) * 100.0, 2),
            "profit_factor": round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2),
            "trades": int(len(work)),
            "win_rate_pct": round(float((pnl > 0).mean() * 100.0), 1) if len(work) else 0.0,
            "avg_win_usd": round(float(wins["scaled_net_pnl_usd"].mean()) if len(wins) else 0.0, 2),
            "avg_loss_usd": round(float(losses["scaled_net_pnl_usd"].mean()) if len(losses) else 0.0, 2),
            "sharpe": _estimate_sharpe_from_monthly(monthly["monthly_breakdown"]),
            "max_dd_pct": round(max_dd, 2),
        },
        "portfolio_curve": build_curve_from_trades(work, start_ts, base_equity_usd),
        "asset_curves": asset_curves,
        "monthly_summary": monthly["monthly_summary"],
        "monthly_breakdown": monthly["monthly_breakdown"],
        "monthly_heatmap": monthly["monthly_heatmap"],
        "regime_snapshot": regime_snapshot,
        "all_trades": _trades_df_to_records(work, include_type=include_type),
    }


def _append_live_extension_view(
    *,
    backtest_trades: pd.DataFrame,
    live_trades: pd.DataFrame,
    start_ts: str,
    backtest_end_ts: str,
    base_equity_usd: float,
    include_type: bool = False,
    regime_segments: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    if live_trades.empty:
        return _execution_view_from_trades(
            backtest_trades,
            start_ts=start_ts,
            base_equity_usd=base_equity_usd,
            include_type=include_type,
            regime_segments=regime_segments,
        )
    cutoff = pd.to_datetime(backtest_end_ts, errors="coerce")
    live_extension = live_trades.copy()
    live_extension["exit_dt"] = pd.to_datetime(live_extension["exit_time"], errors="coerce")
    if pd.notna(cutoff):
        live_extension = live_extension[live_extension["exit_dt"] > cutoff].copy()
    if live_extension.empty:
        merged = backtest_trades.copy()
    else:
        merged = pd.concat([backtest_trades.copy(), live_extension], ignore_index=True)
    return _execution_view_from_trades(
        merged,
        start_ts=start_ts,
        base_equity_usd=base_equity_usd,
        include_type=include_type,
        regime_segments=regime_segments,
    )


def build_citrus_from_candidate(variant: str = "eth_sol") -> Dict[str, Any] | None:
    candidate_dirs = [
        CITRUS_ROOT / "Reports" / "experiments" / "confirmed_alpha_suite" / variant,
        CITRUS_ROOT / "Reports" / "experiments" / "candidate_compare" / variant,
        ROOT / "Reports" / "experiments" / "citrus_candidate_compare" / variant,
    ]
    variant_dir = next((path for path in candidate_dirs if path.exists()), None)
    if variant_dir is None:
        return None
    trades_all = variant_dir / "trades_all.csv"
    if not trades_all.exists():
        return None

    trades = pd.read_csv(trades_all)
    start_ts = "2022-01-01 04:00:00"
    trades["entry_dt"] = pd.to_datetime(trades["entry_time"])
    trades["exit_dt"] = pd.to_datetime(trades["exit_time"])
    trades["hold_hours"] = (trades["bars_held"].astype(float) * 4.0).round(1)

    asset_rows = []
    asset_curves: Dict[str, List[Dict[str, Any]]] = {}
    for asset, group in trades.groupby("asset", sort=False):
        row, curve = _asset_payload_from_trades(
            asset,
            group.sort_values("exit_time").reset_index(drop=True),
            start_ts,
            CITRUS_BASE_EQUITY_USD,
        )
        asset_rows.append(row)
        asset_curves[asset] = curve

    portfolio_curve = build_curve_from_trades(trades, start_ts, CITRUS_BASE_EQUITY_USD)
    active_positions = load_citrus_active_positions()
    regime_segments = load_regime_segments()
    live_trades = load_citrus_live_trades_df()
    backtest_view = _execution_view_from_trades(
        trades,
        start_ts=start_ts,
        base_equity_usd=CITRUS_BASE_EQUITY_USD,
        include_type=False,
        regime_segments=regime_segments,
    )
    live_view = _execution_view_from_trades(
        live_trades if not live_trades.empty else trades,
        start_ts=start_ts,
        base_equity_usd=CITRUS_BASE_EQUITY_USD,
        include_type=False,
        regime_segments=regime_segments,
    )
    portfolio_sharpe = backtest_view["summary"]["sharpe"]
    pnl = trades["scaled_net_pnl_usd"].astype(float)
    winners = trades[pnl > 0]
    losers = trades[pnl <= 0]
    longs = trades[trades["direction"] == "LONG"]
    shorts = trades[trades["direction"] == "SHORT"]
    gross_win = float(winners["scaled_net_pnl_usd"].sum())
    gross_loss = abs(float(losers["scaled_net_pnl_usd"].sum()))
    net = float(pnl.sum())
    equity = CITRUS_BASE_EQUITY_USD + pnl.cumsum()
    max_dd = float(((equity - equity.cummax()) / equity.cummax()).min() * 100.0) if len(equity) else 0.0

    interpretation = [
        "当前网站 Citrus 基线已切到 balanced_hybrid_v1。",
        "BTC 使用更快 TP / trailing，ETH 使用 anti-chase + short_relax，SOL 保持保守 low-DD sleeve。",
        f"在统一 6000U 基准资金下，组合 PF 为 {round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2):.2f}，胜率为 {round(float((pnl > 0).mean() * 100.0), 2):.2f}%。",
    ]

    return {
        "name": "Cortex Citrus",
        "status": "PRODUCTION CANDIDATE / BALANCED HYBRID V1",
        "report_date": str(trades["exit_time"].iloc[-1]) if len(trades) else start_ts,
        "source": str(variant_dir.relative_to(ROOT.parent)),
        "normalization": {
            "fixed_margin_usd": FIXED_MARGIN_USD,
            "leverage": LEVERAGE,
            "fixed_notional_usd": FIXED_NOTIONAL_USD,
            "synthetic_base_equity_usd": CITRUS_BASE_EQUITY_USD,
        },
        "portfolio": {
            "net_pnl_usd": round(net, 2),
            "gross_pnl_usd": round(net, 2),
            "profit_factor": round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2),
            "trades": int(len(trades)),
            "winners": int(len(winners)),
            "winners_pct": round(float((len(winners) / len(trades)) * 100), 1) if len(trades) else 0.0,
            "losers": int(len(losers)),
            "losers_pct": round(float((len(losers) / len(trades)) * 100), 1) if len(trades) else 0.0,
            "avg_win_usd": round(float(winners["scaled_net_pnl_usd"].mean()) if len(winners) else 0.0, 2),
            "avg_loss_usd": round(float(losers["scaled_net_pnl_usd"].mean()) if len(losers) else 0.0, 2),
            "long_trades": int(len(longs)),
            "long_net_usd": round(float(longs["scaled_net_pnl_usd"].sum()) if len(longs) else 0.0, 2),
            "long_wr_pct": round(float(((longs["scaled_net_pnl_usd"] > 0).sum() / len(longs)) * 100), 1) if len(longs) else 0.0,
            "short_trades": int(len(shorts)),
            "short_net_usd": round(float(shorts["scaled_net_pnl_usd"].sum()) if len(shorts) else 0.0, 2),
            "short_wr_pct": round(float(((shorts["scaled_net_pnl_usd"] > 0).sum() / len(shorts)) * 100), 1) if len(shorts) else 0.0,
            "max_win_streak": _compute_trade_streak(pnl, positive=True),
            "max_loss_streak": _compute_trade_streak(pnl, positive=False),
            "total_return_pct_on_base": round((net / CITRUS_BASE_EQUITY_USD) * 100, 2),
            "win_rate_pct": round(float((len(winners) / len(trades)) * 100), 1) if len(trades) else 0.0,
            "max_dd_pct": round(max_dd, 2),
            "final_equity": round(CITRUS_BASE_EQUITY_USD + net, 2),
            "sharpe": portfolio_sharpe,
            "interpretation": interpretation,
        },
        "assets": asset_rows,
        "portfolio_curve": portfolio_curve,
        "asset_curves": asset_curves,
        "monthly_summary": backtest_view["monthly_summary"],
        "monthly_breakdown": backtest_view["monthly_breakdown"],
        "monthly_heatmap": backtest_view["monthly_heatmap"],
        "regime_snapshot": backtest_view["regime_snapshot"],
        "active_positions": active_positions,
        "all_trades": backtest_view["all_trades"],
        "execution_views": {
            "backtest": backtest_view,
            "live": live_view,
        },
        "trades_preview": trades.sort_values("exit_time", ascending=False)[["asset", "direction", "entry_time", "exit_time", "scaled_net_pnl_usd"]].head(20).to_dict(orient="records"),
    }


def build_grapes_payload(path: Path) -> Dict[str, Any]:
    raw = json.loads(path.read_text())
    summary = raw["summary"]
    worst_streak = raw["regime_snapshot"]["worst_streak"]
    monthly_breakdown = raw.get("monthly_breakdown", [])
    all_trades = flatten_grapes_trades(monthly_breakdown)
    original_initial = float(summary.get("initial_equity", 10000.0))
    original_final = float(summary.get("final_equity", original_initial))
    net_pnl = original_final - original_initial
    adjusted_final = GRAPES_BASE_EQUITY_USD + net_pnl
    start_ts = str(summary["start_ts"])
    end_ts = str(summary["end_ts"])
    years = max((pd.to_datetime(end_ts) - pd.to_datetime(start_ts)).total_seconds() / (365.25 * 24 * 3600), 1e-9)
    adjusted_total_return = ((adjusted_final / GRAPES_BASE_EQUITY_USD) - 1.0) * 100.0
    adjusted_annualized = (((adjusted_final / GRAPES_BASE_EQUITY_USD) ** (1.0 / years)) - 1.0) * 100.0
    adjusted_curve = []
    for row in raw["equity_curve"]:
        adjusted_curve.append(
            {
                "ts": row["ts"],
                "equity": round(GRAPES_BASE_EQUITY_USD + (float(row["equity"]) - original_initial), 2),
            }
        )
    monthly_heatmap_rows = [
        {"year": year, "months": [row for row in monthly_breakdown if row["year"] == year]}
        for year in sorted({row["year"] for row in monthly_breakdown})
    ]
    gross_win = sum(max(float(trade["net_pnl_usd"]), 0.0) for trade in all_trades)
    gross_loss = abs(sum(min(float(trade["net_pnl_usd"]), 0.0) for trade in all_trades))
    profit_factor = round((gross_win / gross_loss) if gross_loss > 0 else 0.0, 2)
    active_positions = load_grapes_active_positions()
    regime_segments = load_regime_segments()
    grapes_live_trades = load_grapes_live_trades_df()
    backtest_trades_df = pd.DataFrame(
        [
            {
                "asset": trade["asset"],
                "direction": trade["direction"],
                "entry_time": trade["entry_ts"],
                "exit_time": trade["exit_ts"],
                "hold_hours": trade["hold_hours"],
                "entry_price": float(trade["entry_price"]),
                "exit_price": float(trade["exit_price"]),
                "scaled_net_pnl_usd": float(trade["net_pnl_usd"]),
                "is_tiered": 1 if str(trade.get("type", "")).lower() == "tiered" else 0,
            }
            for trade in all_trades
        ]
    )
    backtest_view = _execution_view_from_trades(
        backtest_trades_df,
        start_ts=start_ts,
        base_equity_usd=GRAPES_BASE_EQUITY_USD,
        include_type=True,
        regime_segments=regime_segments,
    )
    candidate_payload = load_grapes_range_sync_backtest_payload(start_ts)
    candidate_summary = load_grapes_range_sync_summary()
    candidate_asset_stats = load_grapes_range_sync_asset_stats()
    if candidate_payload:
        backtest_view = candidate_payload["execution_view"]
    elif candidate_summary:
        candidate_final_equity = GRAPES_BASE_EQUITY_USD + float(candidate_summary["net_pnl_usd"])
        candidate_total_return = (float(candidate_summary["net_pnl_usd"]) / GRAPES_BASE_EQUITY_USD) * 100.0
        backtest_view["summary"]["final_equity"] = round(candidate_final_equity, 2)
        backtest_view["summary"]["net_pnl_usd"] = round(float(candidate_summary["net_pnl_usd"]), 2)
        backtest_view["summary"]["total_return_pct"] = round(candidate_total_return, 2)
        backtest_view["summary"]["profit_factor"] = round(float(candidate_summary["profit_factor"]), 2)
        backtest_view["summary"]["trades"] = int(candidate_summary["trades"])
        backtest_view["summary"]["win_rate_pct"] = round(float(candidate_summary["win_rate_pct"]), 1)
        backtest_view["summary"]["sharpe"] = round(float(candidate_summary["sharpe"]), 3)
    live_view = _execution_view_from_trades(
        grapes_live_trades,
        start_ts=start_ts,
        base_equity_usd=GRAPES_BASE_EQUITY_USD,
        include_type=True,
        regime_segments=regime_segments,
    )
    grapes_summary = {
        "initial_equity": GRAPES_BASE_EQUITY_USD,
        "final_equity": round(adjusted_final, 2),
        "net_pnl_usd": round(net_pnl, 2),
        "total_return_pct": round(adjusted_total_return, 2),
        "annualized_return_pct": round(adjusted_annualized, 2),
        "max_drawdown_pct": summary["max_drawdown_pct"],
        "sharpe": summary["sharpe"],
        "profit_factor": profit_factor,
        "trade_count": summary["trade_count"],
        "win_rate_pct": raw.get("trade_overview", {}).get("win_rate_pct", 0.0),
        "start_ts": start_ts,
        "end_ts": end_ts,
    }
    if candidate_payload:
        grapes_summary = candidate_payload["summary"]
        adjusted_curve = candidate_payload["equity_curve"]
        monthly_breakdown = candidate_payload["monthly_breakdown"]
        monthly_heatmap_rows = candidate_payload["monthly_heatmap"]
        all_trades = candidate_payload["all_trades"]
    elif candidate_summary:
        grapes_summary["final_equity"] = round(GRAPES_BASE_EQUITY_USD + float(candidate_summary["net_pnl_usd"]), 2)
        grapes_summary["net_pnl_usd"] = round(float(candidate_summary["net_pnl_usd"]), 2)
        grapes_summary["total_return_pct"] = round((float(candidate_summary["net_pnl_usd"]) / GRAPES_BASE_EQUITY_USD) * 100.0, 2)
        grapes_summary["sharpe"] = round(float(candidate_summary["sharpe"]), 3)
        grapes_summary["profit_factor"] = round(float(candidate_summary["profit_factor"]), 2)
        grapes_summary["trade_count"] = int(candidate_summary["trades"])
        grapes_summary["win_rate_pct"] = round(float(candidate_summary["win_rate_pct"]), 1)

    return {
        "name": "Cortex Grapes",
        "status": "LIVE / PRODUCTION",
        "report_date": summary["end_ts"],
        "summary": grapes_summary,
        "equity_curve": adjusted_curve,
        "btc_price": raw["btc_price"],
        "asset_stats": candidate_payload["asset_stats"] if candidate_payload else (candidate_asset_stats if candidate_asset_stats else raw["asset_stats"]),
        "asset_curves": candidate_payload["asset_curves"] if candidate_payload else raw["asset_curves"],
        "monthly_summary": candidate_payload["monthly_summary"] if candidate_payload else raw["monthly_summary"],
        "monthly_breakdown": monthly_breakdown,
        "monthly_heatmap": monthly_heatmap_rows,
        "regime_snapshot": candidate_payload["regime_snapshot"] if candidate_payload else raw["regime_snapshot"],
        "worst_streak": worst_streak,
        "all_trades": all_trades,
        "active_positions": active_positions,
        "execution_views": {
            "backtest": backtest_view,
            "live": live_view,
        },
    }


def build_payload() -> Dict[str, Any]:
    grapes = build_grapes_payload(GRAPES_JSON)
    citrus = build_citrus_from_candidate("balanced_hybrid_v1") or build_citrus_from_backtest() or parse_citrus_report(CITRUS_REPORT)
    updated_candidates = [
        load_grapes_ready_cycle(),
        str(grapes.get("report_date", "")).strip(),
        str(citrus.get("report_date", "")).strip(),
    ]
    updated_at = max((ts for ts in updated_candidates if ts), default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    comparison_rows = [
        {
            "label": "ROI / 总回报",
            "grapes": f"{grapes['summary']['total_return_pct']:+.2f}%",
            "citrus": f"{citrus['portfolio'].get('total_return_pct_on_base', 0.0):+.2f}%",
        },
        {
            "label": "Sharpe",
            "grapes": f"{grapes['summary']['sharpe']:.2f}",
            "citrus": f"{citrus['portfolio'].get('sharpe', 0.0):.2f}",
        },
        {
            "label": "Max DD",
            "grapes": f"{grapes['summary']['max_drawdown_pct']:.2f}%",
            "citrus": f"{citrus['portfolio'].get('max_dd_pct', 0.0):.2f}%",
        },
        {
            "label": "Trades",
            "grapes": str(grapes["summary"]["trade_count"]),
            "citrus": str(citrus["portfolio"]["trades"]),
        },
        {
            "label": "Win Rate",
            "grapes": f"{grapes['summary']['win_rate_pct']:.1f}%",
            "citrus": f"{citrus['portfolio']['win_rate_pct']:.1f}%",
        },
    ]

    return {
        "meta": {
            "title": "NTS Alpha Lab",
            "updated_at": updated_at,
            "sources": {
                "grapes": str(GRAPES_JSON.relative_to(ROOT)),
                "citrus": str(citrus.get("source", CITRUS_REPORT.relative_to(ROOT.parent))),
            },
        },
        "strategies": {
            "grapes": grapes,
            "citrus": citrus,
        },
        "comparison_rows": comparison_rows,
    }


def main() -> None:
    OUTPUT_JSON.write_text(json.dumps(build_payload(), ensure_ascii=False, indent=2))
    print(f"[strategy_os] wrote {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
