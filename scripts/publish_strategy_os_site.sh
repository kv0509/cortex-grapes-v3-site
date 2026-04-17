#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${ROOT_DIR}/logs"
mkdir -p "${LOG_DIR}"

HOME_FALLBACK="$(python3 -c 'from pathlib import Path; print(Path.home())')"
export HOME="${HOME:-${HOME_FALLBACK}}"
export GIT_TERMINAL_PROMPT=0

cd "${ROOT_DIR}"

echo "[PUBLISH] writing build meta"
python3 - <<'EOF'
import json
from datetime import datetime
from pathlib import Path

meta = {
    "built_at": datetime.utcnow().isoformat(),
    "build_status": "success",
}

path = Path("dashboard/data/build_meta.json")
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
EOF

SITE_PATHS=(
  "index.html"
  "dashboard/index.html"
  "dashboard/app.js"
  "dashboard/styles.css"
  "dashboard/strategy_os.html"
  "dashboard/strategy_os.css"
  "dashboard/strategy_os.js"
  "dashboard/data/strategy_os.json"
  "dashboard/data/dashboard_data.json"
  "dashboard/data/citrus_liquidity_data.json"
  "dashboard/data/build_meta.json"
  "dashboard/assets/nts-alpha-lab-logo.png"
  "dashboard/favicon.svg"
)

echo "[PUBLISH] staging Strategy OS site files"
git add -- "${SITE_PATHS[@]}"

NEEDS_COMMIT=1
if git diff --cached --quiet --exit-code; then
  NEEDS_COMMIT=0
fi

if [[ "${NEEDS_COMMIT}" == "1" ]]; then
  COMMIT_MSG="Auto-publish Strategy OS refresh $(date '+%Y-%m-%d %H:%M:%S')"
  echo "[PUBLISH] committing site refresh"
  git commit -m "${COMMIT_MSG}" >> "${LOG_DIR}/strategy_os_publish.log" 2>&1
fi

AHEAD_COUNT="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
if [[ "${NEEDS_COMMIT}" == "0" && "${AHEAD_COUNT}" == "0" ]]; then
  echo "[PUBLISH] no Strategy OS site changes to publish"
  exit 0
fi

echo "[PUBLISH] pushing to origin/main"
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  GITHUB_USERNAME="${GITHUB_USERNAME:-kv0509}"
  ASKPASS_SCRIPT="$(mktemp "${TMPDIR:-/tmp}/strategy_os_askpass.XXXXXX")"
  cleanup_askpass() {
    rm -f "${ASKPASS_SCRIPT}" 2>/dev/null || true
  }
  trap cleanup_askpass EXIT
  cat > "${ASKPASS_SCRIPT}" <<'EOF'
#!/usr/bin/env bash
case "$1" in
  *Username*) printf '%s\n' "${GITHUB_USERNAME}" ;;
  *Password*) printf '%s\n' "${GITHUB_TOKEN}" ;;
  *) printf '\n' ;;
esac
EOF
  chmod 700 "${ASKPASS_SCRIPT}"
  GIT_ASKPASS="${ASKPASS_SCRIPT}" git -c credential.helper= -c core.askPass="${ASKPASS_SCRIPT}" push origin main >> "${LOG_DIR}/strategy_os_publish.log" 2>&1
else
  git push origin main >> "${LOG_DIR}/strategy_os_publish.log" 2>&1
fi

echo "[PUBLISH] Strategy OS site published"
