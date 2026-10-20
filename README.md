# Life on This Day

Read [PLAN.md](PLAN.md) before continuing work. [WALKTHROUGH.md](WALKTHROUGH.md)
explains the components and data flow.

## Using the journal

Published site: **https://philadlamini.github.io/life_on_this_day/**

Sign in with your owner Google account, choose **Add an entry**, select a date and
one format, preview, then **Publish**. Confirm that the moment is final: published
entries cannot be edited, replaced, or deleted. Choose an empty date to keep
another moment. Failed saves retain the form and leave existing entries intact.

- **In words:** up to 20,000 characters.
- **In light:** choose a photo up to 20 MB. The browser resizes it to at most
  1,600 pixels on the long edge, re-encodes JPEG without original EXIF/location
  metadata, and targets 600 KB or less. The hard cap is 800 KB, plus a 360-pixel
  calendar thumbnail capped at 100 KB. Smaller photos are never enlarged.
- **In voice:** upload an existing recording, up to 60 seconds and 5 MB. The app
  decodes the selected file to check duration. M4A and MP3 are recommended.
  Audio is not transcoded; export a compact recording if the source exceeds the
  size cap. Direct microphone recording is not part of this version.

“From the archive” beneath the calendars shows up to five randomly picked
entries, stable while browsing and reshuffled when reopening/refreshing.

Visitors read without signing in. Entries and media are public when published.
Private drafts and an export tool remain later work. A one-minute
limit is enforced by the owner editor's decoded-audio check and database duration
validation; Storage rules enforce file size/type and cannot independently decode
an audio file to verify its claimed duration. No Cloud Functions are involved.

```sh
npm install
npm run dev
npm run build
npm test
```

Use the localhost URL/port printed by Vite. Production deployment uses a Pages
base path; local development uses `/`.

## Firebase setup

- Project: `lifeonthisday-4d69a`.
- Database: `https://lifeonthisday-4d69a-default-rtdb.firebaseio.com` (`us-central1`).
- Owner Firebase UID `sieqz9C2ZGW9xrMKlhgj0jO543X2`.
- `src/firebase/config.js` contains the public SDK configuration and owner UID.
- `database.rules.json` enforces the same UID, verified email, and Google provider.
- Google Authentication is enabled. The app does not use Email/Password or Analytics.
- Firebase Storage is enabled on Blaze. `storage.rules` restricts uploads to the
  verified Google owner, with public downloads only under `published/`. Listing,
  private paths, overwriting existing objects, and deletion are denied.

The client owner check controls UI. Database rules enforce permissions independently.
Only `/posts` is publicly readable; root reads and drafts are denied. Entry writes
require an empty date, the owner, and a single matching text/photo/audio payload. Dates must have
an ISO-shaped key; the reader also checks that they represent real calendar dates.
Unknown fields and mixed formats are rejected. Updates, nested changes, and
deletion are denied even for the owner. Console/admin access bypasses client
rules; it can still perform deliberate administrative changes. Failed/interrupted
media publication may leave unreferenced files requiring administrator cleanup.

To deliberately release a reviewed database-rule change, scope the CLI command:

```sh
firebase deploy --only database,storage --project lifeonthisday-4d69a
```

This releases database and Storage rules, not the website. Do not upload the sample diary to
the production database. Avoid unscoped deploy commands.

## Reading and authentication

The archive first requests shallow `/posts` keys, then uses Firebase SDK range
queries and listeners for the current and populated past months. Listeners and
pending requests are cleaned up on unmount/retry. Loading, timeout, and retry
states keep a read failure distinct from an empty journal. Date discovery happens
on opening/retrying; new entries in an already subscribed month update live. A
newly populated older month appears on reopening/retrying the archive.

The owner button opens Google sign-in and checks the returned UID. Other accounts
are signed out and cannot write under the rules. Refreshing restores the normal
Firebase Auth session. Basic flow follows the official
[Google sign-in guide](https://firebase.google.com/docs/auth/web/google-signin).

## Checks

`npm test` runs thirteen offline date/content/media-limit/highlight tests. Emulator-only rule tests are
explicitly skipped in that command. With Firebase CLI and Java 21+ on PATH, run:

```sh
npm run test:rules
```

This starts a database and Storage emulators under **demo-life-on-this-day** and runs twelve
permission/schema/publishing tests. All writes in these tests target the emulator, never
the live journal. Coverage includes public reads, denied private/root reads,
unauthorized writes/deletes, valid owner writes, malformed payloads, and denied
unverified or non-Google owner sessions. See Firebase's
[rules testing guide](https://firebase.google.com/docs/rules/unit-tests).

For manually using local emulators, copy `.env.example` to `.env.local`, set
`VITE_USE_FIREBASE_EMULATORS=true`, start `firebase emulators:start --only auth,database,storage`,
and restart Vite. That namespace is separate from the test runner's demo namespace.
Remove the flag afterward. Production builds ignore the emulator flag.

## Codebase

- `src/App.jsx`: selected date and page composition.
- `src/components/`: React components with adjacent stylesheets; `editor/` is
  loaded only when the owner opens the editor.
- `src/hooks/`: archive loading and owner authentication state.
- `src/firebase/`: SDK configuration, reads, Google sign-in, transactional saves,
  upload progress, and create-only publishing.
- `src/data/`: title options, entry labels, and retained sample fixtures.
- `src/utils/`: local calendar, title, date-formatting, and remote-entry validation.
- `src/styles.css`: global theme, layout, and accessible controls.
- `tests/`: offline date/content checks and isolated database-rule checks.
- `public/samples/`: retained local demo media, not rendered by the live archive.

## Sample media provenance

The retained samples are fictional, not Phila's diary:

- Photo: Unsplash image `photo-1501594907352-04cda38ebc29`, originally downloaded
  from https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=85
- Audio: synthesized with the macOS Samantha voice. Waveform data reflects it.
- Text: fictional sample content.

The auction repository has not been modified.


## Releasing changes

The GitHub Actions workflow in `.github/workflows/pages.yml` installs dependencies,
runs offline tests, builds with `/life_on_this_day/` as its base path, and publishes
the artifact to GitHub Pages on application pushes to `main`. Documentation-only
pushes do not rebuild the site. Firebase rule changes require their separate
scoped release command above; the website workflow does not deploy cloud rules.

Before a release, run `npm test`, `npm run test:rules`, and `npm run build`.
A local Pages-path smoke build is `BASE_PATH=/life_on_this_day/ npm run build`.
No Firebase admin credentials or GitHub tokens belong in this repository. The
Firebase browser configuration and owner UID are public identification values.
