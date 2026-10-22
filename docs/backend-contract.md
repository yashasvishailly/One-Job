# Buyer-access launch requirements

This frontend needs an authenticated access service under the One Job worker's
`/api/access` prefix. The maintained worker source reviewed on 22 October 2026
does not contain these routes. Keep the companion behind its release gate until
the service is implemented and tested. Publishing the static page cannot create
buyer entitlements or deliver personalized exports by itself.

| Route | Request | Required behavior |
| --- | --- | --- |
| `GET /session` | `Authorization: Bearer <session>` | Validate the entitlement server-side; return `ok` and an expiry timestamp in milliseconds. |
| `POST /exchange` | `{ token }` | Validate the email-link token and return `{ access: { token } }`. Handle an interrupted exchange without stranding a buyer whose link was consumed before the response arrived. |
| `POST /request` | `{ email, receipt }` | Verify a delivered-purchase record, rate-limit requests, and send a short-lived link through the configured email service. Return a user-facing `message` without disclosing another buyer's purchase status. |
| `POST /setup` | `{ profile }` plus the bearer session | Recheck entitlement and validate the profile before generating the requested setup data. Do not trust browser storage as authorization. |
| `POST /logout` | Bearer session | Revoke the session. The browser also clears its session and pending-link state. |

Before launch, test purchase and coupon delivery through sign-in, exchange,
reload, export, expiry, logout, revoked entitlement, and retry after interrupted
responses. Verify both supported production origins and reject unapproved
origins. Use mocked payment, email, and storage adapters for automated tests.
Frontend tests alone do not establish that these server protections exist.

Pending email links stay in sessionStorage until exchanged or definitively
rejected. With storage blocked, the original fragment is retained until exchange
succeeds and retry works in the current page. An issued session is verified on
the server; a temporary session-check failure retries that session rather than
exchanging the email link again. Blocked storage cannot preserve an issued session
across a full reload, so a buyer may need another sign-in link in that browser.
