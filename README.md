# Kanak Sharma Class 3 Practice Zone — V6

A free Class 3 learning web app for Kanak covering English, Maths, Hindi and EVS. V6 keeps the V4 adaptive question engine and Firebase cloud progress, while replacing Google login with a simple Student ID + PIN experience.

## V6 highlights
- Student ID + PIN login — no Google account required
- Firebase Authentication + Firestore cloud progress
- Local progress fallback if cloud sync is temporarily unavailable
- 1,440-question bank: 20 questions per topic/level
- Easy / Medium / Hard timed papers
- Smart Practice that recommends weaker topics
- Parent Progress Dashboard
- A personalized welcome and Dad's message for Kanak 💛

## Firebase setup
1. In Firebase Console → Authentication → Sign-in method, enable **Email/Password**.
2. Keep the existing Firebase web app configuration in `app.js`.
3. In Firestore, create a database if you have not already done so.
4. Use these Firestore security rules:

```text
 rules_version = '2';
 service cloud.firestore {
   match /databases/{database}/documents {
     match /users/{userId} {
       allow read, write: if request.auth != null && request.auth.uid == userId;
     }
   }
 }
```

5. Upload `index.html`, `style.css` and `app.js` to GitHub Pages.

## How Kanak signs in
- Student ID: for example `KANAK001`
- PIN: a 6+ character secret chosen by Dad

The app internally maps the Student ID to a Firebase email-style credential. Kanak only sees the Student ID + PIN; she never needs an email address or Google account.

## First use
Click **First time? Create my learning account**, enter the Student ID and PIN, and the Firebase account is created. On future visits use **Let's Learn!**.

## Important
The Student ID is not a secret. The PIN is the credential. Do not put a real personal email address or password into the app source code.
