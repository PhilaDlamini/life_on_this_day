# Life on This Day

## Purpose and Agreed Scope

A personal, public diary inspired by https://jero.zone/photos. Anyone with the
link can read it without signing in. The owner posts from a phone. There is no
daily posting obligation, streak, engagement score, or requirement to photograph
other people. An ordinary day is worth keeping.

Each local calendar date has at most one entry: a photo OR text OR an audio memo.
Formats are never combined. The current Pacific date is selected automatically;
backdated and future publication are not allowed. The date,
formatted YYYY-MM-DD, is the entry's database key; do not derive a local day from
UTC using toISOString(). Published entries are final: no editing, format
replacement, or deletion through the app or client SDK. A selected photo may have accessibility alt text, not a separate
written diary entry.

## Working Agreement

Build one small, understandable step at a time. Explain changes before making
them and give Phila a reviewable local result before moving to the next stage.
Favor straightforward React and Firebase SDK calls. Avoid speculative features,
extra infrastructure, large abstractions, and a disproportionate test suite.
This is a separate project from ../pbj-auction; do not change the auction app.

## Stack

- React + Vite for the calendar, entry viewers, and eventual phone editor.
- Firebase Realtime Database for entries, not Firestore.
- Firebase Storage for photos/audio, not GitHub media storage.
- Firebase Authentication with Google sign-in for one owner. No public signup,
  account profiles, user-management features, or manually maintained secret token.
- GitHub Pages for the React website; media remains in Firebase.
- Firebase Analytics is optional and omitted initially.
- One callable Firebase function enforces owner-only publishing for the current
  Pacific day; all direct client database writes are denied.

## Firebase Project Provided by Phila

This browser configuration is public project identification, not a write-access
credential. Permissions must be enforced with Database and Storage rules.

```js
const firebaseConfig = {
  apiKey: "AIzaSyC5NCmGOvcvIF2f6cQejlzoatWE3hl9fZA",
  authDomain: "lifeonthisday-4d69a.firebaseapp.com",
  projectId: "lifeonthisday-4d69a",
  storageBucket: "lifeonthisday-4d69a.firebasestorage.app",
  messagingSenderId: "651511248387",
  appId: "1:651511248387:web:044944ea9d0695840e8036",
  measurementId: "G-0CH6PCEG48"
};
```

Before enabling real writes, create/confirm the Realtime Database and obtain its
databaseURL, enable Google sign-in and authorized domains, identify the owner's
Firebase UID, and confirm Storage is enabled. Storage requires a billing-enabled
Blaze plan; applicable free allowances do not guarantee zero cost forever.

## Public Experience

- The archive is the first screen, with a daily rotating title prominent.
  Rotate through As It Was, In Passing, Here, Lately, Small Hours, Day Notes,
  Of Late, For the Record, Passing Through, Still Here, A Few Things, and
  Life on This Day.
  The visitor's local calendar date determines the title, so reopening or
  refreshing on the same day keeps it consistent; the cycle repeats after eleven days.
- Vertically scrolling calendar, current local month first, then earlier months
  with entries in reverse chronological order. Skip empty past months and always
  display at least the current month. Mobile responsive, neutral empty days.
- Entry labels are “In words” (text), “In voice” (audio), and “In light”
  (photo), shared across viewers, previews, mobile rows, and the calendar legend.
- Text entries use simple black sans-serif text on white, including the viewer.
- Photo thumbnails open an uncropped full-image viewer.
- Text excerpts open the full text.
- Audio indicators open a player with play/pause, seeking, and duration.
- Audio never autoplays. Media viewers support close, keyboard navigation,
  accessible labels, and proper focus handling.
- Clean calendar lines, expressive type, restrained accent colors, and thoughtful
  interactions. No dashboard, marketing landing page, or social engagement UI.
- The public link can be forwarded. Discouraging indexing is not access control.

## Owner Editor (Later Checkpoints)

Open the editor in Safari or Chrome, sign in with Google, choose a date and one
format, add content, preview, publish. Photo and audio use the native file picker.
Start with uploaded audio recordings; direct microphone recording is a later
optional feature, not part of the first version.

