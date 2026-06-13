# Git Cleanup Guide

Use this guide when local `.env`, build files, ZIP patches, or temporary files were accidentally committed.

## 1. Add proper `.gitignore`

Copy the included `.gitignore` to the root of the repository.

## 2. Keep only an example env file

Use:

```text
.env.example
```

Do not commit:

```text
.env
.env.local
.env.development
.env.production
```

## 3. Remove env files from Git tracking

PowerShell:

```powershell
git rm --cached .env .env.local .env.development .env.production
```

If a file does not exist or is already untracked, Git may show an error. That is okay.

Then commit:

```powershell
git add .gitignore .env.example README.md
git commit -m "chore: clean repository files and update README"
git push
```

## 4. Remove generated files from tracking

PowerShell:

```powershell
git rm -r --cached node_modules .next dist build
git add .gitignore
git commit -m "chore: remove generated files from repository"
git push
```

## 5. If real secrets were pushed

For real secrets, do not only delete the file. Rotate the secret first.

Examples of real secrets:

```text
DATABASE_URL
JWT_SECRET
GEMINI_API_KEY
CLOUDINARY_API_SECRET
SMTP_PASSWORD
REDIS_PASSWORD
```

Then remove from history using `git filter-repo` or BFG Repo-Cleaner.
