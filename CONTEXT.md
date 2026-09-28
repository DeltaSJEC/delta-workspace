# CONTEXT.md — Delta SJEC Virtual Workspace

> **Purpose:** This file is the single source of truth for the broader project context — architecture decisions, data model, security model, component map, and feature specifications. It is intended for developers, AI coding assistants, and new contributors picking up the project. Keep this file updated whenever a significant change is made.

---

## Project Identity

| Field | Value |
|---|---|
| Project name | Delta SJEC Virtual Workspace |
| Type | Private internal web portal (not public-facing) |
| Organisation | Delta Club, St. Joseph Engineering College (SJEC) |
| Repository | https://github.com/sanmithsj1103/delta-workspace.git |
| Frontend URL | Deployed on Vercel |
| Backend URL | Supabase project ref: `aeqjvcizplxxzhhxuzcl` |
| Version | 1.0 |

---

## Problem This Solves

Delta SJEC had no single system for distributing project work or announcements. Content was scattered across WhatsApp groups, email, verbal updates, and shared drive links. Department heads had no reliable way to reach only their members, and there was no way to track submitted work or measure member engagement.

The workspace centralises all of this: Heads post projects and announcements targeted to specific departments or the whole club; Members receive only what's relevant to them, submit their work, and can see their own contribution history.

---

## Architecture Decision: No Separate Backend Server

**Decision:** Supabase JS client is called directly from the React frontend. There is no Express/Node API server.

**Rationale:**
- Reduces operational complexity for a small student team
- Authorization is handled by Postgres Row Level Security (RLS), not middleware
- Supabase provides Auth, Postgres, Storage, and Realtime in one platform
- Free-tier hosting on both Vercel and Supabase covers the club's scale (≤50 members)

**Implication:** RLS is non-negotiable. Without it, any user could query any row directly via the Supabase REST API using the public anon key. RLS policies are the security boundary — they must be applied to every table and must be tested under each role before deployment.

---

## Technology Stack (detailed)

### Frontend

| Package | Version | Purpose |
|---|---|---|
| react | 18.3.x | Component-based SPA |
| vite | 5.4.x | Dev server, HMR, production bundler |
| tailwindcss (via @tailwindcss/vite) | v4.0 | Utility-first CSS |
| react-router-dom | 6.26.x | Client-side routing with route protection |
| @tanstack/react-query | 5.56.x | Server state and caching |
| @supabase/supabase-js | 2.45.x | Supabase client (auth, db, storage, realtime) |
| lucide-react | 0.441.x | Icon set |
| react-hot-toast | 2.4.x | Toast notifications |
| date-fns | 3.6.x | Date formatting, duration, relative time |
| dotenv | 16.x | `.env` loading for Node scripts (seed/migrate) |

### Fonts & Icons (CDN, loaded in `index.html`)
- **IBM Plex Sans** — primary typeface (Google Fonts)
- **Google Material Symbols Outlined** — extended icon set (used alongside lucide-react)

### Backend (all Supabase)

| Service | What we use it for |
|---|---|
| Supabase Auth | Email/password authentication; JWT issuance; session management |
| Supabase Postgres | Primary relational database; RLS policies; trigger for user creation |
| Supabase Storage | File uploads — `project-files` and `member-submissions` buckets |
| Supabase Realtime | WebSocket push for new projects, announcements, comments |
| Supabase Admin API | Used by `scripts/seed-users.js` (server-side only, never in browser) |

---

## Environment Variables

| Variable | Where used | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser (Supabase JS client) | Set in Vercel project settings |
| `VITE_SUPABASE_ANON_KEY` | Browser (Supabase JS client) | Public key — safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Node scripts only (seed) | **Never deploy to frontend** |

`.env` is in `.gitignore`. Only `.env.example` (no values) is committed.

---

## Source File Map