Publishing asks for final confirmation. Existing dates cannot be edited,
replaced, or deleted, even by the owner. Add private drafts separately after core publishing works. Draft
records AND draft media must stay inaccessible to public viewers.

## Database Shape

```json
{
  "posts": {
    "2026-10-19": { "type": "photo", "photoURL": "https://..." },
    "2026-10-20": { "type": "text", "text": "Something worth remembering." },
    "2026-10-21": { "type": "audio", "audioURL": "https://...", "duration": 30 }
  }
}
```

Database rules enforce one matching content field per type. Only the owner's UID
may write. Public reads apply to published posts, not the database root. Private
drafts, when implemented, use drafts/{ownerUID}/{date} and owner-only media paths.

## Saving, Media, and Reliability

- Upload a photo/audio file, then save its URL to the database. Text saves directly.
- Show upload/save progress; announce success only after all required saves finish.
- Keep form input after errors so the owner can retry.
- Create only on an empty date; never change an existing published post.
- Resize/compress photos before upload; use efficient thumbnails and lazy loading.
- Fetch entries by month and fetch audio only when needed.
- Later add an export of entries and media for an independent archive copy.

## Checkpoints

1. REVIEWED AND APPROVED: Save this plan, create the standalone project, and build the local
   calendar with one sample photo, text, and audio entry. Review desktop/mobile
   appearance and viewers. No Firebase connection, login, or editor yet.
2. BUILT: Firebase reads and owner-only Google sign-in; verify permissions.
   Authorized by Phila on October 19, 2026; see checkpoint 2 status below.
3. Text publishing and date editing; review from a phone.
4. Photo upload, compression, previews, and reliable save behavior; review.
5. Audio upload/playback; review.
6. Private drafts and export in small individual steps. Published moments remain final.
7. Verify the complete experience and deploy when explicitly requested.

## Verification

Keep checks focused: one-entry-per-date/type validation, reliable saves,
unauthorized-write rejection, private draft access, and real mobile media playback.
Use emulators for write/rule checks when Firebase is introduced. For checkpoint 1,
build and manually/browser-check month changes, empty months, each viewer,
keyboard/focus behavior, and desktop/mobile layout. Do not introduce a full test
framework until the behavior warrants it.

## Checkpoint 1 Status

Built and reviewed on October 19, 2026. Phila authorized checkpoint 2 after the
visual revisions and code walkthrough. The notes below describe checkpoint 1.

- Standalone React + Vite project in life_on_this_day; the auction repo is clean.
- Original illustrative entries on October 17, 18, and 19, 2026, plus fictional
  text samples on September 6 and July 12 to demonstrate scrolling.
- Scroll through the current month and populated past months; empty August is
  skipped. An empty archive still shows the current local month.
- Text excerpts and the full viewer use plain black sans-serif text on white;
  the approved voice memo styling is preserved.
- Full-image, full-text, and native audio viewers; audio is never autoplayed.
- Escape closes and returns focus; arrow keys navigate entries.
- Browser checked at desktop, 390px mobile, and 320px small-mobile widths.
- Sample audio loaded successfully (14.16 seconds) and playback time advanced.
- Production build passed. No test framework, Firebase SDK, or cloud connection.

Demo content is illustrative, not Phila's personal diary. The photo is from
Unsplash and the voice memo is synthesized; provenance is recorded in README.md.
The archive is labeled as a sample; viewer captions are omitted per Phila’s review. No cloud resources
have been changed. Next: review appearance and interactions, then configure
Firebase reads and owner Google sign-in as a separate checkpoint.

## Checkpoint 1 Review Revisions — October 19, 2026

Phila requested scrolling through recent and previous months, skipping empty
months while always showing one, and simple black text like Twitter. Implemented
as a current-month calendar followed by earlier populated months, with static year
labels replacing the month arrows/year selector. Mobile entry rows use each
entry's actual month and text. Voice memo styling and controls are unchanged.

Verification: production build passed; date-helper checks cover an empty archive,
empty current month, skipped months, year boundaries, and leap February. Browser
checked at desktop, 390px, and 320px widths, including text styling, audio metadata
and no autoplay, cross-month keyboard navigation, and Escape/focus restoration.
Still checkpoint 1: Firebase and subsequent checkpoints require separate review.

