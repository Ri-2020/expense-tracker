#!/usr/bin/env bash
# Deploy script for Expense Tracker
#   Frontend  → Firebase Hosting preview channel (not live/default)
#   Backend   → Firebase Cloud Functions (gen2, us-central1)
#   Project   → notesa
#   Account   → rohitgupta111abcd@gmail.com
#
# Usage:
#   ./deploy.sh              # full deploy with tests
#   ./deploy.sh --skip-tests # skip Firestore emulator tests (requires Java)

set -euo pipefail

SKIP_TESTS=false
for arg in "$@"; do
  [[ "$arg" == "--skip-tests" ]] && SKIP_TESTS=true
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Load .env ──────────────────────────────────────────────────────────────────
if [[ -f .env ]]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
else
  echo "Missing .env — copy .env.example and fill in your values." >&2
  exit 1
fi

PROJECT_ID="${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID not set in .env}"
ACCOUNT="${FIREBASE_ACCOUNT:?FIREBASE_ACCOUNT not set in .env}"
HOSTING_CHANNEL="${HOSTING_CHANNEL:-release}"

# ── Colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
step()  { echo -e "\n${CYAN}=== $* ===${NC}"; }
ok()    { echo -e "${GREEN}✓ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $*${NC}"; }
die()   { echo -e "${RED}✗ $*${NC}" >&2; exit 1; }

# ── Preflight: check required CLIs ────────────────────────────────────────────
step "Preflight checks"
command -v node     >/dev/null 2>&1 || die "node not found"
command -v npm      >/dev/null 2>&1 || die "npm not found"
command -v firebase >/dev/null 2>&1 || die "firebase CLI not found — run: npm i -g firebase-tools"

if [[ "$SKIP_TESTS" == false ]]; then
  if ! java -version >/dev/null 2>&1; then
    warn "Java not found — the Firestore emulator requires Java."
    echo    "  Install via Homebrew:  brew install --cask temurin"
    echo    "  Or download from:      https://adoptium.net"
    echo    ""
    echo    "  To deploy without running tests, use:  ./deploy.sh --skip-tests"
    exit 1
  fi
  ok "Java $(java -version 2>&1 | head -1 | awk -F '"' '{print $2}') found"
fi

ok "All required CLIs present"

# ── Firebase auth & project ────────────────────────────────────────────────────
step "Firebase authentication"
CURRENT_USER=$(firebase login:list 2>/dev/null | grep -o '[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]*' | head -1 || true)
if [[ "$CURRENT_USER" != "$ACCOUNT" ]]; then
  warn "Not logged in as $ACCOUNT (current: ${CURRENT_USER:-none})"
  echo "Opening browser for Firebase login..."
  firebase login --no-localhost
fi
ok "Firebase account: $(firebase login:list 2>/dev/null | grep -o '[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]*' | head -1)"

firebase use "$PROJECT_ID" || die "Could not switch to project $PROJECT_ID — does it exist?"
ok "Active project: $PROJECT_ID"

# ── Install backend deps (all — needed for tests) ─────────────────────────────
step "Installing backend dependencies (all)"
(cd backend && npm ci)

# ── Run tests via Firestore emulator ──────────────────────────────────────────
if [[ "$SKIP_TESTS" == true ]]; then
  warn "Tests skipped (--skip-tests flag set)"
else
  step "Running tests (Firestore emulator)"
  firebase emulators:exec \
    --only firestore \
    --project "$PROJECT_ID" \
    "npm --prefix backend test"
  ok "All tests passed"
fi

# ── Reinstall backend deps (prod-only for deploy) ─────────────────────────────
step "Reinstalling backend dependencies (production only)"
(cd backend && npm ci --omit=dev)
ok "Backend production dependencies ready"

# ── Build frontend ─────────────────────────────────────────────────────────────
step "Building frontend"
(cd frontend && npm ci && npm run build)
ok "Frontend built → frontend/dist/"

# ── Deploy Cloud Functions ─────────────────────────────────────────────────────
step "Deploying Cloud Functions"
firebase deploy --only functions --project "$PROJECT_ID" --force
ok "Cloud Function 'api' deployed (us-central1)"

# ── Deploy Frontend to Hosting preview channel ─────────────────────────────────
step "Deploying to Firebase Hosting channel: $HOSTING_CHANNEL"
firebase hosting:channel:deploy "$HOSTING_CHANNEL" \
  --project "$PROJECT_ID" \
  --expires 30d

echo ""
ok "Deploy complete!"
echo -e "${CYAN}Channel URL printed above. The live/default channel was NOT touched.${NC}"
echo -e "${CYAN}To promote to live: firebase hosting:clone $PROJECT_ID:$HOSTING_CHANNEL $PROJECT_ID:live${NC}"