```
src/
├── App.jsx                          Route definitions + AuthProvider wrapper
├── main.jsx                         React DOM entry point
├── index.css                        Global CSS (Carbon-inspired dark theme, glass cards,
│                                    upload zones, nav items, badge styles, animations)
│
├── lib/
│   └── supabaseClient.js            Single Supabase client instance
│
├── context/
│   └── AuthContext.jsx              Manages: session, user, profile (public.users row),
│                                    login (logLogin), logout (logLogout), changePassword.
│                                    Exposes: isHead, isMember, session, user, profile.
│                                    On login → inserts login_sessions row.
│                                    On logout → updates row with logout_time + duration_seconds.
│
├── routes/
│   ├── ProtectedRoute.jsx           Redirects unauthenticated users to /login
│   └── HeadOnlyRoute.jsx            Redirects non-heads to /dashboard
│
├── constants/
│   └── departments.js               DEPARTMENTS = ['Mechanical','Electronics','Computing','Media']
│                                    DEPARTMENT_COLORS = colour tokens per dept
│                                    ALL_DEPARTMENTS_VALUE = 'all'
│
├── utils/
│   ├── dateFormat.js                formatDate, formatDateTime, formatDuration, timeAgo
│   ├── fileHelpers.js               formatFileSize, getFileIcon (returns Material Symbol name)
│   └── roleHelpers.js               Role utility functions
│
├── hooks/                           One hook per feature domain
│   ├── useAnnouncements.js          Fetches + Realtime subscription for announcements
│   ├── useComments.js               Fetches + Realtime subscription for comments on a project
│   ├── useLoginSessions.js          Fetches all login_sessions (head only)
│   ├── useMemberSubmissions.js      Fetch, upload, delete, signed URL for member submissions
│   ├── usePerformance.js            Computes session stats: total time, avg, streaks, dailyMap
│   ├── useProjects.js               Fetches project list + single project
│   ├── useReactions.js              Toggle like reaction
│   └── useUserProjects.js           Fetches member_submissions for a user (for profile page)
│
├── pages/
│   ├── LoginPage.jsx                Animated starfield + login form
│   ├── MemberDashboard.jsx          Project feed filtered to member's dept
│   ├── HeadDashboard.jsx            Project feed (all depts) + quick stats
│   ├── ProjectDetailPage.jsx        Full project view + reactions + comments +
│   │                                MemberSubmissionUpload (members) or
│   │                                MemberSubmissionsPanel (heads)
│   ├── AnnouncementsPage.jsx        Pinned-first announcement feed
│   ├── CreateProjectPage.jsx        Head: title, description, dept selector, file upload
│   ├── CreateAnnouncementPage.jsx   Head: title, body, dept selector, pin toggle
│   ├── LoginActivityPage.jsx        Head: filterable session log table
│   └── ProfilePage.jsx              Profile card, performance stats, heatmap, submissions history
│
└── components/
    ├── layout/
    │   ├── AppShell.jsx             Wraps Sidebar + TopBar + page content area
    │   ├── Sidebar.jsx              Desktop left nav (logo, user info, nav links, logout)
    │   └── TopBar.jsx               Mobile top bar + slide-out nav menu
    │
    ├── announcements/
    │   └── AnnouncementCard.jsx     Single announcement card with pin indicator
    │
    ├── comments/
    │   └── CommentList.jsx          Comment thread with real-time updates + add comment
    │
    ├── projects/
    │   ├── ProjectCard.jsx          Summary card in feed view
    │   ├── ProjectFeed.jsx          Lists ProjectCards with loading/empty states
    │   ├── DepartmentSelector.jsx   Checkbox group for targeting departments
    │   ├── FileUploadZone.jsx       Drag-and-drop file picker (used by CreateProjectPage)
    │   ├── ProjectFileList.jsx      Lists head-uploaded files with download + delete
    │   ├── MemberSubmissionUpload.jsx  Upload panel for members on ProjectDetailPage
    │   └── MemberSubmissionsPanel.jsx  Head-only panel: all submissions grouped by member
    │
    ├── reactions/
    │   └── ReactionButton.jsx       Toggle 👍 reaction
    │
    └── ui/
        ├── Badge.jsx                Role/dept coloured badge chip
        ├── EmptyState.jsx           Empty state placeholder
        ├── Modal.jsx                Generic modal wrapper
        ├── Spinner.jsx              Loading spinner (sm / md / lg)
        └── YearlyHeatmap.jsx        GitHub-style 52-week contribution grid.
                                     Props: dailyMap (login sessions), yearTotal,
                                     submissionMap (submission dates → blue cells).
                                     Legend shows both green (logins) and blue (submissions).
```

---

## Database Schema (complete)

### Enum
```sql
CREATE TYPE user_role AS ENUM ('member', 'head');
```

### Tables

