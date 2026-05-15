# Cambridge Exam Timer - Deployment Notes

This project is a Vite + React app.

Vite is the tool that turns the source files into the final website files.
React is the library used to build the app screen.

## Vercel deployment

Use these settings in Vercel:

- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

The app is configured with this in vite.config.ts:

  base: './'

That means the built website looks for its JavaScript, CSS, icons, manifest, and service worker next to the current page. This works on Vercel and also keeps the app portable if it is hosted in a folder later.

## Local check before deploying

Run:

  npm run build
  npm run preview

Then open the local preview URL shown in the terminal, usually:

  http://localhost:4173/

## Why the old Vercel deploy failed

The project used to have:

  base: '/LVExamtimer/'

That was useful for GitHub Pages because the site lived inside a repo folder. On Vercel, the site lives at the main website address, so the browser was asking for files in the wrong place and Vercel returned 404 "not found" errors.
