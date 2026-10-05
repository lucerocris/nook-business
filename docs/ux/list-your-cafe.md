# List your cafe · UX research (2026-10-05)

Desk research and expert evaluation with partwise (`ux`): the logged-out steps
walked on the local business site (localhost:3001, 390px wide, then 1440), the
logged-in steps and the admin side read in the code, and all of it compared with
real flows from Refero. Not user research: nothing here says what owners felt or
did. Questions that need real people are at the end.

Limits of this pass: no account was created and nothing was submitted (the site
runs against production Supabase), so the form, the status page, the dashboard
and the admin screens were judged from code. Address search needs
`NEXT_PUBLIC_MAPBOX_TOKEN`, which is not set locally, and the
`20261004120000_list_your_cafe` migration is not applied, so a submission cannot
complete anywhere yet.

## Question

**Can a cafe owner whose cafe isn't on Nook get from the business site to a live
page without help, and where would they stall or give up?**

- **Product:** merchant onboarding for a listings app, like Google Business
  Profile, Yelp for Business, Airbnb hosting, Uber Eats merchant.
- **People:** independent cafe owners or managers in Cebu, mostly on a phone.
  *When my cafe isn't on Nook, I want to add it and prove it's mine, so people
  searching for a place to work or study can find it with the right hours and
  photos.*
- **Journeys:** (A) landing → not found → add → account → form → submitted;
  (B) DM the code from the cafe's Instagram → waiting; (C) admin approves the new
  listing, later publishes it; (D) owner after approval: checklist → Submit for
  review → live.
- **Evidence:** the running site (logged out); code in `nook-business`
  (`app/claim/*`, `app/components/claim/*`, `actions/listings.ts`,
  `components/owner/dashboard-client.tsx`, `actions/auth.ts`), `nook-admin`
  (`app/admin/claims`, `app/admin/cafes`, `emails/`), the migration in
  `nook-supabase`. **Analytics:** none for this flow; it isn't live, so there are
  no funnel numbers.

## Journeys today

Screens: [a1-no-match](list-your-cafe/a1-no-match.png),
[a2-account-gate](list-your-cafe/a2-account-gate.png),
[a3-register](list-your-cafe/a3-register.png). Scores are single-rater, 1 easy
to 3 hard enough to quit.

### A · Add the cafe

| # | Step | Score |
|---|---|---|
| 1 | Landing hero: search box. Typing a missing name opens "No cafes found. Try a different name, or **add your cafe to Nook**." The line under the box, "Can't find your cafe? **Ask us to add it**", still went to Instagram, and the FAQ said "Not from this site yet. Message us on Instagram" | 2 |
| 2 | `/claim/new` signed out: "Add your cafe to Nook. Create a free owner account first." Strip says **Find your cafe** · Verify · Go live. Nothing says the cafe's Instagram will be needed | 2 |
| 3 | Register: name, email, password (or Google). No strip, no mention of the cafe; reads like a detour | 2 |
| 4 | Email OTP, then back to `/claim/new` with the name filled in | 1 |
| 5 | Form: name, address (Mapbox search, must pick a result; map preview), neighbourhood (optional), Instagram, owner/manager. The address list closes when you Tab into it, and a search with no matches shows nothing at all | 3 |
| 6 | Look-alikes, if any: "This is mine" (claim instead) or "None of these, add …" | 1 |
| 7 | Redirect to `/claim/status` | 1 |

**Total 12.**

### B · Verify and wait

| # | Step | Score |
|---|---|---|
| 1 | Status page, step 2 "Waiting for your code": the code in a box and "Message @nook_cafefinder", which opened the Instagram **profile**. No Copy button, no expiry date, no hint to switch to the cafe's account | 2 |
| 2 | Owner switches account in Instagram, finds Message, types the code | 2 |
| 3 | Back on Nook nothing changes until an admin marks it "Under review"; the page doesn't say that's expected | 2 |
| 4 | Coming back later: logging in from the landing page sent someone with a claim and no owner row to `/` (the marketing page). The only way back was "Claim status" in the account menu | 3 |
| 5 | Rejected: "Not approved" with a generic line; the admin's reason only went by email | 2 |

**Total 11.**

### C · Admin review and publish

| # | Step | Score |
|---|---|---|
| 1 | Alert email "New cafe listing: …" → Claims queue; row tagged **New listing**; approve dialog shows the Instagram handle and code, and says the cafe stays hidden until published | 1 |
| 2 | Weeks later, owner presses Submit for review → alert email "Ready to publish" with a link to the cafe page | 1 |
| 3 | Without that email there was no way to find it: the Cafés list showed it as one more "Draft" among every draft | 3 |
| 4 | Cafe page: "Owner submitted this listing for review" card with **Publish**; owner gets "is now live" email | 1 |