```
public.users
  id              UUID PK  → auth.users(id)
  name            TEXT
  email           TEXT UNIQUE
  role            user_role  ('member' | 'head')
  department      TEXT       ('Mechanical' | 'Electronics' | 'Computing' | 'Media')
  is_club_wide    BOOLEAN    default false
  created_at      TIMESTAMPTZ

public.login_sessions
  id              UUID PK
  user_id         UUID FK → users(id)
  login_time      TIMESTAMPTZ
  logout_time     TIMESTAMPTZ nullable
  duration_seconds INTEGER nullable
  created_at      TIMESTAMPTZ

public.projects
  id                  UUID PK
  title               TEXT
  description         TEXT
  posted_by           UUID FK → users(id)
  target_departments  TEXT[]   (e.g. ['Mechanical'] or ['all'])
  created_at          TIMESTAMPTZ

public.project_files
  id            UUID PK
  project_id    UUID FK → projects(id)
  storage_path  TEXT   (path in 'project-files' bucket)
  filename      TEXT
  file_type     TEXT   (MIME type)
  size_bytes    BIGINT
  created_at    TIMESTAMPTZ

public.member_submissions
  id            UUID PK
  project_id    UUID FK → projects(id)
  submitted_by  UUID FK → users(id)
  storage_path  TEXT   (path in 'member-submissions' bucket)
  filename      TEXT
  file_type     TEXT   (MIME type)
  size_bytes    BIGINT
  note          TEXT   (optional, max 200 chars)
  submitted_at  TIMESTAMPTZ

public.comments
  id          UUID PK
  project_id  UUID FK → projects(id)
  user_id     UUID FK → users(id)
  text        TEXT
  created_at  TIMESTAMPTZ

public.reactions
  id          UUID PK
  project_id  UUID FK → projects(id)
  user_id     UUID FK → users(id)
  type        TEXT default 'like'
  created_at  TIMESTAMPTZ
  UNIQUE (project_id, user_id, type)

public.announcements
  id                  UUID PK
  title               TEXT
  body                TEXT
  posted_by           UUID FK → users(id)
  pinned              BOOLEAN default false
  target_departments  TEXT[]
  created_at          TIMESTAMPTZ
```

### Helper Functions (SECURITY DEFINER)
```sql
public.current_user_department() → TEXT   -- returns dept of auth.uid()
public.current_user_role()       → user_role  -- returns role of auth.uid()
```

### Trigger
```sql
-- After INSERT on auth.users → copies metadata into public.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## RLS Policy Summary

### `projects`
| Operation | Allowed when |
|---|---|
| SELECT | `role = 'head'` OR `'all' = ANY(target_departments)` OR `department = ANY(target_departments)` |
| INSERT | `role = 'head'` |
| UPDATE | `role = 'head'` AND `posted_by = auth.uid()` |
| DELETE | `role = 'head'` AND `posted_by = auth.uid()` |

### `project_files`
| Operation | Allowed when |
|---|---|
| SELECT | Parent project is visible to the user |
| INSERT | `role = 'head'` |
| DELETE | `role = 'head'` AND project belongs to `auth.uid()` |

### `member_submissions`
| Operation | Allowed when |
|---|---|
| SELECT | `role = 'head'` OR `submitted_by = auth.uid()` |
| INSERT | `submitted_by = auth.uid()` |
| DELETE | `submitted_by = auth.uid()` OR (`role = 'head'` AND project posted by `auth.uid()`) |

### `comments`
| Operation | Allowed when |
|---|---|
| SELECT | Parent project is visible |
| INSERT | `user_id = auth.uid()` |
| UPDATE / DELETE | `user_id = auth.uid()` |

### `reactions`
| Operation | Allowed when |
|---|---|
| SELECT | Parent project is visible |
| INSERT | `user_id = auth.uid()` |
| DELETE | `user_id = auth.uid()` |

### `announcements`
| Operation | Allowed when |
|---|---|
| SELECT | Same logic as `projects` |
| INSERT / UPDATE / DELETE | `role = 'head'` |

### `login_sessions`
| Operation | Allowed when |
|---|---|
| SELECT | `role = 'head'` OR `user_id = auth.uid()` |
| INSERT | `user_id = auth.uid()` |
| UPDATE | `user_id = auth.uid()` (for logout update) |

---

## Storage Buckets

| Bucket ID | Visibility | Who can upload | Max size | Purpose |
|---|---|---|---|---|
| `project-files` | Private | Heads only (`role = 'head'`) | 50 MB | Head-attached project files |
| `member-submissions` | Private | Any authenticated user | 50 MB | Member work submissions |

Both buckets allow: PDF, DOCX, XLSX, PPTX, ZIP, JPEG, PNG, GIF, WEBP, CSV, TXT, MP4, WEBM, MP3, WAV.

Downloads in both buckets use **signed URLs** (short expiry) — never public URLs.

---

## Routing Map

| Path | Component | Auth Guard |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/dashboard` | `DashboardRedirect` (role-based) | `ProtectedRoute` |
| `/member-dashboard` | `MemberDashboard` | `ProtectedRoute` |
| `/head-dashboard` | `HeadDashboard` | `ProtectedRoute` + `HeadOnlyRoute` |
| `/project/:id` | `ProjectDetailPage` | `ProtectedRoute` |
| `/announcements` | `AnnouncementsPage` | `ProtectedRoute` |
| `/create-project` | `CreateProjectPage` | `ProtectedRoute` + `HeadOnlyRoute` |
| `/create-announcement` | `CreateAnnouncementPage` | `ProtectedRoute` + `HeadOnlyRoute` |
| `/login-activity` | `LoginActivityPage` | `ProtectedRoute` + `HeadOnlyRoute` |
| `/profile` | `ProfilePage` | `ProtectedRoute` |
| `*` | Redirect to `/dashboard` | — |

