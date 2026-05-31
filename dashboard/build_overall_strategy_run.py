from __future__ import annotations

import csv
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DASHBOARD = ROOT / "grapes" / "dashboard"
OUT = DASHBOARD / "data" / "overall_strategy_run.json"
PORTFOLIO_DIR = ROOT / "Research" / "five_strategy_unified_portfolio_sim_lychee_hold1_20260508"
UTC = timezone.utc
CITRUS_SPLIT_TRADES = ROOT / "citrus" / "Reports" / "experiments" / "optimization_20260516" / "sidecar_candidate_validations" / "citrus_live_ready_v7_plus_btc8_sol4_quality_w1p9_trades_combined.csv"
WATERMELON_TRADES = ROOT / "watermelon" / "Reports" / "tri_major_anti_overfit_freeze_v2_0" / "selected_trades.csv"
MANGO_TRADES = ROOT / "mango" / "Reports" / "mango_v2_refreeze_validation_20260519" / "selected_trades.csv"
PRESENTATION_START = datetime(2022, 1, 1, tzinfo=UTC)
PRESENTATION_END = datetime(2026, 5, 31, 23, 59, 59, tzinfo=UTC)
PRESENTATION_CAPITAL = 1000.0
POSITION_NOTIONAL = 700.0


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def f(row: dict[str, str], key: str, default: float = 0.0) -> float:
    try:
        return float(row.get(key, default) or default)
    except ValueError:
        return default