Phila also requested removing captions from viewer mode to keep it understated.
Removed the sample/provenance captions from all viewers; entry navigation remains.

Phila requested rotating through the ten suggested titles, limited to one daily.
The masthead, browser tab, and footer now share a title selected by local date.
The serif typography and italic accent remain. The project folder retains its
original name. This is a local checkpoint 1 design revision.

## Checkpoint 1 Code Organization Review

Phila authorized the proposed cleanup before Firebase. App now composes the page
and owns entry data and selection. Reusable components live in src/components
with adjacent CSS; sample content and labels live in src/data; pure date and
title calculations live in src/utils. Components accept entry data through props.
Waveform amplitudes belong to the sample audio entry, not a viewer-level import.
Dialog focus, keyboard handling, and scroll cleanup live together in EntryViewer.
Comments explain date handling, callback flow, and cleanup. WALKTHROUGH.md follows
startup, calendar rendering, one entry click, and dialog closing, with an edit map.

Verification: production build and seven Node date/title tests pass, including
runs under America/Los_Angeles and Pacific/Auckland. Browser reviewed desktop,
390px, and 320px layouts; photo containment, plain text, no captions, audio loading
and playback without autoplay, mobile selection, cross-month keyboard navigation,
and Escape restoring focus and scroll behavior. No Firebase or other checkpoint
2 work was added, and pbj-auction was only read for structural reference.


## Checkpoint 2 Status — October 19, 2026

Phila explicitly authorized Firebase wiring and selected [owner Google account] as
sole owner. Firebase SDK is installed; Analytics is omitted. React still uses
small components, with src/firebase for SDK calls and src/hooks for lifecycle.

- Default Realtime Database is active in us-central1:
  https://lifeonthisday-4d69a-default-rtdb.firebaseio.com
- Google sign-in succeeded in the local app at http://localhost:5174/.
- Admin lookup confirmed verified [owner Google account] with Google provider and
  UID sieqz9C2ZGW9xrMKlhgj0jO543X2. That public UID is pinned in config and rules.
- Database rules were tested in the emulator, then released only to this project.
  Public reads apply to posts; root/private paths are denied. Writes require the
  owner's UID, verified email, Google provider, and one matching content format.
- Live anonymous checks confirmed posts reads succeed (empty), while root and
  drafts return permission denied. No production diary entries or test payloads
  were written. Sample fixtures remain local and are not shown as real entries.
- Archive dates are discovered using a shallow read; SDK queries load/listen by
  month. Request/listener cleanup, loading, read errors, timeout, and retry are
  handled in useArchive. New older-month discovery occurs on reopening/retrying.
- Owner sign-in is separate from public reading. Other Google accounts are signed
  out by the app; server rules independently reject their writes.
- Nine offline date/content tests and six emulator permission tests passed.
  Build passed; npm audit reports no vulnerabilities after a compatible gRPC
  transitive dependency override. Browser verified the actual owner session and
  the live empty archive. Emulators required a temporary Java 21 runtime; the
  repository's normal rules command expects Firebase CLI and Java 21+ on PATH.
- Storage has no bucket yet and was not initialized or billed. Uploads are not
  part of this checkpoint. No website deployment, editor, or publishing UI added.

Next checkpoint, after Phila's review: text publishing and date editing. Google
sign-in uses localhost for local work; any additional hostname needs to be in
Firebase Authentication's authorized domains. Email/Password was enabled during
manual setup but is unused by the app and cannot satisfy the Google-only rules.

## Tonight’s usable release — authorized October 19, 2026

Phila explicitly expanded the next step to a usable editor, git push, and GitHub
Pages publication tonight. Implement text publishing first, then photo/audio
uploads, and validate before release. Audio maximum is 60 seconds; resize and
compress photos in the browser before uploading to reduce data usage. Preserve
the one-format-per-date rule and existing entries on failed saves. Billing
activation and a public repository decision are awaiting Phila; independent
implementation and emulator testing can proceed meanwhile. Private drafts,
export, and direct microphone recording remain outside this release.


## Usable Release Preparation

