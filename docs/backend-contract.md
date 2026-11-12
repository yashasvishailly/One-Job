# Buyer-access integration and release gate

The maintained backend exists in
[`yashasvishailly-com/workers/one-job-search`](https://github.com/yashasvishailly/yashasvishailly-com/tree/1fb69c0fad52166e628c924760504b4878b4424a/workers/one-job-search).
The previous statement that these routes were missing is superseded by the
current source. Do not implement a duplicate payment or entitlement service in
this standalone frontend repository.

## Implemented contract

| Route | Request | Current server behavior |
| --- | --- | --- |
| `GET /session` | `Authorization: Bearer <session>` | Checks the unexpired session and a matching delivered purchase; returns `ok` and expiry in milliseconds. |
| `POST /exchange` | `{ token }` | Checks the 15-minute email link and delivered purchase; issues a hashed-at-rest session. The link remains usable until expiry, allowing retry if an exchange response is lost. It is not a single-use link. |
| `POST /request` | `{ email, receipt }` | Looks up a matching delivered payment or coupon redemption. Sends the configured email only on a match and returns the same generic message for valid and invalid details. A best-effort KV throttle suppresses repeat sends for 60 seconds. |
| `POST /setup` | `{ profile }` plus bearer session | Rechecks entitlement, validates preferences, and returns the brief, tracker and ZIP without persisting profile data. |
| `POST /logout` | Bearer session | Deletes that session. The frontend clears the session and pending link locally. An unexpired email link remains usable until its own expiry. |

The server allows the canonical `https://yashasvishailly.com` origin only.
GitHub Pages, localhost and temporary previews are not authenticated checkout
origins. Do not broaden the allowlist merely to make a standalone preview pass.

## Reproduce local verification

Use Node.js 22 or later and a checkout of the maintained website repository.
The integration suite imports its actual `buyer-access.mjs` and this PR's actual
client. Only storage, email delivery and network transport are fake; no live
payment, email, coupon redemption or personal data is sent.

```sh
npm test
ONE_JOB_WEBSITE_ROOT=/absolute/path/to/yashasvishailly-com npm run test:backend
cd /absolute/path/to/yashasvishailly-com
node --test workers/one-job-search/tests/*.test.mjs
for test in workers/one-job-search/test-*.mjs; do node "$test" || exit 1; done
```

Verified on website commit `1fb69c0fad52166e628c924760504b4878b4424a`:
7 standalone tests, 4 frontend/backend integration tests, 18 backend/export
tests and all 6 existing payment-worker test scripts passed. Coverage includes
receipt privacy, normal sign-in/export/logout, lost exchange response and reload,
refunded entitlement, expiry, forged tokens, untrusted origins, payment retries
and coupon buyer recovery. These are local synthetic tests, not live fulfillment.

## Remaining release checks

1. Apply the reload-recovery client and early fragment handler to the maintained
   website's separate frontend copy before releasing that fix on the main site.
2. Verify the deployed Worker version and canonical-origin responses. A successful
   Cloudflare build alone does not prove traffic allocation or configured services.
3. With explicit authorization for the concrete test transaction and email, verify
   purchase and coupon delivery through email, sign-in, reload, export and logout.
   Do not use a real buyer record or send a test email without permission.
4. Treat link expiry as the limit on replay. If single-use/revocation semantics
   are required later, design atomic consumption with safe interrupted-response
   recovery; a simple KV delete can strand buyers or race.

Pending email links stay in sessionStorage until exchanged or definitively
rejected. With storage blocked, the original fragment is retained until exchange
succeeds. An issued session is checked server-side; temporary verification
failures retry that session. Blocked storage cannot preserve an issued session
across a reload, so a buyer may need another sign-in link in that browser.
