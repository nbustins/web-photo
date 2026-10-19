# Feature: wedding-dto-real-contract

## Objective
Align the wedding frontend DTOs (types, services, MSW mocks) with the published
`wedding-manager-api` OpenAPI contract (`docs/openapi.json`), and render hotel info
as rich-HTML content instead of a boolean feature toggle. Branch:
`feature/custom-weddings`. Delivery: `ask-on-risk`. Test runner: none configured
(checks: `npx tsc -b`, `npm run lint`, `npm run build`, `bash tools/check-tokens.sh`).

## Specs
- S1 — Update the DTOs with `wedding-manager-api/docs/openapi.json`.
  - S1.1 `WeddingFeaturesDto` has only `transportToHotel`, `songRequests`, `allergens`. `hotelInfo` is NOT a feature toggle.
  - S1.2 `WeddingFeaturesContentDto` = `{ hotelInfo, introductionText, weddingPlace, schedule, donations, contact, songRequestsPhrase, transportToHotelPhrase }` (all nullable strings).
  - S1.3 `InvitationDto` = `{ id, label, inviteCode, maxAddedGuests, weddingTitle, eventDate, notes, guests, features, content, songRequests }` — no top-level `hotelInfo`, content is `content`.
  - S1.4 Admin reads (`WeddingSettingsDto`, `WeddingSummaryDto`) carry `{ features, content }`; `UpdateWeddingSettingsRequest` = `{ features, content }`; POST `/api/weddings` takes content inside the `wedding` JSON.
- S2 — "hotelinfo is now a string so is a new feature use GuestRichHtmlSection like other html rich string sections, now features that are just string do not use a boolean".
  - S2.1 `GuestFormFields` renders hotel info with `GuestRichHtmlSection` from `content.hotelInfo`; no `features.hotelInfo` gate.
  - S2.2 `HotelInfoSection` and its CSS are removed (superseded by `GuestRichHtmlSection`).
- S3 — The guest content fields are read from `invitation.content` with the real names (`introductionText`, `songRequestsPhrase`, `transportToHotelPhrase`).
- S4 — MSW fixtures/handlers mirror the real wire shape (no `hotelInfo` toggle; `content` object; phrases only when their feature is on; `hotelInfo` omitted on the public invite when unset and always present on admin reads).
- S5 — No behavior change beyond the contract alignment: the invitation (with all features on) still shows introduction, place/schedule, attendance, allergens, hotel info, transport, songs, notes, donations, contact.

## Tasks
- [x] T1 Types + services: realign `src/model/wedding.types.ts`, `guest-invite.api.ts`, `public-wedding.api.ts`, `admin-wedding.api.ts`. Route: inline.
- [x] T2 MSW mocks: realign fixtures + handlers. Route: inline.
- [x] T3 Guest components: `GuestFormFields` (+ `GuestConfirmationForm`), remove `HotelInfoSection`. Route: inline.
- [x] T4 Feature-gate constants (`WeddingManagerPage`, `WeddingsTab`) drop `hotelInfo`. Route: inline.
- [x] T5 Checks + independent verification. Route: delegated verification (PASS, 0 blockers).

## Log
- L1 (verbatim, 2026-10-19): " The task is update GuestFormFields with real dto.

- update the dtos with /home/nbustins/Projects/photo-project/wedding-manager-api/docs/openapi.json
- hotelinfo is now a string so is a new feature use GuestRichHtmlSection like other html rich string sections, now features
that are just string do not use a boolean"
- 2026-10-19: Contract read from `docs/openapi.json`. Style rule honoured: UI copy stays Catalan ("Allotjament", "Benvinguda", "Regals", "Contacte"); identifiers and comments English.
- 2026-10-19: Risk analysis: TypeScript catches type-level renames; the untyped MSW wire keys are the only regression surface → `Risk: item 6`, so T5 adds one independent verifier after the inline checks.
- 2026-10-19: T1–T4 implemented inline (parent). `WeddingFeatures` loses `hotelInfo`; `WeddingContent` replaces `WeddingGuestContent` with the real field names; `Invitation`/admin DTOs carry `content`; `createAdminWedding` puts content inside the `wedding` JSON; mocks mirror public (hotelInfo omitted when unset, phrases feature-gated) and admin (content always, hotelInfo null when unset) shapes; `HotelInfoSection` + CSS deleted.
- 2026-10-19: Inline checks — `npx tsc -b` exit 0; `npm run lint` exit 0 (0 errors, 4 pre-existing warnings); `npm run build` exit 0 (pre-existing large-chunk warning only); `bash tools/check-tokens.sh` OK (82 tokens).
- 2026-10-19: T5 independent verification (gentle-ai-verify, read-only, runtime MSW probe): PASS, 0 blockers, all S1.1–S5 met. Advisory: hotel HTML loses the deleted `HotelInfoSection.module.css` heading/list/link typography (browser defaults now) — intentional per S2.2, one-line CSS follow-up if the user wants it restored. Reviewer scratch removed.
- 2026-10-19: Test-first exception: no test runner exists in this repo (`package.json` has no test script), so no RED/GREEN; evidence is typecheck + build + lint + tokens + the verifier's runtime probe. Regression tests were proposed by the verifier but not written (would require adding Vitest), per the documented no-runner exception.
- 2026-10-19: No commit created; repo convention requires asking first.