Phila enabled Blaze/Storage and authorized a public repository at
https://github.com/PhilaDlamini/life_on_this_day and GitHub Pages publication.
The temporary open Storage rules were replaced with permanent owner-only write
rules; downloads are public only under published/. Rules deny object listing,
private paths, and in-place overwrite. Date entries enforce one matching format,
photo thumbnail/alt fields, and audio duration of at most 60 seconds.

The owner editor supports text, photos, audio, date selection/backdating, local
previews, replacement confirmation, and editing from a viewer. Photos are resized
to a 1,600-pixel long edge and re-encoded JPEG without original EXIF/location data,
targeting 600 KB (hard cap 800 KB), plus a 360-pixel thumbnail capped at 100 KB.
Audio is decoded locally and limited to 60 seconds and 5 MB; it is not transcoded.
Storage enforces byte/MIME limits but cannot verify decoded duration independently.

Uploads finish before a database transaction changes the entry. Transaction
conflicts and failed saves preserve the previous record. The editor keeps input
on failure. New failed uploads and obsolete media are cleaned up best-effort;
interrupted cleanup can leave unused files. Saving refreshes archive discovery.
No private drafts, deletion UI, direct microphone recording, or export added.

Checks: eleven offline tests and ten database/Storage emulator tests pass,
including unauthorized writes, file limits, transaction conflicts, and preserving
an original after a failed save. Browser checked text preview, compressed photo
(287 KB total for the illustrative sample), rejecting a 61-second file, and a
valid 14.16-second recording without autoplay. None was published to the diary.

The initial repository push and Pages workflow are being prepared. Target site:
https://philadlamini.github.io/life_on_this_day/. That domain and local 127.0.0.1
were added to Firebase Authentication's authorized domains. Git commits use
Phila's GitHub noreply address. Public Firebase identifiers are not credentials.

## Release Verified — October 19, 2026

Code committed and pushed to main in the approved public repository. GitHub Pages
workflow run 39364928173 completed successfully (install, offline tests, build,
and Pages deployment). Production site verified at:
https://philadlamini.github.io/life_on_this_day/

The production calendar loads the real empty database, Google sign-in succeeds
for the owner, and Add an entry opens the editor from its separate production
bundle. Sign-in needed a retry once after a transient network error. Media/date
validation, transactions, and storage limits were verified locally and in the
emulators; no fictional entry or test media was published to the live diary.
Database and permanent Storage rules are released. The next action is Phila's
first real entry, through the deployed owner editor. No website approval or
billing step is still pending for this release.


## Editor style revision

Phila requested a less boxy editor using the warm rust accent from the title.
The editor now uses an open writing area, understated date/input underlines,
text tabs with a rust selection underline, a softer paper-colored dialog, an
italic rust heading accent, and a rounded rust Publish button. Upload and save
behavior is unchanged.


## Editor color refinement

After publishing the first real entry, Phila requested the editor heading entirely
black and upright, with the green Publish button restored. Rust remains the
accent for selected format tabs and focus indicators.


## Time capsule and mobile refinement — October 19, 2026

Phila requested square calendar cells/photos, with mobile as the priority,
rounded viewer photo corners, and permanent entries. This supersedes the earlier
editing/replacement workflow recorded above. Every calendar cell now uses a
1:1 aspect ratio at all widths; phone indicators fit the smaller squares. The
viewer keeps the full uncropped image with rounded corners and a small gutter.

Edit entry is removed. The editor blocks occupied dates and confirms that a
publication is final. Transactions create only on an empty date. Database rules
deny overwrites, nested edits, format replacement, and deletion even for the
owner. Storage also denies replacement/deletion of existing media. Failed or
interrupted publications can leave unreferenced files for administrator cleanup;
the client cannot delete them. Firebase console/admin access bypasses client
rules and remains an administrative escape hatch. No real entries were changed
for verification.

Verification: eleven offline tests, twelve database/Storage emulator tests, and
the production build pass. Tests cover nested owner edits/deletes, concurrent
publication, and immutable media alongside existing permission and size limits.