---

## Auth Flow (detailed)

```
1. App mounts → AuthContext calls supabase.auth.getSession()
2. If session exists → fetchProfile(user.id) → setProfile()
3. supabase.auth.onAuthStateChange() listener handles:
   - SIGNED_IN  → setSession, setUser, fetchProfile
   - SIGNED_OUT → clear all state
4. login(email, password):
   - supabase.auth.signInWithPassword(...)
   - On success → logLogin(user.id) → INSERT into login_sessions
5. logout():
   - logLogout() → UPDATE login_sessions SET logout_time, duration_seconds
   - supabase.auth.signOut()
6. changePassword(newPassword):
   - supabase.auth.updateUser({ password: newPassword })
7. isHead = profile?.role === 'head'  (derived, not a separate state)
```

---

## Member Submissions Flow (detailed)

```
Member opens ProjectDetailPage
  → useMemberSubmissions(projectId).fetchSubmissions() called on mount
  → RLS filters: member sees only their own rows

Member picks a file + optional note → clicks "Submit Work"
  → MemberSubmissionUpload calls onUploaded({ file, note, userId })
  → useMemberSubmissions.uploadSubmission():
       1. supabase.storage.from('member-submissions').upload(path, file)
       2. supabase.from('member_submissions').insert({ project_id, submitted_by, ... })
       3. On error in step 2 → storage.remove(path) (rollback)
       4. fetchSubmissions() to refresh list
  → toast.success / toast.error

Head opens ProjectDetailPage
  → Same hook, but RLS returns ALL submissions for that project
  → MemberSubmissionsPanel renders groups by member name
  → Download: getDownloadUrl(storagePath) → createSignedUrl(120s) → window.open
  → Delete: deleteSubmission(s) → storage.remove + DB delete
```

---

## Profile Page Data Sources

| Section | Data source |
|---|---|
| Profile card | `profile` from `AuthContext` (fetched from `public.users`) |
| Workspace time / Sessions / Avg / Streaks | `usePerformance(user.id)` → queries `login_sessions` |
| Yearly heatmap (green) | `stats.dailyMap` from `usePerformance` |
| Yearly heatmap (blue — submissions) | Derived from `projects` (submission dates) in `ProfilePage` |
| Submissions count stat | `projects.length` from `useUserProjects(user.id)` |
| Previous Work Submitted cards | `useUserProjects(user.id)` → queries `member_submissions` joined to `projects` |
| Change password | `changePassword()` from `AuthContext` |

---

## Performance Calculations (`usePerformance.js`)

| Stat | How calculated |
|---|---|
| Total workspace time | Sum of `duration_seconds` for all completed sessions |
| Total sessions | Count of all `login_sessions` rows for the user |
| Avg session duration | `totalSeconds / completedSessions.length` |
| Last seen | Most recent `login_time` |
| Daily map | `{ 'YYYY-MM-DD': sessionCount }` for all sessions |
| Current streak | Walk backward from today (or yesterday if no session today), count consecutive days with any entry in dailyMap |
| Longest streak | Scan sorted active dates, track longest consecutive run |
| Year sessions | Count entries in dailyMap within the past 365 days |

---

## YearlyHeatmap Component

