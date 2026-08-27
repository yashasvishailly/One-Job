# One Job

Public demo for The One Job skill package.

The One Job is a job-search operating system for non-linear operators looking for Chief of Staff, founder's office, GTM, growth, RevOps, international expansion, EIR, and first-generalist startup roles.

This public repo does not include the paid skill package. It shows what a good run should look like after the buyer installs the delivered Google Doc or private GitHub package.

## What The Skill Does

1. Starts with Prompt Zero and asks for the buyer's resume, profile, target roles, compensation floor, geography, industries, exclusions, browser access, LinkedIn/X access, and Gmail connection.
2. Runs a weekly sweep across company signals, founder posts, VC portfolio hiring, operator newsletters, talent networks, job boards, LinkedIn, and X.
3. Rejects weak fits instead of padding the list.
4. Names a real person for every network row or marks the contact gap.
5. Drafts specific hiring-manager outreach for the strongest leads.
6. Maintains a tracker across weeks and months.
7. Reads Gmail for sent mail, replies, recruiter updates, interview notes, application updates, rejection emails, and late outcomes.

## Demo Profile

This sample uses a fictional buyer:

| Field | Value |
| --- | --- |
| Name | Asha Mehta |
| Current lane | GTM and founder's office operator |
| Experience | 8 years across marketplace, SaaS, and AI startups |
| Target roles | Chief of Staff, Founder Office, GTM Strategy, Revenue Operations, International Expansion |
| Geography | India remote, Bengaluru, Mumbai, London remote, Singapore remote |
| Compensation floor | Must match senior operator scope |
| Exclusions | Pure EA roles, junior program manager roles, US-only onsite roles, unpaid fellowships |
| Platforms | Gmail, LinkedIn, X |

## Prompt Zero Intake

Before sourcing, the skill should ask:

```text
To run this properly, upload or paste your resume first.

Then answer these setup questions:
1. What role titles should I target?
2. What seniority level is too junior or too senior?
3. What is your compensation floor?
4. Which geographies are acceptable?
5. Which industries should I prioritize?
6. Which companies, industries, or role types should I exclude?
7. Can I use the browser for LinkedIn and X checks?
8. Is Gmail connected for sent-mail, reply, application update, rejection, and interview-status checks?
9. Where should I keep the tracker?

I will not start the weekly sweep until these are clear.
```

## Sample Weekly Output

Run date: 2026-08-28

Summary:

- 42 roles or signals reviewed.
- 6 passed the hard filters.
- 4 rejected for seniority mismatch.
- 11 rejected for geography.
- 9 rejected for compensation or scope mismatch.
- 8 rejected as weak or unverifiable hiring signals.
- 4 duplicates reconciled against the tracker.
- 2 outreach drafts prepared.
- 1 old rejection email matched back to a tracker row.

## Shortlist

| Rank | Company | Role | Decision | Contact | Why It Passed | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Northstar AI | GTM Enablement Lead, India Remote | Apply | Decision-maker not identified; apply through careers page | Strong GTM systems fit; AI company; India remote | No named hiring manager found |
| 2 | HorizonOps | Founder Office, Growth | Network | Maya Patel, Operations Lead | Founder post mentions hiring for a growth operator; strong marketplace plus GTM overlap | Compensation not public |
| 3 | FlowOps | Founder Office Strategy and GTM | Network | Arun Rao, VP Strategy | Public LinkedIn post asks for someone to own GTM experiments and founder-office projects | Needs seniority confirmation |

## Rejected Roles

| Company | Role | Rejection Reason |
| --- | --- | --- |
| Savi | Associate, Executive Team | Too junior and below target scope |
| Mesa School of Business | Program Manager, Growth | Good domain, but 3-6 year program role is too junior |
| Moneycorp | Strategy Associate | US onsite requirement |
| Example Ventures | Operator Fellowship | Unpaid fellowship; excluded |

## Hiring-Manager Drafts

### Draft 1: HorizonOps

Target: Maya Patel, Operations Lead

Channel: Email or LinkedIn

```text
Hi Maya,

I saw your post about HorizonOps looking for someone to own founder-office growth work.

My background sits close to that lane: marketplace growth, GTM systems, founder-led execution, and turning ambiguous operating problems into weekly pipeline.

One example: I helped scale a managed-account motion by tightening the operating cadence, account visibility, and follow-through between growth and delivery.

If useful, I can send a short note on how I would approach the first 30 days for this role.

Yashasvi
```

Why this draft is acceptable:

- Names a real person.
- References the specific hiring signal.
- Uses one relevant proof point.
- Does not pretend there is a formal job post.
- Leaves the final send decision with the buyer.

### Draft 2: FlowOps

Target: Arun Rao, VP Strategy

Channel: LinkedIn

```text
Hi Arun,

I saw your note about FlowOps needing someone across founder-office strategy and GTM execution.

That combination is where I have done my best work: turning unclear growth priorities into operating rhythm, experiments, partner motion, and follow-through.

I have worked across marketplace, SaaS, and AI-adjacent environments where the job was not just planning the GTM motion, but making sure it moved every week.

Open to a quick conversation if this is still active.

Yashasvi
```

## Tracker Update

The tracker keeps one row per lead and survives across runs.

| Row ID | Date Added | Last Seen Date | Company | Role | Contact | Channel | Applied Date | Outreach Sent Date | Reply Date | Outcome Date | Status | Follow-up Date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20260821-northstar-ai-gtm-enablement-lead | 2026-08-21 | 2026-08-28 | Northstar AI | GTM Enablement Lead | Decision-maker not identified | Application form | 2026-08-22 |  |  |  | Applied | 2026-09-05 | Seen again this week; not duplicated |
| 20260821-horizonops-founder-office | 2026-08-21 | 2026-08-28 | HorizonOps | Founder Office, Growth | Maya Patel, Operations Lead | Email |  | 2026-08-22 |  |  | Follow-up due | 2026-08-29 | One follow-up draft allowed |
| 20260821-flowops-strategy-gtm | 2026-08-21 | 2026-08-28 | FlowOps | Founder Office Strategy and GTM | Arun Rao, VP Strategy | LinkedIn |  | 2026-08-23 | 2026-08-27 |  | Replied |  | Reply found in LinkedIn |
| 20260514-exampleco-chief-of-staff | 2026-05-14 | 2026-05-14 | ExampleCo | Chief of Staff | Priya Shah, Recruiter | Email | 2026-05-15 | 2026-05-15 |  | 2026-08-23 | Rejected |  | Rejection email found three months later |

## Gmail Outcome Handling

Example Gmail finding:

```text
Subject: Update on your Chief of Staff application
Date: 2026-08-23
From: Priya Shah

Thanks for your interest. We have decided not to move forward.
```

Correct system behavior:

- Match the email to the existing ExampleCo tracker row.
- Set `Outcome Date` to `2026-08-23`.
- Set `Status` to `Rejected`.
- Stop follow-ups.
- Do not create a duplicate ExampleCo row.
- Mention the outcome in the weekly summary.

## Quality Bar

A result is not good enough when it says:

- "message leadership"
- "contact hiring team"
- "reach out to GTM leader"
- "apply if interested"

A result is good enough when it says:

- who to contact
- why that person is credible
- what signal made the lead real
- why the role passed
- what could still break the fit
- what draft should be sent
- what changed in the tracker

## What This Demo Proves

This demo shows the buyer experience the paid skill package should create:

- intake before action
- hard filtering before drafting
- named contacts where possible
- no hallucinated leads
- outreach drafts after filtering
- tracker memory across months
- Gmail rejection and application update handling

