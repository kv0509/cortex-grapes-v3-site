# System Changes

## 2026-03-25

- Added a reusable Binance Vision importer script at `scripts/build_binance_vision_asset.py`.
- Purpose: download all daily futures kline and metrics zips for a symbol, merge them, and build Grapes-compatible `Data/<ASSET>.csv`, `Data/<ASSET>v1.csv`, and `Data/<ASSET>_metrics_raw.csv`.
- Impacted modules: data ingestion, offline feature generation, backtest dataset preparation.
- Notes: this keeps external exchange data normalization out of the live trading path and makes adding new research assets repeatable and auditable.
- Added exploratory HYPE support to the offline backtest entrypoints with a conservative SOL-like config and lower margin sizing.
- Added `scripts/run_hype_config_sweep.py` to sweep production-ensemble portability parameters for HYPE without mutating the shared default config.
- Promoted the current HYPE default backtest config to the best sweep candidate: `thr_trend=0.55`, `thr_trend_low=0.53`, `vol_z_gate=2.0`, `z_oi_gate=1.0`, `hard_tp_pct=0.06`, `margin=50`.
- Note: HYPE history currently starts on 2025-05-30, so walk-forward coverage is still shallow and under-trading is expected while Vegas context is still short.
- Updated `scripts/publish_strategy_os_site.sh` to support unattended GitHub publishing via `GITHUB_TOKEN` and optional `GITHUB_USERNAME`.
- Purpose: let the downstream cron publish GitHub Pages without relying on interactive keychain prompts, which were failing under cron with `could not read Username for 'https://github.com'`.
- Impacted modules: Strategy OS site publishing, downstream cron release path.
- Notes: add `GITHUB_TOKEN` to `.env.bingx.local` (local only, never committed). Once present, cron can rebuild + push website updates for each new processed cycle.
- Reworked `Strategy OS` data modeling to preserve both `backtest` and `live` execution views for Grapes and Citrus instead of overwriting one with the other.
- Added Grapes live trade extraction from `Live/db/grapes_model_v1.db` and normalized both strategies into `execution_views.backtest/live` with separate summary, monthly, heatmap, regime, asset curves, and trade explorer payloads.
- Updated the `Strategy OS` frontend to add per-strategy `Backtest / Live` tabs plus execution snapshot cards so users can compare validated performance against the current live ledger without mixing the two lenses.
- Impacted modules: `scripts/build_strategy_os_data.py`, `dashboard/strategy_os.html`, `dashboard/strategy_os.css`, `dashboard/strategy_os.js`, `dashboard/data/strategy_os.json`.
- Notes: top-line strategy cards still represent the primary marketed backtest/candidate result; the new lens switch controls the detailed execution board, monthly view, regime view, and trade explorer.
