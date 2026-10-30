# Codebase walkthrough

This version includes Firebase reads, owner sign-in, and publishing for all three
formats. Retained sample fixtures have not been uploaded to the real diary.
The title changes daily, but the project is still named `life_on_this_day`.

## Start here

Read these files in order:

1. `src/main.jsx` starts React and loads the global stylesheet.
2. `src/App.jsx` supplies entries, tracks the selected date, and composes the page.
3. `src/components/MonthCalendar.jsx` builds one month of days.
4. `src/components/EntryPreview.jsx` renders a populated day as a button.
5. `src/components/EntryViewer.jsx` opens the selected entry in a native dialog.

You can follow a complete user interaction through those five files.

## Directory map

```text
src/
  main.jsx                 Mount React in the HTML root
  App.jsx                  Own data and selection, compose the page
  styles.css               Global theme, page layout, shared controls
  components/
    JournalHeader.jsx      Masthead and daily title
    MonthCalendar.jsx      Month heading, calendar, legend, empty state
    EntryPreview.jsx       A populated photo/text/audio day
    EntryViewer.jsx        Full entry, native dialog, keyboard navigation
    ArchiveHighlights.jsx  Up to five random moments, stable for one visit
    Waveform.jsx           Decorative amplitude bars shared by tile and viewer
    *.css                  Each component's styling and responsive rules
  hooks/
    useArchive.js          Loading, month subscriptions, cleanup, and retry
    useOwnerAuth.js        Auth session, owner check, and sign-in actions
  firebase/
    config.js             Public SDK configuration and owner UID
    database.js           Public date discovery and month listeners
    auth.js               Google sign-in and owner checks
  data/
    samplePosts.js         Fictional entries and sample media references
    sample-waveform.json   Amplitudes from the synthesized sample recording
    titles.js              Eleven daily titles and their individual accents
    entryTypes.js          Shared human-readable format labels
  utils/
    calendar.js            Local date keys, calendar cells, archive months
    dailyTitle.js          Select a title for a local calendar date
    formatDate.js          Shared date formatters
public/samples/            Photo and audio files served by Vite
tests/dates.test.js       Small Node tests for calendar/title rules
```

## 1. Starting the app

`index.html` provides `<div id="root">`. `main.jsx` mounts `App` there using
React's `createRoot`. Strict Mode helps surface missing effect cleanup during
development. Global styles define fonts, colors, page width, focus outlines,
and shared icon buttons.

`styles.css` defines shared color variables for page/surface/text, controls,
calendar lines, and the editor using CSS `light-dark()` pairs. Native
`color-scheme` chooses the device appearance by default; a root data attribute
can force Light or Dark. The small footer AppearanceControl owns the selected
preference; utils/appearance.js reads/saves it locally and updates browser theme
metadata. The early script in index.html restores a saved override before CSS
loads, avoiding a flash of the device theme. No Firebase setting or new dependency.

## 2. Choosing the title and supplying entries

`App` receives published posts from `useArchive()` and calls `dailyTitle()`. The title list is data;
selection by date is a separate utility. A local calendar day maps to one title,
starting with As It Was on October 19, 2026, and repeating after eleven days.
Refreshing does not randomize it. The calculation uses local year/month/day
parts, then counts civil days without daylight-saving drift. It runs when App
renders; there is no background midnight timer.

`JournalHeader` receives the title as a prop and looks up its optional italic
accent in the title data. Plain titles stay upright and black. The browser tab
keeps the permanent “Life on This Day” title from `index.html`. The footer
shows “Phila Dlamini * 2026” alongside the existing personal tagline.

An entry is keyed by its date, with one format:

```js
"2026-10-18": {
  type: "text",
  runs: [{ text: "I took the long way home..." }],
}
```

Photos have `photoURL` and optional accessibility `alt`; audio has `audioURL`.
The sample audio also carries waveform amplitudes for decoration. These bars
are not an audio player and do not fetch or start a recording.

## 3. Rendering the archive

