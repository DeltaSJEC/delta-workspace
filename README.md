# Delta SJEC Virtual Workspace

> A private, role-based collaboration portal for the Delta club at SJEC — built with React, Vite, Tailwind CSS, and Supabase.

---

## Overview

The **Delta SJEC Virtual Workspace** replaces scattered WhatsApp groups, email threads, and shared drive links with a single authenticated portal where:

- **Heads** post project assignments, announcements, and review member-submitted work
- **Members** view relevant project posts, comment, react, submit their completed work, and track their own contribution history
- All access is enforced at the **Postgres database level** via Row Level Security — no separate backend server required

---

## Features

| Feature | Description |
|---|---|
| 🔐 Role-based auth | Pre-created accounts; Member and Head views; session logging |
| 📋 Project feed | Department-scoped project posts with file attachments |
| 📤 Member submissions | Members upload work per project; heads see all submissions grouped by member |
| 📢 Announcements | Club-wide or department-specific notices with pinning |
| 💬 Comments & reactions | Real-time comments and 👍 reactions on project posts |
| 📊 Profile & performance | Session stats, login streaks, submission count, GitHub-style yearly heatmap |
| 🔍 Login activity | Head-only table of all members' session records |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom v6 |
| State | @tanstack/react-query v5 |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Hosting | Vercel (frontend), Supabase (backend) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/sanmithsj1103/delta-workspace.git
cd delta-workspace
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key_here
```

> ⚠️ The `SERVICE_ROLE_KEY` is only used by the local seed/migration scripts — **never expose it in a deployed frontend**.

### 3. Run database migrations

Copy and paste each file (in order) into the **Supabase SQL Editor** and run them:

```
supabase/migrations/001_initial_schema.sql   ← tables + trigger
supabase/migrations/002_rls_policies.sql     ← Row Level Security
supabase/migrations/003_storage.sql          ← project-files bucket
supabase/migrations/004_member_submissions.sql ← member submissions
supabase/migrations/005_security_hardening.sql ← RLS, storage, and validation hardening
```

### 4. Seed test accounts

```bash
npm run seed
```

This creates two test accounts:

| Email | Password | Role | Dept |
|---|---|---|---|
| `test_head@delta.sjec.ac.in` | `Delta@2026` | Head | Computing |
| `test_member@delta.sjec.ac.in` | `Delta@2026` | Member | Mechanical |

### 5. Start the dev server

```bash
npm run dev
# or
npm start
```

Open [http://localhost:5173](http://localhost:5173)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` / `npm start` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run seed` | Create test user accounts in Supabase Auth |

---

## Project Structure

```
delta-workspace/
├── public/                  # Static assets (Delta Logo)
├── src/
│   ├── components/
│   │   ├── announcements/   # AnnouncementCard
│   │   ├── comments/        # CommentList
│   │   ├── layout/          # AppShell, Sidebar, TopBar
│   │   ├── projects/        # ProjectCard, ProjectFeed, FileUploadZone,
│   │   │                    # ProjectFileList, MemberSubmissionUpload,
│   │   │                    # MemberSubmissionsPanel, DepartmentSelector
│   │   ├── reactions/       # ReactionButton
│   │   └── ui/              # Badge, EmptyState, Modal, Spinner, YearlyHeatmap
│   ├── constants/           # departments.js (DEPARTMENTS, DEPARTMENT_COLORS)
│   ├── context/             # AuthContext.jsx (session, profile, login/logout)
│   ├── hooks/               # Custom React hooks per feature domain
│   │   ├── useAnnouncements.js
│   │   ├── useComments.js
│   │   ├── useLoginSessions.js
│   │   ├── useMemberSubmissions.js
│   │   ├── usePerformance.js
│   │   ├── useProjects.js
│   │   ├── useReactions.js
│   │   └── useUserProjects.js
│   ├── lib/                 # supabaseClient.js
│   ├── pages/               # Full-page components
│   │   ├── LoginPage.jsx
│   │   ├── MemberDashboard.jsx
│   │   ├── HeadDashboard.jsx
│   │   ├── ProjectDetailPage.jsx
│   │   ├── AnnouncementsPage.jsx
│   │   ├── CreateProjectPage.jsx
│   │   ├── CreateAnnouncementPage.jsx
│   │   ├── LoginActivityPage.jsx
│   │   └── ProfilePage.jsx
│   ├── routes/              # ProtectedRoute, HeadOnlyRoute
│   └── utils/               # dateFormat.js, fileHelpers.js, roleHelpers.js
├── supabase/
│   ├── migrations/          # SQL migration files (001–005)
│   └── seed.sql             # Reference seed data
├── scripts/
│   ├── seed-users.js        # Creates auth accounts via Supabase Admin API
├── .env.example             # Template env file (no secrets)
├── documentation.md         # Full project documentation
├── CONTEXT.md               # Broader project context for AI/developer reference
└── README.md                # This file
```

---

## Departments

The four Delta departments, each with colour-coded badges:

| Department | Colour |
|---|---|
| Mechanical | Blue |
| Electronics | Teal |
| Computing | Purple |
| Media | Orange |

---

## Deployment

### Vercel (recommended)

1. Import the GitHub repository into Vercel
2. Set environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Vercel will run `vite build` automatically on every push to `main`

> The `SUPABASE_SERVICE_ROLE_KEY` should **not** be set in Vercel — it is only needed locally for seeding.

---

## Security Notes

- All accounts are pre-seeded by an admin — there is no public sign-up
- Every database table has Row Level Security enabled; members only ever receive data relevant to their own department
- The Supabase service role key (which bypasses RLS) is excluded from git via `.gitignore` and is never deployed to Vercel
- File storage uses private buckets with signed URLs — no public file URLs are exposed

---

## Known Limitations

- **Supabase free-tier auto-pause:** The database pauses after ~7 days of inactivity and must be manually resumed from the Supabase dashboard
- **No automated backups:** Free tier does not include daily backups; manual exports are required
- **No email notifications:** Members only receive real-time updates while actively in the app
- **50 MB file limit** per upload (Supabase free-tier constraint)

---

## Contributing

This is an internal club project. For changes:

1. Create a feature branch from `main`
2. Make your changes and test locally
3. Open a pull request into `main`
4. Vercel will auto-deploy once merged

---

## Project Team

| Role | Name | ID |
|---|---|---|
| Project Lead | Sanmith S Joseph | DEL-C-2605 |
| Technical Contributor | Anish Dsouza | DEL-C-2601 |
| Reviewer | Norman Daran Dsouza | DEL-SE-2610 |
| Faculty Advisor | Dr. Ramananda H S | — |

---

## License

Private — internal use by Delta Club SJEC only.