**Total 6.**

### D · Set up and go live

| # | Step | Score |
|---|---|---|
| 1 | Approval email: "Your café claim has been approved … You can now manage your listing" (worded for a cafe that is already public), "Go to your dashboard", and "Questions? Just reply to this email" from a noreply address | 2 |
| 2 | Dashboard: "Finish your listing" checklist in order cover, hours, **menu highlights, tags**, description. Submit for review needs cover, hours and description, so working down the list puts two optional steps before a required one | 2 |
| 3 | "Ready to go live?" panel: disabled until ready, with the same fixed sentence naming all three requirements even when two are done | 2 |
| 4 | When all six steps are done, the checklist says "Nothing left to set up" while the page is still unsubmitted, and on a phone the side column (with Submit for review) drops below the stats | 3 |
| 5 | Submitted: "Sent Oct 5. We'll email you when … is live" | 1 |

**Total 10.**

### States

| State | A | B | C | D |
|---|---|---|---|---|
| Loading | shown (search, submit spinner) | n/a (server page) | shown (Publish…) | shown (Submitting…) |
| No results | shown on cafe search; **missing** on address search (fixed) | — | — | — |
| Validation error | shown (top-of-form alert) | — | — | shown |
| Server error | shown (generic) | — | toast | shown |
| Offline | cafe search says "check your connection"; Mapbox failure silent | not reachable | not reachable | not reachable |
| Undo | "Edit details" from look-alikes; **no way to fix a submitted listing** (e.g. a mistyped Instagram) | no cancel for a new listing | no unpublish from the card (status menu can hide) | — |

## How others do it

Sheets beside this file, `list-your-cafe/ref-*.png` (gitignored). Refero had no
Google Business Profile, Yelp or Uber Eats merchant flows, so these are the
closest real ones; all are desktop captures.

- **Add the business.** *Nextdoor* (business page): signed in already, one
  short form with category in a searchable modal, ownership as a one-line
  consent, publishes at once. *Klarna* (merchant onboarding): sign in first,
  named sections with a progress header, ineligible answers rejected early, a
  review-and-submit step, then "Application under review". *Square*: account
  first, then one question per screen, a searchable category list, an overview
  of choices, then the dashboard. **Pattern:** account before details, a short
  form, and an ending that says where the business now stands. **Split:**
  verify-then-publish (Klarna, Square) or publish on trust (Nextdoor).
- **Verify and wait.** *Airbnb* (address by mailed code): explains the three
  steps **before** asking, then "Your code is on the way" with an ETA and the
  **expiry date**, and the checklist row turns "In progress" in the place the
  host returns to. *Polar*: proof from public signals, a spinner with "one to two
  minutes", and the features approval unlocks shown but disabled. *Klarna*:
  "Checking your application", then "Under review" with a pointer to the email
  that will follow. **Pattern:** a named in-between status inside the product,
  plus the next channel or time. **Split:** only Airbnb gives a date; only Klarna
  has check-your-answers.
- **Set up and go live.** *Patreon*: a free-order checklist on the dashboard
  with Publish always visible, missing info asked for at the moment of
  publishing, then a share moment and a live dashboard. *Airbnb* listing: one
  question per screen with Save & exit, then an "Action required" banner and
  badge carry the host through the last steps. *Fourthwall*: one page with a live
  preview, AI-drafted description, "Publish now" / "Save as hidden". **Pattern:**
  draft and live kept apart, one clear publish action, the reason given for each
  requirement. None of them has Nook's human review after submit.

## Findings

Ranked by severity, then evidence. "Fixed" means changed in this pass, on
`feat/list-your-cafe`.

1. **Major · code · B4.** A returning owner can't find their claim. Logging in
   from the landing page (no `?redirect`) resolved owners to the dashboard and
   everyone else to `/`, so someone with a pending claim or new listing landed on
   the marketing page with no code and no status. Nothing emails them the code
   either. This is the step people come back for, days later, after switching to
   the cafe's Instagram. *Airbnb* keeps the "In progress" row where the host
   returns. **Fixed:** password and Google sign-in now land on `/claim/status`
   when the account has a pending or under-review claim (`lib/auth-landing.ts`).
2. **Major · code · D1.** The approval email for a new listing said "Your café
   claim has been approved … manage your listing", for a cafe that is still
   hidden, and never mentioned Submit for review. An owner who reads it as "I'm
   live" never comes back to finish. **Fixed:** for `is_new_listing` claims the
   subject is "… is verified: set up its page to go live" and the body lists the
   three steps (cover, hours, description → optional extras → Submit for review,
   usually within 2 working days); button "Set up your page". "Just reply to this
   email" (from noreply, no reply-to) now points to Instagram.
