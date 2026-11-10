# Adobe Market

A nationwide Ghana farm-produce marketplace with familiar local measures, prices per measure, minimum quantities, seller locations, and four seller-selected delivery options. Buyers contact sellers directly to agree on payment and transport.

## Stack

Firebase Authentication for Google sign-in and email/password; Cloudflare Workers for the website/API; D1 for profiles and listings; private R2 photo storage. The Worker validates Firebase ID tokens before authorizing account-owned writes. Live listings support private buyer–seller chat and calling the seller. Conversations persist in D1, update approximately every five seconds while open, and have unread counts and earlier-message history. Sample listings retain a separate, clearly labelled chat preview.

## Development

Use Node.js 24.

```sh
npm ci
npm run build
npm test
```

The build bundles the Firebase web SDK and the Worker with esbuild. Generated `dist/` and local credentials/configuration are ignored. GitHub Actions builds, tests, and checks JavaScript syntax on pushes and pull requests.

## Deployment

Follow [Cloudflare + Firebase setup](docs/DEPLOYMENT.md). The tracked `wrangler.jsonc` contains the public Firebase app settings and D1 database ID. Create the configured private R2 bucket, apply migrations, then deploy. Use `wrangler.example.jsonc` as a reference when creating another environment. The app does not need a Firebase service-account private key.

Public Firebase configuration comes from `/api/config`. Until configured, browsing remains available and sign-in explains that setup is pending. The old Sites sign-in endpoints and trusted identity headers are no longer used.

## Current status

The build and automated backend/authentication tests pass locally, including signed-token verification, cross-account listing access, ownership, CSRF, uploads, and session cookies. Firebase provider configuration, Cloudflare resources, browser interaction checks, and live deployment still need account setup and end-to-end verification. Original Sites provisioning is separate from your Cloudflare account.

All sample produce listings and illustrative prices are labelled and separate from live listings. Contact numbers on listings are supplied by sellers; the app does not currently assert that a separately supplied contact number matches the phone used for sign-in.

## Live chat rollout

The additive migration `drizzle/0001_live_chat.sql` creates conversations and messages without changing existing listings. The configured Cloudflare deploy command must remain `npm run db:migrate:remote && npm run deploy` so migration runs before the new Worker is published. No Firebase Firestore setup is required. Test with two distinct accounts after deployment.

Messages are text-only (2,000 characters), restricted to participants, and retained across devices. Sending retries use client IDs to prevent duplicates. Existing conversations remain available when a listing is paused or sold. New conversations require an active listing. Email/push notifications and attachments are not part of this version.
