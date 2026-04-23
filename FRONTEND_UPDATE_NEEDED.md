# Frontend Update Plan - Match Backend Modular Refactor
**Purpose:** Update frontend to work with the refactored backend API structure

**Generated:** 2026-04-23

---

## Context

The backend has been refactored into a modular structure with new API endpoints and response formats using **Laravel API Resources**. The frontend needs updates to match these changes.

### Backend Changes:
- **New modular routes:** `/api/v1/expert/*`, `/api/v1/domain-head/*`, `/api/v1/main-board/*`, `/api/v1/admin/*`
- **API Resources:** Response formats changed (embedded objects, `kurdish_name` instead of `name_i18n`, `access_token` instead of `token`)
- **API Key authentication:** Public endpoints now require API keys

### Critical Issues Found:
1. **Type mismatches:** Frontend expects `name_i18n` but backend returns `kurdish_name`
2. **Endpoint paths changed:** e.g., `/api/v1/voting/*` → `/api/v1/expert/voting/*`
3. **Embedded objects:** Backend returns full objects (e.g., `english_term`) but frontend expects IDs
4. **Missing API key support:** Public endpoints need `X-API-Key` header
5. **Login response:** Backend returns `access_token` but frontend expects `token`

---

## Plan: Update Frontend API Files

### Phase 1: Update Type Definitions (types.ts)

**Changes needed:**

```typescript
// BEFORE:
export interface Domain {
  name_i18n?: { ku?: string };
  description_i18n?: { ku?: string };
}

export interface DomainSummary {
  name_i18n?: { ku?: string };
}

export interface Concept {
  english_term_id: number;
  english_term?: LexiconWord;  // Optional
  stage_entered_at: string;
}

export interface Candidate {
  kurdish_term_id: number;
  kurdish_term?: LexiconWord;  // Optional
  author_id: number;
}

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  ...
}

// AFTER:
export interface Domain {
  kurdish_name?: string;  // Changed from name_i18n
  description: string | null;
  // No description_i18n
}

export interface DomainSummary {
  kurdish_name?: string;  // Changed from name_i18n
}

export interface Concept {
  english_term: LexiconWord;  // Now ALWAYS embedded
  motioned_at: string;  // Changed from stage_entered_at
  voting_closed_at?: string;
  board_reviewed_at?: string;
  published_at?: string;
  recalled_at?: string;
  is_close_call?: boolean;
  candidates_count?: number;
  discussions_count?: number;
}

export interface Candidate {
  kurdish_term: LexiconWord;  // Now ALWAYS embedded
  created_by: number;  // Changed from author_id
  // Flattened metrics (embedded in response):
  consensus_score?: number;
  mean_score?: number;
  std_deviation?: number;
  vote_count?: number;
}

export interface LoginResponse {
  access_token: string;  // Changed from token
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: User;
}
```

### Phase 2: Update API Client (client.ts)

**Add API key header support:**

```typescript
// Add API Key header if provided (for public API endpoints)
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (apiKey && !authStore.token) {
  (headers as Record<string, string>)["X-API-Key"] = apiKey;
}
```

**Update login response handling:**

```typescript
// Line ~80: refreshAccessToken function
authStore.setTokens(data.access_token, data.refresh_token ?? refreshToken);
// Changed from data.token to data.access_token
```

### Phase 3: Update API Endpoint Files

#### 1. **voting.ts** - Update to `/api/v1/expert/voting/*`

```typescript
// BEFORE:
api.post(`/api/v1/concepts/${id}/threshold-votes`, { vote })
api.post(`/api/v1/concepts/${id}/consensus-votes`, payload)
api.get(`/api/v1/concepts/${id}/threshold-votes`)

// AFTER:
api.post(`/api/v1/expert/voting/concepts/${id}/threshold`, { vote })
api.post(`/api/v1/expert/voting/concepts/${id}/consensus`, payload)
api.get(`/api/v1/expert/voting/concepts/${id}/threshold`)
```

#### 2. **candidates.ts** - Update to `/api/v1/expert/candidates/*`

```typescript
// BEFORE:
api.get(`/api/v1/concepts/${conceptId}/candidates`)
api.post(`/api/v1/concepts/${conceptId}/candidates`, data)
api.patch(`/api/v1/candidates/${id}`, data)
api.post(`/api/v1/candidates/${id}/withdraw`)

// AFTER:
api.get(`/api/v1/expert/candidates/concepts/${conceptId}`)
api.post(`/api/v1/expert/candidates`, { concept_id: conceptId, ...data })
api.patch(`/api/v1/expert/candidates/${id}`, data)
api.post(`/api/v1/expert/candidates/${id}/withdraw`, { reason })
```

#### 3. **board.ts** - Update to `/api/v1/main-board/*`

```typescript
// BEFORE:
api.get(`/api/v1/board/review-queue?${params}`)
api.get(`/api/v1/board/review/${conceptId}`)
api.get(`/api/v1/board/analytics`)
api.post(`/api/v1/concepts/${conceptId}/board/approve`, { note })
api.post(`/api/v1/concepts/${conceptId}/board/veto`, { reason })

// AFTER:
api.get(`/api/v1/main-board/review/queue?${params}`)
api.get(`/api/v1/main-board/review/${conceptId}`)
api.get(`/api/v1/main-board/analytics`)
api.post(`/api/v1/main-board/review/${conceptId}/approve`, { note, candidate_id })
api.post(`/api/v1/main-board/review/${conceptId}/veto`, { reason, candidate_id })
```

