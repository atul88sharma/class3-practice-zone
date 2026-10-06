# Kanak Sharma Class 3 Practice Zone — V5 Firebase Cloud Sync

This version keeps the V4 adaptive practice engine and 1,440-question bank, and adds Google Sign-In + Firebase Cloud Firestore sync.

## Features
- Maths, English, Hindi and EVS
- 1,440 original Class 3 practice questions
- Easy / Medium / Hard levels
- 20-question timed papers
- Smart Practice and adaptive recommendations
- Parent Progress Dashboard
- Google Sign-In
- Cloud-synced history across devices
- Local browser copy retained as a fallback

## Firebase setup
1. Firebase project: `kanakpracticezone`
2. Authentication: Google provider enabled
3. Firestore: `(default)` database
4. Firestore rules should allow each signed-in user to access only `/users/{their-uid}` and its subcollections.
5. Add the GitHub Pages hostname to Firebase Authentication → Settings → Authorized domains.

## GitHub Pages deployment
Keep these four files together at the repository root:
- `index.html`
- `style.css`
- `app.js`
- `README.md`

After replacing the files, commit to `main` and hard-refresh the site (`Cmd + Shift + R` on Mac).

## Important
The Firebase web configuration in `app.js` is a public web-app configuration, not a service-account private key. Never put Firebase service-account credentials or private keys in this repository.
