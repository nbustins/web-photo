# Wedding invitation QR codes

Objective: let wedding admins prepare guest-specific QR codes for physical invitations. Branch: create a dedicated feature branch before implementation; current branch has another in-progress feature. Delivery: ask-on-risk (default). Runner: `npm run build`, `npm run lint`, and focused Vitest tests once the test harness is available.

## Specs

### S1 — Guest-specific invitation URL

The invitation URL includes the wedding slug and that invitation's existing code as a `code` query parameter. The URL shape follows the user's example, `http://localhost:5173/web-photo/#/weddings/carla-joel?code=GARCIA01`, but must use the real URL for the current deployment rather than localhost. Opening a QR link must take the guest directly to that invitation, without requiring manual code entry. Build URLs from the deployed app origin/base path and encode values safely; do not hardcode a host or create new invitation codes.

Acceptance: a generated link uses the deployed origin and configured app base path, identifies the right wedding and invitation, and its query code opens that invitation. Existing no-query/manual-code behavior remains unchanged. Check with focused URL-builder and guest-route tests plus build/lint.

### S2 — View and download one invitation QR

From a wedding in the admin panel, an admin can select a specific invitation, visualize its QR code and download that QR code for use in the physical invitation. Use the existing wedding slug and per-invitation code. Preserve the existing invitation details and link-copy behavior.

Acceptance: selecting one invitation renders a QR whose payload equals its S1 URL, and downloading it produces a usable image for only that invitation. Check selected-invitation behavior, QR payload, download action, and existing details/link-copy behavior with focused UI tests plus build/lint.

### S3 — Download every invitation QR for a wedding

From the wedding's admin panel, an admin can download a package containing a QR code for every invitation belonging to that wedding. Every QR uses its own invitation code and the same wedding slug/deployed app URL rules as S1.

Acceptance: one bulk-download action provides exactly one correctly named, readable QR image per invitation for the selected wedding, with no invitations from another wedding. The archive/file delivery format is an implementation choice. Check empty, single-invitation, and multiple-invitation cases, downloaded outputs, and each QR payload; run focused UI/utility tests plus build/lint.

### S4 — QR implementation and output quality

Select and document an appropriate React/browser QR-generation approach during implementation; no QR dependency is currently present in `package.json`. The QR output must remain readable when downloaded for use in a physical invitation, and each output must be identifiable by its invitation label.

Acceptance: record the chosen dependency and tradeoff in the implementation log and verify generated files decode to the intended URL. Check the download/view controls and generated QR payloads with focused component/output tests, plus build/lint.

## Tasks

- T1 — S1, S2, S3, S4; route: inline; status: not started; commit: pending. Add query-code deep linking, per-invitation QR view/download, and wedding-wide QR download using existing invitation data.

## Log

- L1 — User request (verbatim): "We need a feature where we can generate a QR code for each invitation. Once a wedding is created, admin will use its panel to visualize all inviitations and prepare physical invitations. We need to generate a QR where the code is directly added in the url (so one by each invitation). I know tehres a lib react qr I dont know if there are more optins but ask me any quesiton to prepar de ODD task (another agetn is workign for now just preapre the odd)"
- L2 — URL clarification (verbatim): "yes thats the idea is; http://localhost:5173/web-photo/#/weddings/carla-joel?code=GARCIA01 but not using localhost but real url"
- L3 — Physical-invitation workflow clarification (verbatim): "both, so download all directly given a wedding or select some specific invitation visualize it and download"
- L4 — Existing-code evidence: the admin dashboard already has invitation summaries with `inviteCode`, the wedding slug, and a selected-invitation drawer with a copy-link action. The public app uses `HashRouter`, and its guest page has a manual invitation-code entry. Reuse those existing data and flows; the new query parameter should bypass manual code entry for that invitation. No QR library is currently declared in `package.json`.
- L5 — Scope boundary: this document prepares the feature only. No implementation, dependency change, branch creation, or commit is authorized by this request. Forecast: approximately 250 authored changed lines, to be revised after implementation mapping; ask-on-risk delivery strategy remains the default.
