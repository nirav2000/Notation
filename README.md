# Sight Reading Coach

Sight Reading Coach v2.0.0 is a beginner-friendly static web app for improving piano sight-reading. It teaches with landmark notes and interval reading, then adapts practice based on accuracy, response time, and weak spots.

## Run locally

Open `index.html` directly in a modern browser, or run a tiny local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Files

- `index.html` — app shell, dashboard, practice views, progress view, settings, and version selector.
- `styles.css` — responsive light/dark visual design.
- `app.js` — notation rendering, adaptive exercise logic, session flow, analytics, import/export, and localStorage persistence.
- `version-history.json` — global semantic version history used by the in-app version selector.
- `archive/v1.0.1/` — archived v1.0.1 app snapshot.
- `archive/v1.0.0/` — archived v1.0.0 app snapshot.
- `archive/v0.0.1/index.html` — archived starter version snapshot.

## Libraries

No build step, backend, npm package, or external runtime library is required. The app uses a custom SVG staff renderer and browser APIs only.

## Progress storage

All user progress is stored per profile in the browser with `localStorage` under the key `sightReadingCoach.v2`. When Firebase is reachable and anonymous auth/rules are enabled, each active profile also syncs to Firestore at `users/{uid}/profiles/{profileId}`. The data model includes settings, current level, exercise history, per-note stats, per-clef stats, interval stats, rhythm stats, daily activity, streak, and total completed exercises.

Use the Progress page to export progress as JSON, import a previous JSON export, or reset progress with confirmation.


## Firebase setup for v2.0.0

The app initializes Firebase with the `notation-mvp` web configuration, uses Anonymous Authentication, and saves profile documents in Cloud Firestore. In Firebase Console:

1. Enable **Authentication → Sign-in method → Anonymous**.
2. Create/enable **Cloud Firestore** for the project.
3. Use rules similar to the following so each anonymous user can only read/write their own profile documents:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/profiles/{profileId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

No custom backend is required. If Firebase auth or Firestore rules are not enabled yet, the app remains usable with local per-profile storage and shows a local-only sync status in Settings.
