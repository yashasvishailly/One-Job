# One Job — buyer setup MVP

A responsive product preview and guided onboarding companion for the existing paid [One Job system](https://yashasvishailly.com/theone-jobsearch/). Buyers run the purchased system in their own AI assistant. This site makes no AI API calls.

## Buyer journey

1. Explore the public sample workspace or follow **Get One Job** to the existing purchase page.
2. Existing buyers choose **Set up your search** and enter roles, seniority, locations, compensation, and exclusions.
3. Download a personalized Markdown brief, blank tracker CSV, or a ZIP containing the brief, profile JSON, and tracker.
4. Attach the purchased guide, the brief, and a resume in their own assistant; paste the generated starting prompt.

The private paid guide is **not included** in the website or downloads. The starting prompt requires the purchased guide or installed skill before sourcing. Payment verification and private delivery remain with the existing checkout. This public companion does not pretend to verify purchases or gate paid content in browser code.

## Run locally

No install or build step is required. Serve this folder over HTTP (ES modules cannot be opened reliably with file://):

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. All asset paths are relative, including when hosted below a GitHub Pages repository path.

## Files

- `index.html` — accessible app shell and navigation.
- `styles.css` — responsive design using the existing cream, ink, poppy, marigold, rani, violet, and green brand palette.
- `app.mjs` — guided setup, sample workspace, browser persistence, and download interactions.
- `package.mjs` — profile validation, briefing documents, safe CSV export, and dependency-free ZIP generation.
- `tests/package.test.mjs` — export, validation, Unicode, CSV, and ZIP interoperability tests.
- `docs/sample-report.md` — the original public sample report for reference.

The purchase destination is `PURCHASE_URL` in `app.mjs`. It points to the existing website's purchase form so India/global checkout and delivery choice continue to work there. No prices, payment keys, buyer data, or private delivery URLs are copied into this site.

## Privacy and storage

Inputs stay in browser memory unless the buyer explicitly checks **Remember my preferences on this device**. Only then are they saved under `one-job-preferences-v1` in localStorage. **Privacy & local data → Clear my preferences** clears both the current form and saved preferences. Resume upload, account login, analytics, and backend storage are not implemented. Downloaded files contain the buyer's preferences. Their AI provider receives those files only when the buyer attaches them there.

## Validation

Requires Node.js 18+ and Python 3 for independent ZIP/CSV interoperability checks:

```sh
npm test
```

Browser verification covers required input validation, custom roles, flexible compensation, buyer guidance, download generation, sample status filtering, editable draft persistence within a session, opt-in preferences across reload, clearing preferences, and the 390px mobile layout. Sample data is labelled fictional and is not mixed into the real buyer's exported brief.

## Scope

This is a setup companion, not a hosted job-search agent. It does not search job databases, send outreach, connect an inbox, schedule runs, or maintain the buyer's live tracker. Those actions belong to the purchased system and the buyer's assistant. An assistant subscription or research tools may have their own costs and usage limits.

To test demand, share the public preview with prospective buyers and send the setup URL to existing buyers. Observe whether they can create a brief and complete their first search using their purchased guide. No analytics are silently installed.