3. **Major · code · C3.** Submitted drafts were only findable through the
   "Ready to publish" alert email. If it's missed or `CLAIM_NOTIFICATION_TO` is
   unset, the owner's dashboard says "Nook is reviewing" indefinitely.
   **Fixed:** a **To publish** tab with a count on the admin Cafés list
   (draft + `review_requested_at`), and those rows read "Ready to publish"
   instead of "Draft".
4. **Major · code · D2–D4.** The checklist and the publish gate disagree. Optional
   steps (highlights, tags) came before a required one (description); when all
   six were done it said "Nothing left to set up" though the page wasn't
   submitted; and on a phone the Submit panel fell below the analytics once the
   checklist was complete. Goal-gradient: the finish line was hidden at the
   point of finishing. *Patreon* keeps Publish visible next to the checklist.
   **Fixed:** required steps first (cover, hours, description, then highlights,
   tags); the panel names only what's still missing ("Add opening hours, then
   send…"); the column stays first on a phone until a draft is submitted; the
   complete state says "Nothing left to set up before it goes live".
5. **Major · code · A5.** The address field can stall the form. It must be picked
   from Mapbox results, but a search with no matches showed nothing (no message),
   and Tab into the list closed it, so keyboard users couldn't pick at all
   (WCAG 2.1.1). New cafes in Cebu are often not yet a Mapbox place. **Fixed:**
   "No matches. Try your street name or a landmark next to the cafe, then pick
   it. We check the exact pin before your cafe goes live."; a confirmation once
   picked; the list stays open while focus is in it and picks on click (so
   Enter works). A "drop a pin" fallback followed (follow-up 2).
6. **Moderate · code · B1–B3.** The code hand-off was thinner than the existing
   claim flow's: no Copy, a link to the profile rather than the DM, no expiry,
   no word that the step changes only when the team sees the message.
   *Airbnb* gives the expiry date and what happens next. **Fixed:** new
   `CodeHandoff` on the status page with Copy, "switch to your cafe's Instagram
   account" in the instruction, `ig.me/m/nook_cafefinder` (opens the DM thread),
   "Send it by Oct 12", and "this step changes to Under review and we email you".
7. **Moderate · seen · A1.** The landing still sent "Can't find your cafe?" to
   Instagram, and the FAQ said adding a cafe wasn't possible from the site.
   **Fixed:** "Add it to Nook" → `/claim/new`; FAQ answer rewritten.
8. **Moderate · seen · A2–A3.** The account gate didn't say what the owner will
   need, so someone without access to the cafe's Instagram finds out after
   signing up; and register dropped the step strip and the cafe. *Airbnb*
   explains the steps before asking. **Fixed:** a "You'll need" box (address,
   access to the cafe's Instagram) on the gate; register and login keep the
   strip and say "Next, you'll add your cafe's address and Instagram"; stage 1
   reads "Add your cafe" in this flow.
9. **Moderate · code · B5.** A rejected owner saw "Not approved" without the
   reason the admin typed. **Fixed:** the reason shows on the status page.
10. **Moderate · inferred · C4.** Admin can only Publish. If the photos or pin are
    wrong there's no "send back with a note", so the owner sits on "Submitted
    for review" while the team messages them elsewhere. Not fixed (product
    decision). Built afterwards as Send back (follow-up 3).
11. **Moderate · inferred · A5.** A cafe with no Instagram has no way through the
    form; the hint only says the code goes through Instagram. Not fixed
    (deferred, follow-up 4).
12. **Minor · code · A, undo.** A submitted listing can't be corrected or
    cancelled by the owner (a mistyped Instagram handle means the DM never
    matches). The existing claim flow has "Cancel this claim". Cancel built
    afterwards (follow-up 5); editing is not.
13. **Minor · seen.** The account and claim pages showed a strip of the landing's
    dot lattice under the card on short pages (the shell stopped 72px short of
    the viewport). **Fixed:** plain white to the bottom.
14. **Minor · code · D1.** The checklist's first row says "Claim your café" for a
    cafe the owner added. Left as is.

Working well and worth keeping: the add link inside the no-match dropdown that
carries the typed name into the form; the duplicate check with "This is mine";
one open listing per account with a redirect to status; the status timeline;
the admin approve dialog's Instagram link and new-listing note; the Publish card
and the "is now live" email.

## Recommended flow

