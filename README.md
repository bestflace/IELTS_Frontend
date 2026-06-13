# IELTSBF — IELTS Learning & Practice Platform

IELTSBF is a full-stack IELTS learning platform built for learners, teachers, and administrators.  
The system supports IELTS practice tests, public learning resources, role-based dashboards, AI-assisted grading workflows, teacher review, import tools, media management, notifications, and progress tracking.

## Main Features

### Learner
- Browse public IELTS resources for Reading, Listening, Writing, and Speaking.
- Register, log in, reset password, and manage learner profile.
- Take IELTS practice tests in a learner-style attempt interface.
- Submit Writing and Speaking answers for review.
- View attempt status, results, feedback, reports, and progress.
- Read IELTS learning blogs and receive notifications.

### Teacher
- View assigned/pending Writing and Speaking submissions.
- Claim, release, review, and grade learner submissions.
- Send detailed feedback to learners.
- Track teacher review reports and recent activity.
- Manage teacher profile and notifications.

### Admin
- Manage users, roles, and account status.
- Manage IELTS tests and preview tests before publishing.
- Manage content bank:
  - Reading Sets
  - Listening Sets
  - Writing Tasks
  - Speaking Sets
- Upload and manage media files for Reading images, Writing charts, Listening audio, and import assets.
- Import data from Excel/CSV templates.
- Review submissions, comments, reports, notifications, and system content.
- Publish/unpublish tests and content safely.

## Tech Stack

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand
- Axios/custom API client
- Lucide React icons

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Role-based access control
- BullMQ/worker workflow for import and background jobs
- Cloudinary/R2 upload integration
- AI-assisted grading integration

## Project Structure

```text
IELTSBF/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── store/
│   │   ├── styles/
│   │   └── types/
│   ├── public/
│   ├── .env.example
│   └── README.md
│
└── backend/
    ├── src/
    │   ├── common/
    │   ├── config/
    │   ├── modules/
    │   ├── middlewares/
    │   ├── routes/
    │   └── workers/
    ├── prisma/
    ├── .env.example
    └── README.md
```

Adjust the folder names above if your local repository uses a different layout.

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```

### 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

Default backend API URL:

```text
http://localhost:5000/api/v1
```

### 4. Frontend environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

`NEXT_PUBLIC_*` variables are exposed to the browser by design. Do not put secrets in `NEXT_PUBLIC_*`.

## Recommended Git Hygiene

Do not commit local environment files, build output, dependencies, logs, generated archives, or temporary patch files.

Tracked example file:

```text
.env.example
```

Ignored local files:

```text
.env
.env.local
.env.development
.env.production
node_modules/
.next/
dist/
build/
*.zip
*.log
```

## Useful Commands

### Check current Git status

```bash
git status
```

### Remove accidentally tracked environment files from Git tracking

```bash
git rm --cached .env .env.local .env.development .env.production 2>/dev/null || true
git add .gitignore .env.example README.md
git commit -m "chore: clean repository files and update README"
git push
```

On PowerShell:

```powershell
git rm --cached .env .env.local .env.development .env.production
git add .gitignore .env.example README.md
git commit -m "chore: clean repository files and update README"
git push
```

If Git says a file does not exist, continue with the next command.

### Remove tracked build/cache files if they were committed before

```bash
git rm -r --cached node_modules .next dist build 2>/dev/null || true
git add .gitignore
git commit -m "chore: remove generated files from repository"
git push
```

PowerShell alternative:

```powershell
git rm -r --cached node_modules .next dist build
git add .gitignore
git commit -m "chore: remove generated files from repository"
git push
```

## Security Note

The value below is not a secret because it is a public frontend API URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

However, real secrets must never be committed, for example:

```text
DATABASE_URL
JWT_SECRET
REFRESH_TOKEN_SECRET
GEMINI_API_KEY
CLOUDINARY_API_SECRET
SMTP_PASSWORD
REDIS_PASSWORD
```

If a real secret was pushed, rotate the secret immediately and remove it from Git history.

## Status

This project is under active development as an IELTS learning website with learner, teacher, and admin workspaces.
