# Password Strength Checker

A browser-based tool that scores password strength and checks whether a password has appeared in known data breaches.

## Features
- Live strength meter with feedback tips
- Entropy estimate in bits
- Detection of repeated characters and common sequences (abc, 123, qwerty)
- Breach lookup using the Have I Been Pwned Pwned Passwords API

## Privacy and security
- Runs entirely in the browser. Passwords are never stored.
- The breach check uses the k-anonymity model: the password is hashed with SHA-1 in your browser, and only the first 5 characters of the hash are sent. The full password and full hash never leave your device.
- SHA-1 is used only because the API requires it. It is not recommended for storing passwords (use Argon2 or bcrypt for that).

## Limitations
- Scores from simple rules are a rough guide, not a guarantee.
- Entropy estimates assume random passwords and overrate predictable ones.
- "Not found in breaches" does not mean a password is safe.

## Built with
HTML, CSS, and JavaScript (no frameworks).

## What I learned
- How entropy, hashing, and k-anonymity work
- DOM manipulation and async JavaScript (fetch, Web Crypto API)
- Debugging with the browser console