| Journey | Steps after this pass | Score before → after |
|---|---|---|
| A · Add | Search → no match → "add your cafe" (name carried) → gate with "You'll need" → register with the strip → OTP → form with address guidance → look-alikes if any → status | 12 → 9 |
| B · Verify | Status: Copy, open the DM, send by date, "changes to Under review" → returning login lands on status → rejection shows the reason | 11 → 7 |
| C · Admin | Claims (New listing) → approve → later, Cafés › To publish → cafe page → Publish | 6 → 4 |
| D · Go live | Email says what's next → checklist with the three required steps first → panel names what's missing and stays on top on a phone → Submit → "is live" email | 10 → 6 |

Single-rater scores, for comparing before and after only.

### Follow-up: decisions built (2026-10-05)

Four of the five recommendations were approved and built on
`feat/list-your-cafe`; the fourth (no-Instagram path) is deferred.

1. **Code by email.** `lib/claims/send-claim-code.ts` emails the owner their
   code when a claim or a new listing is created: the code, the steps (switch to
   the cafe's account, DM it), the `ig.me` link, "Send it by <date>", what
   happens next, and a link to `/claim/status`. Sent with `after()` from the
   same Resend setup and sender (`CLAIM_NOTIFICATION_FROM`) as the team alert;
   a failure is logged and never fails the submission. The status page and the
   claim page say the code was emailed too.
2. **Drop a pin.** Under the address search, "Can't find it? Type the address
   and place a pin instead" switches to a typed address plus a map
   (`app/components/claim/pin-picker.tsx`, mapbox-gl): tap to place, drag to
   adjust, or "I'm at the cafe, use my location". Tapping is the non-drag way
   (WCAG 2.5.7). The pin is checked against the RPC's Philippines box before
   submitting; city falls back to the RPC default and the team checks the
   details before publishing. The RPC's address messages no longer say "pick
   from the list". **The map tiles need `NEXT_PUBLIC_MAPBOX_TOKEN` too**, so
   without the token neither search nor the pin works (the form says so and
   keeps submit disabled, as before).
3. **Send back with a note.** In nook-admin, the "Owner submitted" card on a
   draft has **Send back** beside Publish: a note (required, up to 2,000
   characters) is stored in the new `cafes.review_note`,
   `review_requested_at` is cleared, and the owner is emailed the note with a
   link to the dashboard. The dashboard's panel shows "Nook asked for a few
   changes" with the note and a **Submit again** button; resubmitting clears
   the note. The admin cafe page keeps showing the note until resubmission.
   The owner column guard now also rejects owner-session changes to
   `review_requested_at` and `review_note`; only the business app's service
   role (resubmit) and admin write them.
4. **No-Instagram path: deferred.** Still open: decide what an owner without
   a cafe Instagram does (Facebook page message, a call, a permit photo) and
   say it in the form.
5. **Cancel a pending listing.** On `/claim/status`, a new listing that is
   pending or under review has "Made a mistake, like the wrong Instagram
   handle? Cancel this listing", with an inline confirm. The new
   `withdraw_cafe_listing` RPC withdraws the claim and sets the draft
   inactive in one transaction, which frees the one-open-listing slot; the
   owner lands on the form with the cafe's name filled in.

## Needs the token or the migration to verify

- The form end to end, the address hints, keyboard picking, and the pin map
  (tiles, tap, drag, use my location): need `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Submission, duplicates, the status page with a real code, the dashboard panel,
  the To publish tab, the approval email: need the migration. **Deploy order
  matters:** `/claim/status` selects `is_new_listing` and the admin Cafés list
  now selects `review_requested_at`; deploying either app before the migration
  breaks those pages.
- Code email, send-back email and note, cancel and resubmit: need the
  migration (`review_note`, `withdraw_cafe_listing`) and, for the emails,
  `RESEND_API_KEY`.
- `ig.me/m/nook_cafefinder` opening the DM thread in the Instagram app, on
  Android and iOS.

## To test with real people

| Question | Method | Task or prompt | Success |
|---|---|---|---|
| Do owners find "add your cafe" when search fails? | 5-person task test, phone, think aloud | "Your cafe isn't on Nook yet. Get it listed." Start at business.nookph.app | Reaches the form without help in under 2 minutes |
| Can owners send the code from the cafe's account? | 5-person task test with real owners | From the status page: "Send Nook your code." | Code arrives from the cafe account, not a personal one, first try |
| Is the address step a wall for new cafes? | 5-person task test | "Add your cafe's address." | A correct pin with no help; note every query typed |
| Does the approval email lead to setup? | Analytics (HEART: task success) | Goal: approved new listings get submitted. Signal: approval → `review_requested_at`. Events: `listing_submitted`, `listing_approved`, `review_requested`, `listing_published` with timestamps | Share submitted within 7 days of approval; median days approval → live |
| Where do owners stop? | Analytics funnel | Events: `claim_new_viewed`, `account_created` (with redirect), `listing_submitted`, `claim_under_review`, `claim_approved` | Drop-off per step, by device |
