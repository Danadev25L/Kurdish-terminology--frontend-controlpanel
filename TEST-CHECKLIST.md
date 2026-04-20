# Kurdish Terminology Portal - Test Checklist

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ktp.local | password123 |
| Expert | expert@test.com | password123 |
| Domain Head | head@test.com | password123 |
| Main Board | karim@ktp.local | password123 |

---

## 1. Authentication
- [ ] Login with admin@ktp.local
- [ ] Login with expert@test.com
- [ ] Login with head@test.com
- [ ] Logout works
- [ ] Wrong password shows error

---

## 2. Dashboard (Priority Inbox)
- [ ] Load dashboard at `/dashboard`
- [ ] Shows active tasks count
- [ ] Shows critical items count
- [ ] Shows unread notifications count
- [ ] Click item → navigates to concept detail

---

## 3. Concepts Page
- [ ] Load `/concepts`
- [ ] Shows list of concepts
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Search functionality

---

## 4. Concept Detail - Overview Tab
- [ ] Load `/concepts/1`
- [ ] Shows English term
- [ ] Shows definition
- [ ] Shows domain
- [ ] Shows priority
- [ ] Shows Reference Context sidebar

---

## 5. Concept Detail - Candidates Tab
- [ ] Shows candidates list
- [ ] Each candidate shows Kurdish word
- [ ] Each candidate shows dialect
- [ ] Withdraw button works (for own candidates)

---

## 6. Concept Detail - Discussions Tab
- [ ] Shows discussion list
- [ ] Type 5+ characters → "Post" button enables
- [ ] Post discussion → appears in list
- [ ] Reply to discussion works
- [ ] React (like) button works
- [ ] Character counter updates
- [ ] Error messages display correctly

---

## 7. Concept Detail - Voting Tab

### 7a. Threshold Stage
- [ ] Only experts see voting buttons
- [ ] Domain head sees results but no buttons
- [ ] Main Board sees "experts only" message
- [ ] Click "Yes" → vote recorded
- [ ] Shows vote counts
- [ ] Shows passed/pending status

### 7b. Consensus Stage
- [ ] Only experts see voting matrix
- [ ] Shows all candidates
- [ ] Can rate 1-10 for each candidate
- [ ] Skip button works
- [ ] Submit votes → scores recorded
- [ ] Cannot vote twice

---

## 8. Role Permissions Verification

### Expert (expert@test.com)
- [ ] Can see Dashboard
- [ ] Can see Concepts
- [ ] Can propose candidates
- [ ] Can participate in discussions
- [ ] **CAN vote in threshold stage**
- [ ] **CAN vote in consensus stage**
- [ ] CANNOT access Admin panel
- [ ] CANNOT access Board analytics

### Domain Head (head@test.com)
- [ ] Can see Dashboard
- [ ] Can see Concepts
- [ ] Can propose candidates
- [ ] **CANNOT vote** (per SRS)
- [ ] Can trigger "Motion to Vote"
- [ ] Can moderate discussions

### Main Board (karim@ktp.local)
- [ ] Can see Board Review queue
- [ ] Can see Published terms
- [ ] Can see Analytics
- [ ] Can approve/veto concepts
- [ ] **CANNOT vote** (per SRS)
- [ ] Can recall published terms

### Admin (admin@ktp.local)
- [ ] Full access to all features
- [ ] Can create domains
- [ ] Can manage users
- [ ] Can import reference data
- [ ] Override permissions

---

## 9. Admin Features

### Reference Library
- [ ] `/admin/references` loads
- [ ] Shows reference sources list
- [ ] "Add Source" button opens modal
- [ ] Create new source works (slug auto-generated)
- [ ] Import CSV button works
- [ ] Shows entry count per source

### Other Admin Pages
- [ ] `/admin/users` - user management
- [ ] `/admin/domains` - domain management

---

## 10. Board Features
- [ ] `/board/review-queue` - concepts awaiting review
- [ ] `/board/published` - published terms
- [ ] `/board/analytics` - platform metrics
- [ ] Dialect equity chart
- [ ] Word versatility metrics

---

## Notes
- Log out and log back in when switching between test accounts to get fresh tokens
- Test with concepts in different stages: draft, threshold, voting, review, published