`archiveMonths(posts, today)` receives today's Pacific date, includes its month, adds earlier
months with entries, and orders the result newest first. Empty past months and
future months are omitted. This keeps an empty archive visible as one calendar.

`App` passes each month, the entries, the ordered date keys, and an `onSelect`
callback to `MonthCalendar`. `calendarDays(month)` returns Monday-first cells.
Padding cells are `null`, empty dates render neutral day numbers, and populated
dates render `EntryPreview`.

`EntryPreview` chooses its markup from `post.type`. On phones, the calendar cells
show a compact text excerpt for words and an icon for audio. Each populated tile reports its clicked date through the
`onSelect` callback. After all months load, `ArchiveHighlights` picks up to five
unique entries from across the archive using a shuffle of copied date keys. Its
local state keeps that selection stable while opening/closing entries. Reopening
or refreshing the page makes a fresh selection. Each highlight uses the same
viewer callback; the old exhaustive per-month mobile list is removed.

## 4. Following one click

For a text entry keyed October 18 (as in our retained sample fixture):

```text
EntryPreview's button is clicked
  -> onSelect("2026-10-18")
  -> App's setSelectedDate updates React state
  -> EntryViewer receives the selectedDate and posts
  -> posts[selectedDate] selects the text entry
  -> the dialog opens and renders its paragraphs
```

The selected date is the only piece of React state in this flow. The entry,
position, and previous/next dates are derived from props rather than duplicated
in state. This keeps the calendar and viewer in agreement.

## 5. Dialog behavior and cleanup

`EntryViewer` uses a ref to call the native dialog's `showModal()` and `close()`.
The browser handles modal focus and keyboard containment. While open, the viewer
locks page scrolling. Its effect cleanup closes the dialog and restores the
previous scroll style, including when the component unmounts.

Escape, the close button, and a click outside the dialog clear selection.
Native dialog closing returns focus to the opening button. A guard ignores a
late close event if the dialog has already reopened.

Left/right arrows navigate the ordered entry dates, including across months.
Audio controls retain their own arrow-key behavior. The content's React `key`
is the selected date, so changing entries removes the previous audio element.
Audio uses native controls and never autoplays. Photos use `object-fit: contain`
in the viewer so the whole image remains visible. Tapping a photo expands the
same native dialog to a dark full-screen view. X or Escape closes the entry
directly to the calendar, restoring focus to its opening button.

## Where to make common changes

| Change | File |
| --- | --- |
| Add or edit a sample entry | `src/data/samplePosts.js` |
| Change the daily title options | `src/data/titles.js` |
| Change the daily title schedule | `src/utils/dailyTitle.js` |
| Change colors, fonts, page spacing | `src/styles.css` |
| Change title appearance | `src/components/JournalHeader.css` |
| Change calendar spacing | `src/components/MonthCalendar.css` |
| Change calendar entry previews | `src/components/EntryPreview.jsx` and `.css` |
| Change viewer behavior/appearance | `src/components/EntryViewer.jsx` and `.css` |

Components receive their data through props. `App` gets its posts from
`src/hooks/useArchive.js`, which calls `src/firebase/database.js`. Firebase calls
stay outside calendar/viewer components. `OwnerAccess` uses `useOwnerAuth` and
`src/firebase/auth.js` for Google sign-in; visitors read without authenticating.
No router or shared authentication context is needed for this one screen.

## Verification

`npm test` runs twenty-three focused offline tests using Node's built-in runner.
The dedicated rule tests use Firebase's testing library and a local emulator. They cover date keys, empty archives, skipped months, ordering,
leap years, six-week grids, daily title stability, and remote entry validation. Eleven emulator tests are skipped
unless the emulator is running. Run under a timezone such
as `TZ=America/Los_Angeles npm test` to exercise daylight-saving boundaries.

`npm run build` checks the production bundle. Browser checks complement the
utility tests: desktop and mobile layout, all viewers, real audio playback,
keyboard entry navigation, focus restoration, and page scroll cleanup.


## Firebase data flow

`src/firebase/config.js` initializes the SDK with the public configuration,
Realtime Database URL, and the verified owner's UID. It does not initialize
Analytics or Storage. Development can explicitly select local emulators.

