# Remaining Backend Issues

**Date:** 2026-04-23 (Updated)
**Tested against:** https://enigmatic-mesa-96296-76bcaf48ee65.herokuapp.com/api/v1

---

No remaining backend issues. All previously reported bugs have been resolved.

## Resolved Issues ✅

| # | Issue | Resolution |
|---|-------|------------|
| Candidates dialect 422 | **Fixed** — backend expects `dialect_id` (integer), frontend was sending `dialect` (string). Fixed in frontend. |
| API Key creation 500 | **Fixed** — works when `scopes` field is omitted. |
| Analytics my-contributions 404 | **Fixed** — endpoint now returns 200. |
| domain1 credentials | **Fixed** — password is `domain1234`. |
| Concepts history 500 | **Fixed** — returns 200. |
| Concepts advance 500 | **Fixed** — returns proper validation. |
| Concepts export 500 | **Fixed** — returns JSON. |
| Dashboard/me expert 500 | **Fixed** — returns 200. |
| Profile/password endpoints | **Fixed** — exists at `/profile` and `/profile/change-password`. |
