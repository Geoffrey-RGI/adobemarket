# Adobe Market

A nationwide Ghana farm-produce marketplace with familiar local measures, prices per measure, minimum quantities, seller locations, and four seller-selected delivery options. Buyers contact sellers directly to agree on payment and transport.

## Stack

Firebase Authentication for phone sign-in; Cloudflare Workers for the website/API; D1 for profiles and listings; private R2 photo storage. The Worker validates Firebase ID tokens before authorizing account-owned writes. Chat is currently a labelled sample preview; live listings support calling the seller.

## Development

Use Node.js 24.

```sh
npm ci
npm run build
npm test
```

The build bundles the Firebase web SDK and the Worker with esbuild. Generated `dist/` and local credentials/configuration are ignored. GitHub Actions builds, tests, and checks JavaScript syntax on pushes and pull requests.

## Deployment

Follow [Cloudflare + Firebase setup](docs/DEPLOYMENT.md). Copy `wrangler.example.jsonc` to `wrangler.jsonc`, fill the public Firebase app config and D1 database ID, create the D1/R2 resources, apply migrations, then deploy. The app does not need a Firebase service-account private key.

Public Firebase configuration comes from `/api/config`. Until configured, browsing remains available and sign-in explains that setup is pending. The old Sites sign-in endpoints and trusted identity headers are no longer used.

## Current status

The build and automated backend/authentication tests pass locally, including signed-token verification, cross-account listing access, ownership, CSRF, uploads, and session cookies. Firebase projects, SMS configuration, Cloudflare resources, browser interaction checks, and live deployment still need account setup and end-to-end verification. Original Sites provisioning is separate from your Cloudflare account.

All sample produce listings and illustrative prices are labelled and separate from live listings. Contact numbers on listings are supplied by sellers; the app does not currently assert that a separately supplied contact number matches the phone used for sign-in.
