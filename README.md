# Project ReMotion – Investigation Portal

Investigate the failure of an AI-assisted rehabilitation robot.

## About

Project ReMotion is a browser-based investigation platform built around a fictional incident.
During a pre-demonstration calibration test, the AI-assisted rehabilitation robot **ReMotion**
loaded the wrong calibration profile and triggered its emergency stop. This application lets an
investigator review the evidence, people, locations, and timeline surrounding the incident, and
build up a working hypothesis about what happened.

This repository contains an existing vanilla-JavaScript (no frameworks used) investigation application. The system is
functional but has accumulated technical debt and inconsistent implementation decisions. Your task
during the course will be to analyse, maintain, refactor, migrate, and extend it.

## Running the application

This application uses `fetch()` to load its case data from local JSON files, so it must be served
over HTTP — opening `index.html` directly from the filesystem (`file://`) will not work in most
browsers.

Any static file server will do. For example, from the project root:

```bash
# Python 3
python -m http.server 8080

# Node.js (no install required)
npx serve .

# VS Code
# Use the "Live Server" extension
```

Then open `http://localhost:8080` (or whatever port your server prints) in your browser.

## Local mock backend (development only)

Since Exercise 6 the React app reads its case data from a small read-only Node.js server in
`server/index.mjs` instead of the static `public/data/*.json` files. **It is for local development
only and is not part of the GitHub Pages deploy pipeline** (Exercise 2). The deployed site stays a
static frontend.

Start both servers in two terminals:

```bash
npm run server   # mock API on http://localhost:3001/api  (restarts on file changes)
npm run dev      # Vite dev server; requests to /api are proxied to port 3001
```

Endpoints (GET only, same data/shape as the JSON files):
`/api/case`, `/api/evidence`, `/api/people`, `/api/locations`, `/api/timeline`

Query parameters to simulate real-world conditions (work on every endpoint):

| Parameter   | Effect                                                    |
|-------------|-----------------------------------------------------------|
| `delay=MS`  | respond after `MS` milliseconds                           |
| `fail=1`    | respond with HTTP 500                                     |
| `empty=1`   | respond successfully, but with an empty array / object    |

A default delay for all requests can be set with the `API_DELAY` environment variable
(e.g. `API_DELAY=2000 npm run server`; in PowerShell: `$env:API_DELAY=2000; npm run server`).

## Features

- **Dashboard** — case summary and key statistics calculated from the loaded case data.
- **Evidence catalogue** — search, filter (by type, person, location, status, relevance), sort,
  bookmark, and open detailed evidence records.
- **People & Locations** — profile cards for the investigation team and the six key locations.
- **Timeline** — chronological view of case events with filtering and links to related evidence.
- **Investigator workspace** — bookmarked evidence, personal notes, and a hypothesis draft form.
  Workspace data is saved to your browser's local storage and will still be there when you reload
  the page.

## Browser requirements

A recent version of any evergreen desktop browser (Chrome, Firefox, Edge, Safari). JavaScript must
be enabled. The layout targets common desktop and tablet widths.

## Project status

This is an existing brownfield application, not a fresh scaffold. It works for everyday use, but
you should expect to find rough edges, inconsistent patterns, and a handful of bugs as you work
with it — that discovery process is part of the course.