#### 4. **terms.ts** - Add API key support

```typescript
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export function searchTerms(params: {...}) {
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return api.get<PaginatedResponse<PublicTerm>>(
    `/api/v1/terms?${searchParams}`,
    { headers }
  );
}

export function getTerm(id: string | number) {
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return api.get<PublicTerm>(`/api/v1/terms/${id}`, { headers });
}
```

#### 5. **concepts.ts** - Check and update endpoints

Some endpoints may have moved to domain-head routes:
- Motion to vote: `/api/v1/domain-head/concepts/{id}/motion-to-vote`
- Advance concept: `/api/v1/domain-head/concepts/{id}/advance`

#### 6. **api-keys.ts** - Update to match admin routes

```typescript
// BEFORE: /api/v1/api-keys
// AFTER: /api/v1/admin/api-keys
```

### Phase 4: Files NOT to Change

These endpoints remain the same:
- **auth.ts** - `/api/v1/auth/*` unchanged
- **dashboard.ts** - `/api/v1/dashboard/*` unchanged
- **notifications.ts** - unchanged
- **health.ts** - unchanged
- **domains.ts** - `/api/v1/domains/*` unchanged (public routes kept)

---

## Execution Steps

### Step 1: Update types.ts
- [ ] Update DomainSummary interface: `name_i18n` → `kurdish_name`
- [ ] Update Domain interface: `name_i18n` → `kurdish_name`, remove `description_i18n`
- [ ] Update Concept interface: `english_term_id` → `english_term` (required), `stage_entered_at` → `motioned_at`, add new date fields
- [ ] Update Candidate interface: `kurdish_term_id` → `kurdish_term` (required), `author_id` → `created_by`, add flattened metrics fields
- [ ] Update LoginResponse interface: `token` → `access_token`

### Step 2: Update client.ts
- [ ] Add API key header support in apiClient function
- [ ] Update refreshAccessToken to use `data.access_token` instead of `data.token`

### Step 3: Update voting.ts
- [ ] Change castThresholdVote endpoint to `/api/v1/expert/voting/concepts/{id}/threshold`
- [ ] Change castConsensusVotes endpoint to `/api/v1/expert/voting/concepts/{id}/consensus`
- [ ] Change getThresholdResult endpoint to `/api/v1/expert/voting/concepts/{id}/threshold`

### Step 4: Update candidates.ts
- [ ] Change getCandidates endpoint to `/api/v1/expert/candidates/concepts/{conceptId}`
- [ ] Change createCandidate endpoint to `/api/v1/expert/candidates` (pass concept_id in body)
- [ ] Change updateCandidate endpoint to `/api/v1/expert/candidates/{id}`
- [ ] Change withdrawCandidate endpoint to `/api/v1/expert/candidates/{id}/withdraw` with reason parameter

### Step 5: Update board.ts
- [ ] Change getReviewQueue endpoint to `/api/v1/main-board/review/queue`
- [ ] Change examineConcept endpoint to `/api/v1/main-board/review/{conceptId}`
- [ ] Change getBoardAnalytics endpoint to `/api/v1/main-board/analytics`
- [ ] Change approveConcept endpoint to `/api/v1/main-board/review/{id}/approve`
- [ ] Change vetoConcept endpoint to `/api/v1/main-board/review/{id}/veto`

### Step 6: Update terms.ts
- [ ] Add API key header to searchTerms function
- [ ] Add API key header to getTerm function

### Step 7: Update concepts.ts (if needed)
- [ ] Check if motionToVote needs to use `/api/v1/domain-head/concepts/{id}/motion-to-vote`
- [ ] Check if advanceConcept needs to use `/api/v1/domain-head/concepts/{id}/advance`

### Step 8: Update api-keys.ts
- [ ] Change endpoints to `/api/v1/admin/api-keys`

---

## Verification

After updates, verify:
1. **Login works** - Token stored correctly from `access_token`
2. **Dashboard loads** - User data displays
3. **Domains load** - `kurdish_name` field displays
4. **Concepts load** - `english_term` embedded object displays
5. **Candidates load** - `kurdish_term` embedded object displays, `created_by` works
6. **Voting works** - Can cast votes
7. **Board review works** - Can approve/veto
8. **Public terms work** - Can browse with API key

---

## Files to Modify

| File | Changes |
|------|----------|
| `lib/api/types.ts` | Update interfaces: Domain, DomainSummary, Concept, Candidate, LoginResponse |
| `lib/api/client.ts` | Add API key header support, fix access_token handling |
| `lib/api/voting.ts` | Update endpoints to `/api/v1/expert/voting/*` |
| `lib/api/candidates.ts` | Update endpoints to `/api/v1/expert/candidates/*` |
| `lib/api/board.ts` | Update endpoints to `/api/v1/main-board/*` |
| `lib/api/terms.ts` | Add API key support |
| `lib/api/api-keys.ts` | Update endpoints to `/api/v1/admin/api-keys` |

---

## Branch

Target branch: **staging** (NOT main)

---

## Notes

- Backend uses Laravel **API Resources** which wrap responses in `{ data: ..., meta?: {...} }`
- The frontend `apiClient` already unwraps `{ data: ... }` responses automatically
- Embedded objects (like `english_term`, `kurdish_term`) are now ALWAYS included in responses
- Metrics fields are flattened into Candidate responses for convenience
