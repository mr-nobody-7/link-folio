#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

pass() {
  echo "[PASS] $1"
}

fail() {
  echo "[FAIL] $1"
  exit 1
}

[[ "$(head -n 1 frontend/app/[username]/page.tsx)" != "'use client'" ]] && pass "Public profile page is a server component" || fail "Public profile page must not use 'use client'"

grep -q "^'use client';" frontend/app/[username]/ProfileClient.tsx && pass "ProfileClient is a client component" || fail "ProfileClient is missing 'use client'"

grep -q "export async function generateMetadata" frontend/app/[username]/page.tsx && pass "generateMetadata is exported" || fail "generateMetadata export missing"

grep -q "metadataBase" frontend/app/layout.tsx && pass "metadataBase is configured in app layout" || fail "metadataBase missing in app layout"

grep -q "^NEXT_PUBLIC_APP_URL=" frontend/.env.local && pass "NEXT_PUBLIC_APP_URL exists in frontend/.env.local" || fail "NEXT_PUBLIC_APP_URL missing in frontend/.env.local"

[[ -f frontend/lib/themes.ts ]] && pass "themes.ts exists" || fail "themes.ts missing"

THEME_COUNT="$(grep -c "^    id: '" frontend/lib/themes.ts)"
[[ "$THEME_COUNT" -eq 6 ]] && pass "Exactly 6 themes are defined" || fail "Expected 6 themes, found $THEME_COUNT"

grep -q "THEMES.map" frontend/components/dashboard/ThemePicker.tsx && pass "ThemePicker renders themes from THEMES" || fail "ThemePicker is not rendering THEMES map"

grep -q "\.\.\.themeStyle" frontend/app/[username]/ProfileClient.tsx && grep -q "var(--lf-bg)" frontend/app/[username]/ProfileClient.tsx && pass "ProfileClient applies theme CSS variables" || fail "ProfileClient theme vars not applied on root"

[[ -f frontend/components/dashboard/QRCodeCard.tsx ]] && pass "QRCodeCard exists" || fail "QRCodeCard missing"

grep -q '"qrcode"' frontend/package.json && pass "qrcode dependency exists" || fail "qrcode dependency missing"

grep -q "downloadCanvas.width = 400" frontend/components/dashboard/QRCodeCard.tsx && grep -q "downloadCanvas.height = 460" frontend/components/dashboard/QRCodeCard.tsx && grep -q "Made with LinkFolio" frontend/components/dashboard/QRCodeCard.tsx && pass "QR download canvas uses 400x460 with branding" || fail "QR download format requirements not met"

grep -q "width={200}" frontend/components/dashboard/QRCodeCard.tsx && grep -q "height={200}" frontend/components/dashboard/QRCodeCard.tsx && pass "QR display canvas is 200x200" || fail "QR display canvas is not 200x200"

echo "All structural checks passed."