`useArchive` discovers published date keys through a shallow REST request, then
subscribes to Firebase SDK queries for each relevant month. Each snapshot replaces
that month's entries in React state. Invalid dates/content are ignored. The hook
also owns request cancellation, unsubscribe cleanup, loading, timeout, and retry.
The current empty month remains visible, and read errors do not masquerade as an
empty journal. Newly populated older months are discovered when opening/retrying.
`useToday` also refreshes subscriptions when the Pacific month changes.

`useOwnerAuth` observes Firebase's session and exposes sign-in/sign-out actions.
The Google popup result must match the pinned owner UID. `OwnerAccess` displays
that state. Its check controls presentation; `database.rules.json` denies all
direct client writes. The server publisher verifies the owner UID, verified
email, and Google provider independently. Private paths remain denied.

The owner UID is a public identifier, not a secret. Keep its configuration and
rule value aligned if the owner ever changes. Read README.md for local domains,
emulator commands, and the distinction between offline tests and rule tests.


## Owner publishing

`App` owns one `useOwnerAuth` hook and passes its state to `OwnerAccess`. After
sign-in, **Add an entry** opens the lazily loaded `components/editor/EntryEditor`.
The form owns its draft input, date, chosen format, prepared media, errors, and
progress. Occupied dates are blocked; published viewers have no edit action.

`prepareMedia.js` resizes/re-encodes photos and generates small thumbnails. A
fresh canvas removes original image metadata. Audio is decoded locally to check
its actual duration and build decorative waveform bars. File preparation never
publishes anything; the preview uses local object URLs, revoked on cleanup.

The editor has no date picker. `useToday` follows the current Pacific date and
updates an editor left open overnight without discarding its draft. The same
`functions/shared/journalDay.js` helper supplies the browser and server's IANA
timezone calculation, including daylight saving.

On Publish, `saveEntry.js` uploads media to unique Storage paths, then
`src/firebase/publish.js` calls the Firebase callable `publishEntry`. The SDK
includes the signed-in owner's ID token. All direct client database writes are
denied, so changing browser code cannot bypass the publishing policy.

`functions/index.js` is the Firebase adapter: verified authentication context,
Admin SDK transaction, and callable error responses. `functions/publishMoment.js`
applies the owner, current-day, and content rules; its dependencies are injected
for focused offline tests. `functions/shared/posts.js` validates content for both
the reader and privileged writer. The server clock decides today's Pacific key,
and the transaction rejects an occupied day or a midnight rollover.

Failed saves retain the form. Published entries and media cannot be edited or
deleted through the app. Interrupted media publications may leave unreferenced
files requiring administrator cleanup. Storage still checks size/type limits;
audio duration is decoded in the editor and validated as metadata by the server.

`onPublished` closes the editor and refreshes the archive. The next moment can
be published after the next Pacific midnight. A new callable function release
requires its own scoped Firebase deployment, separate from GitHub Pages.


## Formatted words

`components/editor/TextEditor.jsx` owns Tiptap's editing surface, selection, and
formatting toolbar; `EntryEditor` still owns the draft and publication lifecycle.
`utils/textFormatting.js` converts the minimal editor document to portable runs
and restores a draft after switching formats. The owner-only editor bundle
contains the editing library; public readers only need the small renderer.

A text post stores one canonical `runs` array: text fragments with optional
bold/italic/underline flags. Plain text is derived by joining them. The editor
also owns only runs; conversion and rendering do not maintain a second copy.
Shared validation rejects empty/oversized text, unknown keys, invalid flags,
and mixed old/new representations. The publisher merges matching adjacent runs
and normalizes submissions from cached older clients before committing.

`FormattedText.jsx` uses React's escaped text and semantic markup. A shared
compatibility helper reads existing `text` and `textRuns` records, so permanent
published entries need no migration. Tests cover old/new reads, canonical writes,
conversion, validation, and the callable save/read round trip. The isolated
formatting fixture checks selection/rendering; the composer fixture uses the
real editor with submission intercepted.
