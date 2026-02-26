Here’s a README.md you can drop straight into your repo so you’ve always got the update/deploy steps handy.

README.md

markdown
Copy
Edit
# LVExamtimer - Deployment Guide

This project is a **Vite + React** app hosted on **GitHub Pages**.

---

## 🌐 Live site
[https://stuartscottai.github.io/LVExamtimer/](https://stuartscottai.github.io/LVExamtimer/)

---

## 🚀 How to update the live site

Whenever you make changes locally:

1. **Open your terminal** in the project folder:
   ```bash
   cd "C:\Users\PC GAMING\Documents\Vibe Coding apps\LV Exam Timer"
Check you are on the main branch:


git branch
If not, switch:


git checkout main
Add your changes:


git add .
Commit your changes:


git commit -m "Describe what you changed"
Push to GitHub:


git push
Wait for deployment:

Go to your repo → Actions tab.

Find the Deploy static site to GitHub Pages workflow.

When the yellow dot turns into a ✅ green check, the site is live.

🛠 Local testing before deploy
Run this to see exactly what will be deployed:


npm run build && npm run preview
Open the link it shows (usually http://localhost:4173/) and check everything.

⚠ Important settings
In vite.config.ts:


export default {
  base: '/LVExamtimer/'
}
This must match the repo name exactly (case-sensitive).

The GitHub Actions workflow is in:


.github/workflows/deploy.yml
It handles building and deploying automatically.

If the workflow fails:

Check the Actions log for errors.

Fix locally → commit → push again.

📦 Install dependencies
If you ever open this project on a new computer:


npm install
🧹 TypeScript type-checking
The build skips tsc to avoid blocking on test file errors.
To run type-checking manually:


npm run typecheck
