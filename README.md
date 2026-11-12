# Weekly — To-Do List

A mobile-first MERN to-do app that organises tasks by week. Create, edit, search, and
complete tasks with a date, time, and priority; the home screen groups everything into
Monday–Sunday cards with live open/completed counts and progress.

Built for the **SDE-1 (MERN Stack)** assignment.

| Home | New task | Search |
| --- | --- | --- |
| ![Home screen](docs/screenshots/home.png) | ![Create task sheet](docs/screenshots/new-task.png) | ![Search overlay](docs/screenshots/search.png) |

| Swipe to delete | Desktop framing |
| --- | --- |
| ![Swipe to delete](docs/screenshots/swipe-delete.png) | ![Desktop](docs/screenshots/desktop.png) |

---

## Features

- **Task management** — create, edit, and delete tasks with title (required),
  description (optional), date & time (required), and priority (low / medium / high).
- **Search** — debounced keyword search across titles and descriptions, with edit and
  delete actions directly from the results.
- **Weekly home screen** — tasks grouped into Monday–Sunday weeks. The current week is
  always visible; weeks are ordered current → upcoming → past.
- **Summary cards** — every week shows open and completed counts, total tasks, and a
  progress bar. Tap a card to expand its tasks.
- **Status updates** — one tap marks a task complete/in progress; card counts and
  progress update immediately (optimistic UI with rollback on failure).
- **Swipe to delete** — drag a task left to reveal Delete. An undo toast lets you
  restore it. Delete is also available in search results.
- **Mobile-first responsive UI** — app-shell layout on desktop, bottom-sheet task form
  on mobile, centered dialog on larger screens.
- **Accessibility** — labelled controls, 44px tap targets, visible focus rings, WCAG AA
  colour contrast, and keyboard-operable forms/search.
- **Robust API** — request validation, consistent error shapes, Mongo/JSON repository
  abstraction, and 9 integration tests.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, date-fns, lucide-react |
| Backend | Node.js, Express 4, Mongoose 8 |
| Storage | MongoDB Atlas (production) · JSON file fallback (local/demo) |
| Deployment | Netlify static site + Netlify Function (`serverless-http`) |
| Testing | Node test runner, Supertest |
| CI | GitHub Actions (install → test → build) |

## Project structure

```
.
├── client/                  React app (Vite + Tailwind)
│   ├── src/
│   │   ├── api/             fetch wrapper for the REST API
│   │   ├── components/      Header, WeekCard, TaskItem, sheets, overlays, toast
│   │   ├── hooks/           useTasks (load + optimistic CRUD)
│   │   └── utils/           Monday-based week grouping and date formatting
│   └── vite.config.js       dev proxy /api -> localhost:5000
├── server/                  Express REST API
│   ├── src/
│   │   ├── repository/      mongoRepository + fileRepository
│   │   ├── routes/tasks.js  CRUD + search endpoints
│   │   ├── validators.js    input validation and normalisation
│   │   └── seed.js          optional demo data
│   └── test/tasks.test.js   9 API integration tests
├── netlify/functions/api.js Serverless wrapper around the Express app
├── netlify.toml             Build, function, and redirect configuration
└── .github/workflows/ci.yml Test + build on push/PR
```

## Quick start

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run seed     # optional: add demo tasks across this/next/last week
npm run dev
```

- Web app: <http://localhost:5173>
- API: <http://localhost:5000/api/health>

Without `MONGODB_URI`, the API stores data in `server/data/tasks.json` — no database
setup needed for local development or review.

### Environment variables

Copy `server/.env.example` to `server/.env` if you want to override defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | _(empty)_ | Mongo connection string. When empty, the JSON file store is used. |
| `PORT` | `5000` | Local API port. |
| `CLIENT_ORIGIN` | `*` | Allowed CORS origin(s), comma-separated. |
| `DATA_DIR` | `server/data` | Override the JSON store directory. |
| `VITE_API_URL` | `/api` | Client-only: full API URL when the API is hosted separately. |

## API

Base URL: `/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service status and active storage kind. |
| `GET` | `/tasks?q=` | List tasks sorted by due date; optional keyword search. |
| `POST` | `/tasks` | Create a task. Returns `201`. |
| `GET` | `/tasks/:id` | Fetch a single task. |
| `PATCH` | `/tasks/:id` | Update any subset of fields (including `status`). |
| `DELETE` | `/tasks/:id` | Delete a task. |

