#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:5000}"
APP_URL="${APP_URL:-http://127.0.0.1:3000}"

pass() {
  echo "[PASS] $1"
}

fail() {
  echo "[FAIL] $1"
  exit 1
}

if ! curl -sf "$API_URL/health" >/dev/null; then
  fail "Backend is not reachable at $API_URL"
fi
pass "Backend is reachable"

if ! curl -sf "$APP_URL" >/dev/null; then
  fail "Frontend is not reachable at $APP_URL"
fi
pass "Frontend is reachable"

TS="$(date +%s)"
USERNAME="tier3runtime${TS}"
EMAIL="${USERNAME}@example.com"

SIGNUP_RESPONSE="$(curl -s -X POST "$API_URL/auth/signup" -H 'Content-Type: application/json' -d "{\"displayName\":\"Tier 3 Runtime\",\"email\":\"${EMAIL}\",\"username\":\"${USERNAME}\",\"password\":\"password123\"}")"
TOKEN="$(printf '%s' "$SIGNUP_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"

if [[ -z "$TOKEN" ]]; then
  echo "$SIGNUP_RESPONSE"
  fail "Signup failed, could not extract token"
fi
pass "Created runtime test user: $USERNAME"

PROFILE_HTML="$(curl -s "$APP_URL/$USERNAME")"
if printf '%s' "$PROFILE_HTML" | grep -q 'og:title'; then
  pass "og:title appears in public profile HTML"
else
  fail "og:title missing from public profile HTML"
fi

curl -s -X PUT "$API_URL/profile" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d '{"theme":"dark"}' >/dev/null
UPDATED_PROFILE="$(curl -s "$APP_URL/$USERNAME")"

printf '%s' "$UPDATED_PROFILE" | grep -q -- '--lf-bg:#0f0f0f' && pass "Midnight background token appears in public profile" || fail "Midnight background token missing"
printf '%s' "$UPDATED_PROFILE" | grep -q -- '--lf-text-primary:#f9fafb' && pass "Midnight text token appears in public profile" || fail "Midnight text token missing"

echo "All runtime checks passed."
