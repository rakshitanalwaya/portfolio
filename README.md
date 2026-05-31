# Rakshita Nalwaya — Portfolio Website

Professional portfolio site for job applications, built with **Node.js**, **Express**, **EJS**, and **SQLite**.

**Live site:** [https://rakshitanalwaya.github.io/portfolio/](https://rakshitanalwaya.github.io/portfolio/)

## Features

- Resume-backed profile: experience, case studies, AI projects, and education
- Dedicated **AI Project Spotlight** section
- LinkedIn and GitHub integration
- Downloadable resume PDF
- Analytics (local Node server only): page views, click tracking, dashboard at `/admin`

## Local development

```bash
npm install
npm run init-db
npm start
```

- Site: [http://localhost:3000](http://localhost:3000)
- Analytics: [http://localhost:3000/admin](http://localhost:3000/admin) (default token: `change-me-in-production`)

## Customize content

Edit **`data/profile.json`** to update your profile. Your resume PDF lives at **`public/resume/Resume_Rakshita.pdf`**.

After editing, restart the server (`npm start`) or use `npm run dev` for auto-reload.

## Deploy to GitHub Pages

The site is published at **https://rakshitanalwaya.github.io/portfolio/** from the [`portfolio`](https://github.com/rakshitanalwaya/portfolio) repository.

Pushing to the `main` branch triggers a GitHub Actions workflow that:

1. Builds a static version of the site (`npm run build`)
2. Deploys the `docs/` output to GitHub Pages

To preview the production build locally:

```bash
npm run build
npx serve docs -l 3000
```

Then open [http://localhost:3000/portfolio/](http://localhost:3000/portfolio/) (the `serve` package serves the `docs` folder; paths match GitHub Pages when using a subpath).

**Note:** Analytics and the `/admin` dashboard require the Node.js server (`npm start`). They are disabled on the public GitHub Pages site.

## Environment variables (Node server)

```bash
export ADMIN_TOKEN="your-secret-token"
export PORT=3000
npm start
```

## Links

- [Portfolio](https://rakshitanalwaya.github.io/portfolio/)
- [LinkedIn](https://www.linkedin.com/in/rakshitanalwaya/)
- [GitHub](https://github.com/rakshitanalwaya)
- [AI News Aggregator](https://github.com/rakshitanalwaya/ai-news-aggregator-master)