Browser reviewed at 1280px desktop, 390px phone, and 320px small phone. Phone
cells measure 50×50px and 40×40px respectively, without horizontal overflow.
The real photo remains uncropped in the rounded viewer; the owner editor blocks
its occupied date. Database and Storage rules deployed successfully to
lifeonthisday-4d69a. No production test entry was submitted.

Released as commit a703cea; GitHub Pages run 39366877541 succeeded. The deployed
390px calendar was verified at 50×50px per cell with the original photo present.


## Footer authorship

Phila requested replacing the rotating title in the footer with
“Phila Dlamini * 2026”. Keep the existing star styling and the line
“A few things I didn't want to forget.” The masthead still rotates daily.


## Remove duplicate mobile entries

Phila found the list beneath each calendar redundant. Removed the mobile entry
list and its unused component/styles. Populated calendar cells are the single
entry point on all screen sizes; tapping one opens the existing viewer. This
supersedes the earlier mobile summary-list design.


## Mini-highlight from the archive

Phila refined the duplicate-list removal: show up to five randomly chosen
entries as a small “From the archive” highlight beneath the full calendar
archive, on phones and larger screens. Pick from all loaded months, without
repeats; keep the selection stable while browsing, and reshuffle on reopening
or refreshing. Fewer than five entries means showing the available entries;
an empty archive has no highlight section. Each row opens the existing viewer.
The old per-month exhaustive mobile lists remain removed.

Phila requested a quieter “From the archive” label: match the introduction
subtitle's muted sans-serif styling, 14px on larger screens and 12px on phones.


## Footer star alignment

Phila requested vertically centering the footer asterisk between the name and
year. Lower the raised glyph by 3px while preserving its rust color and spacing.


## Today-only publishing — October 19, 2026

Phila requested removing date selection and allowing only one final entry for
today. Phila selected Los Angeles / Pacific time (`America/Los_Angeles`) as the
fixed journal timezone. This supersedes all earlier backdating/date-selection
plans. The owner editor shows a read-only Today/date line, updates over midnight,
and blocks an occupied day with “Today’s moment is already kept.”

Realtime Database rules cannot derive a timezone-aware civil date from server
time. A small Node 24 callable `publishEntry` now applies that policy using its
server clock. It verifies the Google owner UID and email, validates content,
rejects backdated/future keys, and creates only on an empty day atomically. The
transaction rechecks the day across retries. All direct client database writes
are denied. Content validation and Pacific day calculation are shared between
browser and server under functions/shared; the server adapter and publishing
policy remain small separate modules. Existing entries are untouched.

Function configuration: us-central1, zero minimum instances, one maximum
instance, 128 MiB, fractional CPU, and a 30-second timeout. Blaze was already
enabled. Storage permissions and file limits remain unchanged. Calendar month
discovery also follows Pacific time so travel cannot hide today's month.

Verification: seventeen offline tests pass, including Pacific midnight, DST,
authorization, date policy, and all formats. Eleven emulator tests pass, including
real callable requests, rejection of direct owner writes, and concurrent
submissions that keep exactly one moment. Production build passes. No test entry
or media was published to the live diary.

Release: callable publishEntry and deny-all client database writes deployed
successfully. Live unauthenticated callable requests return permission denied.
Commit a5a2939 pushed; Pages run 39368918957 succeeded. Function build images
receive a one-day Artifact Registry cleanup policy; diary media is unaffected.


## Calendar line contrast

Phila requested slightly darker calendar lines while keeping the quiet
gray-green tone. The grid now uses its own #bcc4b9 line color; shared page
dividers retain their existing styling.


## Mobile text excerpts and inline formatting — October 20, 2026

Phila requested actual text instead of quote icons in mobile calendar tiles,
and the ability to apply bold, italic, and underline to selected runs while
composing an entry. Text tiles now retain a compact two-line excerpt on phones.

A small Tiptap editor, loaded only with the owner editor, handles selection,
inline marks, paragraphs, and undo/redo. Only bold/italic/underline are enabled.
A portable textRuns array stores nonempty strings plus optional true-valued
bold/italic/underline flags; concatenated runs must exactly match the plain text.
Both server and reader validate this shape. No raw HTML is stored or rendered.
FormattedText renders escaped React text and semantic strong/em/u elements in
tiles, highlights, previews, and the full viewer. Existing plain text entries
need no migration. One entry per current Pacific day and permanent publishing
remain enforced. Formatting is for new entries; existing entries are unchanged.

