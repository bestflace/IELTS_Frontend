# IELTSBF Frontend

Frontend for IELTSBF, built from the provided Prisma schema and Express API routes.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Zustand auth/session store
- Axios API client with `/auth/refresh` retry
- React Hook Form / Zod ready
- Recharts for reports
- Lucide React icons
- Sonner toast

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

The backend mounts routes under `/api/v1`, so the frontend base URL must include `/api/v1`.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Backend mapping notes

- Backend role `USER` is mapped to frontend learner role.
- Backend roles: `USER`, `TEACHER`, `ADMIN`.
- Publish statuses: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Attempt statuses: `IN_PROGRESS`, `SUBMITTED`, `GRADING`, `GRADED`, `ERROR`, `EXPIRED`.
- Auth refresh uses httpOnly cookie and the client sets `withCredentials: true`.
- API envelope is normalized from `{ success, message, data, meta }`.

## Important implemented areas

- API functions in `src/lib/api` match the provided backend endpoints and validators.
- `RoleGuard` protects Learner, Teacher, and Admin layouts.
- Dashboard shells include sidebar, topbar, notification bell, and user menu.
- Attempt session uses a professional IELTS two-panel layout with timer, autosave indicator, question panel, and navigator.
- Admin CRUD pages have route, list loading/error/empty states, and endpoint-specific clients.
- Reports use Recharts with IELTSBF vintage academic colors.

## Recommended next coding pass

The backend schema and validators are mapped. The remaining production step is to refine each CRUD form field with exact response examples from a running backend database, especially nested `test_sections`, `questions`, and import job error payloads.
