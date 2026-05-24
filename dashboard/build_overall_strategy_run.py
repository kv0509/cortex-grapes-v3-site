from __future__ import annotations

import csv
import json
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DASHBOARD = ROOT / "grapes" / "dashboard"
OUT = DASHBOARD / "data" / "overall_strategy_run.json"
PORTFOLIO_DIR = ROOT / "Research" / "five_strategy_unified_portfolio_sim_lychee_hold1_20260508"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def f(row: dict[str, str], key: str, default: float = 0.0) -> float:
    try:
        return float(row.get(key, default) or default)
    except ValueError:
        return default


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


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


def main() -> None:
    scenario = "no_lychee_25_25_25_25_0_gross_1x"
    summary_rows = read_csv(PORTFOLIO_DIR / "unified_portfolio_sim_scenario_summary.csv")
    split_rows = read_csv(PORTFOLIO_DIR / f"{scenario}_split_metrics.csv")
    contribution_rows = read_csv(PORTFOLIO_DIR / f"{scenario}_strategy_contribution.csv")
    equity_rows = read_csv(PORTFOLIO_DIR / f"{scenario}_equity.csv")

    summary = next(row for row in summary_rows if row["scenario"] == scenario)
    full = next(row for row in split_rows if row["period"] == "full_common")
    oos = next(row for row in split_rows if row["period"] == "oos_2025_plus")

    monthly, heatmap = monthly_from_equity(equity_rows)

    strategy_returns = [
        {"strategy": "Grapes", "return_pct": 442.66, "status": "Production", "role": "Core return engine"},
        {"strategy": "Watermelon", "return_pct": 243.68, "status": "Shadow candidate", "role": "Tactical short / defense"},
        {"strategy": "Peach", "return_pct": 197.11, "status": "Locked baseline", "role": "Rebound engine"},
        {"strategy": "Pomelo", "return_pct": 154.74, "status": "Official current", "role": "Portfolio quality engine"},
        {"strategy": "Citrus", "return_pct": 132.85, "status": "Production candidate", "role": "Structured sidecar"},
        {"strategy": "Lychee", "return_pct": 122.97, "status": "Shadow / research", "role": "Cross-asset diversifier"},
        {"strategy": "Kiwi", "return_pct": 109.15, "status": "Shadow live", "role": "Squeeze expansion"},
        {"strategy": "Mango", "return_pct": 108.35, "status": "Validated shadow", "role": "Acceleration sidecar"},
    ]

    first_equity = f(equity_rows[0], "equity") or 100000.0
    contribution_scale = 100000.0 / first_equity
    validated_return = f(summary, "total_return_pct")
    normalized_ending_equity = 100000.0 * (1 + validated_return / 100.0)
    total_pnl = normalized_ending_equity - 100000.0
    contribution = [
        {
            "strategy": row["strategy"].title(),
            "trades": int(f(row, "trades")),
            "pnl_usd": round(total_pnl * f(row, "pnl_contribution_pct") / 100.0, 2),
            "contribution_pct": pct(f(row, "pnl_contribution_pct")),
            "avg_notional_usd": round(f(row, "avg_filled_notional_usd"), 2),
        }
        for row in contribution_rows
    ]

    payload = {
        "meta": {
            "title": "NTS Overall Strategy Run",
            "updated_at": datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "source": "Research/five_strategy_unified_portfolio_sim_lychee_hold1_20260508",
            "scenario": scenario,
            "note": "Validated combo is a shared-capital portfolio simulation. 8-engine headline average is standalone breadth, not an 8-engine merged portfolio backtest.",
            "normalization_note": "Equity curve is normalized to a 100,000 USD starting capital for investor readability.",
        },
        "portfolio": {
            "initial_equity": 100000.0,
            "ending_equity": round(normalized_ending_equity, 2),
            "validated_combo_return_pct": pct(validated_return),
            "independent_combo_return_pct": pct(f(oos, "total_return_pct")),
            "annual_return_pct": pct(f(summary, "annual_return_pct")),
            "sharpe": round(f(summary, "sharpe"), 3),
            "sortino": round(f(summary, "sortino"), 3),
            "max_drawdown_pct": pct(f(summary, "max_drawdown_pct")),
            "filled_trades": int(f(summary, "filled_trades")),
            "max_open_positions": int(f(summary, "max_open_positions")),
            "max_gross_exposure_pct": pct(f(summary, "max_gross_exposure_pct")),
            "mean_gross_exposure_pct": pct(f(summary, "mean_gross_exposure_pct")),
            "oos_sharpe": round(f(oos, "sharpe"), 3),
            "oos_max_drawdown_pct": pct(f(oos, "max_drawdown_pct")),
            "strategy_pnl_total_usd": round(total_pnl, 2),
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