Verification: twenty offline tests and eleven emulator tests pass. Callable
round-trip tests preserve all three styles and reject mismatched runs. Browser
fixture tests selected-word styling, combined styles, undo/redo, editor remount,
viewer rendering, and 390px/320px mobile excerpts. The fixture is separate from
Firebase and cannot publish. Production build passes; no live diary data changed.

The shared DM Sans font request includes real italic faces at weights 400–700;
font synthesis is disabled, so semantic em tags alone were insufficient. This
keeps italic and bold-italic text visibly correct in both editor and reader.

Release verified: publishing function update succeeded; commits b6b5d4c and
6624304 pushed, with successful Pages runs 39527095527 and 39527311201. The
mobile excerpt and shared renderer were checked locally at 390px and 320px.
No live entry was created or modified for testing.


## Formatting toolbar visual refinement — October 20, 2026

Phila requested the original Publish button and Apple Notes-style B/I/U controls.
The production Publish button already retained its original green pill styling;
a plain control in the earlier screenshot belonged to the isolated test fixture.
The toolbar now uses one compact warm-gray segmented group, consistent Lucide
icons, black emphasis, and a subtle paper-colored selected state. The original
“Whatever stayed with you.” placeholder returns, and formatting instructions
remain accessible without adding visible clutter. Publishing behavior and
formatting persistence are unchanged. Verify using the real composer component
inside a local fixture that intercepts form submission.


## Canonical runs-only text storage — October 20, 2026

Phila authorized switching to one canonical list of runs instead of duplicating
text in `text` and `textRuns`. New text entries now store only `{type:"text",
runs:[...]}`. Plain text is derived when required. The owner editor also stores
only the runs array in state. The publisher validates and merges adjacent runs
with identical marks, and normalizes submissions from older cached clients.

The reader supports existing plain `text` and `text` plus `textRuns` entries.
No existing diary record is rewritten and no database-console action is needed.
This supersedes earlier descriptions of the text-plus-formatting storage shape.
The UI, formatting controls, Pacific date policy, and immutable entries remain
unchanged. Checks: twenty-one offline tests, eleven emulator tests, and the
production build pass, including canonical storage without duplicate fields
and preserved formatting for both legacy and current client submissions.

## Title emphasis — October 22, 2026

Phila requested choosing emphasis per title. As It Was, In Passing, Here,
Lately, For the Record, and Still Here retain their final word in the rustic
italic accent. Small Hours, Day Notes, Of Late, Passing Through, and A Few
Things render entirely upright in the normal black heading color. The ordered
title data records each accent explicitly; the daily rotation is unchanged.

## Viewer close button — October 22, 2026

Phila requested removing the rust border around the entry viewer's X. Replace
the shared focus outline on this button with a soft neutral circular background,
keeping keyboard focus visible and the existing native dialog focus behavior.

## Permanent browser title — October 22, 2026

Phila selected the original “Life on This Day” as the permanent browser title
for recognizable tabs and bookmarks. Keep the existing index.html title and
remove the React effect that replaced it with the rotating heading. The visible
masthead continues its daily rotation and per-title emphasis.

Phila also approved adding “Life on This Day” to the end of the visible title
rotation. The rotation now repeats every eleven
days; the permanent browser title remains unchanged.

Phila refined this title's treatment to “Life on This *Day.*”, with Day in the
same rustic italic accent used by the other emphasized titles.

## Full-screen photo viewing — October 27, 2026

Phila approved tapping the photo inside an entry dialog to expand it into a
dark, viewport-filling photo view. Reuse the native dialog for focus trapping
and scroll locking; keep the image uncropped. The full-screen X shares the
entry close button's icon size and neutral circular treatment. X or Escape
returns to the entry and restores focus to the photo; another Escape closes
the entry and restores the calendar button. Navigating to another date or
closing the entry clears expansion. No Firebase or publishing changes.

Verified the expanded photo, matching close control, and focus restoration on
desktop and a 390px phone viewport. Offline checks and production build pass.
