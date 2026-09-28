# Delta SJEC Virtual Workspace — Project Documentation

> **Version:** 1.0 · **Status:** Development · **Last Updated:** September 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What Is the Project?](#2-what-is-the-project)
3. [Why Was It Developed?](#3-why-was-it-developed)
4. [Where Is It Used?](#4-where-is-it-used)
5. [Workflow](#5-workflow)
6. [Scope](#6-scope)
7. [System Requirements](#7-system-requirements)
8. [System Architecture](#8-system-architecture)
9. [Technology Stack](#9-technology-stack)
10. [Detailed Features](#10-detailed-features)
11. [User Roles & Permissions](#11-user-roles--permissions)
12. [Database & Data Structure](#12-database--data-structure)
13. [File & Storage Management](#13-file--storage-management)
14. [Security](#14-security)
15. [Development Process](#15-development-process)
16. [Version Control](#16-version-control)
17. [Testing & Validation](#17-testing--validation)
18. [Deployment](#18-deployment)
19. [Maintenance & Handover](#19-maintenance--handover)
20. [Known Limitations](#20-known-limitations)
21. [Future Development](#21-future-development)
22. [Project Outcomes](#22-project-outcomes)
23. [Project Information](#23-project-information)
24. [Appendices](#24-appendices)

---

## 1. Project Overview

### 1.1 Project Title
**Delta SJEC Virtual Workspace**

### 1.2 Project Summary
A private, authentication-gated web portal for the Delta club at SJEC. It replaces scattered communication channels (WhatsApp groups, email threads, shared drives) with a single, role-aware platform where Heads post project assignments, Members submit their work, and all activity is tracked and measured.

### 1.3 Classification

| Field | Value |
|---|---|
| Category | Web Application (Internal Portal) |
| Domains | Web Development, Database Management, Authentication, Collaboration |
| Status | Development — v1.0 |
| Repository | https://github.com/sanmithsj1103/delta-workspace.git |
| Frontend Hosting | Vercel (free tier) |
| Backend | Supabase — Postgres + Auth + Storage + Realtime (free tier) |

---

## 2. What Is the Project?

### 2.1 Technical Description

**What it is:** A React single-page application that acts as a private collaboration portal for the Delta club at SJEC.

**What it does:**
- Heads create project posts (title, description, file attachments) scoped to specific departments or to all members
- Members view project posts relevant to their department, comment, react, and submit their work as file uploads
- Heads post club-wide or department-specific announcements with optional pinning
- Session activity (login/logout timestamps and duration) is automatically logged and visible to heads
- Each member's profile shows their contribution history — workspace time, submission count, login streaks, and a GitHub-style yearly contribution heatmap with submission markers

**Who uses it:** Two user categories — **Members** and **Heads**. All accounts are pre-seeded by an admin; there is no open sign-up.

**Major components:**

| Component | Description |
|---|---|
| Authentication | Supabase Auth with pre-created credentials; login/logout session logging |
| Project Feed | Department-filtered project posts with file attachments, reactions, comments |
| Member Submissions | Members upload work on each project; heads review all submissions grouped by member |
| Announcements | Club-wide or department-specific feed with pinning |
| Profile & Performance | Session stats, streak tracking, submissions count, YearlyHeatmap contribution chart |
| Login Activity | Head-only table of all members' session records with filtering |
| Row Level Security | All data access enforced at the Postgres level — members only see their department's data |

---

## 3. Why Was It Developed?

### 3.1 Problem Statement
Delta SJEC had no centralized system for distributing project work or announcements. Content was scattered across informal channels (WhatsApp, email, verbal updates). Department heads had no reliable way to reach only their department's members, and there was no way to measure member engagement or track submitted work over time.

### 3.2 Existing Situation
- Project updates shared via group chats or verbal communication during meetings
- Files passed via shared drive links with no consistent structure or naming
- No record of member participation or submission history
- No reliable way to target a specific department
- No way for heads to know if members had seen updates or submitted anything

### 3.3 Motivation
Delta chose to build a dedicated portal so that club activity would be **centralized, department-aware, access-controlled, and measurable**. A Backend-as-a-Service approach (Supabase) was chosen so the project could be delivered and maintained by a small student team without building or operating a separate backend server.

### 3.4 Objectives

| ID | Objective |
|---|---|
| OB-01 | Maintain a single pre-loaded record of all member details (name, department, role, credentials) |
| OB-02 | Give heads a centralized way to post project files and updates, targeted to department or club-wide |
| OB-03 | Provide a single announcements feed (club-wide or department-specific, with pinning) |
| OB-04 | Let members submit their work on each project; heads review all submissions in one place |
| OB-05 | Track member engagement automatically: session logging, workspace time, streaks, contribution heatmap |
| OB-06 | Ensure members only see information relevant to their department via database-level access rules |
| OB-07 | Deliver new content (projects, announcements, comments) to members in real time without manual refresh |

---

## 4. Where Is It Used?

### 4.1 Organizational Context
Used exclusively within Delta club at SJEC, supporting under 50 members across four departments: **Mechanical, Electronics, Computing, and Media**.

### 4.2 Digital Environment

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS v4 |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Frontend Hosting | Vercel (free tier) |
| Backend Hosting | Supabase (free tier) |
| Storage | Supabase Storage (S3-compatible) |
| Real-time | Supabase Realtime (WebSocket subscriptions) |

### 4.3 Users

**Member**
- Logs in with pre-created credentials
- Sees only project posts relevant to their department (or club-wide posts)
- Can view, download, comment on, and react to posts
- Can submit work files against any project they can see
- Profile shows their own session stats, submission history, and contribution heatmap

**Head**
- Logs in with pre-created credentials
- Can create project posts (targeting a specific department or all members) with file attachments
- Can create announcements (club-wide or department-specific) with optional pinning
- Sees all member submissions for each project, grouped by member, with download and delete actions
- Can view the login activity table: all members' session logs filterable by member and date
- Profile shows the same performance stats as members

> Heads are pre-assigned by the club — not self-registered. Some heads are club-wide (e.g., president); others are department-specific — but any head can post to any department.

---

## 5. Workflow

### 5.1 Operational Position
The Virtual Workspace is the central coordination layer between Delta's heads and members. Heads use it as the single point through which project work and announcements reach members. Members use it as the single place to check what's relevant to their department, engage with posts, and submit their work.

### 5.2 Flow Diagram (text)

```
[Admin: pre-seeds all accounts into Supabase Auth]
         ↓
[User opens app → Login page]
         ↓
[Supabase Auth validates email + password]
         ↓
[Session row created in login_sessions table]
         ↓
[AuthContext fetches role from public.users]
         ↓
    ┌────┴────┐
 [Head]    [Member]
    │           │
    │    ┌──────┘
    │    │ View department-filtered project feed
    │    │ Comment + React on posts
    │    │ Submit work files on projects
    │    │ View announcements
    │    │ View own profile + stats
    │    └──────┐
    │           │
    ├── Create project posts (targeting dept or all)
    ├── Create announcements (dept or all, pinnable)
    ├── Review all member submissions per project
    ├── View login activity table (all members)
    └── (same member actions as above)
         ↓
[Logout → session end time + duration recorded]
```

---

## 6. Scope

### 6.1 Included

- Login and role-based access (Member / Head)
- Automatic session logging: login/logout timestamps, duration calculation
- Head-only login activity table with member and date filtering
- Project posting: title, description, file attachments (≤50 MB), department/all-members targeting
- Member interactions on project posts: view, download, comment, react (👍)
- **Member work submissions**: upload files against a project, with an optional note
- **Head submission review**: see all member submissions per project, grouped by member, with download/delete
- Announcements feed: club-wide or department-specific, with optional pin
- Real-time delivery of new projects, announcements, and comments via Supabase Realtime
- Profile page: workspace time stats, login streaks, submission count, yearly contribution heatmap (login days = green, submission days = blue)
- "Previous Work Submitted" section in profile: each member's own submission history
- Database-level security via Supabase Row Level Security on every table

### 6.2 Not Included (v1.0)

- Open sign-up (all accounts are pre-seeded)
- Member-to-member direct messaging
- Role promotion workflow (e.g., member levels)
- Formal task/deadline assignment per member
- Email or push notifications
- In-app admin UI for account management
- Automated database backups (free-tier limitation)

---

## 7. System Requirements

### 7.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Authenticate users against pre-loaded credentials in Supabase Auth |
| FR-02 | Present Member view or Head view based on the authenticated user's role |
| FR-03 | Record session start/end timestamps and compute duration automatically |
| FR-04 | Allow Heads to view session logs as a filterable table (by member and date) |
| FR-05 | Allow Heads to create project posts with title, description, and file attachments |
| FR-06 | Allow a Head to scope a project post to a specific department or all members |
| FR-07 | Show each Member only project posts relevant to their department plus club-wide posts |
| FR-08 | Allow Members to view, download, comment on, and react to project posts |
| FR-09 | Allow Members to upload work files against a project (member submissions) |
| FR-10 | Allow Heads to view, download, and delete member submissions per project |
| FR-11 | Provide an announcements feed supporting club-wide and department-specific notices |
| FR-12 | Allow Heads to pin important announcements |
| FR-13 | Push new projects, announcements, and comments in real time without a manual refresh |
| FR-14 | Enforce at the database level that Members only read data relevant to their department |
| FR-15 | Enforce that only Heads can create projects and announcements |
| FR-16 | Allow any Head — club-wide or department-specific — to post to any department |
| FR-17 | Display each member's submission count and history in their profile |
| FR-18 | Display a yearly contribution heatmap marking both login days and submission days |

### 7.2 Non-Functional Requirements

| Attribute | Specification |
|---|---|
| Security | RLS on every table; members see only their department's data; no open sign-up |
| Performance | Low concurrent load (≤50 users); real-time updates via WebSocket |
| Availability | Dependent on Supabase free-tier (auto-pauses after ~7 days inactivity) |
| Scalability | Sized for ≤50 members across 4 departments — well within free-tier caps |
| Maintainability | Auth logic in RLS policies; small, single-responsibility hooks and components |
| Accessibility | Not formally reviewed against a standard in v1.0 |
| Backup/Recovery | No automated backups on free tier; manual exports required |

---

## 8. System Architecture

### 8.1 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Browser (React SPA)                 │
│  Vite + React 18 + Tailwind CSS v4              │
│  react-router-dom · @tanstack/react-query        │
│  lucide-react · react-hot-toast · date-fns       │
└─────────────┬───────────────────────────────────┘
              │  @supabase/supabase-js (JS client)
              │  JWT in request headers
              ▼
┌─────────────────────────────────────────────────┐
│                   Supabase                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Auth   │  │ Postgres │  │   Storage    │  │
│  │ (JWT)    │  │ + RLS    │  │ (S3-compat.) │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │          Realtime (WebSocket)              │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 8.2 Data Flow

1. **Login:** User submits credentials → Supabase Auth validates → JWT issued → session row inserted in `login_sessions`
2. **Profile fetch:** `AuthContext` queries `public.users` by `auth.uid()` → role resolved → correct view rendered
3. **Project feed:** Hook queries `projects` table → PostgREST enforces RLS → only department-matching rows returned
4. **File upload (head):** File sent to `project-files` Storage bucket → metadata inserted in `project_files` table
5. **Member submission:** File sent to `member-submissions` Storage bucket → metadata inserted in `member_submissions` table
6. **Realtime:** Client subscribes to Supabase Realtime channel → `postgres_changes` events pushed on INSERT to `projects`, `announcements`, `comments`
7. **Logout:** `login_sessions` row updated with `logout_time` and computed `duration_seconds`

### 8.3 External Services

| Service | Purpose |
|---|---|
| Supabase Auth | User authentication and session management |
| Supabase Postgres | Primary database with RLS |
| Supabase Storage | File storage for project attachments and member submissions |
| Supabase Realtime | WebSocket-based live updates |
| Vercel | Frontend hosting and CDN |

---

## 9. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Build tool | Vite | 5.4.x | Dev server, HMR, production bundling |
| UI framework | React | 18.3.x | Component-based SPA |
| Styling | Tailwind CSS | v4.0 | Utility-first CSS |
| Routing | react-router-dom | 6.x | Client-side routing |
| Data fetching | @tanstack/react-query | 5.x | Server state management |
| Backend | Supabase JS client | 2.45.x | Auth, database, storage, realtime |
| Icons | lucide-react | 0.441.x | Icon library |
| Icons (extended) | Google Material Symbols | CDN | Additional icon set |
| Toasts | react-hot-toast | 2.4.x | In-app notifications |
| Dates | date-fns | 3.6.x | Date formatting and calculation |
| Env vars | dotenv | 16.x | Local `.env` loading for Node scripts |
| Font | IBM Plex Sans | Google Fonts | Primary typeface |

---

## 10. Detailed Features

### 10.1 Authentication & Session Logging

**Purpose:** Authenticate users and automatically record workspace activity.

**Behaviour:**
- User enters email + password on the Login page (animated starfield background)
- Supabase Auth validates credentials via `signInWithPassword`
- On success, a row is inserted into `login_sessions` with `login_time = NOW()`
- `AuthContext` fetches the user's row from `public.users` to resolve their `role` and `department`
- Role determines routing: `head` → `/head-dashboard`, `member` → `/member-dashboard`
- On logout, `logout_time` and `duration_seconds` are written to the session row

**Session row schema:** `id, user_id, login_time, logout_time, duration_seconds, created_at`

---

### 10.2 Project Feed & Project Detail

**Purpose:** Heads publish project assignments; members browse and engage with them.

**Head actions:**
- Navigate to **New Project** → fill title, description, choose target departments (checkboxes: Mechanical / Electronics / Computing / Media / All Members), attach files (drag-and-drop, ≤50 MB each)
- Project stored in `projects` table; files stored in `project-files` Storage bucket with metadata in `project_files`

**Member view:**
- Feed shows only projects where `target_departments` includes the member's department or `'all'`
- Each card shows title, department chips, author, timestamp, like count, comment count
- Project detail page shows full description, file attachments (download via signed URL), reactions, comments, and the submission upload panel

**RLS:** `projects_select` policy enforces department filtering at the database level — PostgREST never returns rows a member shouldn't see.

---

### 10.3 Member Work Submissions

**Purpose:** Members submit their completed work files against a project; heads review all submissions.

**Member experience (Project Detail page, below Comments):**
- **Submit Your Work** panel with drag-and-drop file picker
- Optional free-text note (max 200 chars)
- On submit: file uploaded to `member-submissions` Storage bucket; metadata inserted in `member_submissions` table
- Members see only their own past submissions (enforced by RLS)

**Head experience (Project Detail page, below Comments):**
- **Member Submissions** panel lists all submissions grouped by member name
- Each entry shows: filename, file size, submission timestamp, optional note
- Download button generates a signed URL (120 s expiry)
- Delete button removes both the storage object and the metadata row

**RLS:** `member_submissions_select` — `current_user_role() = 'head' OR submitted_by = auth.uid()`

---

### 10.4 Announcements

**Purpose:** Heads broadcast notices club-wide or to a specific department.

**Head actions:**
- Navigate to **New Announcement** → fill title, body, choose target departments, toggle Pin
- Pinned announcements appear at the top of the feed

**Member view:**
- Feed filtered by the same RLS logic as projects (department or `'all'`)
- Pinned announcements displayed first with a pin indicator

---

### 10.5 Profile & Performance

**Purpose:** Each user sees their own activity stats and contribution history.

**Sections:**

| Section | Content |
|---|---|
| Profile card | Name, email, role badge, department, member since, access level |
| Performance hero | Total workspace time (HH:MM:SS formatted) |
| Stat row | Total sessions · Avg. session duration · **Submissions count** |
| Streak card | Current login streak (🔥 with days), longest all-time streak (💤 if zero) |
| Yearly heatmap | 52-week GitHub-style grid — green cells = login days, **blue cells = submission days** |
| Previous Work Submitted | Cards linking to each project the member submitted work to, showing filename, note, and submission date |
| Security | Change password form |

---

### 10.6 Login Activity (Head only)

**Purpose:** Heads review member engagement across the club.

- Table of all `login_sessions` rows joined to `public.users`
- Columns: Member name, Department, Login time, Logout time, Duration
- Filterable by member name/department and date range

---

## 11. User Roles & Permissions

### 11.1 Access Control Matrix

| Resource | Member | Head |
|---|---|---|
| Login / Logout | ✅ | ✅ |
| View project feed (own dept + all) | ✅ | ✅ (all depts) |
| Create project posts | ❌ | ✅ |
| Upload project files (head attachments) | ❌ | ✅ |
| Delete project files | ❌ | ✅ (own projects) |
| Comment on projects | ✅ | ✅ |
| React to projects | ✅ | ✅ |
| Submit work on a project | ✅ | ❌ |
| View own submissions | ✅ | — |
| View all member submissions per project | ❌ | ✅ |
| Delete member submissions | Own only | ✅ (any) |
| View announcements (own dept + all) | ✅ | ✅ (all depts) |
| Create / pin announcements | ❌ | ✅ |
| View own session stats & profile | ✅ | ✅ |
| View all members' login activity | ❌ | ✅ |
| Change own password | ✅ | ✅ |

> All permissions are enforced at the database layer via Supabase RLS — client-side role checks are cosmetic only.

---

## 12. Database & Data Structure

### 12.1 Database

- **Type:** PostgreSQL (managed by Supabase)
- **Security:** Row Level Security enabled on every table
- **Migrations:** Version-controlled SQL files in `supabase/migrations/`

### 12.2 Tables

#### `public.users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | References `auth.users(id)` |
| name | TEXT | |
| email | TEXT UNIQUE | |
| role | user_role ENUM | `'member'` or `'head'` |
| department | TEXT | Mechanical / Electronics / Computing / Media |
| is_club_wide | BOOLEAN | `true` for club-wide heads (e.g. president) |
| created_at | TIMESTAMPTZ | |

#### `public.login_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| login_time | TIMESTAMPTZ | Set on login |
| logout_time | TIMESTAMPTZ | Set on logout |
| duration_seconds | INTEGER | Computed on logout |
| created_at | TIMESTAMPTZ | |

#### `public.projects`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | TEXT | |
| description | TEXT | |
| posted_by | UUID FK → users | Must be a head (enforced by RLS) |
| target_departments | TEXT[] | e.g. `['Mechanical', 'Computing']` or `['all']` |
| created_at | TIMESTAMPTZ | |

#### `public.project_files`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK → projects | |
| storage_path | TEXT | Path in `project-files` bucket |
| filename | TEXT | |
| file_type | TEXT | MIME type |
| size_bytes | BIGINT | |
| created_at | TIMESTAMPTZ | |

#### `public.member_submissions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK → projects | |
| submitted_by | UUID FK → users | |
| storage_path | TEXT | Path in `member-submissions` bucket |
| filename | TEXT | |
| file_type | TEXT | MIME type |
| size_bytes | BIGINT | |
| note | TEXT | Optional member note |
| submitted_at | TIMESTAMPTZ | |

#### `public.comments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK → projects | |
| user_id | UUID FK → users | |
| text | TEXT | |
| created_at | TIMESTAMPTZ | |

#### `public.reactions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK → projects | |
| user_id | UUID FK → users | |
| type | TEXT | Default `'like'` |
| created_at | TIMESTAMPTZ | |
| UNIQUE (project_id, user_id, type) | | One reaction per user per type per project |

#### `public.announcements`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | TEXT | |
| body | TEXT | |
| posted_by | UUID FK → users | |
| pinned | BOOLEAN | Default `false` |
| target_departments | TEXT[] | Same logic as projects |
| created_at | TIMESTAMPTZ | |

### 12.3 Key RLS Policies

| Table | Policy | Rule |
|---|---|---|
| `projects` | SELECT | `role = 'head'` OR `'all' = ANY(target_departments)` OR `department = ANY(target_departments)` |
| `projects` | INSERT | `role = 'head'` only |
| `member_submissions` | SELECT | `role = 'head'` OR `submitted_by = auth.uid()` |
| `member_submissions` | INSERT | `submitted_by = auth.uid()` |
| `login_sessions` | SELECT | `role = 'head'` OR `user_id = auth.uid()` |
| `announcements` | SELECT | Same as projects |
| `announcements` | INSERT/UPDATE/DELETE | `role = 'head'` only |

### 12.4 Trigger
`on_auth_user_created` — fires after INSERT on `auth.users`; copies `name`, `email`, `role`, `department`, `is_club_wide` from `raw_user_meta_data` into `public.users`.

---

## 13. File & Storage Management

### 13.1 Storage Buckets

| Bucket | Visibility | Uploader | Allowed Types |
|---|---|---|---|
| `project-files` | Private + RLS | Heads only | PDF, DOCX, XLSX, PPTX, ZIP, images, CSV, MP4, audio |
| `member-submissions` | Private + RLS | Any authenticated user | Same set as above |

### 13.2 File Size Limits
- Per-file maximum: **50 MB** (Supabase free-tier global limit)
- Total storage quota: **1 GB** on the free tier

### 13.3 Naming Convention
Files are stored as:
```
{project_id}/{user_id}/{timestamp}_{original_filename}
```
This groups files by project, prevents collisions, and keeps the human-readable name visible.

### 13.4 Access
- All files are in **private** buckets with RLS
- Downloads use **signed URLs** with a short expiry (60 s for project files, 120 s for submissions)
- No public bucket URLs are exposed

### 13.5 Deletion
- Deleting a file calls `storage.remove()` on the storage object and then deletes the corresponding metadata row in one atomic operation
- No soft-delete or recycle bin in v1.0

---

## 14. Security

### 14.1 Security Architecture

| Concern | Implementation |
|---|---|
| Authentication | Supabase Auth — email/password; no open sign-up |
| Authorization | Supabase RLS on every table and storage bucket |
| Password storage | Managed by Supabase Auth (bcrypt hashing) — not stored in app tables |
| JWT handling | Supabase JS client handles token storage and refresh automatically |
| Session logging | Every login/logout timestamped; duration computed server-side |
| Input validation | Client-side form validation + Postgres column constraints |
| File upload security | MIME type and size restrictions enforced at the bucket policy level |
| Environment variables | Supabase URL and anon key in `VITE_` prefixed env vars on Vercel; service role key never exposed to client |
| Secret key | `.env` is in `.gitignore`; only `.env.example` (no values) is committed |
| Client-side trust | RLS means the database is authoritative — even if a client bypasses UI checks, the database rejects unauthorized requests |

---

## 15. Development Process

### 15.1 Phases

1. **Database schema and RLS migrations** (`supabase/migrations/`)
2. **Authentication + session logging** (`AuthContext`, login page, `login_sessions`)
3. **Project feed and project detail** (hooks, components, file upload)
4. **Announcements feed** (hooks, components)
5. **Comments and reactions** (real-time subscriptions)
6. **Member work submissions** (new table, hooks, upload panel, head review panel)
7. **Profile + performance** (session stats, streak calc, YearlyHeatmap, submission history)
8. **Head login activity dashboard**
9. **UI polish** (Carbon Design-inspired dark theme, glassmorphism, micro-animations)

### 15.2 Key Design Decisions

- **No Express/Node backend** — Supabase client used directly from the browser; authorization enforced by RLS, not a server layer
- **Pre-seeded accounts** — `scripts/seed-users.js` creates auth accounts via Supabase Admin API; a Postgres trigger copies metadata to `public.users`
- **Migrations in repo** — All schema changes are SQL files in `supabase/migrations/` so they can be replayed on any environment
- **React hooks per feature** — Each domain (projects, announcements, comments, reactions, submissions, performance) has a dedicated hook for clean separation of concerns

---

## 16. Version Control

### 16.1 Repository
`https://github.com/sanmithsj1103/delta-workspace.git`

### 16.2 Workflow
- **Branch:** `main` — connected to Vercel for auto-deploy on push
- **Commit style:** `feat:`, `fix:`, `docs:`, `chore:` prefixes (conventional commits)
- **Sensitive files excluded from git:** `.env`, `node_modules/`, `dist/`

---

## 17. Testing & Validation

### 17.1 Test Cases

| Test ID | Requirement | Test | Expected Result |
|---|---|---|---|
| TC-01 | FR-01, FR-02 | Log in as `test_member@delta.sjec.ac.in` | Member dashboard rendered; head-only routes blocked |
| TC-02 | FR-01, FR-02 | Log in as `test_head@delta.sjec.ac.in` | Head dashboard rendered; create-project and announcements accessible |
| TC-03 | FR-06, FR-07 | Post a project targeting `Computing` dept | Member in Mechanical cannot see it; member in Computing can |
| TC-04 | FR-14, FR-15 | Member attempts to POST to `projects` table directly | RLS rejects insert; 403 returned |
| TC-05 | FR-09, FR-10 | Submit a file as member → check head submission panel | Head sees submission grouped under member's name |
| TC-06 | FR-03, FR-04 | Log in and out; check login activity table as head | Session row has correct login_time, logout_time, duration_seconds |
| TC-07 | FR-13 | Head posts announcement; member of target dept opens announcements | Announcement visible; member of other dept cannot see it |
| TC-08 | FR-18 | Member submits work; opens profile | Contribution heatmap shows blue cell on submission date |
| TC-09 | FR-11 | Head posts project while member is on dashboard | Project appears in member feed without refresh |
| TC-10 | Security | Member tries to access `/head-dashboard` directly | Redirected by `HeadOnlyRoute` to member dashboard |

---

## 18. Deployment

### 18.1 Environment Variables

| Variable | Where set | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` / Vercel env | Supabase JS client (browser) |
| `VITE_SUPABASE_ANON_KEY` | `.env` / Vercel env | Supabase JS client (browser) |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | `.env` (local only) | Seed + migration scripts (Node) — never deployed |

### 18.2 Local Development

```bash
git clone https://github.com/sanmithsj1103/delta-workspace.git
cd delta-workspace
npm install
cp .env.example .env        # fill in Supabase URL + anon key
npm run dev                  # → http://localhost:5173/
```

### 18.3 Database Setup (one-time, run in Supabase SQL Editor)

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_storage.sql
supabase/migrations/004_member_submissions.sql
```

### 18.4 Seeding Test Accounts

```bash
npm run seed      # creates test_head@delta.sjec.ac.in and test_member@delta.sjec.ac.in
                  # password: Delta@2026
```

### 18.5 Production Deploy
1. Connect the GitHub repository to a Vercel project
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables
3. Vercel auto-deploys on every push to `main` using `vite build`
4. HTTPS is provisioned automatically by Vercel

---

## 19. Maintenance & Handover

### 19.1 Routine Tasks

| Task | How |
|---|---|
| Add a new member | Create auth account in Supabase dashboard (Auth → Users → Invite user) with correct metadata; trigger auto-populates `public.users` |
| Update a member's department | Edit the row directly in `public.users` via Supabase dashboard |
| Apply a schema change | Write a new migration SQL file → run in Supabase SQL Editor → commit the file to repo |
| Manual DB backup | Supabase dashboard → Settings → Database → Export |
| Resume a paused project | Supabase dashboard → project page → click Resume |

### 19.2 Troubleshooting

| Symptom | First check |
|---|---|
| App unreachable | Supabase project may have auto-paused (free tier, ~7 days inactivity) → resume from dashboard |
| Data not loading | Browser console for JS errors; Supabase dashboard → Logs → API for RLS violations |
| File upload fails | Check Storage bucket MIME type allowlist and 50 MB limit |
| Build fails | Run `npm run build` locally and check console output |

---

## 20. Known Limitations

| Limitation | Detail |
|---|---|
| Supabase auto-pause | Free-tier projects pause after ~7 days of inactivity; requires manual resume from dashboard |
| No automated backups | Daily backups are a paid Supabase feature; free tier requires manual exports |
| Storage quota | 1 GB total file storage on free tier |
| No email notifications | Members only receive updates if they are actively in the app |
| No soft-delete | Deleted files and records are immediately and permanently removed |
| No member-to-member messaging | Out of scope for v1.0 |

---

## 21. Future Development

| Item | Priority |
|---|---|
| Self-service password reset for members | High |
| Email / push notifications for new announcements | Medium |
| In-app admin UI for account management (add/remove members) | Medium |
| Deadline tracking on projects | Medium |
| Analytics: aggregated engagement trends over time | Low |
| Upgrade to paid Supabase tier (removes auto-pause, adds backups) | When justified |
| Accessibility audit (contrast, keyboard navigation, ARIA) | Low |
| Task/deadline assignment per member per project | Low |

---

## 22. Project Outcomes

> The system was in development at the time of writing. The following metrics should be measured once the portal is in live use.

- **Users onboarded:** How many of the club's ≤50 members and heads have working accounts and have logged in at least once
- **Workflows replaced:** Whether project sharing and announcements have genuinely moved off informal channels and into the portal
- **Submissions processed:** Volume of files uploaded via member submissions
- **Reliability:** Frequency of Supabase auto-pause events given actual club usage patterns
- **User feedback:** Whether members and heads prefer the portal over previous communication methods

---

## 23. Project Information

| Field | Value |
|---|---|
| Project Lead | Sanmith S Joseph — DEL-C-2605 |
| Technical Contributors | Sanmith S Joseph (DEL-C-2605), Anish Dsouza (DEL-C-2601) |
| Reviewer | Norman Daran Dsouza — DEL-SE-2610 |
| Faculty Advisor | Dr. Ramananda H S |
| Repository | https://github.com/sanmithsj1103/delta-workspace.git |
| Deployment | Vercel (frontend), Supabase (backend) |
| Version | 1.0 |
| Last Updated | September 2026 |

---

## 24. Appendices

### Appendix A — Requirement Traceability Matrix

| Req. ID | Requirement | Hook / Component | Migration | Test ID |
|---|---|---|---|---|
| FR-01 | Authenticate pre-loaded users | `AuthContext.jsx` | `001_initial_schema.sql` | TC-01, TC-02 |
| FR-02 | Role-based view routing | `App.jsx`, `ProtectedRoute`, `HeadOnlyRoute` | `002_rls_policies.sql` | TC-01, TC-02, TC-10 |
| FR-03 | Session start/end + duration logging | `AuthContext.jsx` (logLogin/logLogout) | `001_initial_schema.sql` | TC-06 |
| FR-04 | Head session-log table, filterable | `LoginActivityPage.jsx`, `useLoginSessions.js` | `002_rls_policies.sql` | TC-06 |
| FR-05 | Project posting with attachments | `CreateProjectPage.jsx`, `useProjects.js` | `001_initial_schema.sql` | TC-03 |
| FR-06 | Department / club-wide scoping | `DepartmentSelector.jsx` | `002_rls_policies.sql` | TC-03 |
| FR-07 | Department-filtered member feed | `useProjects.js`, `ProjectFeed.jsx` | `002_rls_policies.sql` | TC-03, TC-04 |
| FR-08 | View / download / comment / react | `ProjectDetailPage.jsx`, `CommentList.jsx`, `ReactionButton.jsx` | `002_rls_policies.sql` | — |
| FR-09 | Member work submissions | `MemberSubmissionUpload.jsx`, `useMemberSubmissions.js` | `004_member_submissions.sql` | TC-05 |
| FR-10 | Head review of submissions | `MemberSubmissionsPanel.jsx` | `004_member_submissions.sql` | TC-05 |
| FR-11 | Announcements feed | `AnnouncementsPage.jsx`, `useAnnouncements.js` | `001_initial_schema.sql` | TC-07 |
| FR-12 | Pin announcements | `CreateAnnouncementPage.jsx` | `001_initial_schema.sql` | TC-07 |
| FR-13 | Real-time delivery | `useAnnouncements.js`, `useProjects.js`, `useComments.js` | — | TC-09 |
| FR-14 | RLS-enforced department scoping | `002_rls_policies.sql` | `002_rls_policies.sql` | TC-03, TC-04 |
| FR-15 | Only Heads create content | `002_rls_policies.sql`, `HeadOnlyRoute.jsx` | `002_rls_policies.sql` | TC-04, TC-10 |
| FR-16 | Any Head posts to any department | `002_rls_policies.sql` | `002_rls_policies.sql` | — |
| FR-17 | Submission count in profile | `ProfilePage.jsx`, `useUserProjects.js` | `004_member_submissions.sql` | TC-05 |
| FR-18 | Yearly heatmap with submission markers | `YearlyHeatmap.jsx` | — | TC-08 |

### Appendix B — Minimum Diagrams Required

- System architecture diagram — Section 8.1
- User-role / access-control matrix — Section 11.1
- Primary workflow diagram — Section 5.2
- Data-flow description — Section 8.2
- Database table reference — Section 12.2
- Deployment architecture — Section 18

### Appendix C — References

- React — https://react.dev
- Vite — https://vitejs.dev
- Tailwind CSS — https://tailwindcss.com
- Supabase Docs (Database, Auth, Storage, Realtime) — https://supabase.com/docs
- PostgreSQL Docs — https://www.postgresql.org/docs
- Vercel Docs — https://vercel.com/docs
- React Router — https://reactrouter.com
- TanStack Query — https://tanstack.com/query