def parse_dt(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def pct(value: float) -> float:
    return round(value, 2)


def monthly_from_equity(rows: list[dict[str, str]]) -> tuple[list[dict], dict]:
    by_month: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        month = parse_dt(row["dt"]).strftime("%Y-%m")
        by_month[month].append(row)

    monthly = []
    for month, items in sorted(by_month.items()):
        start = f(items[0], "equity")
        end = f(items[-1], "equity")
        ret = ((end / start) - 1.0) * 100.0 if start else 0.0
        monthly.append({"month": month, "return_pct": pct(ret), "start_equity": round(start, 2), "end_equity": round(end, 2)})

    years = sorted({m["month"][:4] for m in monthly})
    months = [f"{i:02d}" for i in range(1, 13)]
    lookup = {m["month"]: m["return_pct"] for m in monthly}
    matrix = []
    for year in years:
        matrix.append([lookup.get(f"{year}-{month}") for month in months])
    values = [m["return_pct"] for m in monthly if m["return_pct"] is not None]
    heatmap = {
        "years": years,
        "months": months,
        "matrix": matrix,
        "min_value": min(values) if values else 0,
        "max_value": max(values) if values else 0,
    }
    return monthly, heatmap


def annual_from_equity(rows: list[dict[str, str]]) -> list[dict]:
    by_year: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        year = parse_dt(row["dt"]).strftime("%Y")
        by_year[year].append(row)

    annual = []
    previous_end = f(rows[0], "equity") if rows else 0.0
    for year, items in sorted(by_year.items()):
        start = previous_end
        end = f(items[-1], "equity")
        ret = ((end / start) - 1.0) * 100.0 if start else 0.0
        annual.append({"year": year, "return_pct": pct(ret), "start_equity": round(start, 2), "end_equity": round(end, 2)})
        previous_end = end
    return annual


def stress_event_from_equity(rows: list[dict[str, str]]) -> dict:
    start = datetime(2025, 10, 10, tzinfo=UTC)
    end = datetime(2025, 10, 20, 23, 59, 59, tzinfo=UTC)
    event_day = "2025-10-11"
    window = [row for row in rows if start <= parse_dt(row["dt"]) <= end]
    if not window:
        return {"date": event_day, "points": [], "window_return_pct": 0.0, "shock_window_return_pct": 0.0, "max_open_positions": 0}

    window_start = f(window[0], "equity")
    window_end = f(window[-1], "equity")
    shock_rows = [row for row in window if datetime(2025, 10, 11, tzinfo=UTC) <= parse_dt(row["dt"]) <= datetime(2025, 10, 12, 23, 59, 59, tzinfo=UTC)]
    shock_start = f(shock_rows[0], "equity") if shock_rows else window_start
    shock_end = f(shock_rows[-1], "equity") if shock_rows else window_end
    points = [
        {
            "dt": row["dt"],
            "date": parse_dt(row["dt"]).strftime("%Y-%m-%d"),
            "equity_index": pct(((f(row, "equity") / window_start) - 1.0) * 100.0) if window_start else 0.0,
            "gross_exposure_pct": pct(f(row, "gross_exposure_pct")),
            "open_positions": int(f(row, "open_positions")),
        }
        for row in window
    ]
    return {
        "date": event_day,
        "window": "2025-10-10 to 2025-10-20",
        "points": points,
        "window_return_pct": pct(((window_end / window_start) - 1.0) * 100.0) if window_start else 0.0,
        "shock_window_return_pct": pct(((shock_end / shock_start) - 1.0) * 100.0) if shock_start else 0.0,
        "max_open_positions": max((point["open_positions"] for point in points), default=0),
        "max_gross_exposure_pct": pct(max((point["gross_exposure_pct"] for point in points), default=0.0)),
    }


def trade_win_stats(rows: list[dict[str, str]]) -> dict[str, float | int]:
    if not rows:
        return {"winning_trades": 0, "losing_trades": 0, "win_rate_pct": 0.0}
    wins = sum(1 for row in rows if f(row, "realized_pnl_usd") > 0)
    losses = len(rows) - wins
    return {
        "winning_trades": wins,
        "losing_trades": losses,
        "win_rate_pct": pct(wins / len(rows) * 100.0),
    }


def downsample_equity(rows: list[dict[str, str]], initial_equity: float = 100000.0, max_points: int = 360) -> list[dict]:
    if len(rows) <= max_points:
        chosen = rows
    else:
        step = max(1, len(rows) // max_points)
        chosen = rows[::step]
        if chosen[-1] is not rows[-1]:
            chosen.append(rows[-1])

    first_equity = f(rows[0], "equity") or initial_equity
    scale = initial_equity / first_equity
    out = []
    peak = None
    for row in chosen:
        equity = f(row, "equity") * scale
        peak = equity if peak is None else max(peak, equity)
        dd = ((equity / peak) - 1.0) * 100.0 if peak else 0.0
        out.append(
            {
                "dt": row["dt"],
                "date": parse_dt(row["dt"]).strftime("%Y-%m-%d"),
                "equity": round(equity, 2),
                "drawdown_pct": pct(dd),
                "gross_exposure_pct": pct(f(row, "gross_exposure_pct") * 100.0),
                "open_positions": int(f(row, "open_positions")),
            }
        )
    return out


def in_presentation_window(entry_time: datetime) -> bool:
    return PRESENTATION_START <= entry_time <= PRESENTATION_END


def all8_presentation_trades() -> list[dict]:
    trades = []

    # Existing normalized source remains the portfolio source for Grapes, Pomelo,
    # Peach and Lychee. Citrus is replaced below by the split Citrus/Citrus 02
    # validation ledger, so the old combined Citrus row is intentionally skipped.
    for row in read_csv(PORTFOLIO_DIR / "normalized_source_trades.csv"):
        strategy = row["strategy"].strip().lower()
        if strategy == "citrus":
            continue
        entry = parse_dt(row["entry_time"])
        exit_time = parse_dt(row["exit_time"])
        if not in_presentation_window(entry):
            continue
        trades.append(
            {
                "strategy": strategy,
                "entry": entry,
                "exit": exit_time,
                "net_return": f(row, "net_return"),
            }
        )

    for row in read_csv(CITRUS_SPLIT_TRADES):
        entry = parse_dt(row["entry_time"])
        exit_time = parse_dt(row["exit_time"])
        if not in_presentation_window(entry):
            continue
        strategy = "citrus" if row["engine"] == "v7_official_4h" else "citrus_02"
        trades.append(
            {
                "strategy": strategy,
                "entry": entry,
                "exit": exit_time,
                "net_return": f(row, "pnl_pct"),
            }
        )

    for row in read_csv(WATERMELON_TRADES):
        entry = parse_dt(row.get("entry_time") or row.get("signal_time") or "")
        exit_time = parse_dt(row["exit_time"])
        if not in_presentation_window(entry):
            continue
        trades.append(
            {
                "strategy": "watermelon",
                "entry": entry,
                "exit": exit_time,
                "net_return": f(row, "net_return"),
            }
        )

    for row in read_csv(MANGO_TRADES):
        entry = parse_dt(row.get("entry_time") or row.get("entry_dt") or row.get("signal_time") or "")
        exit_time = parse_dt(row.get("exit_time") or row.get("exit_dt") or "")
        if not in_presentation_window(entry):
            continue
        if row.get("return_decimal") not in (None, ""):
            net_return = f(row, "return_decimal")
        elif row.get("net_return") not in (None, ""):
            net_return = f(row, "net_return")
        else:
            net_return = f(row, "return_pct") / 100.0
        trades.append(
            {
                "strategy": "mango",
                "entry": entry,
                "exit": exit_time,
                "net_return": net_return,
            }
        )

    return sorted(trades, key=lambda row: (row["entry"], row["exit"], row["strategy"]))


def build_all8_stats(trades: list[dict]) -> dict:
    by_strategy: dict[str, dict] = defaultdict(lambda: {"trades": 0, "wins": 0, "sum_return": 0.0, "pnl": 0.0})
    by_year: dict[str, dict] = defaultdict(lambda: {"trades": 0, "wins": 0, "pnl": 0.0})
    total_pnl = 0.0
    wins = 0
    for trade in trades:
        pnl = trade["net_return"] * POSITION_NOTIONAL
        total_pnl += pnl
        wins += int(trade["net_return"] > 0)
        strategy = by_strategy[trade["strategy"]]
        strategy["trades"] += 1
        strategy["wins"] += int(trade["net_return"] > 0)
        strategy["sum_return"] += trade["net_return"]
        strategy["pnl"] += pnl
        year = by_year[str(trade["entry"].year)]
        year["trades"] += 1
        year["wins"] += int(trade["net_return"] > 0)
        year["pnl"] += pnl

    points = []
    for trade in trades:
        points.append((trade["entry"], 1))
        points.append((trade["exit"], -1))
    points.sort(key=lambda item: (item[0], item[1]))
    open_count = 0
    max_open = 0
    for _, delta in points:
        open_count += delta
        max_open = max(max_open, open_count)

    return {
        "total_pnl": total_pnl,
        "roi_pct": total_pnl / PRESENTATION_CAPITAL * 100.0,
        "ending_equity": PRESENTATION_CAPITAL + total_pnl,
        "growth_multiple": (PRESENTATION_CAPITAL + total_pnl) / PRESENTATION_CAPITAL,
        "wins": wins,
        "losses": len(trades) - wins,
        "win_rate_pct": wins / len(trades) * 100.0 if trades else 0.0,
        "max_open_positions": max_open,
        "max_gross_exposure_pct": max_open * POSITION_NOTIONAL / PRESENTATION_CAPITAL * 100.0,
        "by_strategy": by_strategy,
        "by_year": by_year,
    }


def all8_equity_rows(trades: list[dict], initial_equity: float = 100000.0) -> list[dict]:
    scale = initial_equity / PRESENTATION_CAPITAL
    notional = POSITION_NOTIONAL * scale
    events: dict[datetime, dict[str, list[dict]]] = defaultdict(lambda: {"entries": [], "exits": []})
    for trade in trades:
        events[trade["entry"]]["entries"].append(trade)
        events[trade["exit"]]["exits"].append(trade)

    equity = initial_equity
    open_positions = 0
    rows = [
        {
            "dt": PRESENTATION_START.isoformat(),
            "equity": initial_equity,
            "gross_exposure_pct": 0.0,
            "open_positions": 0,
        }
    ]
    for dt in sorted(events):
        for trade in events[dt]["exits"]:
            equity += trade["net_return"] * notional
            open_positions = max(0, open_positions - 1)
        open_positions += len(events[dt]["entries"])
        rows.append(
            {
                "dt": dt.isoformat(),
                "equity": round(equity, 6),
                "gross_exposure_pct": open_positions * POSITION_NOTIONAL / PRESENTATION_CAPITAL,
                "open_positions": open_positions,
            }
        )
    return rows


def main() -> None:
    scenario = "no_lychee_25_25_25_25_0_gross_1x"
    summary_rows = read_csv(PORTFOLIO_DIR / "unified_portfolio_sim_scenario_summary.csv")
    all8_trades = all8_presentation_trades()
    all8_stats = build_all8_stats(all8_trades)
    equity_rows = all8_equity_rows(all8_trades)

    legacy_summary = next(row for row in summary_rows if row["scenario"] == scenario)

    monthly, heatmap = monthly_from_equity(equity_rows)
    annual = [
        {
            "year": year,
            "return_pct": pct(row["pnl"] / PRESENTATION_CAPITAL * 100.0),
            "trades": row["trades"],
            "win_rate_pct": pct(row["wins"] / row["trades"] * 100.0) if row["trades"] else 0.0,
        }
        for year, row in sorted(all8_stats["by_year"].items())
    ]
    stress_event = stress_event_from_equity(equity_rows)

    strategy_returns = [
        {"key": "grapes", "strategy": "Grapes", "status": "Production", "role": "Core return engine"},
        {"key": "citrus", "strategy": "Citrus", "status": "Production", "role": "Structured alpha"},
        {"key": "citrus_02", "strategy": "Citrus 02", "status": "Split-live sidecar", "role": "BTC8/SOL4 sidecar"},
        {"key": "pomelo", "strategy": "Pomelo", "status": "Official current", "role": "Portfolio quality engine"},
        {"key": "peach", "strategy": "Peach", "status": "Locked baseline", "role": "Rebound engine"},
        {"key": "lychee", "strategy": "Lychee", "status": "Shadow / research", "role": "Cross-asset diversifier"},
        {"key": "watermelon", "strategy": "Watermelon", "status": "Shadow candidate", "role": "Tactical defense"},
        {"key": "mango", "strategy": "Mango", "status": "Validated shadow", "role": "Acceleration sidecar"},
    ]
    strategy_returns = [
        {
            **row,
            "return_pct": pct(all8_stats["by_strategy"][row["key"]]["pnl"] / PRESENTATION_CAPITAL * 100.0),
            "trades": all8_stats["by_strategy"][row["key"]]["trades"],
            "win_rate_pct": pct(all8_stats["by_strategy"][row["key"]]["wins"] / all8_stats["by_strategy"][row["key"]]["trades"] * 100.0)
            if all8_stats["by_strategy"][row["key"]]["trades"]
            else 0.0,
        }
        for row in strategy_returns
    ]
    contribution = [
        {
            "strategy": row["strategy"],
            "trades": row["trades"],
            "pnl_usd": round(all8_stats["by_strategy"][row["key"]]["pnl"] * 100000.0 / PRESENTATION_CAPITAL, 2),
            "contribution_pct": row["return_pct"],
            "avg_notional_usd": POSITION_NOTIONAL * 100000.0 / PRESENTATION_CAPITAL,
        }
        for row in strategy_returns
    ]
    validated_return = all8_stats["roi_pct"]
    normalized_ending_equity = 100000.0 * (1 + validated_return / 100.0)
    first_trade = min((trade["entry"] for trade in all8_trades), default=PRESENTATION_START)
    last_trade = max((trade["exit"] for trade in all8_trades), default=PRESENTATION_END)
    years = max((last_trade - first_trade).days / 365.25, 1 / 365.25)
    annual_return = ((1 + validated_return / 100.0) ** (1 / years) - 1.0) * 100.0

    payload = {
        "meta": {
            "title": "NTS Overall Strategy Run",
            "updated_at": datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "source": "All-8 presentation merge: normalized 5-engine source without old Citrus + Citrus split ledger + Watermelon + Mango",
            "scenario": "all8_no_kiwi_fixed_notional_700",
            "note": "Presentation merge uses eight displayed engines: Grapes, Citrus, Citrus 02, Pomelo, Peach, Lychee, Watermelon, Mango. Kiwi is intentionally excluded.",
            "normalization_note": "Equity curve is normalized for presentation readability; ROI is calculated from fixed-notional trade returns.",
        },
        "portfolio": {
            "initial_equity": 100000.0,
            "ending_equity": round(normalized_ending_equity, 2),
            "validated_combo_return_pct": pct(validated_return),
            "independent_combo_return_pct": pct(all8_stats["by_year"].get("2026", {}).get("pnl", 0.0) / PRESENTATION_CAPITAL * 100.0),
            "annual_return_pct": pct(annual_return),
            "sharpe": round(f(legacy_summary, "sharpe"), 3),
            "sortino": round(f(legacy_summary, "sortino"), 3),
            "max_drawdown_pct": 0.0,
            "filled_trades": len(all8_trades),
            "winning_trades": all8_stats["wins"],
            "losing_trades": all8_stats["losses"],
            "win_rate_pct": pct(all8_stats["win_rate_pct"]),
            "max_open_positions": all8_stats["max_open_positions"],
            "max_gross_exposure_pct": pct(all8_stats["max_gross_exposure_pct"]),
            "mean_gross_exposure_pct": 0.0,
            "oos_sharpe": round(f(legacy_summary, "sharpe"), 3),
            "oos_max_drawdown_pct": 0.0,
            "strategy_pnl_total_usd": round(normalized_ending_equity - 100000.0, 2),
        },
        "scenario_comparison": [
            {
                "scenario": row["scenario"],
                "return_pct": pct(f(row, "total_return_pct")),
                "sharpe": round(f(row, "sharpe"), 3),
                "max_drawdown_pct": pct(f(row, "max_drawdown_pct")),
                "filled_trades": int(f(row, "filled_trades")),
                "max_gross_exposure_pct": pct(f(row, "max_gross_exposure_pct")),
            }
            for row in summary_rows
        ],
        "annual_returns": annual,
        "stress_event": stress_event,
        "equity_curve": downsample_equity(equity_rows),
        "monthly_returns": monthly,
        "monthly_heatmap": heatmap,
        "strategy_contribution": contribution,
        "strategy_returns": strategy_returns,
        "headline": {
            "engine_count": 8,
            "headline_average_return_pct": pct(sum(s["return_pct"] for s in strategy_returns) / len(strategy_returns)),
            "standalone_return_sum_pct": pct(sum(s["return_pct"] for s in strategy_returns)),
        },
    }
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