**Task shape**

```json
{
  "id": "0c7f...",
  "title": "Finish dashboard API",
  "description": "Add weekly summary endpoints",
  "dueAt": "2026-11-12T15:30:00.000Z",
  "priority": "high",
  "status": "in_progress",
  "createdAt": "2026-11-10T09:00:00.000Z",
  "updatedAt": "2026-11-10T09:00:00.000Z"
}
```

- `priority`: `low | medium | high` (default `medium`)
- `status`: `in_progress | completed` (default `in_progress`)
- Errors use `{ "error": "message" }` with `400`, `404`, or `500`.

## How weeks are calculated

- Weeks start on **Monday** and end on **Sunday** (`weekStartsOn: 1`).
- Grouping happens on the client in `client/src/utils/date.js`.
- The current week is always rendered, even when it has no tasks.
- Ordering: current week first, upcoming weeks ascending, past weeks descending.
- Each card computes `open`, `completed`, `total`, and a percentage from the tasks in
  that bucket. Dates are stored as UTC ISO strings and displayed in the user's local
  time zone.

## Testing and checks

```bash
npm test         # 9 API integration tests (Node test runner + Supertest)
npm run build    # production build of the client
```

The API tests run against the JSON repository in a temporary directory, so they need
no database. GitHub Actions runs both commands on every push and pull request.

## Deployment (Netlify + MongoDB Atlas)

The repo is ready for a single Netlify deployment: the static site and the API
(serverless function) ship together under one domain, so the client calls `/api`
same-origin.

1. **Create a MongoDB Atlas cluster** (free tier is fine).
   - Add a database user.
   - Allow network access from `0.0.0.0/0` (or Netlify's egress ranges).
   - Copy the connection string and add a database name, e.g.
     `mongodb+srv://user:pass@cluster.mongodb.net/weekly-todo?retryWrites=true&w=majority`.
2. **Push this repository to GitHub.**
3. In Netlify: **Add new site → Import an existing project**, then pick the repo.
   `netlify.toml` already defines:
   - build command `npm run build`
   - publish directory `client/dist`
   - functions directory `netlify/functions`
   - `/api/*` → `/.netlify/functions/api/:splat` rewrite
   - SPA fallback to `index.html`
4. Add an environment variable in **Site configuration → Environment variables**:
   - `MONGODB_URI` = your Atlas connection string (**required for persistence**)
   - `CLIENT_ORIGIN` = your Netlify URL (optional; `*` works for a public demo)
5. Deploy. The app and API are served from the same Netlify domain.

> The JSON-file fallback uses `/tmp` inside a serverless function. It is intentionally
> only for local demos — configure `MONGODB_URI` in production so data persists.

### Alternative: separate API host

You can also deploy `server/` to Render/Railway and the client to Netlify:

- API host: root directory `server`, build `npm install`, start `npm start`, set
  `MONGODB_URI` and `CLIENT_ORIGIN=https://your-site.netlify.app`.
- Netlify: set `VITE_API_URL=https://your-api.example.com/api` and redeploy.

## Design decisions

- **Repository abstraction** — `mongoRepository` and `fileRepository` share one
  interface, so routes and tests are storage-agnostic. MongoDB is used whenever
  `MONGODB_URI` is set; otherwise local development is zero-config.
- **Optimistic updates** — status toggles and deletes update the UI instantly and roll
  back to the previous snapshot if the API call fails.
- **Pointer Events for swipe** — works with both touch and mouse, ignores vertical
  scroll gestures, and always exposes a labelled Delete button for non-swipe users.
- **Single-user scope** — the assignment does not require authentication, so there is
  no login. The API is intentionally simple and CORS-configurable.

## Assignment checklist

- [x] Create task with title, description, date & time, priority
- [x] Edit any task attribute
- [x] Delete task (swipe left on mobile + search result action)
- [x] Search by title/description with view, edit, delete
- [x] Weekly grouping, Monday–Sunday
- [x] Week cards with open/completed counts
- [x] Expand a week to view its tasks
- [x] Mark tasks completed / in progress
- [x] Fully responsive mobile UI
- [x] Own API (Express) + deployment configuration
- [x] Tests, CI, and documentation
