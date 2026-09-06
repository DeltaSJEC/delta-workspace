# Delta Backend (Express + Supabase)

This is an Express API sitting between your frontend and Supabase. The frontend
never talks to Supabase directly anymore — it calls these endpoints instead,
sending its access token in the `Authorization: Bearer <token>` header after login.

## Route reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | none | ID + password → session tokens |
| POST | /api/auth/forgot-password | none | Sends reset link email |
| POST | /api/auth/reset-password | none | Sets new password from reset link |
| GET | /api/dashboard | member | Attendance status, activity, recent files |
| POST | /api/attendance/entry | member | Mark today's entry |
| POST | /api/attendance/exit | member | Mark today's exit |
| GET | /api/attendance/history | member | Attendance between two dates |
| GET | /api/files | member | List/search files |
| GET | /api/files/url | member | Signed download URL for a file |
| POST | /api/files/upload | head | Upload a file (multipart) |
| GET | /api/admin/overview | head | Dashboard counters |
| GET | /api/admin/logs | head | Access/checkpoint logs |
| GET | /api/admin/members | head | List members |
| PATCH | /api/admin/members/:id/status | head | Enable/disable a member |
| GET | /api/admin/attendance-report | head | Filtered attendance report |
| GET | /api/notices/latest | member | Latest broadcast notice |
| POST | /api/notices | head | Post a new notice |

---

## Setup steps to run this yourself

**Step 1 — Install Node.js** (if you don't have it): nodejs.org, LTS version.

**Step 2 — Open this folder in your editor** (VS Code or Antigravity — both are
just code editors, this part is identical in either).

**Step 3 — Install dependencies**
```bash
npm install
```

**Step 4 — Create your real `.env`**
Copy `.env.example` to `.env`, then fill in your actual Supabase URL and anon
key (Settings → API in your Supabase dashboard).
```bash
cp .env.example .env
```

**Step 5 — Run it**
```bash
npm run dev
```
You should see `Delta API listening on http://localhost:4000`.

**Step 6 — Test one route before touching the frontend**
Use curl, Postman, or Thunder Client (a VS Code extension) to hit:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idOrUsername":"USR-4920","password":"yourpassword"}'
```
If you get back a `session` object, the backend is wired correctly.

**Step 7 — Point your frontend at this API instead of Supabase directly**
Wherever your frontend called `supabase.auth.signInWithPassword(...)`, it now
calls `fetch('http://localhost:4000/api/auth/login', ...)` instead, and stores
`session.access_token` (e.g. in memory or localStorage) to send on every
future request:
```javascript
fetch('http://localhost:4000/api/attendance/entry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
})
```

---

## How to build/extend this yourself, step by step (no AI assistance)

If you want to genuinely write and understand this code yourself instead of
copy-pasting, work in this order — each step is testable on its own before
you move to the next, which is the actual skill of building a backend:

1. **Get a bare server running first.** Just `server.js` with one route
   (`GET /`) that returns `{status: "ok"}`. Run it, hit it in the browser.
   Nothing else until this works.
2. **Add the Supabase client.** Get `supabaseClient.js` connecting, and add
   one throwaway route that just runs `supabase.from('profiles').select('*')`
   and logs the result to your terminal. Confirm real data comes back before
   building anything on top of it.
3. **Build ONE full route end-to-end** — I'd pick `/api/auth/login` first,
   since everything else depends on having a logged-in user. Get it working
   with Postman/curl before writing any frontend code against it.
4. **Add the auth middleware** once login works, and build one protected
   route (`/api/dashboard`) to prove the Bearer token flow works.
5. **Add the rest of the routes one file at a time**, testing each with
   curl/Postman before moving to the next — attendance, then files, then
   admin, then notices.
6. **Only then wire the frontend to it**, one screen at a time, in the same
   order you built the backend routes.

### Using Antigravity or VS Code without AI help

Both are regular code editors underneath any AI features — you can use either
exactly like a plain text editor with syntax highlighting, a terminal panel,
and a debugger. To work without AI assistance:

- Don't invoke the AI/agent panel or chat sidebar — just use the file explorer,
  editor, and integrated terminal (`` Ctrl+` `` in both).
- Use the built-in terminal to run `npm run dev`, `curl`, and `git` commands
  directly, rather than asking an agent to run them for you.
- For debugging, use `console.log()` liberally in your routes, and read the
  terminal output — that's genuinely how most backend debugging works day to
  day, AI or not.
- Install the **Thunder Client** or **REST Client** extension (works in both
  editors) so you can send test requests to your own API without leaving the
  editor, instead of switching to Postman.
- Turn off inline AI code completion in Settings if it's on by default and
  distracting — search "inline suggestions" in the settings search bar.

### Git, so you don't lose work while learning

```bash
git init
git add .
echo "node_modules/
.env" > .gitignore
git add .gitignore
git commit -m "Initial Express + Supabase backend"
```
Commit after each working route — that gives you a checkpoint to roll back to
if you break something while experimenting.
