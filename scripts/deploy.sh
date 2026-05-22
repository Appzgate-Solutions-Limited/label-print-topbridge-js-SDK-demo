#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Pages deploy script (Direct Upload)
# Usage:
#   bash scripts/deploy.sh          # full deploy
#   bash scripts/deploy.sh --dry-run # preflight only
#   bash scripts/deploy.sh --help    # show help

PROJECT_NAME="${CF_PROJECT_NAME:-label-print-topbridge-sdk-demo}"
DIST_DIR=".vitepress/dist"
MIN_NODE_MAJOR=22

info()  { echo -e "\033[34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[32m[OK]\033[0m $*"; }
warn()  { echo -e "\033[33m[WARN]\033[0m $*"; }
error() { echo -e "\033[31m[ERROR]\033[0m $*"; exit 1; }

usage() {
  cat <<'EOF'
Cloudflare Pages deploy script (Direct Upload)

Usage:
  bash scripts/deploy.sh
  bash scripts/deploy.sh --dry-run
  bash scripts/deploy.sh --help

Options:
  --dry-run  Run preflight checks only, skip build and deploy
  --help     Show this help

Environment variables:
  CF_PROJECT_NAME  Cloudflare Pages project name, default label-print-topbridge-sdk-demo
EOF
}

project_status() {
  local target="$1"

  node -e '
const target = process.argv[1];
let input = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let parsed;

  try {
    parsed = JSON.parse(input);
  } catch (error) {
    console.error(`Failed to parse Cloudflare Pages project list: ${error.message}`);
    process.exit(2);
  }

  const projects = Array.isArray(parsed)
    ? parsed
    : parsed.result || parsed.projects || [];
  const found = Array.isArray(projects) && projects.some((project) => (
    project.name === target || project["Project Name"] === target
  ));

  console.log(found ? "found" : "missing");
});
' "$target"
}

DRY_RUN=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo -e "\033[31m[ERROR]\033[0m Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

# ── Preflight ─────────────────────────────────────────────
info "Running preflight checks..."

NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [[ "$NODE_MAJOR" -lt "$MIN_NODE_MAJOR" ]]; then
  error "Node >= $MIN_NODE_MAJOR required, got $(node -v)"
fi
ok "Node $(node -v)"

if ! command -v pnpm &>/dev/null; then
  error "pnpm not found. Run: npm install -g pnpm"
fi
ok "pnpm $(pnpm -v)"

if ! pnpm exec wrangler --version &>/dev/null; then
  error "wrangler not found. Run: pnpm install"
fi
ok "wrangler $(pnpm exec wrangler --version 2>/dev/null | head -1)"

if ! pnpm exec wrangler whoami &>/dev/null; then
  error "wrangler not authenticated. Run: pnpm exec wrangler login"
fi
ok "wrangler authenticated"

info "Checking Cloudflare Pages project: ${PROJECT_NAME}"
if ! PROJECTS_JSON=$(pnpm exec wrangler pages project list --json); then
  error "Failed to fetch Cloudflare Pages project list. Verify wrangler auth and account permissions."
fi

if ! PROJECT_STATUS=$(printf '%s' "$PROJECTS_JSON" | project_status "$PROJECT_NAME"); then
  error "Failed to parse Cloudflare Pages project list."
fi

if [[ "$PROJECT_STATUS" != "found" ]]; then
  error "Cloudflare Pages project not found: ${PROJECT_NAME}. Create it first: pnpm exec wrangler pages project create ${PROJECT_NAME} --production-branch=main"
fi
ok "Cloudflare Pages project exists: ${PROJECT_NAME}"

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [[ "$BRANCH" != "main" ]]; then
  warn "Current branch: $BRANCH (not main). Continue deploy? [y/N]"
  read -r answer
  [[ "$answer" =~ ^[yY]$ ]] || { info "Deploy cancelled"; exit 0; }
fi

if [[ "$BRANCH" == "main" ]] && [[ -f "pnpm-lock.yaml" ]] && grep -q "codeartifact" pnpm-lock.yaml; then
  error "Lockfile on main branch contains CodeArtifact URLs. Regenerate it (see docs/codeartifact-switching-guide.md)"
fi

info "All preflight checks passed"

if [[ "$DRY_RUN" == true ]]; then
  info "--dry-run mode, skipping build and deploy"
  exit 0
fi

# ── Build ─────────────────────────────────────────────────
info "Installing dependencies..."
pnpm install --frozen-lockfile

info "Building VitePress site..."
pnpm build

if [[ ! -d "$DIST_DIR" ]] || [[ -z "$(ls -A "$DIST_DIR" 2>/dev/null)" ]]; then
  error "Build output directory $DIST_DIR is missing or empty"
fi

FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')
ok "Build complete: $FILE_COUNT files in $DIST_DIR"

# ── Deploy ────────────────────────────────────────────────
info "Deploying to Cloudflare Pages (project: ${PROJECT_NAME})..."
pnpm exec wrangler pages deploy "$DIST_DIR" --project-name "$PROJECT_NAME"

ok "Deploy complete!"