**Props:**
```typescript
dailyMap: Record<string, number>       // 'YYYY-MM-DD' → login session count
yearTotal: number                       // total sessions in past year (for summary line)
submissionMap: Record<string, number>  // 'YYYY-MM-DD' → submission count (optional)
```

**Colour logic:**
- Submission day → `#0f62fe` (blue, takes priority)
- Login day (no submission) → green shades `#0e4429` / `#006d32` / `#26a641` / `#39d353` based on count vs. max
- Empty day → `#161b22`

**Legend:** Less → More (green scale) | Submission (blue)

---

## Design System (index.css highlights)

- **Background:** `#0a0c0c` (near-black)
- **Glass cards:** `background: rgba(10,18,40,0.7); backdrop-filter: blur(18px); border: 1px solid rgba(174,198,255,0.1)`
- **Primary accent:** `#0f62fe` (IBM Blue)
- **Text primary:** `#e2e2e2`
- **Text secondary:** `#8c909f`
- **Text muted:** `#525252`
- **Danger:** `#fa4d56`
- **Success:** `#64dcb4` (teal)
- **Font:** IBM Plex Sans (Google Fonts)
- **Nav items:** custom `.nav-item` class with active state highlight
- **Buttons:** `.btn-primary` (blue fill), `.btn-secondary` (ghost with border), `.btn-ghost`
- **Inputs:** `.carbon-input` (IBM Carbon Design-inspired)

---

## Migration Files

| File | Contents |
|---|---|
| `001_initial_schema.sql` | All tables, enum, indexes, `handle_new_user` trigger |
| `002_rls_policies.sql` | RLS enable + all policies + helper functions |
| `003_storage.sql` | `project-files` bucket + storage RLS policies |
| `004_member_submissions.sql` | `member_submissions` table + RLS + `member-submissions` bucket |
| `005_security_hardening.sql` | Privilege, storage, validation, and session-integrity hardening |

> Run migrations in **Supabase SQL Editor** in order. All are idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).

---

## Scripts

| Script | Command | Notes |
|---|---|---|
| `scripts/seed-users.js` | `npm run seed` | Creates `test_head` and `test_member` via Supabase Admin API. Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`. |

---

## Departments Reference

```javascript
DEPARTMENTS = ['Mechanical', 'Electronics', 'Computing', 'Media']

// Colour tokens per department (used for badge chips)
DEPARTMENT_COLORS = {
  Mechanical: { bg: 'rgba(174,198,255,0.12)', border: 'rgba(174,198,255,0.3)', text: '#aec6ff' },  // blue
  Electronics: { bg: 'rgba(100,220,180,0.12)', border: 'rgba(100,220,180,0.3)', text: '#64dcb4' }, // teal
  Computing:   { bg: 'rgba(180,130,255,0.12)', border: 'rgba(180,130,255,0.3)', text: '#b482ff' }, // purple
  Media:       { bg: 'rgba(255,180,100,0.12)', border: 'rgba(255,180,100,0.3)', text: '#ffb464' }, // orange
}

ALL_DEPARTMENTS_VALUE = 'all'
```

---

## Known Issues & Limitations

| Issue | Detail |
|---|---|
| Supabase free-tier auto-pause | Project pauses after ~7 days inactivity; must be manually resumed from dashboard |
| No automated backups | Free tier; manual Supabase dashboard export required |
| Storage quota | 1 GB total on free tier |
| No email/push notifications | Real-time only applies when user is active in the app |
| No soft-delete | Files and records permanently deleted immediately |

---

## Future Work (not yet implemented)

- Self-service password reset
- Email/push notifications for new announcements and projects
- In-app admin UI for managing member accounts
- Task/deadline assignment per member per project
- Engagement analytics dashboard (trends over time)
- Upgrade to paid Supabase tier (removes auto-pause; adds automated backups)
- Formal accessibility audit

---

## Test Accounts

| Email | Password | Role | Department |
|---|---|---|---|
| `test_head@delta.sjec.ac.in` | `Delta@2026` | Head | Computing (club-wide) |
| `test_member@delta.sjec.ac.in` | `Delta@2026` | Member | Mechanical |

---

## Project Team

| Role | Name | ID |
|---|---|---|
| Project Lead | Sanmith S Joseph | DEL-C-2605 |
| Technical Contributor | Anish Dsouza | DEL-C-2601 |
| Reviewer | Norman Daran Dsouza | DEL-SE-2610 |
| Faculty Advisor | Dr. Ramananda H S | — |
