# One Job — buyer setup MVP

A responsive product page and guided onboarding companion for the paid [One Job system](https://yashasvishailly.com/theone-jobsearch/). Buyers run the system in their own AI assistant. This site makes no AI API calls.

## Buyer journey

1. Visitors explore the public sample or follow **Get One Job** to the existing checkout.
2. **Build my search** is hidden until a purchase session is verified by the backend. Direct `#setup` links show purchase and buyer sign-in options.
3. Verified buyers enter preferences and download a personalized brief, blank tracker, or setup ZIP.
4. Buyers attach their purchased guide, brief, and resume in their own assistant and paste the starting prompt.

The private paid guide is never included in this repository or generated downloads. The production website and payment Worker changes are maintained in the website repository. This public frontend requires that backend; changing browser storage cannot authorize server downloads.

## Run locally

No install or build step is required:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Asset paths work below a repository path. Public pages and the locked buyer screen work locally. Authenticated setup and payment APIs allow only the production website origin; local and temporary previews are not end-to-end checkout environments.

## Files

- `index.html`, `styles.css`, `site-shell.css`: responsive page with the parent website’s navbar, footer, fonts, and colours.
- `app.mjs`: routes, buyer forms, sample workspace, and downloads.
- `buyer-access.mjs`: session verification, sign-in requests, and authenticated setup API calls.
- `package.mjs`: public profile validation and sample CSV helpers; personalized export generation lives on the server.
- `tests/`: public module and authentication-client regression tests.
- `docs/sample-report.md`: original public sample report.

The standalone purchase link goes to the existing production purchase form. The website replacement retains checkout on-page.

## Privacy and access

Preferences stay in browser memory unless the buyer chooses **Remember my preferences on this device**, which saves them in localStorage. **Privacy & local data → Clear my preferences** clears both. When generating downloads, preferences are sent to the One Job backend, processed for that request, and not stored or logged by application code. No resume is uploaded and no AI provider is contacted.

Buyer sessions last up to 24 hours and are kept in sessionStorage for the current tab. Returning buyers request a 15-minute email link using their purchase email and payment reference. The server verifies the delivered-purchase record for sessions and exports. Sign-in tokens are stored hashed on the backend. The existing email service delivers sign-in links.

The standalone page adds no analytics. The production replacement retains the site's explicit analytics events but disables automatic field capture and session recording. Fonts load from Google Fonts and the favicon from the main site. Generated files contain the buyer's preferences; their AI provider receives them only when the buyer attaches them.

## Validation and scope

```sh
npm test
```

Backend export, authorization, and mocked checkout tests live in the website repository. No real charge, coupon redemption, or delivery is performed by these tests.

This is a setup companion. It does not source live jobs, send outreach, connect an inbox, schedule runs, or maintain a live tracker. Those actions belong to the purchased system and the buyer's assistant, whose plan may have separate costs and usage limits.

## Release status

The replacement is prepared for `/theone-jobsearch/`. Deploy the updated payment Worker before publishing the replacement page. A preview or merged frontend alone does not deploy that Worker or prove live payment-to-delivery operation.
