# Life-Stage Dilemmas: What Would You Do?

Speaking activity for adult English learners (A2+/B1): six mystery cards with
life-stage dilemmas, speaking support, note fields, and a passcode-protected
"Unexpected Complication" for each card.

## Where to edit the content

| What | File |
| --- | --- |
| The six scenarios (title, theme, story) | `public/js/scenarios.js` |
| The six unexpected complications | `lib/complications.js` |

The complications are only sent to the browser by `api/complication.js` after the
correct passcode is entered, so students can't find them in the page source.
The passcode is stored only as a SHA-256 hash.

## Run locally

```bash
node dev-server.js
```

Then open http://localhost:3000.

## Deploy on Vercel

Import the GitHub repository at vercel.com → **Add New… → Project**. No build
settings are needed: Vercel serves `public/` as the site and `api/` as serverless
functions automatically.

> Keep the GitHub repository **private** if you don't want students to read the
> complications in `lib/complications.js`.
